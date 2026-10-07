import type { useLanguage } from "@/components/language-provider";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = 10;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function validateImage(
  file: File,
  t: ReturnType<typeof useLanguage>["t"],
): Promise<string | null> {
  if (!ALLOWED_TYPES.has(file.type)) return t("imageTypes");
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) return t("imageSize");
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const valid =
    file.type === "image/jpeg"
      ? header[0] === 0xff && header[1] === 0xd8
      : file.type === "image/png"
        ? header[0] === 0x89 &&
          header[1] === 0x50 &&
          header[2] === 0x4e &&
          header[3] === 0x47
        : header[0] === 0x52 &&
          header[1] === 0x49 &&
          header[2] === 0x46 &&
          header[3] === 0x46 &&
          header[8] === 0x57 &&
          header[9] === 0x45 &&
          header[10] === 0x42 &&
          header[11] === 0x50;
  return valid ? null : t("imageMismatch");
}

export function safeFileName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .slice(-80) || "image"
  );
}
