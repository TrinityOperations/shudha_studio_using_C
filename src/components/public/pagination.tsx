"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function Pagination({
  page,
  totalPages,
  query,
  category,
  sort,
  params: extraParams = {},
  basePath = "/shop",
}: {
  page: number;
  totalPages: number;
  query?: string;
  category?: string;
  sort?: string;
  params?: Record<string, string | undefined>;
  basePath?: string;
}) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;
  const href = (nextPage: number) => {
    const queryParams = new URLSearchParams();
    if (query) queryParams.set("q", query);
    if (category) queryParams.set("category", category);
    if (sort) queryParams.set("sort", sort);
    for (const [key, value] of Object.entries(extraParams))
      if (value) queryParams.set(key, value);
    queryParams.set("page", String(nextPage));
    return `${basePath}${queryParams.size ? `?${queryParams.toString()}` : ""}`;
  };

  return (
    <nav
      aria-label={t("productPages")}
      className="mt-10 flex items-center justify-center gap-3"
    >
      {page > 1 ? (
        <Link
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          href={href(page - 1)}
        >
          {t("previous")}
        </Link>
      ) : null}
      <span className="text-sm text-slate-600">
        {t("pageOf", { page, total: totalPages })}
      </span>
      {page < totalPages ? (
        <Link
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          href={href(page + 1)}
        >
          {t("next")}
        </Link>
      ) : null}
    </nav>
  );
}
