"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

import { getCategoryImageUrl, getProductImageUrl } from "@/lib/catalog-images";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { GalleryImage } from "@/types/catalog";
import { useLanguage } from "@/components/language-provider";
import {
  MAX_GALLERY_IMAGES,
  validateImage,
  safeFileName,
} from "@/lib/image-validation";

type ImageManagerProps = {
  kind: "category" | "product";
  id: string;
  initialMainPath?: string | null;
  initialGallery?: GalleryImage[];
};

export function ImageManager({
  kind,
  id,
  initialMainPath,
  initialGallery = [],
}: ImageManagerProps) {
  const { t } = useLanguage();
  const [mainPath, setMainPath] = useState(initialMainPath ?? null);
  const [gallery, setGallery] = useState<GalleryImage[]>(initialGallery);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const mainInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const mainUrl = useMemo(
    () =>
      kind === "category"
        ? getCategoryImageUrl(mainPath)
        : getProductImageUrl(mainPath),
    [kind, mainPath],
  );

  async function upload(file: File, purpose: "main" | "gallery") {
    setError("");
    setMessage("");
    const validationError = await validateImage(file, t);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (purpose === "gallery" && gallery.length >= MAX_GALLERY_IMAGES) {
      setError(t("maxGallery", { count: MAX_GALLERY_IMAGES }));
      return;
    }

    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const bucket = kind === "category" ? "category-images" : "product-images";
    const path = `${id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      setBusy(false);
      return;
    }

    const image: GalleryImage = { path, alt_en: file.name.replace(/\.[^.]+$/, "") };
    const nextGallery = purpose === "gallery" ? [...gallery, image] : gallery;
    const response = await fetch(`/api/admin/images/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        purpose === "gallery" ? { gallery_images: nextGallery } : { image_path: path },
      ),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      await supabase.storage.from(bucket).remove([path]);
      setError(payload.error ?? t("unableImageReference"));
      setBusy(false);
      return;
    }

    if (purpose === "gallery") setGallery(nextGallery);
    else setMainPath(path);
    setMessage(t("imageSaved"));
    setBusy(false);
  }

  async function remove(path: string, purpose: "main" | "gallery") {
    if (!window.confirm(t("removeImage"))) return;
    setBusy(true);
    setError("");
    setMessage("");
    const nextGallery = gallery.filter((image) => image.path !== path);
    const response = await fetch(`/api/admin/images/${kind}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        purpose === "gallery" ? { gallery_images: nextGallery } : { image_path: null },
      ),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Unable to remove the image reference.");
      setBusy(false);
      return;
    }
    const bucket = kind === "category" ? "category-images" : "product-images";
    const { error: storageError } = await createSupabaseBrowserClient()
      .storage.from(bucket)
      .remove([path]);
    if (storageError)
      setError(
        `Reference removed, but storage cleanup failed: ${storageError.message}`,
      );
    else setMessage("Image removed.");
    if (purpose === "gallery") setGallery(nextGallery);
    else setMainPath(null);
    setBusy(false);
  }

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="text-lg font-semibold text-slate-950">Images</h2>
      <p className="mt-1 text-sm text-slate-600">
        JPEG, PNG, or WebP. Maximum 5 MB per image.
      </p>
      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative h-32 w-40 overflow-hidden rounded-xl bg-slate-200">
            {mainUrl ? (
              <Image
                alt={t("mainImage")}
                className="object-cover"
                fill
                src={mainUrl}
                unoptimized
              />
            ) : (
              <span className="flex h-full items-center justify-center px-3 text-center text-xs text-slate-500">
                {t("imageComingSoon")}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="admin-button rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
              onClick={() => mainInput.current?.click()}
              type="button"
            >
              {mainPath ? t("replaceImage") : t("mainImage")}
            </button>
            {mainPath ? (
              <button
                className="admin-button admin-button-danger rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                disabled={busy}
                onClick={() => remove(mainPath, "main")}
                type="button"
              >
                {t("remove")}
              </button>
            ) : null}
          </div>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file, "main");
              event.target.value = "";
            }}
            ref={mainInput}
            type="file"
          />
        </div>
      </div>
      {kind === "product" ? (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-slate-950">{t("gallery")}</h3>
            <button
              className="admin-button admin-button-secondary rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || gallery.length >= MAX_GALLERY_IMAGES}
              onClick={() => galleryInput.current?.click()}
              type="button"
            >
              {t("addGalleryImage")}
            </button>
            <input
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file, "gallery");
                event.target.value = "";
              }}
              ref={galleryInput}
              type="file"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((image) => (
              <div
                className="relative overflow-hidden rounded-xl bg-slate-200"
                key={image.path}
              >
                <div className="relative aspect-square">
                  <Image
                    alt={image.alt_en || t("gallery")}
                    className="object-cover"
                    fill
                    src={getProductImageUrl(image.path) ?? ""}
                    unoptimized
                  />
                </div>
                <button
                  className="absolute right-2 bottom-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-red-700"
                  disabled={busy}
                  onClick={() => remove(image.path, "gallery")}
                  type="button"
                >
                  {t("remove")}
                </button>
              </div>
            ))}
          </div>
          {gallery.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">{t("noGalleryImages")}</p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
