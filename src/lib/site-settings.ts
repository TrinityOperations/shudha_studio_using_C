import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  customThemeRowSchema,
  defaultThemeColors,
  getHomepageThemeContent,
  type CustomTheme,
} from "@/lib/custom-themes";
import { migrateLegacyDiscoveryContent } from "@/lib/storefront-navigation";
import { normalizeTheme, type SiteTheme } from "@/lib/theme";

export type SiteSettings = {
  address_en: string | null;
  address_bn: string | null;
  business_timezone: string;
  business_name_en: string;
  business_name_bn: string;
  default_language: "en" | "bn";
  active_theme: SiteTheme;
  active_theme_id: string | null;
  theme: CustomTheme;
  contact_description_en: string | null;
  contact_description_bn: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "business_name_en, business_name_bn, phone, whatsapp, email, address_en, address_bn, business_timezone, default_language, active_theme, active_theme_id, contact_description_en, contact_description_bn, site_themes(*)",
    )
    .eq("id", true)
    .single();

  if (error || !data) {
    throw new Error("Unable to load public site settings.");
  }

  const rawTheme = Array.isArray(data.site_themes)
    ? data.site_themes[0]
    : data.site_themes;
  const fallbackTheme = {
    id: data.active_theme_id ?? "legacy",
    name: normalizeTheme(data.active_theme),
    slug: normalizeTheme(data.active_theme),
    colors: defaultThemeColors,
    content: {},
    logo_path: null,
    background_path: null,
    hero_path: null,
    logo_alt_en: null,
    logo_alt_bn: null,
  };
  const parsedTheme = customThemeRowSchema.parse(rawTheme ?? fallbackTheme);
  const theme = {
    ...parsedTheme,
    content: getHomepageThemeContent(
      migrateLegacyDiscoveryContent(parsedTheme.content as Record<string, unknown>),
    ),
  };
  return {
    ...data,
    active_theme: normalizeTheme(data.active_theme),
    active_theme_id: data.active_theme_id ?? null,
    theme,
  } as SiteSettings;
}
