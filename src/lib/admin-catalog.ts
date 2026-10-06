import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminCategories() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, is_active, sort_order, image_path, image_alt_en, image_alt_bn",
    )
    .order("sort_order")
    .order("name_en");
  if (error) throw new Error("Unable to load categories.");
  return data ?? [];
}

export async function getAdminCategory(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select(
      "id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, is_active, sort_order, image_path, image_alt_en, image_alt_bn",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error("Category not found.");
  return data;
}

export async function getAdminProducts() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, category_id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, is_active, is_available, is_featured, sort_order, main_image_path, gallery_images, categories(name_en)",
    )
    .order("sort_order")
    .order("name_en");
  if (error) throw new Error("Unable to load products.");
  return data ?? [];
}

export async function getAdminProduct(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, category_id, slug, name_en, name_bn, description_en, description_bn, seo_title_en, seo_title_bn, seo_description_en, seo_description_bn, is_active, is_available, is_featured, sort_order, main_image_path, gallery_images",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) throw new Error("Product not found.");
  return data;
}
