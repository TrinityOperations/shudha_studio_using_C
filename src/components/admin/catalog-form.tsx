"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { MAX_GALLERY_IMAGES, validateImage } from "@/lib/image-validation";

type Field = { key: string; label: string; textarea?: boolean };
type FormValue = string | boolean | number | null;
type ErrorPayload = { error?: string; field?: string };
type PendingImage = { file: File; previewUrl: string; name: string };
type ProductResponse = ErrorPayload & { id?: string };

const categoryFields: Field[] = [
  { key: "slug", label: "Slug" },
  { key: "name_en", label: "English name" },
  { key: "name_bn", label: "Bangla name" },
  { key: "description_en", label: "English description", textarea: true },
  { key: "description_bn", label: "Bangla description", textarea: true },
  { key: "seo_title_en", label: "English SEO title" },
  { key: "seo_title_bn", label: "Bangla SEO title" },
  { key: "seo_description_en", label: "English SEO description", textarea: true },
  { key: "seo_description_bn", label: "Bangla SEO description", textarea: true },
];

export function CategoryForm({
  initial,
  id,
}: {
  initial?: Record<string, unknown>;
  id?: string;
}) {
  const { t } = useLanguage();
  const [values, setValues] = useState<Record<string, FormValue>>({
    is_active: true,
    sort_order: 0,
    ...initial,
  });
  return (
    <CatalogForm
      endpoint={id ? `/api/admin/categories/${id}` : "/api/admin/categories"}
      listPath="/admin/categories"
      fields={categoryFields.map((field) => ({
        ...field,
        label: translateField(field.key, t),
      }))}
      values={values}
      setValues={setValues}
    />
  );
}

export function ProductForm({
  initial,
  id,
  categories,
  imageManager,
}: {
  initial?: Record<string, unknown>;
  id?: string;
  categories: { id: string; name_en: string }[];
  imageManager?: React.ReactNode;
}) {
  const { t } = useLanguage();
  const [pendingMain, setPendingMain] = useState<PendingImage | null>(null);
  const [pendingGallery, setPendingGallery] = useState<PendingImage[]>([]);
  const [values, setValues] = useState<Record<string, FormValue>>({
    is_active: true,
    is_available: true,
    is_featured: false,
    sort_order: 0,
    price: null,
    compare_at_price: null,
    currency_code: "USD",
    ...initial,
  });
  const fields: Field[] = [
    { key: "slug", label: "Slug" },
    { key: "name_en", label: "English name" },
    { key: "name_bn", label: "Bangla name" },
    { key: "description_en", label: "English description", textarea: true },
    { key: "description_bn", label: "Bangla description", textarea: true },
    { key: "price", label: "Price (optional; blank means inquire)" },
    { key: "compare_at_price", label: "Compare-at price (optional)" },
    { key: "currency_code", label: "Currency code (ISO 4217)" },
    { key: "seo_title_en", label: "English SEO title" },
    { key: "seo_title_bn", label: "Bangla SEO title" },
    { key: "seo_description_en", label: "English SEO description", textarea: true },
    { key: "seo_description_bn", label: "Bangla SEO description", textarea: true },
  ];
  return (
    <CatalogForm
      endpoint={id ? `/api/admin/products/${id}` : "/api/admin/products"}
      listPath="/admin/products"
      fields={fields.map((field) => ({
        ...field,
        label: translateField(field.key, t),
      }))}
      values={values}
      setValues={setValues}
      categories={categories}
      imageManager={imageManager}
      pendingMain={pendingMain}
      pendingGallery={pendingGallery}
      setPendingMain={setPendingMain}
      setPendingGallery={setPendingGallery}
      product
    />
  );
}

function CatalogForm({
  endpoint,
  listPath,
  fields,
  values,
  setValues,
  categories,
  imageManager,
  pendingMain,
  pendingGallery,
  setPendingMain,
  setPendingGallery,
  product,
}: {
  endpoint: string;
  listPath: string;
  fields: Field[];
  values: Record<string, FormValue>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, FormValue>>>;
  categories?: { id: string; name_en: string }[];
  imageManager?: React.ReactNode;
  pendingMain?: PendingImage | null;
  pendingGallery?: PendingImage[];
  setPendingMain?: React.Dispatch<React.SetStateAction<PendingImage | null>>;
  setPendingGallery?: React.Dispatch<React.SetStateAction<PendingImage[]>>;
  product?: boolean;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  function set(key: string, value: FormValue) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFieldError("");
    setSaved(false);
    try {
      const saveEndpoint = createdProductId
        ? `/api/admin/products/${createdProductId}`
        : endpoint;
      const response = await fetch(saveEndpoint, {
        method:
          createdProductId ||
          endpoint.includes("/categories/") ||
          endpoint.includes("/products/")
            ? "PATCH"
            : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as ProductResponse;
      if (!response.ok) {
        setError(payload.error ?? t("unableToSave"));
        setFieldError(payload.field ?? "");
      } else {
        const productId = createdProductId ?? payload.id;
        if (product && productId && (pendingMain || pendingGallery?.length)) {
          try {
            await uploadPendingImages(productId, pendingMain, pendingGallery ?? [], t);
            setPendingMain?.(null);
            setPendingGallery?.([]);
          } catch (uploadError) {
            setCreatedProductId(productId);
            setError(
              uploadError instanceof Error
                ? `${uploadError.message} You can retry the image upload without creating another product.`
                : "Image upload failed. You can retry without creating another product.",
            );
            return;
          }
        }
        setSaved(true);
        window.location.assign(listPath);
      }
    } catch {
      setError(t("unableToSave"));
    } finally {
      setSaving(false);
    }
  }

  async function uploadPendingImages(
    productId: string,
    main: PendingImage | null | undefined,
    gallery: PendingImage[],
    translate: ReturnType<typeof useLanguage>["t"],
  ) {
    const supabase = createSupabaseBrowserClient();
    const paths: { path: string; purpose: "main" | "gallery"; name: string }[] = [];
    for (const item of [main, ...gallery]) {
      if (!item) continue;
      const path = `${productId}/${crypto.randomUUID()}-${item.file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, item.file, { contentType: item.file.type, upsert: false });
      if (uploadError)
        throw new Error(uploadError.message || translate("unableImageReference"));
      paths.push({
        path,
        purpose: item === main ? "main" : "gallery",
        name: item.name,
      });
    }
    const mainImage = paths.find((image) => image.purpose === "main");
    if (mainImage)
      await saveImageReference(productId, { image_path: mainImage.path }, translate);
    const galleryImages = paths
      .filter((image) => image.purpose === "gallery")
      .map((image) => ({
        path: image.path,
        alt_en: image.name.replace(/\.[^.]+$/, ""),
      }));
    if (galleryImages.length)
      await saveImageReference(productId, { gallery_images: galleryImages }, translate);
  }

  async function saveImageReference(
    productId: string,
    body: Record<string, unknown>,
    translate: ReturnType<typeof useLanguage>["t"],
  ) {
    const response = await fetch(`/api/admin/images/product/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const payload = (await response.json()) as ErrorPayload;
      throw new Error(payload.error ?? translate("unableImageReference"));
    }
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      {product && categories ? (
        <Field label={t("category")}>
          <select
            aria-describedby={
              fieldError === "category_id" ? "product-category-error" : undefined
            }
            aria-invalid={fieldError === "category_id"}
            className="form-input"
            required
            value={String(values.category_id ?? "")}
            onChange={(event) => set("category_id", event.target.value)}
          >
            <option value="">{t("chooseCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en}
              </option>
            ))}
          </select>
          {fieldError === "category_id" ? (
            <p className="mt-1 text-sm text-red-700" id="product-category-error">
              {error}
            </p>
          ) : null}
        </Field>
      ) : null}
      {fields.map((field) => (
        <Field key={field.key} label={field.label}>
          {field.textarea ? (
            <textarea
              className="form-input min-h-28"
              value={String(values[field.key] ?? "")}
              onChange={(event) => set(field.key, event.target.value)}
            />
          ) : (
            <input
              aria-describedby={
                fieldError === field.key ? `product-${field.key}-error` : undefined
              }
              aria-invalid={fieldError === field.key}
              className="form-input"
              required={field.key === "slug" || field.key.startsWith("name_")}
              min={
                field.key === "price" || field.key === "compare_at_price"
                  ? 0
                  : undefined
              }
              step={
                field.key === "price" || field.key === "compare_at_price"
                  ? "0.01"
                  : undefined
              }
              type={
                field.key === "price" || field.key === "compare_at_price"
                  ? "number"
                  : "text"
              }
              value={String(values[field.key] ?? "")}
              onChange={(event) => {
                const isPrice =
                  field.key === "price" || field.key === "compare_at_price";
                set(
                  field.key,
                  isPrice
                    ? event.target.value === ""
                      ? null
                      : Number(event.target.value)
                    : field.key === "currency_code"
                      ? event.target.value.toUpperCase()
                      : event.target.value,
                );
              }}
            />
          )}
          {field.key === "slug" ? (
            <p className="mt-1 text-xs text-slate-500">
              Use lowercase letters, numbers, and hyphens only, for example:
              rose-gift-box.
            </p>
          ) : null}
          {fieldError === field.key ? (
            <p className="mt-1 text-sm text-red-700" id={`product-${field.key}-error`}>
              {error}
            </p>
          ) : null}
        </Field>
      ))}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("sortOrder")}>
          <input
            className="form-input"
            min="0"
            type="number"
            value={Number(values.sort_order ?? 0)}
            onChange={(event) => set("sort_order", Number(event.target.value))}
          />
        </Field>
        <div className="space-y-3 pt-7">
          {["is_active", ...(product ? ["is_available", "is_featured"] : [])].map(
            (key) => (
              <label className="flex items-center gap-2 text-sm font-medium" key={key}>
                <input
                  checked={Boolean(values[key])}
                  onChange={(event) => set(key, event.target.checked)}
                  type="checkbox"
                />{" "}
                {key === "is_active"
                  ? t("active")
                  : key === "is_available"
                    ? t("available")
                    : t("featured")}
              </label>
            ),
          )}
        </div>
      </div>
      {imageManager}
      {product && !imageManager ? (
        <PendingProductImages
          main={pendingMain ?? null}
          gallery={pendingGallery ?? []}
          setMain={setPendingMain}
          setGallery={setPendingGallery}
        />
      ) : null}
      {error && !fieldError ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {t("savedSuccessfully")}
        </p>
      ) : null}
      <button
        className="admin-button admin-button-primary rounded-xl px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? "Saving product…" : t("save")}
      </button>
    </form>
  );
}

function PendingProductImages({
  main,
  gallery,
  setMain,
  setGallery,
}: {
  main: PendingImage | null;
  gallery: PendingImage[];
  setMain?: React.Dispatch<React.SetStateAction<PendingImage | null>>;
  setGallery?: React.Dispatch<React.SetStateAction<PendingImage[]>>;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [mainInputKey, setMainInputKey] = useState(0);
  const [galleryInputKey, setGalleryInputKey] = useState(0);

  async function choose(file: File, purpose: "main" | "gallery") {
    const validationError = await validateImage(file, t);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    const image = {
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
    };
    if (purpose === "main") {
      if (main) URL.revokeObjectURL(main.previewUrl);
      setMain?.(image);
      setMainInputKey((key) => key + 1);
    } else {
      if (gallery.length >= MAX_GALLERY_IMAGES) {
        URL.revokeObjectURL(image.previewUrl);
        setError(t("maxGallery", { count: MAX_GALLERY_IMAGES }));
        return;
      }
      setGallery?.((images) => [...images, image]);
      setGalleryInputKey((key) => key + 1);
    }
  }

  function removeMain() {
    if (main) URL.revokeObjectURL(main.previewUrl);
    setMain?.(null);
    setMainInputKey((key) => key + 1);
  }

  function removeGallery(index: number) {
    const image = gallery[index];
    if (image) URL.revokeObjectURL(image.previewUrl);
    setGallery?.((images) => images.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <section
      className="rounded-2xl border border-slate-200 p-5"
      aria-label="Product images"
    >
      <h2 className="text-lg font-semibold text-slate-950">Product images</h2>
      <p className="mt-1 text-sm text-slate-600">
        Choose photos now. They will upload automatically when you save the product.
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <div>
          <p className="font-semibold">Main photo</p>
          {main ? (
            <div className="relative mt-3 overflow-hidden rounded-xl bg-slate-100">
              <img
                alt={main.name}
                className="h-48 w-full object-cover"
                src={main.previewUrl}
              />
              <button
                className="admin-button admin-button-danger absolute right-2 bottom-2 rounded-lg px-3 py-2 text-sm font-semibold"
                onClick={removeMain}
                type="button"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-3 grid h-48 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
              No main photo selected
            </div>
          )}
          <label className="admin-button admin-button-secondary mt-3 inline-flex cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold">
            {main ? "Replace main photo" : "Browse for main photo"}
            <input
              key={mainInputKey}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void choose(file, "main");
              }}
              type="file"
            />
          </label>
        </div>
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">Gallery</p>
            <span className="text-xs text-slate-500">
              {gallery.length}/{MAX_GALLERY_IMAGES}
            </span>
          </div>
          <label className="admin-button admin-button-secondary mt-3 inline-flex cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold">
            Browse for gallery photo
            <input
              key={galleryInputKey}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void choose(file, "gallery");
              }}
              type="file"
            />
          </label>
          {gallery.length ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {gallery.map((image, index) => (
                <div
                  className="relative overflow-hidden rounded-xl bg-slate-100"
                  key={image.previewUrl}
                >
                  <img
                    alt={image.name}
                    className="h-28 w-full object-cover"
                    src={image.previewUrl}
                  />
                  <button
                    className="admin-button admin-button-danger absolute right-1 bottom-1 rounded-md px-2 py-1 text-xs font-semibold"
                    onClick={() => removeGallery(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 grid h-28 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
              No gallery photos selected
            </div>
          )}
        </div>
      </div>
      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function translateField(key: string, t: ReturnType<typeof useLanguage>["t"]) {
  const map: Record<string, Parameters<typeof t>[0]> = {
    slug: "slug",
    name_en: "englishName",
    name_bn: "banglaName",
    description_en: "englishDescription",
    description_bn: "banglaDescription",
    seo_title_en: "englishSeoTitle",
    seo_title_bn: "banglaSeoTitle",
    seo_description_en: "englishSeoDescription",
    seo_description_bn: "banglaSeoDescription",
    price: "productPrice",
    compare_at_price: "compareAtPrice",
    currency_code: "currencyCode",
  };
  return t(map[key] ?? "slug");
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      {children}
    </div>
  );
}
