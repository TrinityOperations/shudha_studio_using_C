import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronRight } from "lucide-react";

import { ContactActions } from "@/components/public/contact-actions";
import { PageContainer } from "@/components/public/page-container";
import { ProductGallery } from "@/components/public/product-gallery";
import { ProductGrid } from "@/components/public/product-grid";
import { getProductImageUrl } from "@/lib/catalog-images";
import { getPublicProductBySlug, getPublicProductsInCategory } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { localizedValue, translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

function formatPrice(amount: number, currency: string, language: "en" | "bn") {
  try {
    return new Intl.NumberFormat(language === "bn" ? "bn-BD" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getPublicProductBySlug((await params).slug);
  const language = await getPreferredLanguage("en");
  const name = localizedValue(product, "name", language);
  const title =
    localizedValue(product, "seo_title", language) || `${name} | Shudha Studio`;
  const description =
    localizedValue(product, "seo_description", language) ||
    localizedValue(product, "description", language) ||
    `Discover ${name} from Shudha Studio.`;
  const imagePath = product.main_image_path || product.gallery_images?.[0]?.path;
  const imageUrl = getProductImageUrl(imagePath ?? null);
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { images: imageUrl ? [imageUrl] : undefined },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const [product, settings] = await Promise.all([
    getPublicProductBySlug((await params).slug),
    getSiteSettings(),
  ]);
  const language = await getPreferredLanguage(settings.default_language);
  const sameCategory = product.category_id
    ? await getPublicProductsInCategory(product.category_id, product.id, 4)
    : [];
  const featured =
    sameCategory.length < 4
      ? (await import("@/lib/catalog")).getFeaturedProducts(8)
      : Promise.resolve([]);
  const extraRelated = (await featured)
    .filter(
      (item) =>
        item.id !== product.id && !sameCategory.some((same) => same.id === item.id),
    )
    .slice(0, 4 - sameCategory.length);
  const related = [...sameCategory, ...extraRelated];
  const name = localizedValue(product, "name", language);
  const description = localizedValue(product, "description", language);
  const currency = product.currency_code || "USD";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: description || undefined,
    image: [
      product.main_image_path,
      ...(product.gallery_images ?? []).map((image) => image.path),
    ]
      .filter((path): path is string => Boolean(path))
      .map((path) => getProductImageUrl(path))
      .filter((url): url is string => Boolean(url)),
    sku: product.id,
    category: product.categories
      ? language === "bn"
        ? product.categories.name_bn || product.categories.name_en
        : product.categories.name_en
      : undefined,
    offers:
      product.price != null
        ? {
            "@type": "Offer",
            price: product.price,
            priceCurrency: currency,
            availability: "https://schema.org/InStock",
            url: `/product/${product.slug}`,
          }
        : undefined,
  };

  return (
    <main id="main-content">
      <PageContainer className="store-product-detail py-7 sm:py-12">
        <nav
          aria-label={translate(language, "breadcrumb")}
          className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-600"
        >
          <Link className="hover:text-rose-700 hover:underline" href="/">
            {translate(language, "home")}
          </Link>
          <ChevronRight aria-hidden="true" size={15} />
          <Link className="hover:text-rose-700 hover:underline" href="/shop">
            {translate(language, "shop")}
          </Link>
          {product.categories?.slug ? (
            <>
              <ChevronRight aria-hidden="true" size={15} />
              <Link
                className="hover:text-rose-700 hover:underline"
                href={`/shop/category/${product.categories.slug}`}
              >
                {language === "bn"
                  ? product.categories.name_bn || product.categories.name_en
                  : product.categories.name_en}
              </Link>
            </>
          ) : null}
          <ChevronRight aria-hidden="true" size={15} />
          <span aria-current="page" className="font-medium text-slate-950">
            {name}
          </span>
        </nav>

        <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
          <ProductGallery product={product} />
          <section className="lg:sticky lg:top-8">
            {product.categories ? (
              <Link
                className="text-xs font-bold tracking-[0.18em] text-rose-700 uppercase hover:underline"
                href={`/shop/category/${product.categories.slug}`}
              >
                {language === "bn"
                  ? product.categories.name_bn || product.categories.name_en
                  : product.categories.name_en}
              </Link>
            ) : null}
            <h1 className="store-display mt-3 text-4xl leading-tight font-medium text-slate-950 sm:text-5xl">
              {name}
            </h1>
            <div className="mt-5 flex flex-wrap items-baseline gap-3">
              {product.price != null ? (
                <span className="text-2xl font-semibold text-slate-950">
                  {formatPrice(product.price, currency, language)}
                </span>
              ) : (
                <span className="text-lg font-semibold text-slate-800">
                  {translate(language, "priceOnRequest")}
                </span>
              )}
              {product.price != null &&
              product.compare_at_price != null &&
              product.compare_at_price > product.price ? (
                <del className="text-base text-slate-500">
                  {formatPrice(product.compare_at_price, currency, language)}
                </del>
              ) : null}
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
              <Check aria-hidden="true" size={16} />
              {translate(language, "availableNow")}
            </div>

            <div className="mt-7 border-y border-slate-200 py-5">
              <h2 className="sr-only">{translate(language, "productDescription")}</h2>
              {description ? (
                <details className="group" open>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-2 font-semibold text-slate-900 focus-visible:outline-2 focus-visible:outline-rose-700">
                    {translate(language, "productDescription")}
                    <span aria-hidden="true" className="text-xl group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="pt-3 leading-7 whitespace-pre-line text-slate-600">
                    {description}
                  </p>
                </details>
              ) : (
                <p className="text-sm text-slate-600">
                  {translate(language, "descriptionComingSoon")}
                </p>
              )}
            </div>

            <div className="mt-7 rounded-3xl border border-rose-100 bg-rose-50/60 p-5 sm:p-7">
              <p className="leading-7 text-slate-700">
                {translate(language, "reachOut", {
                  business:
                    language === "bn"
                      ? settings.business_name_bn
                      : settings.business_name_en,
                })}
              </p>
              <Link
                className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-rose-700 px-5 text-sm font-semibold text-white transition hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 sm:w-auto"
                href={`/book-a-meeting?product=${encodeURIComponent(product.slug)}`}
              >
                {translate(language, "bookMeeting")}
                <ArrowUpRight aria-hidden="true" size={17} />
              </Link>
              <div className="mt-5 border-t border-rose-200 pt-5">
                <ContactActions
                  email={settings.email}
                  phone={settings.phone}
                  whatsapp={settings.whatsapp}
                />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">
              {translate(language, "deliveryCopy")}
            </p>
          </section>
        </div>

        {related.length ? (
          <section
            aria-labelledby="related-products"
            className="mt-16 border-t border-slate-200 pt-10 sm:mt-24"
          >
            <p className="text-xs font-bold tracking-[0.18em] text-rose-700 uppercase">
              {translate(language, "shopByCategory")}
            </p>
            <h2
              className="store-display mt-2 text-3xl font-medium text-slate-950"
              id="related-products"
            >
              {translate(language, "relatedProducts")}
            </h2>
            <div className="mt-7">
              <ProductGrid products={related} />
            </div>
          </section>
        ) : null}
      </PageContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
    </main>
  );
}
