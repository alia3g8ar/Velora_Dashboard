import { useTranslation } from "react-i18next";

import { List } from "@refinedev/antd";
import {
  useCustom,
  useCustomMutation,
  useGetIdentity,
} from "@refinedev/core";

import { DeleteOutlined } from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Popconfirm,
  Result,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import type { User } from "@/graphql/schema.types";
import { formatDate } from "@/utilities";

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

export const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const { message } = App.useApp();
  const { data: identity } = useGetIdentity<User>();

  const isAdmin = identity?.role === "ADMIN";

  const { data, isLoading, refetch } = useCustom<{ adminUsers: AdminUser[] }>({
    url: "",
    method: "get",
    queryOptions: {
      // Don't fire the admin query for non-admins — the backend would reject
      // it anyway and the 403 page is shown instead.
      enabled: isAdmin,
    },
    meta: {
      gqlQuery: ADMIN_USERS_QUERY,
    },
  });

  const { mutate: updateRole, isLoading: isUpdatingRole } = useCustomMutation();
  const { mutate: deleteUser, isLoading: isDeletingUser } = useCustomMutation();

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
          <Avatar src={record.avatarUrl} alt={record.name ?? record.email}>
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
            title={t("admin.actions.deleteConfirm", { name: record.name ?? "" })}
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

  if (!isAdmin) {
    return (
      <div className="page-container">
        <Result
          status="403"
          title={t("admin.accessDenied")}
          subTitle={t("admin.accessDeniedHint")}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
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
    </div>
  );
};
