import type { Metadata } from "next";

import { PageContainer } from "@/components/public/page-container";
import { ProductGrid } from "@/components/public/product-grid";
import { getActiveCategoryBySlug, getProductPage } from "@/lib/catalog";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { localizedValue, translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const category = await getActiveCategoryBySlug((await params).slug);
  const language = await getPreferredLanguage("en");
  const title =
    localizedValue(category, "seo_title", language) ||
    `${localizedValue(category, "name", language)} | Shudha Studio`;
  const description =
    localizedValue(category, "seo_description", language) ||
    localizedValue(category, "description", language) ||
    `Browse ${localizedValue(category, "name", language)} gifts from Shudha Studio.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getActiveCategoryBySlug((await params).slug);
  const products = await getProductPage({ categorySlug: category.slug });
  const language = await getPreferredLanguage("en");

  return (
    <main id="main-content">
      <PageContainer className="py-16 sm:py-24">
        <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
          {translate(language, "collectionLabel")}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          {localizedValue(category, "name", language)}
        </h1>
        {localizedValue(category, "description", language) ? (
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {localizedValue(category, "description", language)}
          </p>
        ) : null}
        <div className="mt-10">
          {products.products.length ? (
            <ProductGrid products={products.products} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-600">
              {translate(language, "noCategoryProducts")}
            </div>
          )}
        </div>
      </PageContainer>
    </main>
  );
}
