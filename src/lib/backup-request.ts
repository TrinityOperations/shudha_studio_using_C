import {
  isZipBackup,
  legacyCatalogBackupSchema,
  legacyThemeBackupSchema,
  parseBackupZip,
} from "@/lib/backup-formats";

export async function readBackupRequest(request: Request) {
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (isZipBackup(bytes)) return parseBackupZip(bytes);
  const json = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  const theme = legacyThemeBackupSchema.safeParse(json);
  if (theme.success) return { manifest: null, data: theme.data, files: [] };
  const catalog = legacyCatalogBackupSchema.safeParse(json);
  if (catalog.success) return { manifest: null, data: catalog.data, files: [] };
  throw new Error("Invalid backup file.");
}
