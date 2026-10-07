"use client";
import { ArrowUpRight, MapPin, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/public/page-container";
import { useLanguage } from "@/components/language-provider";
import type { StorefrontGroup } from "@/lib/storefront-navigation";

type FooterProps = {
  address?: string | null;
  addressBn?: string | null;
  businessName: string;
  businessNameBn?: string;
  groups?: StorefrontGroup[];
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
};

export function Footer({
  address,
  addressBn,
  businessName,
  businessNameBn,
  groups = [],
  email,
  phone,
  whatsapp,
}: FooterProps) {
  const { language, t } = useLanguage();
  const displayedAddress = language === "bn" ? addressBn || address : address;
  const displayedBusinessName =
    language === "bn" ? businessNameBn || businessName : businessName;
  const whatsappDigits = whatsapp?.replace(/[^0-9]/g, "");

  return (
    <footer className="store-footer border-t border-slate-200 bg-slate-950 text-slate-300">
      <PageContainer className="grid min-w-0 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="min-w-0">
          <Link className="text-xl font-semibold text-white" href="/">
            {displayedBusinessName}
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            {t("footerDescription")}
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
            href="/shop"
          >
            {t("viewAllProducts")} <ArrowUpRight aria-hidden="true" size={16} />
          </Link>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            {t("shop")}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Link className="block hover:text-white" href="/shop">
              {t("products")}
            </Link>
            <Link className="block hover:text-white" href="/shop?sort=newest">
              {t("newArrivals")}
            </Link>
            {groups
              .find((group) => group.id === "categories")
              ?.items.slice(0, 5)
              .map((category) => (
                <Link
                  className="block hover:text-white"
                  href={`/shop/category/${category.slug}`}
                  key={category.id}
                >
                  {language === "bn"
                    ? category.name_bn || category.name_en
                    : category.name_en}
                </Link>
              ))}
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            {t("customerHelp")}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <Link className="block hover:text-white" href="/book-a-meeting">
              {t("bookMeeting")}
            </Link>
            <Link className="block hover:text-white" href="/contact">
              {t("contact")}
            </Link>
          </div>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-[0.18em] text-white uppercase">
            {t("contact")}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {phone ? (
              <a
                className="flex items-center gap-2 hover:text-white"
                href={`tel:${phone}`}
              >
                <Phone aria-hidden="true" size={16} /> {phone}
              </a>
            ) : null}
            {whatsappDigits ? (
              <a
                className="flex items-center gap-2 hover:text-white"
                href={`https://wa.me/${whatsappDigits}`}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={16} /> {t("whatsapp")}
              </a>
            ) : null}
            {email ? (
              <a
                className="flex min-w-0 items-center gap-2 break-all hover:text-white"
                href={`mailto:${email}`}
              >
                <Mail aria-hidden="true" size={16} /> {email}
              </a>
            ) : null}
            {displayedAddress ? (
              <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                <span>{displayedAddress}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="text-sm text-slate-400 sm:col-span-2 lg:col-span-4">
          <p>
            © {new Date().getFullYear()} {displayedBusinessName}.{" "}
            {t("allRightsReserved")}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
