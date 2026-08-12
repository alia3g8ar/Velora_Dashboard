import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { CameraOutlined } from "@ant-design/icons";
import { Form, Spin, theme } from "antd";

import { uploadAvatarImage } from "@/utilities";

import { CustomAvatar } from "../custom-avatar";

type Props = {
  /** Current avatar URL (form-controlled via `value`). */
  value?: string | null;
  /** Display name used for the initials fallback while no photo is set. */
  name?: string;
  shape?: "square" | "circle";
  size?: number;
  /** Called with the uploaded avatar URL after picking a file. */
  onChange?: (value: string) => void;
};

/**
 * Avatar preview with a camera overlay that opens a file picker. The picked
 * image is downscaled to a JPEG blob and uploaded to `/uploads/avatar`,
 * which stores the file server-side (no base64 in the API or database) and
 * returns a `/uploads/avatar/:id` URL saved on the record. Works as an antd
 * Form control (`value` / `onChange`), so it can be placed inside a
 * `Form.Item`.
 */
export const AvatarUploader = ({
  value,
  name = "",
  shape = "square",
  size = 96,
  onChange,
}: Props) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow picking the same file again next time.
    event.target.value = "";
    if (!file || uploading) {
      return;
    }
    setUploading(true);
    try {
      const url = await uploadAvatarImage(file);
      onChange?.(url);
    } catch {
      // Ignore unreadable/oversized files; keep the current photo.
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <CustomAvatar
        shape={shape}
        src={value}
        // Pass the raw name: CustomAvatar derives the initials itself.
        // Pre-processing here would double-apply getNameInitials and render
        // only the first letter.
        name={name}
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size / 2.6),
          borderRadius: shape === "circle" ? "50%" : token.borderRadiusLG,
        }}
      />
      {uploading && (
        <Spin
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      )}
      <button
        type="button"
        aria-label={t("common.changePhoto")}
        title={t("common.changePhoto")}
        onClick={() => fileInputRef.current?.click()}
        style={{
          position: "absolute",
          insetInlineEnd: -4,
          bottom: -4,
          width: Math.max(24, Math.round(size / 4)),
          height: Math.max(24, Math.round(size / 4)),
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
        onChange={handleChange}
      />
    </div>
  );
};

/**
 * A ready-to-use `Form.Item` bound to the `avatarUrl` field. The initials
 * fallback follows the form's `name` field so the preview updates as the
 * user types. Forms without a `name` field (e.g. the company edit form)
 * can pass the record name via `name` so the fallback still shows initials.
 */
export const AvatarFormItem = ({
  size = 96,
  name: nameFallback = "",
}: {
  size?: number;
  name?: string;
}) => {
  const form = Form.useFormInstance();
  const watchedName = Form.useWatch("name", form);
  const name = watchedName ?? nameFallback;

  return (
    <Form.Item name="avatarUrl" style={{ marginBottom: 24 }}>
      <AvatarUploader name={name} size={size} />
    </Form.Item>
  );
};
