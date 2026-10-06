import { z } from "zod";

export const themeColorsSchema = z.object({
  background: z.string().regex(/^#[0-9a-f]{6}$/i),
  surface: z.string().regex(/^#[0-9a-f]{6}$/i),
  mutedSurface: z.string().regex(/^#[0-9a-f]{6}$/i),
  foreground: z.string().regex(/^#[0-9a-f]{6}$/i),
  mutedForeground: z.string().regex(/^#[0-9a-f]{6}$/i),
  border: z.string().regex(/^#[0-9a-f]{6}$/i),
  primary: z.string().regex(/^#[0-9a-f]{6}$/i),
  primaryHover: z.string().regex(/^#[0-9a-f]{6}$/i),
  primarySoft: z.string().regex(/^#[0-9a-f]{6}$/i),
  hero: z.string().regex(/^#[0-9a-f]{6}$/i),
  heroAccent: z.string().regex(/^#[0-9a-f]{6}$/i),
  heroHighlight: z.string().regex(/^#[0-9a-f]{6}$/i),
});

export const themeContentSchema = z.object({
  eyebrow_en: z.string().max(160).default(""),
  eyebrow_bn: z.string().max(160).default(""),
  hero_title_en: z.string().max(300).default(""),
  hero_title_bn: z.string().max(300).default(""),
  hero_description_en: z.string().max(1000).default(""),
  hero_description_bn: z.string().max(1000).default(""),
  featured_heading_en: z.string().max(200).default(""),
  featured_heading_bn: z.string().max(200).default(""),
  categories_heading_en: z.string().max(200).default(""),
  categories_heading_bn: z.string().max(200).default(""),
  contact_heading_en: z.string().max(200).default(""),
  contact_heading_bn: z.string().max(200).default(""),
  tags_en: z.array(z.string().max(60)).max(5).default([]),
  tags_bn: z.array(z.string().max(60)).max(5).default([]),
});

export const customThemeSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  colors: themeColorsSchema,
  content: themeContentSchema,
  logo_path: z.string().max(500).nullable().default(null),
  background_path: z.string().max(500).nullable().default(null),
  hero_path: z.string().max(500).nullable().default(null),
  logo_alt_en: z.string().max(200).nullable().default(null),
  logo_alt_bn: z.string().max(200).nullable().default(null),
});

export const customThemeRowSchema = customThemeSchema.extend({
  id: z.string(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type CustomTheme = z.infer<typeof customThemeRowSchema>;

export const defaultThemeColors = {
  background: "#ffffff",
  surface: "#ffffff",
  mutedSurface: "#f8fafc",
  foreground: "#0f172a",
  mutedForeground: "#475569",
  border: "#e2e8f0",
  primary: "#be123c",
  primaryHover: "#9f1239",
  primarySoft: "#fecdd3",
  hero: "#020617",
  heroAccent: "#f43f5e",
  heroHighlight: "#fbbf24",
};
