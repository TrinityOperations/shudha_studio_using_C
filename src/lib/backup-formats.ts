import { z } from "zod";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";

export const backupVersion = 2;
export const maxBackupBytes = 200 * 1024 * 1024;
export const maxBackupFileBytes = 5 * 1024 * 1024;
export const maxBackupFiles = 1000;

const imageManifestSchema = z.object({
  bucket: z.enum(["theme-images", "category-images", "product-images"]),
  path: z.string().min(1),
  archive_path: z.string().min(1),
  content_type: z.string().min(1),
  size: z.number().int().nonnegative(),
});

const legacyImageManifestSchema = z.object({
  bucket: z.enum(["theme-images", "category-images", "product-images"]),
  path: z.string().min(1),
});

const archiveManifestSchema = z.object({
  format: z.enum(["shudha-theme-backup", "shudha-catalog-backup"]),
  version: z.number().int().positive(),
  archive: z.literal("zip"),
  data_file: z.literal("data.json"),
  files: z.array(imageManifestSchema).max(maxBackupFiles),
});

export const themeBackupSchema = z.object({
  format: z.literal("shudha-theme-backup"),
  version: z.number().int().positive(),
  exported_at: z.string(),
  theme: z.record(z.string(), z.unknown()),
  category_mappings: z.record(z.string(), z.string()).default({}),
  images: z.array(imageManifestSchema).default([]),
});

export const legacyThemeBackupSchema = z.object({
  format: z.literal("shudha-theme-backup"),
  version: z.number().int().positive(),
  exported_at: z.string(),
  theme: z.record(z.string(), z.unknown()),
  category_mappings: z.record(z.string(), z.string()).default({}),
  images: z.array(legacyImageManifestSchema).default([]),
});

export const catalogBackupSchema = z.object({
  format: z.literal("shudha-catalog-backup"),
  version: z.number().int().positive(),
  exported_at: z.string(),
  categories: z.array(z.record(z.string(), z.unknown())),
  products: z.array(
    z
      .record(z.string(), z.unknown())
      .and(z.object({ category_slug: z.string().min(1) })),
  ),
  images: z.array(imageManifestSchema).default([]),
});

export const legacyCatalogBackupSchema = z.object({
  format: z.literal("shudha-catalog-backup"),
  version: z.number().int().positive(),
  exported_at: z.string(),
  categories: z.array(z.record(z.string(), z.unknown())),
  products: z.array(
    z
      .record(z.string(), z.unknown())
      .and(z.object({ category_slug: z.string().min(1) })),
  ),
  images: z.array(legacyImageManifestSchema).default([]),
});

export type ThemeBackup = z.infer<typeof themeBackupSchema>;
export type CatalogBackup = z.infer<typeof catalogBackupSchema>;

export type BackupImageFile = {
  bucket: "theme-images" | "category-images" | "product-images";
  path: string;
  contentType: string;
  data: Uint8Array;
};

function safeArchivePath(path: string) {
  return path.replace(/\\/g, "/").replace(/^\/+/, "");
}

export function createBackupZip(
  format: "shudha-theme-backup" | "shudha-catalog-backup",
  data: Record<string, unknown>,
  files: BackupImageFile[],
) {
  const imageFiles = files.map((file) => ({
    bucket: file.bucket,
    path: file.path,
    archive_path: safeArchivePath(`images/${file.bucket}/${file.path}`),
    content_type: file.contentType,
    size: file.data.byteLength,
  }));
  const manifest = {
    format,
    version: backupVersion,
    archive: "zip" as const,
    data_file: "data.json" as const,
    files: imageFiles,
  };
  const archiveFiles: Record<string, Uint8Array> = {
    "manifest.json": strToU8(JSON.stringify(manifest, null, 2)),
    "data.json": strToU8(
      JSON.stringify({ ...data, version: backupVersion, images: imageFiles }, null, 2),
    ),
  };
  files.forEach((file, index) => {
    archiveFiles[imageFiles[index].archive_path] = file.data;
  });
  return zipSync(archiveFiles, { level: 6 });
}

export function parseBackupZip(bytes: Uint8Array) {
  if (bytes.byteLength > maxBackupBytes)
    throw new Error("Backup archive is too large.");
  const archive = unzipSync(bytes);
  const manifestBytes = archive["manifest.json"];
  const dataBytes = archive["data.json"];
  if (!manifestBytes || !dataBytes)
    throw new Error("Backup archive is missing required files.");
  const manifest = archiveManifestSchema.parse(JSON.parse(strFromU8(manifestBytes)));
  if (manifest.data_file !== "data.json")
    throw new Error("Backup archive has an invalid data file.");
  const data = JSON.parse(strFromU8(dataBytes)) as ThemeBackup | CatalogBackup;
  const files = manifest.files.map((file) => {
    const archivePath = safeArchivePath(file.archive_path);
    if (archivePath !== file.archive_path || archivePath.includes("../"))
      throw new Error("Backup archive contains an unsafe file path.");
    const content = archive[archivePath];
    if (!content) throw new Error(`Backup archive is missing ${archivePath}.`);
    if (content.byteLength > maxBackupFileBytes || content.byteLength !== file.size)
      throw new Error(`Backup image has an invalid size: ${file.path}.`);
    return {
      bucket: file.bucket,
      path: file.path,
      contentType: file.content_type,
      data: content,
    } satisfies BackupImageFile;
  });
  if (data.format !== manifest.format)
    throw new Error("Backup archive data does not match its manifest.");
  return { manifest, data, files };
}

export function isZipBackup(bytes: Uint8Array) {
  return bytes[0] === 0x50 && bytes[1] === 0x4b;
}
