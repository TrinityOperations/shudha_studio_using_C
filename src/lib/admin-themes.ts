import { createSupabaseServerClient } from "@/lib/supabase/server";
import { customThemeRowSchema, type CustomTheme } from "@/lib/custom-themes";

export async function getAdminThemes(): Promise<CustomTheme[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .select("*")
    .order("created_at");
  if (error) throw new Error("Unable to load themes.");
  return (data ?? []).map((theme) => customThemeRowSchema.parse(theme));
}

export async function getAdminTheme(id: string): Promise<CustomTheme> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Theme not found.");
  return customThemeRowSchema.parse(data);
}
