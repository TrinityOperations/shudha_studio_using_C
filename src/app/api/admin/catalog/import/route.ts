import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { catalogBackupSchema, legacyCatalogBackupSchema } from "@/lib/backup-formats";
import { readBackupRequest } from "@/lib/backup-request";
import { uploadBackupImages } from "@/lib/backup-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  categoryAdminSchema,
  productAdminSchema,
} from "@/lib/validations/catalog-admin";

export async function POST(request: Request) {
  await requireAdmin();
  let backup:
    | ReturnType<typeof catalogBackupSchema.parse>
    | ReturnType<typeof legacyCatalogBackupSchema.parse>;
  let files: Awaited<ReturnType<typeof readBackupRequest>>["files"] = [];
  try {
    const parsed = await readBackupRequest(request);
    const validated = catalogBackupSchema.safeParse(parsed.data);
    const legacyValidated = legacyCatalogBackupSchema.safeParse(parsed.data);
    if (!validated.success && !legacyValidated.success)
      throw new Error("Invalid catalog backup file.");
    if (validated.success) backup = validated.data;
    else if (legacyValidated.success) backup = legacyValidated.data;
    else throw new Error("Invalid catalog backup file.");
    files = parsed.files;
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid catalog backup file.",
      },
      { status: 400 },
    );
  }
  const supabase = await createSupabaseServerClient();
  try {
    await uploadBackupImages(supabase, files);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to restore catalog images.",
      },
      { status: 400 },
    );
  }
  const categoryIds = new Map<string, string>();
  let categoriesCreated = 0;
  let productsCreated = 0;
  for (const rawCategory of backup.categories) {
    const category = categoryAdminSchema.safeParse(rawCategory);
    if (!category.success)
      return NextResponse.json(
        { error: "Catalog contains invalid category data." },
        { status: 400 },
      );
    const categoryData = {
      ...category.data,
      image_path:
        typeof rawCategory.image_path === "string" ? rawCategory.image_path : null,
      image_alt_en:
        typeof rawCategory.image_alt_en === "string" ? rawCategory.image_alt_en : null,
      image_alt_bn:
        typeof rawCategory.image_alt_bn === "string" ? rawCategory.image_alt_bn : null,
    };
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", category.data.slug)
      .maybeSingle();
    const query = existing
      ? supabase
          .from("categories")
          .update(categoryData)
          .eq("id", existing.id)
          .select("id")
          .single()
      : supabase.from("categories").insert(categoryData).select("id").single();
    const { data, error } = await query;
    if (error || !data)
      return NextResponse.json(
        { error: "Unable to import category data." },
        { status: 400 },
      );
    categoryIds.set(category.data.slug, data.id);
    if (!existing) categoriesCreated += 1;
  }
  for (const rawProduct of backup.products) {
    const categoryId = categoryIds.get(rawProduct.category_slug);
    if (!categoryId)
      return NextResponse.json(
        { error: `Missing category: ${rawProduct.category_slug}` },
        { status: 400 },
      );
    const excludedProductKeys = new Set([
      "category_slug",
      "id",
      "created_at",
      "updated_at",
      "categories",
    ]);
    const productData = Object.fromEntries(
      Object.entries(rawProduct).filter(([key]) => !excludedProductKeys.has(key)),
    );
    const product = productAdminSchema.safeParse({
      ...productData,
      category_id: categoryId,
    });
    if (!product.success)
      return NextResponse.json(
        { error: "Catalog contains invalid product data." },
        { status: 400 },
      );
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", product.data.slug)
      .maybeSingle();
    const productDataWithImages = {
      ...product.data,
      main_image_path:
        typeof rawProduct.main_image_path === "string"
          ? rawProduct.main_image_path
          : null,
      main_image_alt_en:
        typeof rawProduct.main_image_alt_en === "string"
          ? rawProduct.main_image_alt_en
          : null,
      main_image_alt_bn:
        typeof rawProduct.main_image_alt_bn === "string"
          ? rawProduct.main_image_alt_bn
          : null,
      gallery_images: Array.isArray(rawProduct.gallery_images)
        ? rawProduct.gallery_images
        : [],
    };
    const query = existing
      ? supabase
          .from("products")
          .update(productDataWithImages)
          .eq("id", existing.id)
          .select("id")
          .single()
      : supabase.from("products").insert(productDataWithImages).select("id").single();
    const { error } = await query;
    if (error)
      return NextResponse.json(
        { error: "Unable to import product data." },
        { status: 400 },
      );
    if (!existing) productsCreated += 1;
  }
  return NextResponse.json({
    categories_created: categoriesCreated,
    products_created: productsCreated,
  });
}
