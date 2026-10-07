"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

type CatalogControlsProps = {
  categories: { slug: string; name_en: string; name_bn?: string }[];
  category?: string;
  query?: string;
  sort?: string;
  featured?: boolean;
  range?: string;
  currency?: string;
  basePath?: string;
  preserve?: Record<string, string | undefined>;
  showCategory?: boolean;
};

export function CatalogControls({
  categories,
  category,
  query,
  sort,
  featured,
  range,
  currency,
  basePath = "/shop",
  preserve = {},
  showCategory = true,
}: CatalogControlsProps) {
  const { language, t } = useLanguage();
  return (
    <form
      action={basePath}
      className="store-filter grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(12rem,1fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_auto]"
    >
      {Object.entries({
        ...preserve,
        range: range || preserve.range,
        currency: currency || preserve.currency,
      }).map(([key, value]) =>
        value ? <input key={key} name={key} type="hidden" value={value} /> : null,
      )}
      <label className="sr-only" htmlFor="product-search">
        {t("searchProducts")}
      </label>
      <input
        className="store-input min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
        defaultValue={query}
        id="product-search"
        name="q"
        placeholder={t("searchGifts")}
        type="search"
      />
      {showCategory ? (
        <>
          <label className="sr-only" htmlFor="category-filter">
            {t("filterCategory")}
          </label>
          <select
            className="store-input min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
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
        </>
      ) : null}
      <label className="sr-only" htmlFor="sort-products">
        {t("sortProducts")}
      </label>
      <select
        className="store-input min-h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm"
        defaultValue={sort || ""}
        id="sort-products"
        name="sort"
      >
        <option value="">{t("recommended")}</option>
        <option value="newest">{t("newest")}</option>
        <option value="name-asc">{t("nameAsc")}</option>
        <option value="name-desc">{t("nameDesc")}</option>
        {currency ? (
          <>
            <option value="price-asc">{t("priceLowToHigh")}</option>
            <option value="price-desc">{t("priceHighToLow")}</option>
          </>
        ) : null}
      </select>
      <label className="flex min-h-12 items-center gap-2 text-sm">
        <input defaultChecked={featured} name="featured" type="checkbox" value="1" />{" "}
        {t("featured")}
      </label>
      <div className="flex gap-2">
        <button
          className="store-button min-h-12 flex-1 rounded-xl bg-rose-700 px-5 text-sm font-semibold text-white hover:bg-rose-800"
          type="submit"
        >
          {t("search")}
        </button>
        <Link
          className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-white"
          href={basePath}
        >
          {t("clear")}
        </Link>
      </div>
    </form>
  );
}
