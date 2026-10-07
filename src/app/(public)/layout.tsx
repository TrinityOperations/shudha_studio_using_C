import { Footer } from "@/components/public/footer";
import { AnnouncementBar } from "@/components/public/announcement-bar";
import {
  OfflineNotice,
  StorefrontSkipLink,
} from "@/components/public/storefront-states";
import type { CSSProperties } from "react";
import { Header } from "@/components/public/header";
import { LanguageProvider } from "@/components/language-provider";
import { getSiteSettings } from "@/lib/site-settings";
import { getThemeImageUrl } from "@/lib/theme-images";
import { getActiveCategories } from "@/lib/catalog";
import { buildStorefrontGroups } from "@/lib/storefront-navigation";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { readablePrimaryColor } from "@/lib/theme-contrast";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();
  const language = await getPreferredLanguage(settings.default_language);
  const primary = readablePrimaryColor(
    settings.theme.colors.primary,
    settings.theme.colors.primaryHover,
  );
  const categoryResult = await getActiveCategories()
    .then((categories) => ({ categories, failed: false }))
    .catch(() => ({ categories: [], failed: true }));
  const groups = buildStorefrontGroups(
    categoryResult.categories,
    settings.theme.content,
  );

  return (
    <LanguageProvider defaultLanguage={language}>
      <div
        className="public-theme flex min-h-screen flex-col"
        data-theme={settings.active_theme}
        lang={language}
        style={
          {
            "--theme-background-image": settings.theme.background_path
              ? `url(${getThemeImageUrl(settings.theme.background_path)})`
              : "none",
            "--theme-primary": primary,
            "--theme-primary-hover": settings.theme.colors.primaryHover,
            "--theme-primary-soft": settings.theme.colors.primarySoft,
            "--theme-background": settings.theme.colors.background,
            "--theme-surface": settings.theme.colors.surface,
            "--theme-muted-surface": settings.theme.colors.mutedSurface,
            "--theme-foreground": settings.theme.colors.foreground,
            "--theme-muted-foreground": settings.theme.colors.mutedForeground,
            "--theme-border": settings.theme.colors.border,
            "--theme-hero": settings.theme.colors.hero,
            "--theme-hero-accent": settings.theme.colors.heroAccent,
            "--theme-hero-highlight": settings.theme.colors.heroHighlight,
          } as CSSProperties
        }
      >
        <StorefrontSkipLink />
        <AnnouncementBar
          bangla={settings.theme.content.announcement_bn}
          english={settings.theme.content.announcement_en}
          key={`${settings.theme.id}:${settings.theme.content.announcement_en}:${settings.theme.content.announcement_bn}`}
          themeId={settings.theme.id}
        />
        <OfflineNotice />
        <Header
          businessName={settings.business_name_en}
          businessNameBn={settings.business_name_bn}
          categoryError={categoryResult.failed}
          groups={groups}
          logoPath={settings.theme.logo_path}
          logoAlt={settings.theme.logo_alt_en}
          logoAltBn={settings.theme.logo_alt_bn}
        />
        <div className="flex-1">{children}</div>
        <Footer
          address={settings.address_en}
          addressBn={settings.address_bn}
          businessName={settings.business_name_en}
          businessNameBn={settings.business_name_bn}
          groups={groups}
          email={settings.email}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
        />
      </div>
    </LanguageProvider>
  );
}
