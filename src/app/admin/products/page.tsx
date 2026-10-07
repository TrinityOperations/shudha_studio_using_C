import type { Metadata } from "next";

import { DeleteButton } from "@/components/admin/delete-button";
import { ImportBackupButton } from "@/components/admin/backup-controls";
import { PageContainer } from "@/components/public/page-container";
import { getAdminProducts } from "@/lib/admin-catalog";
import { requireAdmin } from "@/lib/auth/server";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products | Admin | Shudha Studio" };

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAdminProducts();
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
              {translate(language, "products")}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <ImportBackupButton
              endpoint="/api/admin/catalog/import"
              label="Import catalog"
            />
            <a
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"
              download
              href="/api/admin/catalog/export"
            >
              Export catalog
            </a>
            <a
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"
              href="/admin"
            >
              {translate(language, "adminVerified")}
            </a>
            <a
              className="rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white"
              href="/admin/products/new"
            >
              {translate(language, "newProduct")}
            </a>
          </div>
        </div>
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {products.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-4 py-3">{translate(language, "products")}</th>
                    <th className="px-4 py-3">{translate(language, "category")}</th>
                    <th className="px-4 py-3">{translate(language, "state")}</th>
                    <th className="px-4 py-3">{translate(language, "actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => {
                    const category = Array.isArray(product.categories)
                      ? product.categories[0]
                      : product.categories;
                    return (
                      <tr key={product.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-950">
                            {product.name_en}
                          </p>
                          <p className="text-slate-600">{product.slug}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {category?.name_en ?? "—"}
                        </td>
                        <td className="px-4 py-4 text-xs">
                          <p
                            className={
                              product.is_active ? "text-emerald-700" : "text-slate-500"
                            }
                          >
                            {translate(
                              language,
                              product.is_active ? "active" : "inactive",
                            )}
                          </p>
                          <p
                            className={
                              product.is_available
                                ? "text-emerald-700"
                                : "text-slate-500"
                            }
                          >
                            {translate(
                              language,
                              product.is_available ? "available" : "unavailable",
                            )}
                          </p>
                          {product.is_featured ? (
                            <p className="text-amber-700">
                              {translate(language, "featured")}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <a
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                              href={`/admin/products/${product.id}/edit`}
                            >
                              {translate(language, "edit")}
                            </a>
                            <DeleteButton
                              endpoint={`/api/admin/products/${product.id}`}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-10 text-center text-slate-600">
              {translate(language, "noProductsYet")}
            </p>
          )}
        </section>
      </PageContainer>
    </main>
  );
}
