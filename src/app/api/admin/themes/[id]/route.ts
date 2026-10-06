import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { customThemeSchema } from "@/lib/custom-themes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const parsed = customThemeSchema.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Please correct the theme fields." },
      { status: 400 },
    );
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();
  if (error)
    return NextResponse.json(
      {
        error:
          error.code === "23505"
            ? "That theme slug is already in use."
            : "Unable to update theme.",
      },
      { status: error.code === "23505" ? 409 : 400 },
    );
  revalidatePath("/", "layout");
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, context: Context) {
  await requireAdmin();
  const { id } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("active_theme_id")
    .eq("id", true)
    .single();
  if (settings?.active_theme_id === id)
    return NextResponse.json(
      { error: "Activate another theme before deleting this one." },
      { status: 409 },
    );
  const { error } = await supabase.from("site_themes").delete().eq("id", id);
  if (error)
    return NextResponse.json({ error: "Unable to delete theme." }, { status: 400 });
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
