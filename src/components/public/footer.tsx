"use client";
import { MapPin, Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { PageContainer } from "@/components/public/page-container";
import { useLanguage } from "@/components/language-provider";

type FooterProps = {
  address?: string | null;
  addressBn?: string | null;
  businessName: string;
  businessNameBn?: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
};

export function Footer({
  address,
  addressBn,
  businessName,
  businessNameBn,
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
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <PageContainer className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr]">
        <div>
          <Link className="text-xl font-semibold text-white" href="/">
            {displayedBusinessName}
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
            {t("footerDescription")}
          </p>
        </div>
        <div>
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
                className="flex items-center gap-2 break-all hover:text-white"
                href={`mailto:${email}`}
              >
                <Mail aria-hidden="true" size={16} /> {email}
              </a>
            ) : null}
            {address ? (
              <p className="flex items-start gap-2">
                <MapPin aria-hidden="true" className="mt-0.5 shrink-0" size={16} />
                <span>{displayedAddress}</span>
              </p>
            ) : null}
          </div>
        </div>
        <div className="text-sm text-slate-400 sm:col-span-2 lg:col-span-1">
          <p>
            © {new Date().getFullYear()} {displayedBusinessName}.{" "}
            {t("allRightsReserved")}
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
