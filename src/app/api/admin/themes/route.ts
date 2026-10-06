import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { customThemeSchema } from "@/lib/custom-themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .select("*")
    .order("created_at");
  if (error)
    return NextResponse.json({ error: "Unable to load themes." }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = customThemeSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please correct the theme fields." },
      { status: 400 },
    );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .insert(parsed.data)
    .select("*")
    .single();
  if (error)
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "That theme slug is already in use."
            : "Unable to create theme.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  await requireAdmin();
  const body = (await request.json()) as { active_theme_id?: unknown };
  if (typeof body.active_theme_id !== "string")
    return NextResponse.json({ error: "Choose a theme." }, { status: 400 });
  const supabase = await createSupabaseServerClient();
  const { data: theme, error: themeError } = await supabase
    .from("site_themes")
    .select("id, slug")
    .eq("id", body.active_theme_id)
    .single();
  if (themeError || !theme)
    return NextResponse.json(
      { error: "That theme is not available." },
      { status: 400 },
    );
  const { error } = await supabase
    .from("site_settings")
    .update({ active_theme_id: theme.id, active_theme: theme.slug })
    .eq("id", true);
  if (error)
    return NextResponse.json({ error: "Unable to activate theme." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ active_theme_id: body.active_theme_id });
}
