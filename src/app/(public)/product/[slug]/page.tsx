import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ContactActions } from "@/components/public/contact-actions";
import { PageContainer } from "@/components/public/page-container";
import { getProductImageUrl } from "@/lib/catalog-images";
import { getPublicProductBySlug } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { localizedValue, translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getPublicProductBySlug((await params).slug);
  const language = await getPreferredLanguage("en");
  const title =
    localizedValue(product, "seo_title", language) ||
    `${localizedValue(product, "name", language)} | Shudha Studio`;
  const description =
    localizedValue(product, "seo_description", language) ||
    localizedValue(product, "description", language) ||
    `Discover ${localizedValue(product, "name", language)} from Shudha Studio.`;
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      images: product.main_image_path
        ? [getProductImageUrl(product.main_image_path)!]
        : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const [product, settings] = await Promise.all([
    getPublicProductBySlug((await params).slug),
    getSiteSettings(),
  ]);
  const language = await getPreferredLanguage(settings.default_language);
  const imageUrl = getProductImageUrl(product.main_image_path);
  const gallery = [
    product.main_image_path,
    ...product.gallery_images.map((image) => image.path),
  ]
    .filter((path): path is string => Boolean(path))
    .filter((path, index, paths) => paths.indexOf(path) === index);

  return (
    <main id="main-content">
      <PageContainer className="py-12 sm:py-20">
        <Link
          className="text-sm font-semibold text-rose-700 hover:underline"
          href={
            product.categories?.slug
              ? `/category/${product.categories.slug}`
              : "/products"
          }
        >
          {translate(language, "backToCollection")}
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100">
              {imageUrl ? (
                <Image
                  alt={
                    localizedValue(product, "main_image_alt", language) ||
                    localizedValue(product, "name", language)
                  }
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={imageUrl}
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-500">
                  {translate(language, "imageComingSoon")}
                </div>
              )}
            </div>
            {gallery.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(0, 4).map((path) => (
                  <div
                    className="relative aspect-square overflow-hidden rounded-xl bg-slate-100"
                    key={path}
                  >
                    <Image
                      alt={localizedValue(product, "name", language)}
                      className="object-cover"
                      fill
                      sizes="25vw"
                      src={getProductImageUrl(path)!}
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>
          <div>
            {product.categories?.name_en ? (
              <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
                {localizedValue(product.categories, "name", language)}
              </p>
            ) : null}
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {localizedValue(product, "name", language)}
            </h1>
            <p className="mt-6 text-lg leading-8 whitespace-pre-line text-slate-600">
              {localizedValue(product, "description", language) ||
                translate(language, "selectedGift")}
            </p>
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-800">
              {translate(language, "availableNow")}
            </div>
            <div className="mt-8">
              <ContactActions
                email={settings.email}
                phone={settings.phone}
                whatsapp={settings.whatsapp}
              />
            </div>
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
