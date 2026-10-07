import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { PageContainer } from "@/components/public/page-container";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact | Shudha Studio",
  description: "Contact Shudha Studio for thoughtful gift guidance.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const language = await getPreferredLanguage(settings.default_language);
  const description =
    language === "bn"
      ? settings.contact_description_bn || settings.contact_description_en
      : settings.contact_description_en;
  const address =
    language === "bn"
      ? settings.address_bn || settings.address_en
      : settings.address_en;
  const whatsapp = settings.whatsapp?.replace(/\D/g, "");

  return (
    <main id="main-content" className="bg-[var(--theme-background)]">
      <PageContainer className="py-12 sm:py-20">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
            {translate(language, "contact")}
          </p>
          <h1 className="store-display mt-4 text-4xl font-medium tracking-tight text-slate-950 sm:text-6xl">
            {translate(language, "letsConnect")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {description || translate(language, "contactIntro")}
          </p>
        </header>

        <div className="mx-auto mt-10 grid max-w-5xl gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {settings.phone ? (
            <a
              className="flex min-h-36 flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-rose-700"
              href={`tel:${settings.phone}`}
            >
              <Phone aria-hidden="true" className="text-rose-700" size={24} />
              <span>
                <span className="block font-semibold text-slate-950">
                  {translate(language, "callUs")}
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  {settings.phone}
                </span>
              </span>
            </a>
          ) : null}
          {whatsapp ? (
            <a
              className="flex min-h-36 flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-emerald-700"
              href={`https://wa.me/${whatsapp}`}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle
                aria-hidden="true"
                className="text-emerald-700"
                size={24}
              />
              <span>
                <span className="block font-semibold text-slate-950">
                  {translate(language, "whatsapp")}
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  {translate(language, "messageUs")}
                </span>
              </span>
            </a>
          ) : null}
          {settings.email ? (
            <a
              className="flex min-h-36 flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-rose-700"
              href={`mailto:${settings.email}`}
            >
              <Mail aria-hidden="true" className="text-rose-700" size={24} />
              <span>
                <span className="block font-semibold text-slate-950">
                  {translate(language, "emailUs")}
                </span>
                <span className="mt-1 block text-sm break-all text-slate-600">
                  {settings.email}
                </span>
              </span>
            </a>
          ) : null}
          {address ? (
            <div className="flex min-h-36 flex-col items-start justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <MapPin aria-hidden="true" className="text-rose-700" size={24} />
              <span>
                <span className="block font-semibold text-slate-950">
                  {translate(language, "address")}
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-600">
                  {address}
                </span>
              </span>
            </div>
          ) : null}
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-3xl bg-rose-50 p-6 text-center sm:p-9">
          <h2 className="store-display text-2xl font-medium text-slate-950">
            {translate(language, "businessHours")}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl leading-7 text-slate-700">
            {translate(language, "businessHoursContact")}
          </p>
          <a
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-rose-700 px-6 font-semibold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
            href="/book-a-meeting"
          >
            {translate(language, "bookMeeting")}
          </a>
        </div>
      </PageContainer>
    </main>
  );
}
