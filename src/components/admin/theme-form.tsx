"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getThemeImageUrl } from "@/lib/theme-images";
import { defaultThemeColors, type CustomTheme } from "@/lib/custom-themes";

const colorFields = [
  ["background", "Page background"],
  ["surface", "Card surface"],
  ["mutedSurface", "Muted surface"],
  ["foreground", "Heading text"],
  ["mutedForeground", "Body text"],
  ["border", "Borders"],
  ["primary", "Primary color"],
  ["primaryHover", "Primary hover"],
  ["primarySoft", "Primary soft"],
  ["hero", "Hero background"],
  ["heroAccent", "Hero accent"],
  ["heroHighlight", "Hero highlight"],
] as const;

type Values = Omit<CustomTheme, "id" | "created_at" | "updated_at">;

export function ThemeForm({ initial, id }: { initial?: CustomTheme; id?: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    name: "New theme",
    slug: "new-theme",
    colors: defaultThemeColors,
    content: {
      eyebrow_en: "",
      eyebrow_bn: "",
      hero_title_en: "",
      hero_title_bn: "",
      hero_description_en: "",
      hero_description_bn: "",
      featured_heading_en: "",
      featured_heading_bn: "",
      categories_heading_en: "",
      categories_heading_bn: "",
      contact_heading_en: "",
      contact_heading_bn: "",
      tags_en: [],
      tags_bn: [],
    },
    logo_path: null,
    background_path: null,
    hero_path: null,
    logo_alt_en: null,
    logo_alt_bn: null,
    ...initial,
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<Values>) {
    setValues((current) => ({ ...current, ...patch }));
    setSaved(false);
  }
  function updateContent(key: string, value: string) {
    update({ content: { ...values.content, [key]: value } });
  }

  function updateTags(key: "tags_en" | "tags_bn", value: string) {
    update({
      content: {
        ...values.content,
        [key]: value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
    });
  }

  async function uploadImage(
    file: File,
    key: "logo_path" | "background_path" | "hero_path",
  ) {
    if (!id) {
      setError("Save the theme before uploading images.");
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Use a JPEG, PNG, or WebP image up to 5 MB.");
      return;
    }
    const path = `${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await createSupabaseBrowserClient()
      .storage.from("theme-images")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setError(uploadError.message);
      return;
    }
    update({ [key]: path });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch(
        id ? `/api/admin/themes/${id}` : "/api/admin/themes",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );
      const payload = (await response.json()) as { error?: string; id?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to save theme.");
        return;
      }
      setSaved(true);
      if (!id && payload.id) router.push(`/admin/themes/${payload.id}/edit`);
      else router.refresh();
    } catch {
      setError("Unable to save theme.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Theme name">
          <input
            className="form-input"
            required
            value={values.name}
            onChange={(e) => update({ name: e.target.value })}
          />
        </Field>
        <Field label="Slug">
          <input
            className="form-input"
            required
            value={values.slug}
            onChange={(e) => update({ slug: e.target.value })}
          />
        </Field>
      </div>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Colors</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {colorFields.map(([key, label]) => (
            <Field key={key} label={label}>
              <div className="flex gap-2">
                <input
                  aria-label={label}
                  className="h-12 w-14"
                  type="color"
                  value={values.colors[key]}
                  onChange={(e) =>
                    update({ colors: { ...values.colors, [key]: e.target.value } })
                  }
                />
                <input
                  className="form-input"
                  value={values.colors[key]}
                  onChange={(e) =>
                    update({ colors: { ...values.colors, [key]: e.target.value } })
                  }
                />
              </div>
            </Field>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Hero tags</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tags (English, comma-separated)">
            <input
              className="form-input"
              value={values.content.tags_en.join(", ")}
              onChange={(e) => updateTags("tags_en", e.target.value)}
            />
          </Field>
          <Field label="Tags (Bangla, comma-separated)">
            <input
              className="form-input"
              value={values.content.tags_bn.join(", ")}
              onChange={(e) => updateTags("tags_bn", e.target.value)}
            />
          </Field>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Homepage writing</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["eyebrow_en", "Eyebrow (English)"],
              ["eyebrow_bn", "Eyebrow (Bangla)"],
              ["hero_title_en", "Hero heading (English)"],
              ["hero_title_bn", "Hero heading (Bangla)"],
              ["hero_description_en", "Hero description (English)"],
              ["hero_description_bn", "Hero description (Bangla)"],
              ["featured_heading_en", "Featured heading (English)"],
              ["featured_heading_bn", "Featured heading (Bangla)"],
              ["categories_heading_en", "Categories heading (English)"],
              ["categories_heading_bn", "Categories heading (Bangla)"],
              ["contact_heading_en", "Contact heading (English)"],
              ["contact_heading_bn", "Contact heading (Bangla)"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea
                className="form-input min-h-24"
                value={String(values.content[key] ?? "")}
                onChange={(e) => updateContent(key, e.target.value)}
              />
            </Field>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Brand images</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {(
            [
              ["logo_path", "Logo"],
              ["background_path", "Background"],
              ["hero_path", "Hero image"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold">{label}</p>
              {values[key] ? (
                <img
                  className="mt-3 h-28 w-full rounded-xl object-cover"
                  src={getThemeImageUrl(values[key]) ?? ""}
                  alt=""
                />
              ) : (
                <div className="mt-3 grid h-28 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                  No image
                </div>
              )}
              <input
                className="mt-3 block w-full text-sm"
                accept="image/jpeg,image/png,image/webp"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file, key);
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Logo alt text (English)">
            <input
              className="form-input"
              value={values.logo_alt_en ?? ""}
              onChange={(e) => update({ logo_alt_en: e.target.value })}
            />
          </Field>
          <Field label="Logo alt text (Bangla)">
            <input
              className="form-input"
              value={values.logo_alt_bn ?? ""}
              onChange={(e) => update({ logo_alt_bn: e.target.value })}
            />
          </Field>
        </div>
      </section>
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

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  );
}
