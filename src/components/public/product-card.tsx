"use client";

import Image from "next/image";
import Link from "next/link";

import { getProductImageUrl } from "@/lib/catalog-images";
import type { Product } from "@/types/catalog";
import { useLanguage } from "@/components/language-provider";
import { localizedValue } from "@/lib/i18n/translations";

export function ProductCard({ product }: { product: Product }) {
  const { language, t } = useLanguage();
  const imageUrl = getProductImageUrl(product.main_image_path);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              alt={
                localizedValue(product, "main_image_alt", language) ||
                localizedValue(product, "name", language)
              }
              className="object-cover transition duration-300 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              src={imageUrl}
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
              {t("imageComingSoon")}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-semibold text-slate-950">
            {localizedValue(product, "name", language)}
          </h3>
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
