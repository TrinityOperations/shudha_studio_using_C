import type { Metadata } from "next";

import { CatalogControls } from "@/components/public/catalog-controls";
import { PageContainer } from "@/components/public/page-container";
import { Pagination } from "@/components/public/pagination";
import { ProductGrid } from "@/components/public/product-grid";
import { getActiveCategories, getProductPage } from "@/lib/catalog";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products | Shudha Studio",
  description: "Browse thoughtful gifts from Shudha Studio.",
};

type ProductsPageProps = {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const category = params.category?.trim() || undefined;
  const parsedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getProductPage({ categorySlug: category, page, query }),
  ]);
  const language = await getPreferredLanguage("en");

  return (
    <main id="main-content">
      <section className="bg-slate-950 text-white">
        <PageContainer className="py-16 sm:py-20">
          <p className="text-sm font-semibold tracking-[0.2em] text-rose-300 uppercase">
            {translate(language, "collection")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {translate(language, "thoughtfulGifts")}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            {translate(language, "browseCollection")}
          </p>
        </PageContainer>
      </section>
      <PageContainer className="py-10 sm:py-14">
        <CatalogControls categories={categories} category={category} query={query} />
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            {products.total}{" "}
            {translate(
              language,
              products.total === 1 ? "productFound" : "productsFound",
            )}
            {query ? ` for “${query}”` : ""}
          </p>
        </div>
        <div className="mt-6">
          {products.products.length ? (
            <ProductGrid products={products.products} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <h2 className="text-xl font-semibold text-slate-950">
                {translate(language, "noProducts")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {translate(language, "tryDifferentSearch")}
              </p>
            </div>
          )}
        </div>
        <Pagination
          category={category}
          page={products.page}
          query={query}
          totalPages={products.totalPages}
        />
      </PageContainer>
    </main>
  );
}
