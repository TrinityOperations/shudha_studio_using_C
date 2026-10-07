import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CatalogListing } from "@/components/public/catalog-listing";
import { getActiveCategories, getProductPage } from "@/lib/catalog";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate, type TranslationKey } from "@/lib/i18n/translations";
import { getSiteSettings } from "@/lib/site-settings";
import { resolveDiscoveryLink, recipientOptions } from "@/lib/storefront-navigation";
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
  const slug = (await params).slug;
  const option = recipientOptions.find(([key]) => key === slug);
  if (!option) notFound();
  return {
    title: `${option[1]} gifts | Shudha Studio`,
    description: `Thoughtful gifts ${option[1].toLowerCase()}.`,
  };
}
export default async function RecipientPage({ params, searchParams }: Props) {
  const [{ slug }, filters] = await Promise.all([params, searchParams]);
  const [settings, categories, language] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getPreferredLanguage("en"),
  ]);
  const option = recipientOptions.find(([key]) => key === slug);
  if (!option) notFound();
  const category = resolveDiscoveryLink(
    settings.theme.content.recipient_links,
    slug,
    categories,
  );
  if (!category) notFound();
  const query = filters.q?.trim() || undefined;
  const page = Math.max(1, Number.parseInt(filters.page || "1", 10) || 1);
  const sort = ["newest", "name-asc", "name-desc"].includes(filters.sort || "")
    ? (filters.sort as "newest" | "name-asc" | "name-desc")
    : undefined;
  const featured = filters.featured === "1";
  const products = await getProductPage({
    categorySlug: category.slug,
    query,
    page,
    sort,
    featured,
  });
  const title = translate(language, `recipient_${slug}` as TranslationKey);
  return (
    <CatalogListing
      title={title || option[1]}
      description={localizedValue(category, "description", language) || undefined}
      products={products}
      categories={categories}
      language={language}
      query={query}
      sort={sort}
      featured={featured}
      fixedCategory={category.slug}
      basePath={`/shop/recipient/${slug}`}
      breadcrumb={title || option[1]}
    />
  );
}
