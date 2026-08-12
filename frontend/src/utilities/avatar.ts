import { API_BASE_URL } from "@/providers/data";

/**
 * Avatar asset helpers.
 *
 * Avatars are uploaded as raw files to the backend (`POST /uploads/avatar`),
 * stored as BLOB rows, and referenced by a relative `/uploads/avatar/:id`
 * path. No image data is ever embedded as a base64 data URL in the API.
 */

export const AVATAR_SIZE = 256;

/**
 * Downscale an image to a small JPEG blob (the backend stores and serves the
 * bytes directly — no base64 encoding anywhere in the flow).
 */
const resizeImageToBlob = (file: File): Promise<Blob> =>
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
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("encode failed"));
            }
          },
          "image/jpeg",
          0.85,
        );
      };
      image.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });

/**
 * Upload an avatar image and return the server-assigned relative URL
 * (`/uploads/avatar/:id`) ready to be stored on the owning record.
 */
export const uploadAvatarImage = async (file: File): Promise<string> => {
  if (!file.type.startsWith("image/")) {
    throw new Error("not an image");
  }

  const blob = await resizeImageToBlob(file);
  const body = new FormData();
  body.append("file", blob, "avatar.jpg");

  const response = await fetch(`${API_BASE_URL}/uploads/avatar`, {
    method: "POST",
    credentials: "include",
    body,
  });

  if (!response.ok) {
    throw new Error("upload failed");
  }

  const payload = (await response.json()) as { url?: string };

  if (!payload.url) {
    throw new Error("upload returned no url");
  }

  return payload.url;
};

/**
 * Turn a stored relative asset path into a fetchable absolute URL. Absolute
 * URLs (seeded remote avatars, legacy values) pass through unchanged.
 */
export const resolveAssetUrl = (url?: string | null): string | undefined => {
  if (!url) {
    return undefined;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};