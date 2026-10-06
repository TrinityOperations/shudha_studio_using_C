"use client";

import { useLanguage } from "@/components/language-provider";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">
          {t("accessVerifyError")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t("accessVerifyHelp")}</p>
        <button
          className="mt-6 rounded-xl bg-rose-700 px-4 py-3 font-semibold text-white hover:bg-rose-800"
          onClick={reset}
          type="button"
        >
          {t("tryAgain")}
        </button>
      </section>
    </main>
  );
}
