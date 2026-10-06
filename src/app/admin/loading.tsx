"use client";

import { useLanguage } from "@/components/language-provider";

export default function AdminLoading() {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <p aria-live="polite" className="text-sm text-slate-600">
        {t("checkingAccess")}
      </p>
    </main>
  );
}
