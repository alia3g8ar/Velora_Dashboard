import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";

import { List } from "@refinedev/antd";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";

import { DeleteOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Avatar,
  Button,
  Card,
  Form,
  Input,
  Popconfirm,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { LanguageSwitcher, VeloraLogo } from "@/components";
import type { User } from "@/graphql/schema.types";
import { API_URL, dataProvider } from "@/providers/data";
import { formatDate, resolveAssetUrl } from "@/utilities";

import {
  ADMIN_DELETE_USER_MUTATION,
  ADMIN_UPDATE_USER_ROLE_MUTATION,
  ADMIN_USERS_QUERY,
} from "./queries";

type AdminUser = Pick<
  User,
  "id" | "name" | "email" | "avatarUrl" | "role" | "createdAt"
>;

const ROLE_VALUES: User["role"][] = [
  "SALES_INTERN",
  "SALES_PERSON",
  "SALES_MANAGER",
  "ADMIN",
];

/**
 * Dedicated login for the standalone admin panel. Uses `adminLogin` (not the
 * regular `login`) so only ADMIN accounts can authenticate here; a valid
 * non-admin account gets a clear rejection instead of a token.
 */
const AdminLoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: { email: string; password: string }) => {
    setSubmitting(true);
    try {
      await dataProvider.custom<{
        adminLogin: { accessToken: string };
      }>({
        url: API_URL,
        method: "post",
        headers: {},
        meta: {
          variables: { email: values.email, password: values.password },
          rawQuery: `
            mutation AdminLogin($email: String!, $password: String!) {
              adminLogin(loginInput: {
                email: $email
                password: $password
              }) {
                accessToken
              }
            }
          `,
        },
      });

      // The admin token is set as an HttpOnly cookie by the server; the
      // browser sends it automatically from here on.
      message.success(t("admin.login.success"));
      onSuccess();
    } catch (error) {
      const raw =
        error instanceof Error
          ? error.message
          : (error as { message?: string })?.message ?? "";
      // The fetch wrapper already maps known backend rejections (invalid
      // credentials / not an admin) to localized text.
      message.error(raw || t("admin.login.failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background:
          "radial-gradient(50% 50% at 50% 50%, #63386A 0%, #310438 100%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          insetInlineEnd: 24,
          insetBlockStart: 24,
          zIndex: 100,
        }}
      >
        <LanguageSwitcher />
      </div>
      <div style={{ width: 400, maxWidth: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <VeloraLogo width={200} height={60} />
        </div>
        <Card
          styles={{
            body: { padding: "28px 24px 20px" },
          }}
        >
          <Space align="center" style={{ marginBottom: 4, display: "flex" }}>
            <SafetyCertificateOutlined
              style={{ fontSize: 20, color: "#722ED1" }}
            />
            <Typography.Title level={4} style={{ margin: 0 }}>
              {t("admin.login.title")}
            </Typography.Title>
          </Space>
          <Typography.Text type="secondary">
            {t("admin.login.subtitle")}
          </Typography.Text>

          <Form
            layout="vertical"
            onFinish={handleFinish}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              label={t("admin.login.email")}
              name="email"
              rules={[
                {
                  required: true,
                  message: t("pages.login.errors.requiredEmail"),
                },
                {
                  type: "email",
                  message: t("pages.login.errors.validEmail"),
                },
              ]}
            >
              <Input
                size="large"
                placeholder={t("admin.login.emailPlaceholder")}
              />
            </Form.Item>
            <Form.Item
              label={t("admin.login.password")}
              name="password"
              rules={[
                {
                  required: true,
                  message: t("pages.login.errors.requiredPassword"),
                },
              ]}
            >
              <Input.Password
                size="large"
                placeholder={t("admin.login.passwordPlaceholder")}
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submitting}
            >
              {t("admin.login.submit")}
            </Button>
          </Form>

          <div
            style={{
              textAlign: "center",
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Typography.Text type="secondary">
              {t("admin.login.backToApp")}
            </Typography.Text>
            <Button type="link" onClick={() => navigate("/login")}>
              {t("admin.login.backToAppLink")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const { data: identity, isLoading: isIdentityLoading } =
    useGetIdentity<User>();

  const isAdmin = identity?.role === "ADMIN";

  const { data, isLoading, refetch } = useCustom<{ adminUsers: AdminUser[] }>({
    url: "",
    method: "get",
    queryOptions: {
      // Don't fire the admin query when not authenticated as an admin — the
      // backend would reject it anyway and the login form is shown instead.
      enabled: isAdmin,
    },
    meta: {
      gqlQuery: ADMIN_USERS_QUERY,
    },
  });

  const { mutate: updateRole, isLoading: isUpdatingRole } = useCustomMutation();
  const { mutate: deleteUser, isLoading: isDeletingUser } = useCustomMutation();

  const handleIdentityRefresh = () => {
    // After an admin login the identity must be refetched so the panel
    // unlocks (and the app's auth state follows the new token).
    // `invalidateQueries` (not `refetchQueries`) is used because the query
    // was disabled while logged out; invalidation re-renders the observer,
    // which re-evaluates `enabled` (now true) and actually runs the query.
    void queryClient.invalidateQueries({ queryKey: ["auth", "identity"] });
  };

  const handleRoleChange = (userId: string, role: User["role"]) => {
    updateRole(
      {
        url: "",
        method: "post",
        values: {},
        meta: {
          gqlMutation: ADMIN_UPDATE_USER_ROLE_MUTATION,
          variables: {
            input: {
              id: userId,
              role,
            },
          },
        },
        successNotification: false,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          message.success(t("admin.notifications.roleUpdated"));
          void refetch();
        },
        onError: (error) => {
          const raw =
            error instanceof Error
              ? error.message
              : (error as { message?: string })?.message ?? "";
          message.error(
            raw.includes("last administrator")
              ? t("admin.notifications.lastAdmin")
              : t("admin.notifications.roleUpdateFailed"),
          );
        },
      },
    );
  };

  const handleDelete = (userId: string, userName?: string) => {
    deleteUser(
      {
        url: "",
        method: "post",
        values: {},
        meta: {
          gqlMutation: ADMIN_DELETE_USER_MUTATION,
          variables: {
            input: {
              id: userId,
            },
          },
        },
        successNotification: false,
        errorNotification: false,
      },
      {
        onSuccess: () => {
          message.success(
            t("admin.notifications.userDeleted", { name: userName ?? "" }),
          );
          void refetch();
        },
        onError: (error) => {
          const raw =
            error instanceof Error
              ? error.message
              : (error as { message?: string })?.message ?? "";
          message.error(
            raw.includes("last administrator")
              ? t("admin.notifications.lastAdmin")
              : raw.includes("own account")
              ? t("admin.notifications.cannotDeleteSelf")
              : t("admin.notifications.deleteFailed"),
          );
        },
      },
    );
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: t("admin.fields.user"),
      dataIndex: "name",
      key: "name",
      render: (_, record) => (
        <Space>
          <Avatar
            src={resolveAssetUrl(record.avatarUrl)}
            alt={record.name ?? record.email}
          >
            {(record.name ?? record.email).charAt(0).toUpperCase()}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.name ?? "—"}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: t("admin.fields.role"),
      dataIndex: "role",
      key: "role",
      width: 220,
      render: (_, record) => {
        const isSelf = record.id === identity?.id;
        return (
          <Select
            size="middle"
            style={{ width: "100%" }}
            value={record.role}
            disabled={isSelf || isUpdatingRole}
            options={ROLE_VALUES.map((value) => ({
              value,
              label: t(`enums.role.${value}`, value),
            }))}
            onChange={(role) => handleRoleChange(record.id, role)}
          />
        );
      },
    },
    {
      title: t("admin.fields.joinedAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => (
        <Typography.Text>
          {formatDate(value, "MMM D, YYYY", i18n.language)}
        </Typography.Text>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_, record) => {
        const isSelf = record.id === identity?.id;
        return (
          <Popconfirm
            title={t("admin.actions.deleteConfirm", {
              name: record.name ?? "",
            })}
            okText={t("common.delete")}
            cancelText={t("common.cancel")}
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record.id, record.name ?? undefined)}
            disabled={isSelf || isDeletingUser}
          >
            <Button
              size="small"
              danger
              type="text"
              icon={<DeleteOutlined />}
              disabled={isSelf || isDeletingUser}
              aria-label={t("common.delete")}
            />
          </Popconfirm>
        );
      },
    },
  ];

  if (isIdentityLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // Not authenticated as an admin → dedicated admin login form. This covers
  // both logged-out visitors and regular users (who must authenticate with an
  // admin account to get in).
  if (!identity || !isAdmin) {
    return <AdminLoginForm onSuccess={handleIdentityRefresh} />;
  }

  return (
    <div style={{ minHeight: "100vh", padding: "24px" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
        }}
      >
        <List breadcrumb={false}>
          <Table<AdminUser>
            rowKey="id"
            loading={isLoading}
            dataSource={data?.data.adminUsers ?? []}
            columns={columns}
            pagination={false}
            scroll={{ x: true }}
          />
        </List>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Link to="/">
            <Button type="link">{t("admin.login.backToAppLink")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
