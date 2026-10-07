import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createBackupZip } from "@/lib/backup-formats";
import { downloadBackupImages } from "@/lib/backup-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BackupImageFile } from "@/lib/backup-formats";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const [
    { data: theme, error: themeError },
    { data: categories, error: categoryError },
  ] = await Promise.all([
    supabase.from("site_themes").select("*").eq("id", id).single(),
    supabase.from("categories").select("id, slug"),
  ]);
  if (themeError || !theme)
    return NextResponse.json({ error: "Theme not found." }, { status: 404 });
  if (categoryError)
    return NextResponse.json({ error: "Unable to export theme." }, { status: 400 });
  const categoryMappings = Object.fromEntries(
    (categories ?? []).map((category) => [category.id, category.slug]),
  );
  const content = (theme.content ?? {}) as Record<string, unknown>;
  const categoryIds = [
    ...(Array.isArray(content.occasion_category_ids)
      ? content.occasion_category_ids
      : []),
    ...(Array.isArray(content.recipient_category_ids)
      ? content.recipient_category_ids
      : []),
    ...(Array.isArray(content.collection_category_ids)
      ? content.collection_category_ids
      : []),
    ...(typeof content.campaign_category_id === "string"
      ? [content.campaign_category_id]
      : []),
    ...(Array.isArray(content.occasion_links)
      ? content.occasion_links.flatMap((link) =>
          typeof (link as Record<string, unknown>).category_id === "string"
            ? [(link as Record<string, unknown>).category_id as string]
            : [],
        )
      : []),
    ...(Array.isArray(content.recipient_links)
      ? content.recipient_links.flatMap((link) =>
          typeof (link as Record<string, unknown>).category_id === "string"
            ? [(link as Record<string, unknown>).category_id as string]
            : [],
        )
      : []),
  ];
  const images = [theme.logo_path, theme.background_path, theme.hero_path]
    .filter((path): path is string => Boolean(path))
    .map((path) => ({
      bucket: "theme-images" as const,
      buckets: [
        "theme-images",
        "product-images",
        "category-images",
      ] satisfies BackupImageFile["bucket"][],
      path,
    }));
  const payload = {
    format: "shudha-theme-backup",
    exported_at: new Date().toISOString(),
    theme,
    category_mappings: Object.fromEntries(
      categoryIds
        .filter((id) => categoryMappings[id])
        .map((id) => [id, categoryMappings[id]]),
    ),
  };
  let archive: Uint8Array;
  try {
    archive = createBackupZip(
      "shudha-theme-backup",
      payload,
      await downloadBackupImages(
        supabase,
        images.map((image) => ({ ...image })),
      ),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to export theme images.",
      },
      { status: 400 },
    );
  }
  return new NextResponse(archive as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="theme-${theme.slug}-backup.zip"`,
    },
  });
}
