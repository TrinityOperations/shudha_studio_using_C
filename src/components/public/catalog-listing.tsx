import Link from "next/link";
import { CatalogControls } from "@/components/public/catalog-controls";
import { PageContainer } from "@/components/public/page-container";
import { Pagination } from "@/components/public/pagination";
import { ProductGrid } from "@/components/public/product-grid";
import { StorefrontEmpty } from "@/components/public/storefront-states";
import { translate } from "@/lib/i18n/translations";
import type { SupportedLanguage } from "@/types/domain";
import type { Category, ProductPage } from "@/types/catalog";

export function CatalogListing({
  title,
  description,
  products,
  categories,
  language,
  query,
  category,
  sort,
  featured,
  basePath = "/shop",
  fixedCategory,
  extraParams = {},
  breadcrumb,
}: {
  title: string;
  description?: string;
  products: ProductPage;
  categories: Category[];
  language: SupportedLanguage;
  query?: string;
  category?: string;
  sort?: string;
  featured?: boolean;
  basePath?: string;
  fixedCategory?: string;
  extraParams?: Record<string, string | undefined>;
  breadcrumb?: string;
}) {
  const breadcrumbLabel = translate(language, "breadcrumb");
  return (
    <main id="main-content">
      <PageContainer className="py-8 sm:py-12">
        <nav aria-label={breadcrumbLabel} className="mb-5 text-sm text-slate-600">
          <Link className="hover:underline" href="/shop">
            {translate(language, "shop")}
          </Link>
          {breadcrumb ? <> / {breadcrumb}</> : null}
        </nav>
        <h1 className="store-display text-4xl font-medium sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">{description}</p>
        ) : null}
        <div className="mt-7">
          <CatalogControls
            categories={categories}
            category={fixedCategory ? undefined : category}
            query={query}
            sort={sort}
            featured={featured}
            basePath={basePath}
            showCategory={!fixedCategory}
            range={extraParams.range}
            currency={extraParams.currency}
            preserve={{
              ...extraParams,
              ...(fixedCategory ? { category: fixedCategory } : {}),
            }}
          />
        </div>
        <p
          className="mt-7 border-b border-slate-200 pb-4 text-sm text-slate-600"
          aria-live="polite"
        >
          {products.total}{" "}
          {translate(language, products.total === 1 ? "productFound" : "productsFound")}
          {query ? ` “${query}”` : ""}
        </p>
        <div className="mt-6">
          {products.products.length ? (
            <ProductGrid products={products.products} />
          ) : (
            <StorefrontEmpty
              title={translate(language, "noProducts")}
              description={translate(
                language,
                query ? "tryDifferentSearch" : "changeFilters",
              )}
            />
          )}
        </div>
        <Pagination
          page={products.page}
          totalPages={products.totalPages}
          query={query}
          category={fixedCategory ? undefined : category}
          sort={sort}
          basePath={basePath}
          params={{
            ...extraParams,
            ...(fixedCategory ? { category: fixedCategory } : {}),
          }}
        />
        {fixedCategory && categories.length > 1 ? (
          <aside className="mt-12 border-t pt-6">
            <h2 className="font-semibold">
              {translate(language, "relatedCategories")}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-3">
              {categories
                .filter((item) => item.slug !== fixedCategory)
                .map((item) => (
                  <li key={item.id}>
                    <Link
                      className="text-rose-700 underline"
                      href={`/shop/category/${item.slug}`}
                    >
                      {language === "bn" ? item.name_bn : item.name_en}
                    </Link>
                  </li>
                ))}
            </ul>
          </aside>
        ) : null}
      </PageContainer>
    </main>
  );
}
