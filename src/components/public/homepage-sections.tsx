import Link from "next/link";
import {
  ArrowUpRight,
  HeartHandshake,
  MapPin,
  PackageCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { PageContainer } from "@/components/public/page-container";
import { translate } from "@/lib/i18n/translations";
import type { SiteTheme } from "@/lib/theme";
import type { SupportedLanguage } from "@/types/domain";

export function CampaignSection({
  language,
  theme,
  title,
  description,
  categorySlug,
}: {
  language: SupportedLanguage;
  theme: SiteTheme;
  title: string;
  description: string;
  categorySlug?: string;
}) {
  const label = translate(language, "seasonalCampaign");
  const defaults: Record<SiteTheme, { title: string; copy: string }> = {
    everyday: {
      title:
        language === "bn"
          ? "প্রতিদিনের ছোট্ট আনন্দ"
          : "Everyday moments, made memorable",
      copy:
        language === "bn"
          ? "ছোট্ট যত্নেও তৈরি হতে পারে সুন্দর স্মৃতি।"
          : "Small gestures can make the everyday feel a little more memorable.",
    },
    wedding: {
      title:
        language === "bn" ? "একসঙ্গে নতুন শুরুর জন্য" : "For the beginning of forever",
      copy:
        language === "bn"
          ? "নতুন জীবনের অধ্যায়ে থাকুক আন্তরিক শুভেচ্ছা।"
          : "Thoughtful gestures for a celebration and the life that follows.",
    },
    festival: {
      title:
        language === "bn"
          ? "উৎসবের আনন্দ ভাগ করে নিন"
          : "A season made brighter by giving",
      copy:
        language === "bn"
          ? "উৎসবের মুহূর্ত ভাগ করুন যত্নে বাছাই করা উপহারে।"
          : "Share the warmth of the season with a gift chosen with care.",
    },
  };
  const fallback = defaults[theme];
  return (
    <section className={`store-campaign store-campaign-${theme} py-12 sm:py-16`}>
      <PageContainer>
        <div className="store-campaign-panel grid gap-6 rounded-[2rem] p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles aria-hidden="true" size={16} />
              {label}
            </p>
            <h2 className="store-display mt-3 max-w-3xl text-3xl font-medium sm:text-5xl">
              {title || fallback.title}
            </h2>
            <p className="mt-4 max-w-2xl leading-7">{description || fallback.copy}</p>
          </div>
          <Link
            className="store-campaign-cta inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold"
            href={categorySlug ? `/category/${categorySlug}` : "/products"}
          >
            {translate(language, "shopGifts")}
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}

export function TrustSection({
  language,
  heading,
  copy,
  theme,
}: {
  language: SupportedLanguage;
  heading: string;
  copy: string;
  theme: SiteTheme;
}) {
  const values = [
    [Sparkles, "qualityValue", "qualityCopy"],
    [HeartHandshake, "personalValue", "personalCopy"],
    [MapPin, "localValue", theme === "festival" ? "festivalLocalCopy" : "localCopy"],
    [
      PackageCheck,
      "deliveryValue",
      theme === "wedding" ? "weddingDeliveryCopy" : "deliveryCopy",
    ],
    [UserRound, "supportValue", "supportCopy"],
  ] as const;
  return (
    <section className="store-values py-12 sm:py-16">
      <PageContainer>
        <h2 className="store-display text-center text-3xl font-medium sm:text-4xl">
          {heading || translate(language, "trustValues")}
        </h2>
        {copy ? (
          <p className="mx-auto mt-3 max-w-2xl text-center leading-7 text-[var(--theme-muted-foreground)]">
            {copy}
          </p>
        ) : null}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {values.map(([Icon, titleKey, copyKey]) => (
            <article className="store-value-card rounded-2xl border p-5" key={titleKey}>
              <Icon
                aria-hidden="true"
                className="text-[var(--theme-primary)]"
                size={21}
              />
              <h3 className="mt-4 font-semibold">{translate(language, titleKey)}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--theme-muted-foreground)]">
                {translate(language, copyKey)}
              </p>
            </article>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

export function MeetingCta({
  language,
  heading,
  copy,
  theme,
}: {
  language: SupportedLanguage;
  heading: string;
  copy: string;
  theme: SiteTheme;
}) {
  return (
    <section className={`store-meeting-cta store-meeting-cta-${theme} py-10 sm:py-14`}>
      <PageContainer>
        <div className="flex flex-col gap-5 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
          <div>
            <h2 className="store-display text-2xl font-medium sm:text-3xl">
              {heading || translate(language, "bookAConsultation")}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--theme-muted-foreground)]">
              {copy ||
                translate(
                  language,
                  theme === "wedding"
                    ? "weddingMeetingCopy"
                    : theme === "festival"
                      ? "festivalMeetingCopy"
                      : "personalCopy",
                )}
            </p>
          </div>
          <Link
            className="store-primary store-focus inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 font-semibold"
            href="/book-a-meeting"
          >
            {translate(language, "bookMeeting")}
            <ArrowUpRight aria-hidden="true" size={17} />
          </Link>
        </div>
      </PageContainer>
    </section>
  );
}

export function StorySection({
  language,
  title,
  copy,
}: {
  language: SupportedLanguage;
  title: string;
  copy: string;
}) {
  if (!title.trim() || !copy.trim()) return null;
  return (
    <section className="store-story py-12 sm:py-16">
      <PageContainer>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--theme-primary)] uppercase">
            {translate(language, "ourStory")}
          </p>
          <h2 className="store-display mt-3 text-3xl font-medium sm:text-4xl">
            {title}
          </h2>
          <p className="mt-5 leading-8 whitespace-pre-line text-[var(--theme-muted-foreground)]">
            {copy}
          </p>
        </div>
      </PageContainer>
    </section>
  );
}
