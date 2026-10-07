import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Gift, Sparkles } from "lucide-react";

import { ContactActions } from "@/components/public/contact-actions";
import { PageContainer } from "@/components/public/page-container";
import { ProductGrid } from "@/components/public/product-grid";
import { DiscoveryCards } from "@/components/public/discovery-cards";
import {
  CampaignSection,
  MeetingCta,
  StorySection,
  TrustSection,
} from "@/components/public/homepage-sections";
import { getActiveCategories, getFeaturedProducts } from "@/lib/catalog";
import { getCategoryImageUrl, getProductImageUrl } from "@/lib/catalog-images";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { localizedValue, translate } from "@/lib/i18n/translations";
import { getThemeImageUrl } from "@/lib/theme-images";
import { resolveDiscoveryLinks } from "@/lib/storefront-navigation";
import type { TranslationKey } from "@/lib/i18n/translations";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shudha Studio | Thoughtful gifts",
  description: "Discover thoughtful gifts and personal service from Shudha Studio.",
};

export default async function Home() {
  const [settings, categories, featuredProducts] = await Promise.all([
    getSiteSettings(),
    getActiveCategories(),
    getFeaturedProducts(),
  ]);
  const language = await getPreferredLanguage(settings.default_language);
  const businessName =
    language === "bn" ? settings.business_name_bn : settings.business_name_en;
  const content = settings.theme.content;
  const text = (key: string, fallback: string) => {
    const value = content[`${key}_${language}` as keyof typeof content];
    return typeof value === "string" && value ? value : fallback;
  };
  const occasionLinks = resolveDiscoveryLinks(content.occasion_links, categories);
  const recipientLinks = resolveDiscoveryLinks(content.recipient_links, categories);
  const discoveryTitle = (key: string) => translate(language, key as TranslationKey);
  const campaignCategory = categories.find(
    (category) => category.id === content.campaign_category_id,
  );
  const heroImage = settings.theme.hero_path
    ? getThemeImageUrl(settings.theme.hero_path)
    : featuredProducts[0]?.main_image_path
      ? getProductImageUrl(featuredProducts[0].main_image_path)
      : null;
  const shouldOptimize = (url: string) =>
    Boolean(
      supabaseHost &&
      url.startsWith(`https://${supabaseHost}/storage/v1/object/public/`),
    );
  const campaignTitle = text(
    "campaign_title",
    language === "bn"
      ? "উৎসব হোক যত্নে বাছাই করা উপহারে"
      : "A little season of meaning",
  );
  const campaignDescription = text(
    "campaign_description",
    language === "bn"
      ? "বিশেষ মুহূর্তে প্রিয়জনের জন্য খুঁজে নিন আন্তরিক উপহার।"
      : "Find a thoughtful gift for the people and moments that make this season special.",
  );
  const tags = content[`tags_${language}`];
  const localizedHomeText = (key: string, fallback: string) => {
    const value = content[`${key}_${language}` as keyof typeof content];
    return typeof value === "string" && value ? value : fallback;
  };

  return (
    <main id="main-content" className="storefront">
      <section className="store-hero relative overflow-hidden bg-slate-950 text-white">
        {heroImage ? (
          <Image
            alt=""
            aria-hidden="true"
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={heroImage}
            unoptimized={!shouldOptimize(heroImage)}
          />
        ) : null}
        <div className="store-hero-glow pointer-events-none absolute inset-0" />
        <PageContainer className="relative grid min-h-[30rem] items-center gap-12 py-12 sm:min-h-[38rem] sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-rose-300 uppercase sm:text-sm">
              <Sparkles aria-hidden="true" size={15} />
              {text("eyebrow", businessName)}
            </p>
            <h1 className="store-display mt-6 text-4xl leading-[1.12] font-medium tracking-tight sm:text-6xl lg:text-7xl">
              {text(
                "hero_title",
                language === "bn"
                  ? "উপহার হোক হৃদয়ের ভাষা।"
                  : "A little something, full of meaning.",
              )}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {text(
                "hero_description",
                language === "bn"
                  ? "প্রিয় মানুষ আর বিশেষ মুহূর্তের জন্য যত্ন করে বেছে নেওয়া উপহার খুঁজে নিন।"
                  : "Discover carefully chosen gifts for the people and moments that matter most.",
              )}
            </p>
            {tags.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                className="store-button inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-rose-700 px-6 text-sm font-semibold text-white hover:bg-rose-800"
                href="/shop"
              >
                <Gift aria-hidden="true" size={17} />
                {translate(language, "shopGifts")}
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
                href="/book-a-meeting"
              >
                {translate(language, "bookMeeting")}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
          <div className="relative mx-auto hidden w-full max-w-md lg:block">
            <div className="absolute -inset-5 rotate-3 rounded-[2rem] border border-white/20" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-sm">
              {heroImage ? (
                <Image
                  alt=""
                  aria-hidden="true"
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 0px, 40vw"
                  src={heroImage}
                  unoptimized={!shouldOptimize(heroImage)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/80">
                  <Gift aria-hidden="true" size={38} strokeWidth={1.2} />
                  <span className="text-sm">
                    {translate(language, "imageComingSoon")}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 pt-20 text-white">
                <span className="text-xs font-semibold tracking-[0.16em] uppercase">
                  {translate(language, "meaningfulMoments")}
                </span>
                {featuredProducts[0] ? (
                  <p className="mt-2 text-xl font-semibold">
                    {localizedValue(featuredProducts[0], "name", language)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <a
            className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-medium text-white/70 lg:inline-flex"
            href="#discover"
          >
            <ArrowDown aria-hidden="true" size={14} />
            {translate(language, "browse")}
          </a>
        </PageContainer>
      </section>

      {tags.length ? (
        <div className="store-tag-strip border-b border-[var(--theme-border)] bg-[var(--theme-surface)] py-3">
          <PageContainer className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {tags.map((tag) => (
              <span
                className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[var(--theme-muted-foreground)]"
                key={tag}
              >
                <Sparkles
                  aria-hidden="true"
                  className="text-[var(--theme-primary)]"
                  size={13}
                />
                {tag}
              </span>
            ))}
          </PageContainer>
        </div>
      ) : null}

      {content.show_categories_section ? (
        <section
          className="store-discovery-section border-b border-slate-200 bg-white py-12 sm:py-16"
          id="discover"
        >
          <PageContainer className="py-12 sm:py-16">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="store-display mt-3 max-w-xl text-3xl font-medium tracking-tight text-slate-950 sm:text-4xl">
                  {text(
                    "categories_heading",
                    language === "bn"
                      ? "আপনার পছন্দের উপহার খুঁজুন"
                      : "Start with what brings you here",
                  )}
                </h2>
              </div>
              <Link
                className="store-link inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                href="/shop"
              >
                {translate(language, "viewAllProducts")}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
            {categories.length ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category, index) => {
                  const imageUrl = getCategoryImageUrl(category.image_path ?? null);
                  return (
                    <Link
                      className="store-category group relative flex min-h-56 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-5 sm:min-h-64"
                      href={`/shop/category/${category.slug}`}
                      key={category.id}
                    >
                      {imageUrl ? (
                        <Image
                          alt={
                            localizedValue(category, "image_alt", language) ||
                            localizedValue(category, "name", language)
                          }
                          className="object-cover transition duration-500 group-hover:scale-105"
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          src={imageUrl}
                          unoptimized={
                            !supabaseHost ||
                            !imageUrl.startsWith(
                              `https://${supabaseHost}/storage/v1/object/public/category-images/`,
                            )
                          }
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className={`store-category-art absolute inset-0 store-category-art-${index % 4}`}
                        >
                          <Gift
                            className="absolute right-5 bottom-5 h-16 w-16 opacity-20"
                            strokeWidth={1}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/5 to-transparent" />
                      <div className="relative mt-auto flex w-full items-end justify-between gap-3 text-white">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {localizedValue(category, "name", language)}
                          </h3>
                          {localizedValue(category, "description", language) ? (
                            <p className="mt-1 line-clamp-2 text-sm text-white/80">
                              {localizedValue(category, "description", language)}
                            </p>
                          ) : null}
                        </div>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/60 transition group-hover:bg-white group-hover:text-slate-900">
                          <ArrowUpRight aria-hidden="true" size={16} />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="mt-8 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-600">
                {translate(language, "categoriesComingSoon")}
              </p>
            )}
          </PageContainer>
        </section>
      ) : null}

      {content.show_occasion_section ? (
        <DiscoveryCards
          id="occasions"
          items={occasionLinks}
          language={language}
          title={discoveryTitle("shopByOccasion")}
        />
      ) : null}
      {content.show_recipient_section ? (
        <DiscoveryCards
          id="recipients"
          items={recipientLinks}
          language={language}
          title={discoveryTitle("shopByRecipient")}
        />
      ) : null}

      {content.show_featured_section ? (
        <section className="store-featured bg-slate-50">
          <PageContainer className="py-14 sm:py-20">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold tracking-[0.2em] text-rose-700 uppercase">
                  {translate(language, "featuredCollection")}
                </p>
                <h2 className="store-display mt-3 text-3xl font-medium tracking-tight text-slate-950 sm:text-4xl">
                  {text("featured_heading", translate(language, "featuredGifts"))}
                </h2>
              </div>
              <Link
                className="store-link inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                href="/shop"
              >
                {translate(language, "viewAllProducts")}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
            {featuredProducts.length ? (
              <ProductGrid products={featuredProducts} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                {translate(language, "noProducts")}
              </div>
            )}
          </PageContainer>
        </section>
      ) : null}

      {content.show_campaign_section ? (
        <CampaignSection
          categorySlug={campaignCategory?.slug}
          description={localizedHomeText("campaign_description", campaignDescription)}
          language={language}
          theme={settings.active_theme}
          title={localizedHomeText("campaign_title", campaignTitle)}
        />
      ) : null}

      {content.show_trust_section ? (
        <TrustSection
          copy={localizedHomeText("trust_copy", "")}
          heading={localizedHomeText("trust_heading", "")}
          language={language}
          theme={settings.active_theme}
        />
      ) : null}

      {content.show_meeting_section ? (
        <MeetingCta
          copy={localizedHomeText("meeting_copy", "")}
          heading={localizedHomeText("meeting_heading", "")}
          language={language}
          theme={settings.active_theme}
        />
      ) : null}

      {content.show_story_section ? (
        <StorySection
          copy={localizedHomeText("story_copy", "")}
          language={language}
          title={localizedHomeText("story_title", "")}
        />
      ) : null}

      {content.show_contact_section ? (
        <section className="store-contact bg-white" id="contact">
          <PageContainer className="grid gap-10 py-14 sm:py-20 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-rose-700 uppercase">
                {translate(language, "letsConnect")}
              </p>
              <h2 className="store-display mt-4 max-w-xl text-3xl font-medium tracking-tight text-slate-950 sm:text-4xl">
                {text("contact_heading", translate(language, "planningSpecial"))}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                {translate(language, "reachOut", { business: businessName })}
              </p>
              <Link
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-rose-700 px-6 text-sm font-semibold text-white hover:bg-rose-800"
                href="/book-a-meeting"
              >
                {translate(language, "bookMeeting")}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
            <div className="store-contact-card rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-950">
                {translate(language, "contactDetails")}
              </h3>
              <dl className="mt-5 space-y-4 text-sm">
                {settings.phone ? (
                  <div>
                    <dt className="font-medium text-slate-500">
                      {translate(language, "phone")}
                    </dt>
                    <dd className="mt-1 text-slate-800">{settings.phone}</dd>
                  </div>
                ) : null}
                {settings.email ? (
                  <div>
                    <dt className="font-medium text-slate-500">
                      {translate(language, "email")}
                    </dt>
                    <dd className="mt-1 break-words text-slate-800">
                      {settings.email}
                    </dd>
                  </div>
                ) : null}
                {(
                  language === "bn"
                    ? settings.address_bn || settings.address_en
                    : settings.address_en
                ) ? (
                  <div>
                    <dt className="font-medium text-slate-500">
                      {translate(language, "address")}
                    </dt>
                    <dd className="mt-1 text-slate-800">
                      {language === "bn"
                        ? settings.address_bn || settings.address_en
                        : settings.address_en}
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-6">
                <ContactActions
                  email={settings.email}
                  phone={settings.phone}
                  whatsapp={settings.whatsapp}
                />
              </div>
            </div>
          </PageContainer>
        </section>
      ) : null}
    </main>
  );
}
