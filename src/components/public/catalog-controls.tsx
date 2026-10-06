"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

type CatalogControlsProps = {
  categories: { slug: string; name_en: string; name_bn?: string }[];
  category?: string;
  query?: string;
};

export function CatalogControls({ categories, category, query }: CatalogControlsProps) {
  const { language, t } = useLanguage();
  return (
    <form
      action="/products"
      className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_220px_auto]"
    >
      <label className="sr-only" htmlFor="product-search">
        {t("searchProducts")}
      </label>
      <input
        className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        defaultValue={query}
        id="product-search"
        name="q"
        placeholder={t("searchGifts")}
        type="search"
      />
      <label className="sr-only" htmlFor="category-filter">
        {t("filterCategory")}
      </label>
      <select
        className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        defaultValue={category || ""}
        id="category-filter"
        name="category"
      >
        <option value="">{t("allCategories")}</option>
        {categories.map((item) => (
          <option key={item.slug} value={item.slug}>
            {language === "bn" ? item.name_bn || item.name_en : item.name_en}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          className="min-h-11 flex-1 rounded-xl bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800"
          type="submit"
        >
          {t("search")}
        </button>
        <Link
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
          href="/products"
        >
          {t("clear")}
        </Link>
      </div>
    </form>
  );
}
