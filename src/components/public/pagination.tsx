"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function Pagination({
  page,
  totalPages,
  query,
  category,
}: {
  page: number;
  totalPages: number;
  query?: string;
  category?: string;
}) {
  const { t } = useLanguage();
  if (totalPages <= 1) return null;
  const href = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);
    params.set("page", String(nextPage));
    return `/products?${params.toString()}`;
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
