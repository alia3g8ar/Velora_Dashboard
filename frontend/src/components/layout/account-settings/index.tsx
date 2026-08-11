import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { SaveButton, useForm } from "@refinedev/antd";
import type { HttpError } from "@refinedev/core";
import { useInvalidate } from "@refinedev/core";
import type { GetFields, GetVariables } from "@refinedev/nestjs-query";

import { CameraOutlined, CloseOutlined } from "@ant-design/icons";
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

const AVATAR_SIZE = 256;

/**
 * Read an image file and return a downscaled JPEG data URL so self-hosted
 * avatars stay small enough to store directly in the database.
 */
const fileToAvatarDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("read failed"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("invalid image"));
      image.onload = () => {
        const scale = Math.min(
          1,
          AVATAR_SIZE / Math.max(image.width, image.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("canvas unsupported"));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

export const AccountSettings = ({ opened, setOpened, userId }: Props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarDraft, setAvatarDraft] = useState<string | null>(null);

  const { saveButtonProps, formProps, form, query: queryResult } = useForm<
    GetFields<UpdateUserMutation>,
    HttpError,
    GetVariables<UpdateUserMutationVariables>
  >({
    mutationMode: "pessimistic",
    resource: "users",
    action: "edit",
    id: userId,
    onMutationSuccess: () => {
      // Close immediately; the cache refresh below runs in the background so
      // the reopened modal and header always show fresh data.
      setOpened(false);
      setAvatarDraft(null);

      // Invalidate the user's list AND detail queries. The explicit id is
      // required: without it the detail key becomes `one` + `""`, which never
      // matches the real `one` + userId cache entry, so the form kept showing
      // stale values after saving.
      void invalidate({
        invalidates: ["list", "detail"],
        resource: "users",
        id: userId,
      });
      // Refetch the authenticated user identity so the header updates live.
      // With `useNewQueryKeys` the identity key is ["auth", "identity"] (no
      // "default" prefix), so matching just the prefix covers both formats.
      void queryClient.refetchQueries({
        queryKey: ["auth", "identity"],
      });
    },
    meta: {
      gqlMutation: UPDATE_USER_MUTATION,
    },
  });

  const { avatarUrl, name, email } = queryResult?.data?.data || {};

  // Keep the form in sync with the freshest user data. Refine only applies
  // `initialValues` when the Form first mounts, so after a save (or a
  // background refetch completing while the modal is open) the fields would
  // otherwise keep showing stale values. Setting them explicitly on every
  // data change is immediate and reliable.
  useEffect(() => {
    if (!opened || !queryResult?.data?.data) {
      return;
    }
    const user = queryResult.data.data;
    form?.setFieldsValue({
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    } as Parameters<typeof form.setFieldsValue>[0]);
  }, [opened, queryResult?.data?.data, form]);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Allow picking the same file again next time.
    event.target.value = "";
    if (!file) {
      return;
    }
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      form?.setFieldValue("avatarUrl", dataUrl);
      setAvatarDraft(dataUrl);
    } catch {
      // Ignore unreadable files; keep the current avatar.
    }
  };

  const closeModal = () => {
    setOpened(false);
    setAvatarDraft(null);
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
      destroyOnHidden
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
        <div style={{ position: "relative", flexShrink: 0 }}>
          <CustomAvatar
            shape="square"
            src={avatarDraft ?? avatarUrl}
            name={getNameInitials(name || "")}
            style={{
              width: 64,
              height: 64,
              fontSize: 24,
              borderRadius: token.borderRadiusLG,
            }}
          />
          <button
            type="button"
            aria-label={t("accountSettings.changePhoto")}
            title={t("accountSettings.changePhoto")}
            onClick={() => fileInputRef.current?.click()}
            style={{
              position: "absolute",
              insetInlineEnd: -4,
              bottom: -4,
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${token.colorBgContainer}`,
              borderRadius: "50%",
              background: token.colorPrimary,
              color: "#fff",
              fontSize: 11,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <CameraOutlined />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
        </div>
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
          <Form.Item name="avatarUrl" hidden>
            <input type="hidden" />
          </Form.Item>
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
