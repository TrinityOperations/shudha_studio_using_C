import type { Metadata } from "next";
import { CatalogListing } from "@/components/public/catalog-listing";
import { getActiveCategories, getProductPage } from "@/lib/catalog";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { getSiteSettings } from "@/lib/site-settings";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Shop | Shudha Studio",
  description: "Browse thoughtful gifts from Shudha Studio.",
};
type Params = Promise<Record<string, string | undefined>>;

export default async function ShopPage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const category = params.category;
  const sort = ["newest", "name-asc", "name-desc", "price-asc", "price-desc"].includes(
    params.sort || "",
  )
    ? (params.sort as "newest" | "name-asc" | "name-desc" | "price-asc" | "price-desc")
    : undefined;
  const featured = params.featured === "1";
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const settings = await getSiteSettings();
  const [categories, language] = await Promise.all([
    getActiveCategories(),
    getPreferredLanguage(settings.default_language),
  ]);
  const range = settings.theme.content.price_ranges.find(
    (item) => item.slug === params.range,
  );
  const suppliedCurrency =
    range?.currency_code ||
    (/^[A-Z]{3}$/.test(params.currency || "") ? params.currency : undefined);
  const minRequested = params.min_price !== undefined;
  const maxRequested = params.max_price !== undefined;
  const minPrice = range
    ? range.min
    : params.min_price &&
        Number.isFinite(Number(params.min_price)) &&
        Number(params.min_price) >= 0
      ? Number(params.min_price)
      : undefined;
  const maxPrice = range
    ? range.max
    : params.max_price &&
        Number.isFinite(Number(params.max_price)) &&
        Number(params.max_price) >= 0
      ? Number(params.max_price)
      : undefined;
  const currency = range || minRequested || maxRequested ? suppliedCurrency : undefined;
  const products = await getProductPage({
    categorySlug: category,
    featured,
    currency,
    minPrice,
    maxPrice,
    page,
    query: q,
    sort,
  });
  const title = range
    ? language === "bn"
      ? range.label_bn
      : range.label_en
    : translate(language, "shopThoughtfulGifts");
  return (
    <CatalogListing
      title={title}
      description={translate(language, "shopDescription")}
      products={products}
      categories={categories}
      language={language}
      query={q}
      category={category}
      sort={sort}
      featured={featured}
      extraParams={{
        range: range?.slug,
        currency,
        min_price: minPrice === undefined ? undefined : String(minPrice),
        max_price: maxPrice === undefined ? undefined : String(maxPrice),
      }}
    />
  );
}
