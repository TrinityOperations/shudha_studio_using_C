import type { Metadata } from "next";

import { MeetingRequestForm } from "@/components/public/meeting-request-form";
import { PageContainer } from "@/components/public/page-container";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book a meeting | Shudha Studio",
  description: "Request a meeting with Shudha Studio for thoughtful gift guidance.",
};

export default async function BookAMeetingPage() {
  const settings = await getSiteSettings();
  const language = await getPreferredLanguage(settings.default_language);
  const businessName =
    language === "bn" ? settings.business_name_bn : settings.business_name_en;

  return (
    <main id="main-content" className="bg-slate-50">
      <PageContainer className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_1fr] lg:items-start">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
            {translate(language, "personalService")}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {translate(language, "bookWith", { business: businessName })}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            {translate(language, "meetingIntro")}
          </p>
        </div>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-950">
            {translate(language, "meetingRequest")}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {translate(language, "allTimesUse", {
              timezone: settings.business_timezone,
            })}
          </p>
          <div className="mt-7">
            <MeetingRequestForm businessTimezone={settings.business_timezone} />
          </div>
        </section>
      </PageContainer>
    </main>
  );
}
