"use client";

import { CalendarDays, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PageContainer } from "@/components/public/page-container";
import { LanguageSwitcher, useLanguage } from "@/components/language-provider";
import { getThemeImageUrl } from "@/lib/theme-images";
import type { StorefrontGroup } from "@/lib/storefront-navigation";

type HeaderProps = {
  businessName: string;
  businessNameBn?: string;
  logoPath?: string | null;
  logoAlt?: string | null;
  logoAltBn?: string | null;
  groups?: StorefrontGroup[];
  categoryError?: boolean;
};

export function Header({
  businessName,
  businessNameBn,
  logoPath,
  logoAlt,
  logoAltBn,
  groups = [],
  categoryError = false,
}: HeaderProps) {
  const { language, t } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [desktopExpanded, setDesktopExpanded] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButton.current?.focus();
      }
      if (event.key !== "Tab" || !drawer.current) return;
      const focusable = Array.from(
        drawer.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled])",
        ),
      ).filter((item) => item.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    function onResize() {
      if (window.innerWidth >= 1024) setIsOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [isOpen]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsOpen(false);
      setDesktopExpanded(null);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const closeMenu = () => {
    setIsOpen(false);
    setExpanded(null);
  };
  const categoryLink = (
    item: StorefrontGroup["items"][number],
    onClick?: () => void,
  ) => (
    <Link
      className="store-focus block rounded-lg px-3 py-2 text-sm hover:bg-[var(--theme-muted-surface)]"
      href={`/shop/category/${item.slug}`}
      key={item.id}
      onClick={onClick}
    >
      {language === "bn" ? item.name_bn || item.name_en : item.name_en}
    </Link>
  );

  return (
    <header className="store-header sticky top-0 z-40 border-b">
      <PageContainer className="flex min-h-[4.5rem] min-w-0 items-center justify-between gap-2 py-2 sm:gap-4">
        <Link
          className="store-focus min-w-0 shrink rounded-lg text-lg font-semibold tracking-tight sm:text-xl"
          href="/"
          onClick={closeMenu}
        >
          {logoPath && !logoFailed ? (
            <img
              alt={
                (language === "bn" ? logoAltBn || logoAlt : logoAlt) ||
                (language === "bn" ? businessNameBn || businessName : businessName)
              }
              className="max-h-10 max-w-36 object-contain sm:max-w-44"
              onError={() => setLogoFailed(true)}
              src={getThemeImageUrl(logoPath) ?? ""}
            />
          ) : (
            <span className="block truncate">
              {language === "bn" ? businessNameBn || businessName : businessName}
            </span>
          )}
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden xl:block">
            <LanguageSwitcher />
          </div>
          <Link
            className="store-primary store-focus hidden min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold lg:inline-flex"
            href="/book-a-meeting"
          >
            <CalendarDays aria-hidden="true" size={16} />
            {t("bookMeeting")}
          </Link>
          <button
            aria-controls="mobile-navigation"
            aria-expanded={isOpen}
            aria-label={isOpen ? t("closeMenu") : t("openMenu")}
            className="store-focus inline-flex size-11 items-center justify-center rounded-full lg:hidden"
            onClick={() => setIsOpen((value) => !value)}
            ref={menuButton}
            type="button"
          >
            {isOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </PageContainer>
      <nav
        aria-label={t("navPrimary")}
        className="store-desktop-nav hidden border-t lg:block"
      >
        <PageContainer className="flex min-h-12 flex-wrap items-center justify-center gap-1 xl:gap-4">
          <Link
            className="store-focus rounded-lg px-3 py-2 text-sm font-medium"
            href="/shop"
          >
            {t("shop")}
          </Link>
          {groups
            .filter((group) => group.items.length)
            .map((group) => (
              <div
                className="relative"
                key={group.id}
                onBlur={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget))
                    setDesktopExpanded(null);
                }}
              >
                <button
                  aria-controls={`desktop-${group.id}`}
                  aria-expanded={desktopExpanded === group.id}
                  className="store-focus flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium"
                  onClick={() =>
                    setDesktopExpanded((current) =>
                      current === group.id ? null : group.id,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setDesktopExpanded(null);
                  }}
                  type="button"
                >
                  {t(group.id)}
                  <ChevronDown aria-hidden="true" size={15} />
                </button>
                {desktopExpanded === group.id ? (
                  <div
                    className="store-dropdown absolute top-full left-0 z-50 max-h-[60vh] w-64 overflow-y-auto rounded-xl border p-2 shadow-xl"
                    id={`desktop-${group.id}`}
                  >
                    {group.items.map((item) =>
                      categoryLink(item, () => setDesktopExpanded(null)),
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          {categoryError ? (
            <span className="px-2 text-xs" role="status">
              {t("categoriesUnavailable")}
            </span>
          ) : null}
          <Link
            className="store-focus rounded-lg px-3 py-2 text-sm font-medium"
            href="/shop?sort=newest"
          >
            {t("newArrivals")}
          </Link>
          <Link
            className="store-focus rounded-lg px-3 py-2 text-sm font-medium"
            href="/contact"
          >
            {t("contact")}
          </Link>
          <div className="xl:hidden">
            <LanguageSwitcher />
          </div>
        </PageContainer>
      </nav>
      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" id="mobile-navigation">
          <button
            aria-label={t("closeMenu")}
            className="absolute inset-0 bg-black/60"
            onClick={closeMenu}
            tabIndex={-1}
            type="button"
          />
          <div
            aria-label={t("navMobile")}
            aria-modal="true"
            className="store-drawer absolute inset-y-0 right-0 flex w-[min(90vw,24rem)] min-w-0 flex-col overflow-hidden shadow-2xl"
            ref={drawer}
            role="dialog"
          >
            <div className="flex items-center justify-between border-b p-4">
              <strong>{t("browse")}</strong>
              <button
                aria-label={t("closeMenu")}
                className="store-focus grid size-11 place-items-center rounded-full"
                onClick={closeMenu}
                ref={closeButton}
                type="button"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <nav
              aria-label={t("navMobile")}
              className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4"
            >
              <Link
                className="store-focus mt-4 block rounded-lg px-3 py-3 font-medium"
                href="/shop"
                onClick={closeMenu}
              >
                {t("shop")}
              </Link>
              {groups
                .filter((group) => group.items.length)
                .map((group) => (
                  <div key={group.id}>
                    <button
                      aria-controls={`mobile-${group.id}`}
                      aria-expanded={expanded === group.id}
                      className="store-focus flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left font-medium"
                      onClick={() =>
                        setExpanded((current) =>
                          current === group.id ? null : group.id,
                        )
                      }
                      type="button"
                    >
                      {t(group.id)}
                      <ChevronDown aria-hidden="true" size={17} />
                    </button>
                    {expanded === group.id ? (
                      <div className="ml-3 border-l pl-2" id={`mobile-${group.id}`}>
                        {group.items.map((item) => categoryLink(item, closeMenu))}
                      </div>
                    ) : null}
                  </div>
                ))}
              {categoryError ? (
                <p className="px-3 text-sm" role="status">
                  {t("categoriesUnavailable")}
                </p>
              ) : null}
              <Link
                className="store-focus block rounded-lg px-3 py-3 font-medium"
                href="/shop?sort=newest"
                onClick={closeMenu}
              >
                {t("newArrivals")}
              </Link>
              <Link
                className="store-focus block rounded-lg px-3 py-3 font-medium"
                href="/contact"
                onClick={closeMenu}
              >
                {t("contact")}
              </Link>
              <div className="px-3 py-3">
                <LanguageSwitcher />
              </div>
            </nav>
            <div className="border-t p-4">
              <Link
                className="store-primary store-focus flex min-h-12 items-center justify-center gap-2 rounded-full px-4 font-semibold"
                href="/book-a-meeting"
                onClick={closeMenu}
              >
                <CalendarDays aria-hidden="true" size={17} />
                {t("bookMeeting")}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
