import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogListing } from "@/components/public/catalog-listing";
import { getActiveCategories, getProductPage } from "@/lib/catalog";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ range: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
    sort?: string;
    featured?: string;
  }>;
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { range: slug } = await params;
  const settings = await getSiteSettings();
  const range = settings.theme.content.price_ranges.find((item) => item.slug === slug);
  if (!range) notFound();
  return {
    title: `${range.label_en} | Shudha Studio`,
    description: `Browse gifts in the ${range.label_en} price range.`,
  };
}
export default async function PricePage({ params, searchParams }: Props) {
  const [{ range: slug }, filters] = await Promise.all([params, searchParams]);
  const [settings, categories, language] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getPreferredLanguage("en"),
  ]);
  const range = settings.theme.content.price_ranges.find((item) => item.slug === slug);
  if (!range) notFound();
  const query = filters.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(filters.page || "1", 10) || 1);
  const sort = ["newest", "name-asc", "name-desc", "price-asc", "price-desc"].includes(
    filters.sort || "",
  )
    ? (filters.sort as "newest" | "name-asc" | "name-desc" | "price-asc" | "price-desc")
    : undefined;
  const featured = filters.featured === "1";
  const products = await getProductPage({
    currency: range.currency_code,
    minPrice: range.min,
    maxPrice: range.max,
    query,
    page,
    sort,
    featured,
  });
  return (
    <CatalogListing
      title={language === "bn" ? range.label_bn : range.label_en}
      description={`${range.currency_code}${range.min === null ? "" : ` ${range.min}`} – ${range.max === null ? "" : ` ${range.max}`}`}
      products={products}
      categories={categories}
      language={language}
      query={query}
      sort={sort}
      featured={featured}
      basePath={`/shop/price/${slug}`}
      extraParams={{ range: slug }}
    />
  );
}
