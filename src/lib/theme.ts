export const themes = ["everyday", "wedding", "festival"] as const;

export type SiteTheme = (typeof themes)[number];

export const themeLabels: Record<SiteTheme, { en: string; bn: string }> = {
  everyday: { en: "Everyday", bn: "দৈনন্দিন" },
  wedding: { en: "Wedding", bn: "বিয়ে" },
  festival: { en: "Festival", bn: "উৎসব" },
};

export function isSiteTheme(value: string | null | undefined): value is SiteTheme {
  return themes.includes(value as SiteTheme);
}

export function normalizeTheme(value: string | null | undefined): SiteTheme {
  return isSiteTheme(value) ? value : "everyday";
}
