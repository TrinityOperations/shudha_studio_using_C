"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ImageOff } from "lucide-react";

import { getProductImageUrl } from "@/lib/catalog-images";
import type { Product } from "@/types/catalog";
import { useLanguage } from "@/components/language-provider";
import { localizedValue } from "@/lib/i18n/translations";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

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

export function ProductCard({ product }: { product: Product }) {
  const { language, t } = useLanguage();
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getProductImageUrl(product.main_image_path);
  const secondaryPath = product.gallery_images.find(
    (image) => image.path !== product.main_image_path,
  )?.path;
  const secondaryUrl = getProductImageUrl(secondaryPath ?? null);
  const [secondaryFailed, setSecondaryFailed] = useState(false);
  const showSecondary = Boolean(secondaryUrl && !secondaryFailed);

  return (
    <article className="store-card group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link
        className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
        href={`/product/${product.slug}`}
      >
        <div className="store-card-image relative aspect-[4/3] overflow-hidden bg-slate-100">
          {imageUrl && !imageFailed ? (
            <Image
              alt={
                localizedValue(product, "main_image_alt", language) ||
                localizedValue(product, "name", language)
              }
              className={`object-cover transition duration-300 motion-reduce:transition-none ${showSecondary ? "group-focus-within:opacity-0 group-hover:opacity-0" : "group-hover:scale-105 motion-reduce:transform-none"}`}
              fill
              onError={() => setImageFailed(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={imageUrl}
              unoptimized={
                !supabaseHost ||
                !imageUrl.startsWith(
                  `https://${supabaseHost}/storage/v1/object/public/product-images/`,
                )
              }
            />
          ) : (
            <div className="flex h-full items-center justify-center gap-2 px-6 text-center text-sm text-slate-500">
              <ImageOff aria-hidden="true" size={18} />
              {t("imageComingSoon")}
            </div>
          )}
          {secondaryUrl && showSecondary && !imageFailed ? (
            <Image
              alt={localizedValue(product, "name", language)}
              className="pointer-events-none object-cover opacity-0 transition duration-300 group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none"
              fill
              onError={() => setSecondaryFailed(true)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={secondaryUrl}
              unoptimized={
                !supabaseHost ||
                !secondaryUrl.startsWith(
                  `https://${supabaseHost}/storage/v1/object/public/product-images/`,
                )
              }
            />
          ) : null}
        </div>
        <div className="p-5 sm:p-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            {product.categories?.name_en ? (
              <p className="text-xs font-semibold tracking-[0.14em] text-rose-700 uppercase">
                {language === "bn"
                  ? product.categories.name_bn || product.categories.name_en
                  : product.categories.name_en}
              </p>
            ) : (
              <span />
            )}
            {product.is_featured ? (
              <span className="rounded-full bg-[var(--theme-primary-soft)] px-2 py-1 text-xs font-semibold text-slate-800">
                {t("featured")}
              </span>
            ) : null}
          </div>
          <h3 className="font-semibold text-slate-950">
            {localizedValue(product, "name", language)}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-800">
            {product.price != null ? (
              <span>
                {formatPrice(product.price, product.currency_code || "USD", language)}
              </span>
            ) : (
              <span>{t("priceOnRequest")}</span>
            )}
            {product.price != null &&
            product.compare_at_price != null &&
            product.compare_at_price > product.price ? (
              <del className="font-normal text-slate-500">
                {formatPrice(
                  product.compare_at_price,
                  product.currency_code || "USD",
                  language,
                )}
              </del>
            ) : null}
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {localizedValue(product, "description", language) || t("selectedGift")}
          </p>
          <span className="mt-4 inline-flex text-sm font-semibold text-rose-700">
            {t("viewDetails")}
          </span>
        </div>
      </Link>
    </article>
  );
}
