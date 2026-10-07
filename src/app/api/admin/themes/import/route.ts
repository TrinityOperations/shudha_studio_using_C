import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { legacyThemeBackupSchema, themeBackupSchema } from "@/lib/backup-formats";
import { readBackupRequest } from "@/lib/backup-request";
import { uploadBackupImages } from "@/lib/backup-storage";
import { customThemeSchema } from "@/lib/custom-themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  await requireAdmin();
  let backup:
    | ReturnType<typeof themeBackupSchema.parse>
    | ReturnType<typeof legacyThemeBackupSchema.parse>;
  let files: Awaited<ReturnType<typeof readBackupRequest>>["files"] = [];
  try {
    const parsed = await readBackupRequest(request);
    const validated = themeBackupSchema.safeParse(parsed.data);
    const legacyValidated = legacyThemeBackupSchema.safeParse(parsed.data);
    if (!validated.success && !legacyValidated.success)
      throw new Error("Invalid theme backup file.");
    if (validated.success) backup = validated.data;
    else if (legacyValidated.success) backup = legacyValidated.data;
    else throw new Error("Invalid theme backup file.");
    files = parsed.files;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid theme backup file." },
      { status: 400 },
    );
  }
  const source = { ...(backup.theme as Record<string, unknown>) };
  delete source.id;
  delete source.created_at;
  delete source.updated_at;
  const content = { ...((source.content ?? {}) as Record<string, unknown>) };
  const mappings = backup.category_mappings;
  const validated = customThemeSchema.safeParse({ ...source, content });
  if (!validated.success)
    return NextResponse.json(
      { error: "Theme backup contains invalid theme data." },
      { status: 400 },
    );
  const supabase = await createSupabaseServerClient();
  const sourceSlugs = Object.values(mappings);
  const { data: destinationCategories, error: categoryError } = sourceSlugs.length
    ? await supabase.from("categories").select("id, slug").in("slug", sourceSlugs)
    : { data: [], error: null };
  if (categoryError)
    return NextResponse.json(
      { error: "Unable to map theme categories." },
      { status: 400 },
    );
  const destinationIds = new Map(
    (destinationCategories ?? []).map((category) => [category.slug, category.id]),
  );
  const remapCategoryId = (value: unknown) =>
    typeof value === "string" ? (destinationIds.get(mappings[value]) ?? null) : null;
  for (const key of [
    "occasion_category_ids",
    "recipient_category_ids",
    "collection_category_ids",
  ]) {
    if (Array.isArray(content[key]))
      content[key] = content[key].map(remapCategoryId).filter(Boolean);
  }
  if (typeof content.campaign_category_id === "string")
    content.campaign_category_id = remapCategoryId(content.campaign_category_id);
  for (const key of ["occasion_links", "recipient_links"]) {
    if (Array.isArray(content[key]))
      content[key] = content[key]
        .map((link) => ({
          ...(link as Record<string, unknown>),
          category_id: remapCategoryId((link as Record<string, unknown>).category_id),
        }))
        .filter((link) => link.category_id);
  }
  const remappedTheme = customThemeSchema.safeParse({ ...source, content });
  if (!remappedTheme.success)
    return NextResponse.json(
      { error: "Theme backup category mappings are invalid." },
      { status: 400 },
    );
  try {
    await uploadBackupImages(supabase, files);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to restore theme images.",
      },
      { status: 400 },
    );
  }
  const { data: existing } = await supabase
    .from("site_themes")
    .select("id")
    .eq("slug", remappedTheme.data.slug)
    .maybeSingle();
  const query = existing
    ? supabase
        .from("site_themes")
        .update(remappedTheme.data)
        .eq("id", existing.id)
        .select("id")
        .single()
    : supabase.from("site_themes").insert(remappedTheme.data).select("id").single();
  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: "Unable to import theme." }, { status: 400 });
  return NextResponse.json(
    { id: data.id, action: existing ? "updated" : "created" },
    { status: existing ? 200 : 201 },
  );
}
