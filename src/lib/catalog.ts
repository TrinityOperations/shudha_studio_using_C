import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Category, Product, ProductPage } from "@/types/catalog";

const PRODUCT_FIELDS =
  "id, category_id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, is_available, is_featured, main_image_path, main_image_alt_en, main_image_alt_bn, gallery_images, categories!inner(slug, name_en, name_bn)";

function normalizeProduct(product: Record<string, unknown>): Product {
  return {
    ...product,
    gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
  } as Product;
}

export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_description_en, image_path, image_alt_en, image_alt_bn",
    )
    .eq("is_active", true)
    .order("sort_order")
    .order("name_en");

  if (error) throw new Error("Unable to load categories.");
  return (data ?? []) as Category[];
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("is_active", true)
    .eq("is_available", true)
    .eq("is_featured", true)
    .eq("categories.is_active", true)
    .order("sort_order")
    .order("name_en")
    .limit(limit);

  if (error) throw new Error("Unable to load featured products.");
  return (data ?? []).map((product) => normalizeProduct(product));
}

export async function getProductPage({
  categorySlug,
  page = 1,
  pageSize = 12,
  query,
}: {
  categorySlug?: string;
  page?: number;
  pageSize?: number;
  query?: string;
}): Promise<ProductPage> {
  const supabase = await createSupabaseServerClient();
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(48, Math.max(1, pageSize));
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let request = supabase
    .from("products")
    .select(PRODUCT_FIELDS, { count: "exact" })
    .eq("is_active", true)
    .eq("is_available", true)
    .eq("categories.is_active", true)
    .order("sort_order")
    .order("name_en")
    .range(from, to);

  if (categorySlug) request = request.eq("categories.slug", categorySlug);
  if (query?.trim()) {
    const escaped = query.trim().replace(/[,()]/g, " ");
    request = request.or(`name_en.ilike.%${escaped}%,name_bn.ilike.%${escaped}%`);
  }

  const { data, error, count } = await request;
  if (error) throw new Error("Unable to load products.");

  const total = count ?? 0;
  return {
    products: (data ?? []).map((product) => normalizeProduct(product)),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
}

export async function getActiveCategoryBySlug(slug: string): Promise<Category> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_description_en, image_path, image_alt_en, image_alt_bn",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) notFound();
  return data as Category;
}

export async function getPublicProductBySlug(slug: string): Promise<Product> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_FIELDS)
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("is_available", true)
    .eq("categories.is_active", true)
    .maybeSingle();

  if (error || !data) notFound();
  return normalizeProduct(data);
}
