import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).or(z.literal("")).default("");

const slug = z
  .string()
  .trim()
  .min(1, "Slug is required.")
  .max(160)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only.",
  );

export const categoryAdminSchema = z.object({
  slug: slug.max(120),
  name_en: z.string().trim().min(1, "English name is required.").max(160),
  name_bn: z.string().trim().min(1, "Bangla name is required.").max(160),
  description_en: optionalText(5000),
  description_bn: optionalText(5000),
  seo_title_en: optionalText(160),
  seo_title_bn: optionalText(160),
  seo_description_en: optionalText(320),
  seo_description_bn: optionalText(320),
  is_active: z.boolean().default(true),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const productAdminSchema = z.object({
  category_id: z.string().uuid("Choose a valid category."),
  slug,
  name_en: z.string().trim().min(1, "English name is required.").max(200),
  name_bn: z.string().trim().min(1, "Bangla name is required.").max(200),
  description_en: optionalText(10000),
  description_bn: optionalText(10000),
  seo_title_en: optionalText(160),
  seo_title_bn: optionalText(160),
  seo_description_en: optionalText(320),
  seo_description_bn: optionalText(320),
  is_active: z.boolean().default(true),
  is_available: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type CategoryAdminInput = z.infer<typeof categoryAdminSchema>;
export type ProductAdminInput = z.infer<typeof productAdminSchema>;
