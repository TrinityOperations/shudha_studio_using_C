import type { Metadata } from "next";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { LanguageSwitcher } from "@/components/language-provider";
import { requireAdmin } from "@/lib/auth/server";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const metadata: Metadata = {
  title: "Admin | Shudha Studio",
  description: "Protected Shudha Studio administration area.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  const language = await getPreferredLanguage();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
              Shudha Studio
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Admin access verified
            </h1>
            <p className="mt-3 text-slate-600">
              Signed in as {admin.email ?? admin.displayName ?? "administrator"}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <AdminLogoutButton />
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-950">Phase 3 foundation</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Authentication and server-side admin authorization are active. Catalog
            Category, product, and meeting request management are available from the
            protected admin area.
          </p>
        </div>
        <a
          className="mt-6 inline-flex rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-800"
          href="/admin/meetings"
        >
          View meeting requests
        </a>
        <a
          className="mt-4 inline-flex rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
          href="/admin/themes"
        >
          Manage themes
        </a>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
            href="/admin/categories"
          >
            Manage categories
          </a>
          <a
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold"
            href="/admin/products"
          >
            Manage products
          </a>
        </div>
      </section>
    </main>
  );
}
