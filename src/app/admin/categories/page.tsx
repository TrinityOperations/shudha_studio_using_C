import type { Metadata } from "next";

import { DeleteButton } from "@/components/admin/delete-button";
import { PageContainer } from "@/components/public/page-container";
import { getAdminCategories } from "@/lib/admin-catalog";
import { requireAdmin } from "@/lib/auth/server";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Categories | Admin | Shudha Studio" };

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await getAdminCategories();
  const language = await getPreferredLanguage();
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
              {translate(language, "catalog")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {translate(language, "categories")}
            </h1>
          </div>
          <div className="flex gap-3">
            <a
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"
              href="/admin"
            >
              {translate(language, "adminVerified")}
            </a>
            <a
              className="rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white"
              href="/admin/categories/new"
            >
              {translate(language, "newCategory")}
            </a>
          </div>
        </div>
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {categories.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">{translate(language, "category")}</th>
                    <th className="px-4 py-3">{translate(language, "slug")}</th>
                    <th className="px-4 py-3">{translate(language, "state")}</th>
                    <th className="px-4 py-3">{translate(language, "actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-950">
                          {category.name_en}
                        </p>
                        <p className="text-slate-600">{category.name_bn}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{category.slug}</td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            category.is_active ? "text-emerald-700" : "text-slate-500"
                          }
                        >
                          {translate(
                            language,
                            category.is_active ? "active" : "inactive",
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                            href={`/admin/categories/${category.id}/edit`}
                          >
                            {translate(language, "edit")}
                          </a>
                          <DeleteButton
                            endpoint={`/api/admin/categories/${category.id}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-10 text-center text-slate-600">
              {translate(language, "noCategories")}
            </p>
          )}
        </section>
      </PageContainer>
    </main>
  );
}
