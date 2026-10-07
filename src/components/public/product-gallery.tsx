"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageOff, X } from "lucide-react";

import { useLanguage } from "@/components/language-provider";
import { getProductImageUrl } from "@/lib/catalog-images";
import { localizedValue } from "@/lib/i18n/translations";
import type { Product } from "@/types/catalog";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

export function ProductGallery({ product }: { product: Product }) {
  const { language, t } = useLanguage();
  const images = [
    ...(product.main_image_path
      ? [
          {
            path: product.main_image_path,
            alt_en: product.main_image_alt_en,
            alt_bn: product.main_image_alt_bn,
          },
        ]
      : []),
    ...(Array.isArray(product.gallery_images) ? product.gallery_images : []),
  ].filter(
    (image, index, all) =>
      all.findIndex((other) => other.path === image.path) === index,
  );
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const active = images[selected];
  const activeUrl = active ? getProductImageUrl(active.path) : null;
  const activeFailed = active ? failed.includes(active.path) : true;

  useEffect(() => {
    if (!dialogRef.current?.open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") dialogRef.current?.close();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <section aria-label={t("productGallery")} className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-slate-100">
        {activeUrl && !activeFailed ? (
          <button
            aria-label={t("enlargeImage")}
            className="absolute inset-0 z-10 cursor-zoom-in focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-rose-700"
            onClick={(event) => {
              openerRef.current = event.currentTarget;
              dialogRef.current?.showModal();
            }}
            type="button"
          >
            <Image
              alt={
                localizedValue(active, "alt", language) ||
                localizedValue(product, "name", language)
              }
              className="object-cover"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              src={activeUrl}
              onError={() => setFailed((paths) => [...paths, active.path])}
              unoptimized={
                !supabaseHost ||
                !activeUrl.startsWith(
                  `https://${supabaseHost}/storage/v1/object/public/product-images/`,
                )
              }
            />
            <span className="sr-only">{t("enlargeImage")}</span>
          </button>
        ) : (
          <div
            className="flex h-full flex-col items-center justify-center gap-3 text-slate-500"
            role="img"
            aria-label={t("imageComingSoon")}
          >
            <ImageOff aria-hidden="true" size={30} />
            <span>{t("imageComingSoon")}</span>
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div
          aria-label={t("productGallery")}
          className="flex gap-3 overflow-x-auto pb-1"
          role="group"
        >
          {images.map((image, index) => {
            const url = getProductImageUrl(image.path);
            return (
              <button
                aria-label={`${t("thumbnail")} ${index + 1}`}
                aria-pressed={selected === index}
                className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 focus-visible:outline-2 focus-visible:outline-rose-700 ${selected === index ? "border-rose-700" : "border-transparent"}`}
                key={image.path}
                onClick={() => setSelected(index)}
                type="button"
              >
                {url && !failed.includes(image.path) ? (
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="80px"
                    src={url}
                    onError={() => setFailed((paths) => [...paths, image.path])}
                    unoptimized={
                      !supabaseHost ||
                      !url.startsWith(
                        `https://${supabaseHost}/storage/v1/object/public/product-images/`,
                      )
                    }
                  />
                ) : (
                  <ImageOff
                    aria-hidden="true"
                    className="m-auto text-slate-500"
                    size={20}
                  />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
      <dialog
        aria-label={t("productGallery")}
        className="m-auto max-h-[92dvh] max-w-[96vw] rounded-2xl bg-slate-950 p-2 backdrop:bg-slate-950/90"
        onClose={() => openerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="relative flex h-[88dvh] w-[92vw] items-center justify-center">
          <button
            aria-label={t("closePreview")}
            className="absolute top-2 right-2 z-10 rounded-full bg-white p-3 text-slate-950 focus-visible:outline-2 focus-visible:outline-rose-700"
            onClick={() => dialogRef.current?.close()}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
          {activeUrl && !activeFailed ? (
            <Image
              alt={
                localizedValue(active, "alt", language) ||
                localizedValue(product, "name", language)
              }
              className="object-contain"
              fill
              sizes="92vw"
              src={activeUrl}
              unoptimized={
                !supabaseHost ||
                !activeUrl.startsWith(
                  `https://${supabaseHost}/storage/v1/object/public/product-images/`,
                )
              }
            />
          ) : (
            <p className="text-white">{t("imageComingSoon")}</p>
          )}
        </div>
      </dialog>
    </section>
  );
}
