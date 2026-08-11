import { useTranslation } from "react-i18next";

import { SaveButton, useForm } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { useInvalidate, useOne } from "@refinedev/core";
import type { GetFields, GetVariables } from "@refinedev/nestjs-query";

import { CloseOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Spin, theme } from "antd";

import type {
  UpdateUserMutation,
  UpdateUserMutationVariables,
} from "@/graphql/types";
import { getNameInitials } from "@/utilities";

import { CustomAvatar } from "../../custom-avatar";
import { Text } from "../../text";
import { UPDATE_USER_MUTATION } from "./queries";

type Props = {
  opened: boolean;
  setOpened: (opened: boolean) => void;
  userId: string;
};

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  // Force refetch user data
  const { refetch: refetchUser } = useOne({
    resource: "users",
    id: userId,
  });

  const {
    saveButtonProps,
    formProps,
    query: queryResult,
  } = useForm<
    GetFields<UpdateUserMutation>,
    HttpError,
    GetVariables<UpdateUserMutationVariables>
  >({
    mutationMode: "pessimistic",
    resource: "users",
    action: "edit",
    id: userId,
    onMutationSuccess: () => {
      // Close immediately; the cache refreshes below run in the background so
      // the reopened modal and header always show fresh data.
      closeModal();

      // Force refetch user data immediately
      void refetchUser();

      // Force refetch all user-related queries
      void queryClient.refetchQueries({
        queryKey: ["default", "users"],
      });
      // Refetch the authenticated user identity so the header updates live
      void queryClient.refetchQueries({
        queryKey: ["default", "auth", "identity"],
      });

      // Also use Refine's invalidate
      void invalidate({
        invalidates: ["list", "detail"],
        resource: "users",
      });
    },
    meta: {
      gqlMutation: UPDATE_USER_MUTATION,
    },
  });
  const { avatarUrl, name, email } = queryResult?.data?.data || {};

  const closeModal = () => {
    setOpened(false);
  };

  if (queryResult?.isLoading) {
    return (
      <Modal
        open={opened}
        footer={null}
        closable={false}
        centered
        width={360}
        styles={{
          content: {
            borderRadius: token.borderRadiusLG,
            display: "flex",
            justifyContent: "center",
            padding: "48px",
          },
        }}
      >
        <Spin size="large" />
      </Modal>
    );
  }

  return (
    <Modal
      open={opened}
      onCancel={closeModal}
      width={480}
      centered
      footer={null}
      closable={false}
      styles={{
        content: {
          borderRadius: token.borderRadiusLG,
          padding: 0,
          overflow: "hidden",
        },
      }}
    >
      {/* Profile header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "20px 24px",
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          background: `linear-gradient(135deg, ${token.colorFillAlter} 0%, #FDF2F8 100%)`,
        }}
      >
        <CustomAvatar
          shape="square"
          src={avatarUrl}
          name={getNameInitials(name || "")}
          style={{
            width: 64,
            height: 64,
            fontSize: 24,
            borderRadius: token.borderRadiusLG,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text strong size="md" ellipsis={{ tooltip: name }}>
            {name}
          </Text>
          <div>
            <Text className="secondary" ellipsis={{ tooltip: email }}>
              {email}
            </Text>
          </div>
        </div>
        <Button
          type="text"
          aria-label={t("common.close")}
          icon={<CloseOutlined />}
          onClick={closeModal}
        />
      </div>

      {/* Form */}
      <div style={{ padding: "24px" }}>
        <Form {...formProps} layout="vertical">
          <Form.Item label={t("accountSettings.name")} name="name">
            <Input placeholder={t("accountSettings.name")} />
          </Form.Item>
          <Form.Item label={t("accountSettings.email")} name="email">
            <Input placeholder={t("accountSettings.email")} />
          </Form.Item>
          <Form.Item label={t("accountSettings.jobTitle")} name="jobTitle">
            <Input placeholder={t("accountSettings.jobTitle")} />
          </Form.Item>
          <Form.Item label={t("accountSettings.phone")} name="phone">
            <Input placeholder={t("accountSettings.phone")} />
          </Form.Item>
        </Form>
      </div>

      {/* Footer actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          padding: "0 24px 24px",
        }}
      >
        <Button onClick={closeModal}>{t("common.cancel")}</Button>
        <SaveButton {...saveButtonProps} />
      </div>
    </Modal>
  );
};
