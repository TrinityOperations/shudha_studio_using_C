"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

type Field = { key: string; label: string; textarea?: boolean };
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
  const [values, setValues] = useState<Record<string, string | boolean | number>>({
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
}: {
  initial?: Record<string, unknown>;
  id?: string;
  categories: { id: string; name_en: string }[];
}) {
  const { t } = useLanguage();
  const [values, setValues] = useState<Record<string, string | boolean | number>>({
    is_active: true,
    is_available: true,
    is_featured: false,
    sort_order: 0,
    ...initial,
  });
  return (
    <CatalogForm
      endpoint={id ? `/api/admin/products/${id}` : "/api/admin/products"}
      listPath="/admin/products"
      fields={[
        { key: "slug", label: "Slug" },
        { key: "name_en", label: "English name" },
        { key: "name_bn", label: "Bangla name" },
        { key: "description_en", label: "English description", textarea: true },
        { key: "description_bn", label: "Bangla description", textarea: true },
        { key: "seo_title_en", label: "English SEO title" },
        { key: "seo_title_bn", label: "Bangla SEO title" },
        { key: "seo_description_en", label: "English SEO description", textarea: true },
        { key: "seo_description_bn", label: "Bangla SEO description", textarea: true },
      ].map((field) => ({ ...field, label: translateField(field.key, t) }))}
      values={values}
      setValues={setValues}
      categories={categories}
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
  product,
}: {
  endpoint: string;
  listPath: string;
  fields: Field[];
  values: Record<string, string | boolean | number>;
  setValues: React.Dispatch<
    React.SetStateAction<Record<string, string | boolean | number>>
  >;
  categories?: { id: string; name_en: string }[];
  product?: boolean;
}) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  function set(key: string, value: string | boolean) {
    setValues((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(endpoint, {
        method:
          endpoint.includes("/categories/") || endpoint.includes("/products/")
            ? "PATCH"
            : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) setError(payload.error ?? t("unableToSave"));
      else {
        setSaved(true);
        window.location.assign(listPath);
      }
    } catch {
      setError(t("unableToSave"));
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="space-y-5" onSubmit={submit}>
      {product && categories ? (
        <Field label={t("category")}>
          <select
            className="form-input"
            required
            value={String(values.category_id ?? "")}
            onChange={(e) => set("category_id", e.target.value)}
          >
            <option value="">{t("chooseCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_en}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      {fields.map((field) => (
        <Field key={field.key} label={field.label}>
          {field.textarea ? (
            <textarea
              className="form-input min-h-28"
              value={String(values[field.key] ?? "")}
              onChange={(e) => set(field.key, e.target.value)}
            />
          ) : (
            <input
              className="form-input"
              required={field.key === "slug" || field.key.startsWith("name_")}
              value={String(values[field.key] ?? "")}
              onChange={(e) => set(field.key, e.target.value)}
            />
          )}
        </Field>
      ))}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("sortOrder")}>
          <input
            className="form-input"
            min="0"
            type="number"
            value={Number(values.sort_order ?? 0)}
            onChange={(e) => set("sort_order", e.target.value)}
          />
        </Field>
        <div className="space-y-3 pt-7">
          {["is_active", ...(product ? ["is_available", "is_featured"] : [])].map(
            (key) => (
              <label className="flex items-center gap-2 text-sm font-medium" key={key}>
                <input
                  checked={Boolean(values[key])}
                  onChange={(e) => set(key, e.target.checked)}
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
      {error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>
      ) : null}
      {saved ? (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {t("savedSuccessfully")}
        </p>
      ) : null}
      <button
        className="rounded-xl bg-rose-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
        disabled={saving}
        type="submit"
      >
        {saving ? t("saving") : t("save")}
      </button>
    </form>
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
