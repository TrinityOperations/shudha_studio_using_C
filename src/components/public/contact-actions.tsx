"use client";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type ContactActionsProps = {
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
};

function digitsOnly(value: string) {
  return value.replace(/[^0-9]/g, "");
}

export function ContactActions({ email, phone, whatsapp }: ContactActionsProps) {
  const { t } = useLanguage();
  const whatsappDigits = whatsapp ? digitsOnly(whatsapp) : "";

  return (
    <div className="flex flex-wrap gap-3">
      {phone ? (
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          href={`tel:${phone}`}
        >
          <Phone aria-hidden="true" size={17} />
          {t("callUs")}
        </a>
      ) : null}
      {whatsappDigits ? (
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
          href={`https://wa.me/${whatsappDigits}`}
          rel="noreferrer"
          target="_blank"
        >
          <MessageCircle aria-hidden="true" size={17} />
          {t("whatsapp")}
        </a>
      ) : null}
      {email ? (
        <a
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus:ring-2 focus:ring-rose-200 focus:outline-none"
          href={`mailto:${email}`}
        >
          <Mail aria-hidden="true" size={17} />
          {t("emailUs")}
        </a>
      ) : null}
    </div>
  );
}
