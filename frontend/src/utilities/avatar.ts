/**
 * Downscale an image file to a small JPEG data URL so self-hosted avatars
 * and logos stay small enough to store directly in the database.
 */

export const AVATAR_SIZE = 256;

export const fileToAvatarDataUrl = (file: File): Promise<string> =>
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
