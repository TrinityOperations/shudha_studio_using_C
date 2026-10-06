import type { Metadata } from "next";

import { ContactActions } from "@/components/public/contact-actions";
import { PageContainer } from "@/components/public/page-container";
import { ProductGrid } from "@/components/public/product-grid";
import { getActiveCategories, getFeaturedProducts } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { localizedValue, translate } from "@/lib/i18n/translations";
import { getThemeImageUrl } from "@/lib/theme-images";

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
  const content = settings.theme.content as Record<string, unknown>;
  const text = (key: string, fallback: string) =>
    typeof content[`${key}_${language}`] === "string" && content[`${key}_${language}`]
      ? String(content[`${key}_${language}`])
      : fallback;
  const rawTags = content[`tags_${language}`];
  const tags: string[] = Array.isArray(rawTags)
    ? rawTags.filter((tag: unknown): tag is string => typeof tag === "string")
    : [];

  return (
    <main id="main-content">
      <section
        className="relative overflow-hidden bg-slate-950 text-white"
        style={{
          backgroundImage: settings.theme.hero_path
            ? `linear-gradient(rgb(2 6 23 / 65%), rgb(2 6 23 / 65%)), url(${getThemeImageUrl(settings.theme.hero_path)})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(244,63,94,0.35),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.16),_transparent_35%)]" />
        <PageContainer className="relative py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-[0.24em] text-rose-300 uppercase">
              {text("eyebrow", settings.business_name_en)}
            </p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              {text(
                "hero_title",
                language === "bn"
                  ? "উপহার যা সাধারণ মুহূর্তকে অসাধারণ করে তোলে।"
                  : "Gifts that make ordinary moments feel extraordinary.",
              )}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              {text(
                "hero_description",
                language === "bn"
                  ? "প্রতিটি গুরুত্বপূর্ণ উপলক্ষের জন্য যত্নসহকারে বাছাই করা উপহার, আন্তরিক সেবা ও সুন্দর বিবরণ।"
                  : "Thoughtfully selected gifts, warm personal service, and beautiful details for every meaningful occasion.",
              )}
            </p>
            {tags.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-rose-600 px-6 font-semibold text-white transition hover:bg-rose-500 focus:ring-2 focus:ring-rose-300 focus:outline-none"
                href="#contact"
              >
                {translate(language, "contactUs")}
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 font-semibold text-white transition hover:bg-white/10 focus:ring-2 focus:ring-rose-300 focus:outline-none"
                href="/book-a-meeting"
              >
                {translate(language, "bookMeeting")}
              </a>
              <ContactActions phone={settings.phone} whatsapp={settings.whatsapp} />
            </div>
            <a
              className="mt-8 inline-flex text-sm font-semibold text-rose-300 underline-offset-4 hover:underline"
              href="/products"
            >
              {translate(language, "exploreCollection")}
            </a>
          </div>
        </PageContainer>
      </section>

      <section className="bg-slate-50">
        <PageContainer className="py-16 sm:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
                {text("featured_heading", translate(language, "featuredGifts"))}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {text("featured_heading", translate(language, "meaningfulMoments"))}
              </h2>
            </div>
            <a
              className="text-sm font-semibold text-rose-700 hover:underline"
              href="/products"
            >
              {translate(language, "viewAllProducts")} →
            </a>
          </div>
          <div className="mt-8">
            {featuredProducts.length ? (
              <ProductGrid products={featuredProducts} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
                {language === "bn"
                  ? "নির্বাচিত উপহার শীঘ্রই এখানে দেখা যাবে।"
                  : "Featured gifts will appear here soon."}
              </div>
            )}
          </div>
        </PageContainer>
      </section>

      <section className="bg-white">
        <PageContainer className="py-16 sm:py-24">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
              {text("categories_heading", translate(language, "browseByOccasion"))}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {text("categories_heading", translate(language, "thoughtfulChoice"))}
            </h2>
          </div>
          {categories.length ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <a
                  className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-rose-200 hover:shadow-sm"
                  href={`/category/${category.slug}`}
                  key={category.id}
                >
                  <h3 className="font-semibold text-slate-950">
                    {localizedValue(category, "name", language)}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {localizedValue(category, "description", language) ||
                      (language === "bn"
                        ? "Shudha Studio-এর এই সংগ্রহটি দেখুন।"
                        : "Explore this collection from Shudha Studio.")}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
              {translate(language, "categoriesComingSoon")}
            </div>
          )}
        </PageContainer>
      </section>

      <section className="bg-white" id="contact">
        <PageContainer className="py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
                {text("contact_heading", translate(language, "letsConnect"))}
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                {text("contact_heading", translate(language, "planningSpecial"))}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
                {translate(language, "reachOut", { business: businessName })}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
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
          </div>
        </PageContainer>
      </section>
    </main>
  );
}
