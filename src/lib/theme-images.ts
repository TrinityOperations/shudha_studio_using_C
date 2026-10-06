import { getPublicEnv } from "@/lib/env";

export function getThemeImageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${getPublicEnv().NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/theme-images/${path}`;
}
