import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  customThemeRowSchema,
  getHomepageThemeContent,
  type CustomTheme,
} from "@/lib/custom-themes";
import { migrateLegacyDiscoveryContent } from "@/lib/storefront-navigation";

function parseAdminTheme(input: unknown): CustomTheme {
  const theme = customThemeRowSchema.parse(input);
  return {
    ...theme,
    content: getHomepageThemeContent(
      migrateLegacyDiscoveryContent(theme.content as Record<string, unknown>),
    ),
  };
}

export async function getAdminThemes(): Promise<CustomTheme[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .select("*")
    .order("created_at");
  if (error) throw new Error("Unable to load themes.");
  return (data ?? []).map(parseAdminTheme);
}

export async function getAdminTheme(id: string): Promise<CustomTheme> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_themes")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Theme not found.");
  return parseAdminTheme(data);
}
