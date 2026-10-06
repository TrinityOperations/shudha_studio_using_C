import { cookies } from "next/headers";

import { LANGUAGE_COOKIE, isSupportedLanguage } from "@/lib/i18n/language";
import type { SupportedLanguage } from "@/types/domain";

export async function getPreferredLanguage(defaultLanguage: SupportedLanguage = "en") {
  const value = (await cookies()).get(LANGUAGE_COOKIE)?.value;
  return isSupportedLanguage(value) ? value : defaultLanguage;
}
