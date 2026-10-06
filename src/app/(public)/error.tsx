"use client";

import { useLanguage } from "@/components/language-provider";

export default function PublicError({ reset }: { reset: () => void }) {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
      <section className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-[0.2em] text-red-700 uppercase">
          {t("somethingWentWrong")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          {t("websiteSettingsError")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t("publicErrorHelp")}</p>
        <button
          className="mt-6 rounded-xl bg-rose-700 px-4 py-3 font-semibold text-white transition hover:bg-rose-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
          onClick={reset}
          type="button"
        >
          {t("tryAgain")}
        </button>
      </section>
    </main>
  );
}
