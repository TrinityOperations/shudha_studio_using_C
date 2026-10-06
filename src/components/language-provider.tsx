"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { LANGUAGE_COOKIE, isSupportedLanguage } from "@/lib/i18n/language";
import {
  languageLabels,
  translate,
  type TranslationKey,
} from "@/lib/i18n/translations";
import type { SupportedLanguage } from "@/types/domain";

type LanguageContextValue = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: TranslationKey, values?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: {
  children: React.ReactNode;
  defaultLanguage?: SupportedLanguage;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<SupportedLanguage>(defaultLanguage);

  useEffect(() => {
    const saved = window.localStorage.getItem(LANGUAGE_COOKIE);
    const savedLanguage: SupportedLanguage | null = isSupportedLanguage(
      saved ?? undefined,
    )
      ? (saved as SupportedLanguage)
      : null;
    if (savedLanguage) {
      // The timeout keeps the server-rendered default stable during hydration.
      window.setTimeout(() => setLanguageState(savedLanguage), 0);
    }
  }, []);

  const setLanguage = useCallback(
    (next: SupportedLanguage) => {
      setLanguageState(next);
      window.localStorage.setItem(LANGUAGE_COOKIE, next);
      document.cookie = `${LANGUAGE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      router.refresh();
    },
    [router],
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey, values?: Record<string, string | number>) =>
        translate(language, key, values),
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  return (
    <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
        onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
        value={language}
      >
        {Object.entries(languageLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
