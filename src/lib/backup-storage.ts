import type { SupabaseClient } from "@supabase/supabase-js";

import type { BackupImageFile } from "@/lib/backup-formats";

type ImageReference = {
  bucket: BackupImageFile["bucket"];
  buckets?: BackupImageFile["bucket"][];
  path: string;
  contentType?: string;
};

export async function downloadBackupImages(
  supabase: SupabaseClient,
  references: ImageReference[],
) {
  const unique = new Map(
    references.map((reference) => [`${reference.bucket}:${reference.path}`, reference]),
  );
  const files: BackupImageFile[] = [];
  for (const reference of unique.values()) {
    const buckets = reference.buckets?.length ? reference.buckets : [reference.bucket];
    let downloaded: { bucket: BackupImageFile["bucket"]; data: Blob } | null = null;
    let lastError: string | null = null;
    for (const bucket of buckets) {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(reference.path);
      if (data) {
        downloaded = { bucket, data };
        break;
      }
      lastError = error?.message ?? null;
    }
    if (!downloaded) {
      throw new Error(
        `Unable to download backup image: ${reference.path}${lastError ? ` (${lastError})` : ""}`,
      );
    }
    files.push({
      bucket: downloaded.bucket,
      path: reference.path,
      contentType:
        reference.contentType ?? downloaded.data.type ?? "application/octet-stream",
      data: new Uint8Array(await downloaded.data.arrayBuffer()),
    });
  }
  return files;
}

export async function uploadBackupImages(
  supabase: SupabaseClient,
  files: BackupImageFile[],
) {
  for (const file of files) {
    const { error } = await supabase.storage
      .from(file.bucket)
      .upload(file.path, file.data, {
        contentType: file.contentType,
        upsert: true,
      });
    if (error) {
      throw new Error(
        `Unable to restore backup image: ${file.bucket}/${file.path} (${error.message})`,
      );
    }
  }
}
