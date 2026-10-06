import { getPublicEnv } from "@/lib/env";

export function getProductImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${path}`;
}

export function getCategoryImageUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  return `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${path}`;
}
