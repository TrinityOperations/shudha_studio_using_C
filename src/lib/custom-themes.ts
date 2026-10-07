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
  announcement_en: z.string().max(240).default(""),
  announcement_bn: z.string().max(240).default(""),
  show_occasion_section: z.boolean().default(true),
  show_recipient_section: z.boolean().default(true),
  show_featured_section: z.boolean().default(true),
  show_categories_section: z.boolean().default(true),
  show_campaign_section: z.boolean().default(true),
  show_trust_section: z.boolean().default(true),
  show_meeting_section: z.boolean().default(true),
  show_story_section: z.boolean().default(true),
  show_contact_section: z.boolean().default(true),
  occasion_category_ids: z.array(z.string().uuid()).max(12).default([]),
  recipient_category_ids: z.array(z.string().uuid()).max(12).default([]),
  collection_category_ids: z.array(z.string().uuid()).max(12).default([]),
  occasion_links: z
    .array(
      z.object({
        key: z.enum([
          "birthday",
          "wedding",
          "anniversary",
          "eid",
          "new_baby",
          "thank_you",
          "corporate",
          "seasonal",
        ]),
        category_id: z.string().uuid(),
      }),
    )
    .max(8)
    .default([]),
  recipient_links: z
    .array(
      z.object({
        key: z.enum(["her", "him", "parents", "children", "friends", "couples"]),
        category_id: z.string().uuid(),
      }),
    )
    .max(6)
    .default([]),
  occasion_intro_en: z.string().max(1000).default(""),
  occasion_intro_bn: z.string().max(1000).default(""),
  price_ranges: z
    .array(
      z
        .object({
          slug: z
            .string()
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          label_en: z.string().trim().min(1).max(100),
          label_bn: z.string().trim().min(1).max(100),
          currency_code: z.string().regex(/^[A-Z]{3}$/),
          min: z.number().finite().min(0).nullable().default(null),
          max: z.number().finite().min(0).nullable().default(null),
        })
        .refine(
          (range) => range.min === null || range.max === null || range.min <= range.max,
          { message: "Minimum must not exceed maximum." },
        ),
    )
    .max(12)
    .default([]),
  campaign_title_en: z.string().max(160).default(""),
  campaign_title_bn: z.string().max(160).default(""),
  campaign_description_en: z.string().max(500).default(""),
  campaign_description_bn: z.string().max(500).default(""),
  campaign_category_id: z.string().uuid().nullable().default(null),
  trust_heading_en: z.string().max(160).default(""),
  trust_heading_bn: z.string().max(160).default(""),
  trust_copy_en: z.string().max(500).default(""),
  trust_copy_bn: z.string().max(500).default(""),
  meeting_heading_en: z.string().max(160).default(""),
  meeting_heading_bn: z.string().max(160).default(""),
  meeting_copy_en: z.string().max(500).default(""),
  meeting_copy_bn: z.string().max(500).default(""),
  story_title_en: z.string().max(160).default(""),
  story_title_bn: z.string().max(160).default(""),
  story_copy_en: z.string().max(1000).default(""),
  story_copy_bn: z.string().max(1000).default(""),
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

export function getHomepageThemeContent(input: unknown) {
  const source =
    typeof input === "object" && input !== null && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const compatible = {
    ...source,
    show_occasion_section:
      typeof source.show_occasion_section === "boolean"
        ? source.show_occasion_section
        : true,
    show_recipient_section:
      typeof source.show_recipient_section === "boolean"
        ? source.show_recipient_section
        : true,
    show_featured_section:
      typeof source.show_featured_section === "boolean"
        ? source.show_featured_section
        : true,
    show_categories_section:
      typeof source.show_categories_section === "boolean"
        ? source.show_categories_section
        : true,
    show_campaign_section:
      typeof source.show_campaign_section === "boolean"
        ? source.show_campaign_section
        : true,
    show_trust_section:
      typeof source.show_trust_section === "boolean" ? source.show_trust_section : true,
    show_meeting_section:
      typeof source.show_meeting_section === "boolean"
        ? source.show_meeting_section
        : true,
    show_story_section:
      typeof source.show_story_section === "boolean" ? source.show_story_section : true,
    show_contact_section:
      typeof source.show_contact_section === "boolean"
        ? source.show_contact_section
        : true,
    occasion_links: Array.isArray(source.occasion_links) ? source.occasion_links : [],
    recipient_links: Array.isArray(source.recipient_links)
      ? source.recipient_links
      : [],
    campaign_title_en:
      typeof source.campaign_title_en === "string" ? source.campaign_title_en : "",
    campaign_title_bn:
      typeof source.campaign_title_bn === "string" ? source.campaign_title_bn : "",
    campaign_description_en:
      typeof source.campaign_description_en === "string"
        ? source.campaign_description_en
        : "",
    campaign_description_bn:
      typeof source.campaign_description_bn === "string"
        ? source.campaign_description_bn
        : "",
    campaign_category_id:
      typeof source.campaign_category_id === "string" &&
      z.string().uuid().safeParse(source.campaign_category_id).success
        ? source.campaign_category_id
        : null,
    trust_heading_en:
      typeof source.trust_heading_en === "string" ? source.trust_heading_en : "",
    trust_heading_bn:
      typeof source.trust_heading_bn === "string" ? source.trust_heading_bn : "",
    trust_copy_en: typeof source.trust_copy_en === "string" ? source.trust_copy_en : "",
    trust_copy_bn: typeof source.trust_copy_bn === "string" ? source.trust_copy_bn : "",
    meeting_heading_en:
      typeof source.meeting_heading_en === "string" ? source.meeting_heading_en : "",
    meeting_heading_bn:
      typeof source.meeting_heading_bn === "string" ? source.meeting_heading_bn : "",
    meeting_copy_en:
      typeof source.meeting_copy_en === "string" ? source.meeting_copy_en : "",
    meeting_copy_bn:
      typeof source.meeting_copy_bn === "string" ? source.meeting_copy_bn : "",
    story_title_en:
      typeof source.story_title_en === "string" ? source.story_title_en : "",
    story_title_bn:
      typeof source.story_title_bn === "string" ? source.story_title_bn : "",
    story_copy_en: typeof source.story_copy_en === "string" ? source.story_copy_en : "",
    story_copy_bn: typeof source.story_copy_bn === "string" ? source.story_copy_bn : "",
  };
  return themeContentSchema.parse(compatible);
}

export function validateThemeContent(input: unknown) {
  return themeContentSchema.parse(input);
}

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

export const customThemeRowSchema = z.object({
  id: z.string(),
  name: customThemeSchema.shape.name,
  slug: customThemeSchema.shape.slug,
  colors: themeColorsSchema,
  content: z.unknown().default({}),
  logo_path: z.string().max(500).nullable().default(null),
  background_path: z.string().max(500).nullable().default(null),
  hero_path: z.string().max(500).nullable().default(null),
  logo_alt_en: z.string().max(200).nullable().default(null),
  logo_alt_bn: z.string().max(200).nullable().default(null),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type CustomTheme = Omit<z.infer<typeof customThemeRowSchema>, "content"> & {
  content: z.infer<typeof themeContentSchema>;
};

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
