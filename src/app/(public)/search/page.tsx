import type { Metadata } from "next";
import { CatalogListing } from "@/components/public/catalog-listing";
import { PageContainer } from "@/components/public/page-container";
import { StorefrontEmpty } from "@/components/public/storefront-states";
import { getActiveCategories, getProductPage } from "@/lib/catalog";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { getSiteSettings } from "@/lib/site-settings";
import { translate } from "@/lib/i18n/translations";
import { occasionOptions, recipientOptions } from "@/lib/storefront-navigation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Search | Shudha Studio",
  description: "Search the Shudha Studio gift catalog.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const sort = ["newest", "name-asc", "name-desc"].includes(params.sort || "")
    ? (params.sort as "newest" | "name-asc" | "name-desc")
    : undefined;
  const page = Math.max(1, Number.parseInt(params.page || "1", 10) || 1);
  const settings = await getSiteSettings();
  const [categories, language] = await Promise.all([
    getActiveCategories(),
    getPreferredLanguage(settings.default_language),
  ]);

  const matchingGuideCategoryIds = query
    ? [
        ...settings.theme.content.occasion_links
          .filter((link) =>
            occasionOptions.some(
              ([key, en, bn]) =>
                link.key === key &&
                `${en} ${bn}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
            ),
          )
          .map((link) => link.category_id),
        ...settings.theme.content.recipient_links
          .filter((link) =>
            recipientOptions.some(
              ([key, en, bn]) =>
                link.key === key &&
                `${en} ${bn}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
            ),
          )
          .map((link) => link.category_id),
      ]
    : [];

  const products = await getProductPage({
    query,
    page,
    sort,
    includeCategoryNames: true,
    categoryIds: [...new Set(matchingGuideCategoryIds)],
  });

  return (
    <>
      <CatalogListing
        title={translate(language, "searchTitle")}
        description={translate(language, "searchDescription")}
        products={products}
        categories={categories}
        language={language}
        query={query}
        sort={sort}
        basePath="/search"
      />
      {!query ? (
        <PageContainer className="-mt-10 pb-10">
          <StorefrontEmpty
            title={translate(language, "startSearch")}
            description={translate(language, "searchPrompt")}
          />
        </PageContainer>
      ) : null}
    </>
  );
}
