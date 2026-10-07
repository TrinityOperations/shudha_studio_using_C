import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";

import { MeetingRequestForm } from "@/components/public/meeting-request-form";
import { PageContainer } from "@/components/public/page-container";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";
import { getPublicProductBySlug } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a meeting | Shudha Studio",
  description: "Request a meeting with Shudha Studio for thoughtful gift guidance.",
};

type BookingPageProps = { searchParams: Promise<{ product?: string | string[] }> };

export default async function BookAMeetingPage({ searchParams }: BookingPageProps) {
  const [settings, query] = await Promise.all([getSiteSettings(), searchParams]);
  const language = await getPreferredLanguage(settings.default_language);
  const requestedSlug =
    typeof query.product === "string" &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(query.product)
      ? query.product
      : "";
  const product = requestedSlug
    ? await getPublicProductBySlug(requestedSlug).catch(() => null)
    : null;
  const businessName =
    language === "bn" ? settings.business_name_bn : settings.business_name_en;

  return (
    <main id="main-content" className="store-booking bg-slate-50">
      <PageContainer className="grid gap-10 py-10 sm:py-16 lg:grid-cols-[0.8fr_1fr] lg:items-start lg:py-20">
        <div className="lg:sticky lg:top-28">
          <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
            {translate(language, "personalService")}
          </p>
          <h1 className="store-display mt-4 text-4xl font-medium tracking-tight text-slate-950 sm:text-5xl">
            {translate(language, "bookWith", { business: businessName })}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            {translate(language, "meetingIntro")}
          </p>
          <p className="mt-4 max-w-xl leading-7 text-slate-600">
            {translate(language, "meetingPurpose")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {settings.phone ? (
              <a
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 hover:bg-white"
                href={`tel:${settings.phone}`}
              >
                {translate(language, "callUs")}
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            ) : null}
            {settings.whatsapp ? (
              <a
                className="inline-flex min-h-12 items-center gap-2 rounded-full border border-emerald-300 px-5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                rel="noreferrer"
                target="_blank"
              >
                {translate(language, "whatsapp")}
                <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            ) : null}
            <Link
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-slate-300 px-5 text-sm font-semibold text-slate-800 hover:bg-white"
              href="/shop"
            >
              {translate(language, "exploreCollection")}
              <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className="mt-8 space-y-3 text-sm text-slate-600">
            <p className="inline-flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="text-rose-700" size={17} />
              {translate(language, "allTimesUse", {
                timezone: settings.business_timezone,
              })}
            </p>
            {settings.address_en || settings.address_bn ? (
              <p className="flex items-start gap-2">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-rose-700"
                  size={17}
                />
                <span>
                  {language === "bn"
                    ? settings.address_bn || settings.address_en
                    : settings.address_en}
                </span>
              </p>
            ) : null}
          </div>
        </div>
        <section className="store-booking-card rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">
            {translate(language, "meetingRequest")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {translate(language, "meetingIntro")}
          </p>
          <div className="mt-7">
            <MeetingRequestForm
              businessTimezone={settings.business_timezone}
              productSlug={product?.slug}
              productName={
                product
                  ? language === "bn"
                    ? product.name_bn || product.name_en
                    : product.name_en
                  : ""
              }
            />
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
