"use client";

import { Menu, Phone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PageContainer } from "@/components/public/page-container";
import { LanguageSwitcher, useLanguage } from "@/components/language-provider";
import { getThemeImageUrl } from "@/lib/theme-images";

type HeaderProps = {
  businessName: string;
  businessNameBn?: string;
  phone?: string | null;
  whatsapp?: string | null;
  logoPath?: string | null;
  logoAlt?: string | null;
};

export function Header({
  businessName,
  businessNameBn,
  phone,
  logoPath,
  logoAlt,
}: HeaderProps) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <PageContainer className="flex min-h-16 items-center justify-between gap-4">
        <Link
          className="shrink-0 text-lg font-semibold tracking-tight text-slate-950 focus:ring-2 focus:ring-rose-300 focus:outline-none"
          href="/"
          onClick={() => setIsOpen(false)}
        >
          {logoPath ? (
            <img
              className="max-h-10 max-w-44 object-contain"
              src={getThemeImageUrl(logoPath) ?? ""}
              alt={logoAlt || businessName}
            />
          ) : language === "bn" ? (
            businessNameBn || businessName
          ) : (
            businessName
          )}
        </Link>

        <nav aria-label={t("navPrimary")} className="hidden items-center gap-7 md:flex">
          <Link
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
            href="/products"
          >
            {t("products")}
          </Link>
          <Link
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
            href="/#contact"
          >
            {t("contact")}
          </Link>
          {phone ? (
            <a
              className="inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              href={`tel:${phone}`}
            >
              <Phone aria-hidden="true" size={16} />
              {t("callUs")}
            </a>
          ) : null}
        </nav>

        <button
          aria-controls="mobile-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? t("closeMenu") : t("openMenu")}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 focus:ring-2 focus:ring-rose-300 focus:outline-none md:hidden"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </PageContainer>

      {isOpen ? (
        <nav
          aria-label={t("navMobile")}
          className="border-t border-slate-200 bg-white md:hidden"
          id="mobile-navigation"
        >
          <PageContainer className="flex flex-col gap-2 py-4">
            <Link
              className="rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              href="/products"
              onClick={() => setIsOpen(false)}
            >
              {t("products")}
            </Link>
            <Link
              className="rounded-xl px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
              href="/#contact"
              onClick={() => setIsOpen(false)}
            >
              {t("contact")}
            </Link>
            {phone ? (
              <a
                className="rounded-xl bg-rose-700 px-4 py-3 font-semibold text-white hover:bg-rose-800"
                href={`tel:${phone}`}
                onClick={() => setIsOpen(false)}
              >
                {t("callUs")}
              </a>
            ) : null}
            <LanguageSwitcher />
          </PageContainer>
        </nav>
      ) : null}
      <div className="absolute top-3 right-4 hidden md:block">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
