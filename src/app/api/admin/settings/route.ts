import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteSettingsThemeSchema } from "@/lib/validations/site-settings";

export async function PATCH(request: Request) {
  await requireAdmin();
  const parsed = siteSettingsThemeSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please choose a valid theme." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: savedTheme, error: themeError } = await supabase
    .from("site_themes")
    .select("id, slug")
    .eq("slug", parsed.data.active_theme)
    .maybeSingle();
  if (themeError || !savedTheme) {
    return NextResponse.json(
      {
        error: "The selected theme is not available. Apply the custom theme migration.",
      },
      { status: 400 },
    );
  }
  const { error } = await supabase
    .from("site_settings")
    .update({ active_theme: parsed.data.active_theme, active_theme_id: savedTheme.id })
    .eq("id", true);

  if (error) {
    return NextResponse.json({ error: "Unable to save the theme." }, { status: 400 });
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ active_theme: parsed.data.active_theme });
}
