import type { SupportedLanguage } from "@/types/domain";

export const LANGUAGE_COOKIE = "shudha-language";

export function isSupportedLanguage(
  value: string | undefined,
): value is SupportedLanguage {
  return value === "en" || value === "bn";
}
