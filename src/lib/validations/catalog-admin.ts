import { z } from "zod";

const optionalText = (max: number) =>
  z
    .preprocess(
      (value) => (value == null ? "" : value),
      z.string().trim().max(max).or(z.literal("")),
    )
    .default("");

const optionalNumber = z
  .preprocess(
    (value) => (value === "" || value == null ? null : value),
    z.coerce.number().finite().min(0).nullable(),
  )
  .default(null);

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

const productAdminFields = {
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
  price: optionalNumber,
  compare_at_price: optionalNumber,
  currency_code: z.preprocess(
    (value) =>
      value == null || value === "" ? "USD" : String(value).trim().toUpperCase(),
    z.string().regex(/^[A-Z]{3}$/),
  ),
};

function validateProductPricing(
  product: { price?: number | null; compare_at_price?: number | null },
  context: z.RefinementCtx,
) {
  if (product.compare_at_price != null && product.price === null) {
    context.addIssue({
      code: "custom",
      path: ["compare_at_price"],
      message: "Set a current price before adding a compare-at price.",
    });
  }
  if (
    product.compare_at_price != null &&
    product.price != null &&
    product.compare_at_price <= product.price
  ) {
    context.addIssue({
      code: "custom",
      path: ["compare_at_price"],
      message: "Compare-at price must exceed the current price.",
    });
  }
}

export const productAdminSchema = z
  .object(productAdminFields)
  .superRefine(validateProductPricing);

export const productAdminUpdateSchema = z
  .object(productAdminFields)
  .partial()
  .superRefine(validateProductPricing);

export type CategoryAdminInput = z.infer<typeof categoryAdminSchema>;
export type ProductAdminInput = z.infer<typeof productAdminSchema>;
