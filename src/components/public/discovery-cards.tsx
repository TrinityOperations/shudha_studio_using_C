"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Gift } from "lucide-react";
import { PageContainer } from "@/components/public/page-container";
import { getCategoryImageUrl } from "@/lib/catalog-images";
import type { DiscoveryKey } from "@/lib/storefront-navigation";
import { localizedValue, translate } from "@/lib/i18n/translations";
import type { SupportedLanguage } from "@/types/domain";
import type { Category } from "@/types/catalog";
import type { TranslationKey } from "@/lib/i18n/translations";
import { buildDiscoveryHref } from "@/lib/storefront-navigation";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

export type DiscoveryItem = { key: DiscoveryKey; category: Category };

export function DiscoveryCards({
  id,
  title,
  items,
  language,
}: {
  id: string;
  title: string;
  items: DiscoveryItem[];
  language: SupportedLanguage;
}) {
  const [failedImages, setFailedImages] = useState<string[]>([]);
  return (
    <section className="store-discovery-section py-12 sm:py-16" id={id}>
      <PageContainer>
        <div className="flex items-end justify-between gap-4">
          <h2 className="store-display text-3xl font-medium sm:text-4xl">{title}</h2>
          <Link className="store-link shrink-0 text-sm font-semibold" href="/shop">
            {translate(language, "viewAllProducts")}{" "}
            <ArrowUpRight aria-hidden="true" className="inline" size={15} />
          </Link>
        </div>
        {items.length ? (
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map(({ key, category }, index) => {
              const image = getCategoryImageUrl(category.image_path ?? null);
              const showImage = image && !failedImages.includes(category.id);
              return (
                <Link
                  className="store-discovery-card group relative flex aspect-[1.15] min-w-0 items-end overflow-hidden rounded-2xl border p-4 text-white sm:aspect-[1.35] sm:p-5"
                  href={buildDiscoveryHref(
                    id === "occasions" ? "occasion" : "recipient",
                    key,
                  )}
                  key={key}
                >
                  {showImage ? (
                    <Image
                      alt={
                        localizedValue(category, "image_alt", language) ||
                        localizedValue(category, "name", language)
                      }
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      fill
                      onError={() =>
                        setFailedImages((current) => [...current, category.id])
                      }
                      sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 24vw"
                      src={image}
                      unoptimized={
                        !supabaseHost ||
                        !image.startsWith(
                          `https://${supabaseHost}/storage/v1/object/public/category-images/`,
                        )
                      }
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className={`store-category-art store-category-art-${index % 4} absolute inset-0 grid place-items-center text-white/70`}
                    >
                      <Gift size={36} strokeWidth={1.2} />
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"
                  />
                  <span className="relative flex w-full items-end justify-between gap-2 font-semibold">
                    {translate(
                      language,
                      `${id === "occasions" ? "occasion" : "recipient"}_${key}` as TranslationKey,
                    )}
                    <ArrowUpRight aria-hidden="true" className="shrink-0" size={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-dashed border-[var(--theme-border)] p-5 text-sm text-[var(--theme-muted-foreground)]">
            {translate(language, "discoverySetupHelp")}{" "}
            <Link className="store-link font-semibold underline" href="/shop">
              {translate(language, "shopGifts")}
            </Link>
          </p>
        )}
      </PageContainer>
    </section>
  );
}
