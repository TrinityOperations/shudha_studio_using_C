import type { Metadata } from "next";
import Image from "next/image";
import { CatalogListing } from "@/components/public/catalog-listing";
import { PageContainer } from "@/components/public/page-container";
import {
  getActiveCategories,
  getActiveCategoryBySlug,
  getProductPage,
} from "@/lib/catalog";
import { getCategoryImageUrl } from "@/lib/catalog-images";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { getSiteSettings } from "@/lib/site-settings";
import { localizedValue } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    featured?: string;
  }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getActiveCategoryBySlug((await params).slug);
  return {
    title: `${category.name_en} | Shudha Studio`,
    description:
      category.seo_description_en ||
      category.description_en ||
      `Browse ${category.name_en} gifts.`,
    alternates: { canonical: `/shop/category/${category.slug}` },
  };
}
export default async function ShopCategoryPage({ params, searchParams }: Props) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const [category, categories, settings] = await Promise.all([
    getActiveCategoryBySlug(slug),
    getActiveCategories(),
    getSiteSettings(),
  ]);
  const language = await getPreferredLanguage(settings.default_language);
  const page = Math.max(1, Number.parseInt(filters.page || "1", 10) || 1);
  const sort = ["newest", "name-asc", "name-desc"].includes(filters.sort || "")
    ? (filters.sort as "newest" | "name-asc" | "name-desc")
    : undefined;
  const query = filters.q?.trim() || undefined;
  const featured = filters.featured === "1";
  const products = await getProductPage({
    categorySlug: category.slug,
    page,
    query,
    sort,
    featured,
  });
  const image = getCategoryImageUrl(category.image_path ?? null);
  return (
    <>
      {image ? (
        <section className="border-b border-slate-200 bg-slate-50">
          <PageContainer className="relative aspect-[3/1] max-h-80 overflow-hidden py-8">
            <Image
              alt={
                localizedValue(category, "image_alt", language) ||
                localizedValue(category, "name", language)
              }
              className="rounded-2xl object-cover"
              fill
              priority
              sizes="100vw"
              src={image}
              unoptimized={!image.includes("/storage/v1/object/public/")}
            />
          </PageContainer>
        </section>
      ) : null}
      <CatalogListing
        title={localizedValue(category, "name", language)}
        description={localizedValue(category, "description", language) || undefined}
        products={products}
        categories={categories}
        language={language}
        query={query}
        sort={sort}
        featured={featured}
        fixedCategory={category.slug}
        basePath={`/shop/category/${category.slug}`}
        breadcrumb={localizedValue(category, "name", language)}
      />
    </>
  );
}
