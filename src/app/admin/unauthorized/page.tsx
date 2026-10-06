"use client";

import Link from "next/link";
import { LanguageSwitcher, useLanguage } from "@/components/language-provider";

export default function UnauthorizedPage() {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <section className="max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold tracking-[0.2em] text-amber-700 uppercase">
          {t("accessDenied")}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          {t("adminRequired")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t("notAdmin")}</p>
        <Link
          className="mt-6 inline-flex rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50"
          href="/"
        >
          {t("returnHome")}
        </Link>
        <div className="mt-6">
          <LanguageSwitcher />
        </div>
      </section>
    </main>
  );
}
