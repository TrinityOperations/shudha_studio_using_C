"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLanguage } from "@/components/language-provider";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { getThemeImageUrl } from "@/lib/theme-images";
import {
  defaultThemeColors,
  themeContentSchema,
  type CustomTheme,
} from "@/lib/custom-themes";
import { occasionOptions, recipientOptions } from "@/lib/storefront-navigation";

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

export function ThemeForm({
  initial,
  id,
  categories = [],
}: {
  initial?: CustomTheme;
  id?: string;
  categories?: { id: string; name_en: string; name_bn: string; is_active: boolean }[];
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const [values, setValues] = useState<Values>({
    ...initial,
    name: initial?.name ?? "New theme",
    slug: initial?.slug ?? "new-theme",
    colors: initial?.colors ?? defaultThemeColors,
    content: themeContentSchema.parse(initial?.content ?? {}),
    logo_path: initial?.logo_path ?? null,
    background_path: initial?.background_path ?? null,
    hero_path: initial?.hero_path ?? null,
    logo_alt_en: initial?.logo_alt_en ?? null,
    logo_alt_bn: initial?.logo_alt_bn ?? null,
  });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<
    "logo_path" | "background_path" | "hero_path" | null
  >(null);

  function update(patch: Partial<Values>) {
    setValues((current) => ({ ...current, ...patch }));
    setSaved(false);
  }
  function updateContent(key: string, value: string) {
    update({ content: { ...values.content, [key]: value } });
  }

  function updateDiscoveryLink(
    field: "occasion_links" | "recipient_links",
    key: (typeof occasionOptions)[number][0] | (typeof recipientOptions)[number][0],
    categoryId: string,
  ) {
    const current = values.content[field] as Array<{
      key: string;
      category_id: string;
    }>;
    const links = current.filter((link) => link.key !== key);
    if (categoryId) links.push({ key, category_id: categoryId });
    update({ content: { ...values.content, [field]: links } });
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

  function updatePriceRanges(value: string) {
    const ranges = value
      .split("\n")
      .map((line) => {
        const [slug, label_en, label_bn, currency_code, minText, maxText] = line
          .split("|")
          .map((part) => part.trim());
        return {
          slug,
          label_en,
          label_bn,
          currency_code: currency_code?.toUpperCase(),
          min: minText ? Number(minText) : null,
          max: maxText ? Number(maxText) : null,
        };
      })
      .filter(
        (range) =>
          range.slug && range.label_en && range.label_bn && range.currency_code,
      );
    update({ content: { ...values.content, price_ranges: ranges } });
  }

  async function uploadImage(
    file: File,
    key: "logo_path" | "background_path" | "hero_path",
  ) {
    if (!id) {
      setError("Save the theme before uploading images.");
      return;
    }
    if (
      !/^image\/(jpeg|png|webp)$/.test(file.type) ||
      file.size <= 0 ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Use a JPEG, PNG, or WebP image up to 5 MB.");
      return;
    }
    setUploading(key);
    setError("");
    try {
      const path = `${id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await createSupabaseBrowserClient()
        .storage.from("theme-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        return;
      }
      update({ [key]: path });
    } finally {
      setUploading(null);
    }
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
        <h2 className="mb-4 text-xl font-semibold">Homepage sections</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["show_occasion_section", "Shop by occasion"],
              ["show_recipient_section", "Shop by recipient"],
              ["show_featured_section", "Featured collection"],
            ] as const
          ).map(([key, label]) => (
            <label
              className="admin-toggle flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold shadow-sm"
              key={key}
            >
              <input
                checked={values.content[key]}
                className="size-5 accent-rose-700"
                onChange={(event) =>
                  update({
                    content: { ...values.content, [key]: event.target.checked },
                  })
                }
                type="checkbox"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-600">
          Choose which discovery sections appear on the homepage for this theme.
        </p>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Storefront announcement</h2>
        <p className="mb-4 text-sm text-slate-600">
          Leave both fields blank to hide the announcement.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {(["en", "bn"] as const).map((locale) => (
            <Field
              key={locale}
              label={`Announcement (${locale === "en" ? "English" : "Bangla"})`}
            >
              <input
                className="form-input"
                maxLength={240}
                value={values.content[`announcement_${locale}`]}
                onChange={(event) =>
                  updateContent(`announcement_${locale}`, event.target.value)
                }
              />
            </Field>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold">Occasion and recipient discovery</h2>
        <p className="mb-4 text-sm text-slate-600">
          Each destination is an existing active category. Unmapped labels will not
          appear on the homepage.
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          {(
            [
              ["occasion_links", occasionOptions, "Occasions"],
              ["recipient_links", recipientOptions, "Recipients"],
            ] as const
          ).map(([field, options, heading]) => {
            const links = values.content[field] as Array<{
              key: string;
              category_id: string;
            }>;
            return (
              <fieldset className="rounded-xl border border-slate-200 p-4" key={field}>
                <legend className="px-1 font-semibold">{heading}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {options.map(([key, en, bn]) => (
                    <Field key={key} label={`${en} / ${bn}`}>
                      <select
                        className="form-input"
                        value={
                          links.find((link) => link.key === key)?.category_id ?? ""
                        }
                        onChange={(event) =>
                          updateDiscoveryLink(field, key, event.target.value)
                        }
                      >
                        <option value="">Not shown</option>
                        {categories
                          .filter((category) => category.is_active)
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name_en}
                            </option>
                          ))}
                      </select>
                    </Field>
                  ))}
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold">
          Price ranges and occasion introduction
        </h2>
        <p className="mb-4 text-sm text-slate-600">
          Configure only real ranges and the actual ISO currency code. One range per
          line: slug|English label|Bangla label|currency|minimum|maximum. Leave a bound
          blank for no bound.
        </p>
        <Field label="Price ranges">
          <textarea
            className="form-input min-h-32 font-mono text-sm"
            value={values.content.price_ranges
              .map(
                (range) =>
                  `${range.slug}|${range.label_en}|${range.label_bn}|${range.currency_code}|${range.min ?? ""}|${range.max ?? ""}`,
              )
              .join("\n")}
            onChange={(event) => updatePriceRanges(event.target.value)}
          />
        </Field>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["en", "bn"] as const).map((locale) => (
            <Field key={locale} label={`Occasion editorial introduction (${locale})`}>
              <textarea
                className="form-input min-h-24"
                maxLength={1000}
                value={values.content[`occasion_intro_${locale}`]}
                onChange={(event) =>
                  updateContent(`occasion_intro_${locale}`, event.target.value)
                }
              />
            </Field>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          Homepage campaign and editorial copy
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["campaign_title_en", "Campaign title (English)"],
              ["campaign_title_bn", "Campaign title (Bangla)"],
              ["campaign_description_en", "Campaign description (English)"],
              ["campaign_description_bn", "Campaign description (Bangla)"],
              ["trust_heading_en", "Trust heading (English)"],
              ["trust_heading_bn", "Trust heading (Bangla)"],
              ["trust_copy_en", "Trust copy (English)"],
              ["trust_copy_bn", "Trust copy (Bangla)"],
              ["meeting_heading_en", "Meeting heading (English)"],
              ["meeting_heading_bn", "Meeting heading (Bangla)"],
              ["meeting_copy_en", "Meeting copy (English)"],
              ["meeting_copy_bn", "Meeting copy (Bangla)"],
              ["story_title_en", "Our story title (English)"],
              ["story_title_bn", "Our story title (Bangla)"],
              ["story_copy_en", "Our story text (English)"],
              ["story_copy_bn", "Our story text (Bangla)"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} label={label}>
              <textarea
                className="form-input min-h-20"
                value={values.content[key]}
                onChange={(event) => updateContent(key, event.target.value)}
              />
            </Field>
          ))}
          <Field label="Campaign destination (active category)">
            <select
              className="form-input"
              value={values.content.campaign_category_id ?? ""}
              onChange={(event) =>
                update({
                  content: {
                    ...values.content,
                    campaign_category_id: event.target.value || null,
                  },
                })
              }
            >
              <option value="">All gifts</option>
              {categories
                .filter((category) => category.is_active)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_en}
                  </option>
                ))}
            </select>
          </Field>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-xl font-semibold">Storefront navigation</h2>
        <p className="mb-4 text-sm text-slate-600">
          Optionally feature active categories under these headings. Links lead to
          category pages, not separate occasion, recipient or collection pages.
        </p>
        <div className="grid gap-5 sm:grid-cols-3">
          {(
            [
              ["occasion_category_ids", "Occasions"],
              ["recipient_category_ids", "Recipients"],
              ["collection_category_ids", "Collections"],
            ] as const
          ).map(([key, label]) => (
            <fieldset className="rounded-xl border border-slate-200 p-4" key={key}>
              <legend className="px-1 font-semibold">{label}</legend>
              <div className="max-h-52 space-y-2 overflow-y-auto">
                {categories
                  .filter((category) => category.is_active)
                  .map((category) => (
                    <label className="flex items-start gap-2 text-sm" key={category.id}>
                      <input
                        checked={values.content[key].includes(category.id)}
                        disabled={
                          values.content[key].length >= 12 &&
                          !values.content[key].includes(category.id)
                        }
                        onChange={(event) =>
                          update({
                            content: {
                              ...values.content,
                              [key]: event.target.checked
                                ? [...values.content[key], category.id]
                                : values.content[key].filter(
                                    (value) => value !== category.id,
                                  ),
                            },
                          })
                        }
                        type="checkbox"
                      />
                      <span>
                        {category.name_en} / {category.name_bn}
                      </span>
                    </label>
                  ))}
                {!categories.some((category) => category.is_active) ? (
                  <p className="text-sm text-slate-500">
                    No active categories available.
                  </p>
                ) : null}
              </div>
            </fieldset>
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
        <h2 className="mb-4 text-xl font-semibold">Homepage sections</h2>
        <p className="mb-4 text-sm text-slate-600">
          Existing themes keep every section enabled unless you explicitly turn it off.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["show_categories_section", "Categories"],
              ["show_occasion_section", "Shop by occasion"],
              ["show_recipient_section", "Shop by recipient"],
              ["show_featured_section", "Featured collection"],
              ["show_campaign_section", "Campaign"],
              ["show_trust_section", "Trust"],
              ["show_meeting_section", "Meeting"],
              ["show_story_section", "Our story"],
              ["show_contact_section", "Let’s connect"],
            ] as const
          ).map(([key, label]) => (
            <label
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
              key={key}
            >
              <input
                checked={values.content[key]}
                onChange={(event) =>
                  update({
                    content: { ...values.content, [key]: event.target.checked },
                  })
                }
                type="checkbox"
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
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
                <>
                  <img
                    className="mt-3 h-28 w-full rounded-xl object-cover"
                    src={getThemeImageUrl(values[key]) ?? ""}
                    alt=""
                  />
                  <button
                    className="admin-button admin-button-danger mt-3 rounded-lg px-3 py-2 text-sm font-semibold"
                    onClick={() => update({ [key]: null })}
                    type="button"
                  >
                    Remove {label.toLowerCase()}
                  </button>
                </>
              ) : (
                <div className="mt-3 grid h-28 place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                  No image
                </div>
              )}
              <input
                className="admin-file-picker mt-3 block w-full text-sm"
                accept="image/jpeg,image/png,image/webp"
                disabled={Boolean(uploading)}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadImage(file, key);
                  e.target.value = "";
                }}
              />
              {uploading === key ? (
                <p className="mt-2 text-sm font-medium text-rose-700" role="status">
                  Uploading {label.toLowerCase()}…
                </p>
              ) : null}
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
        className="admin-button admin-button-primary rounded-xl px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
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
