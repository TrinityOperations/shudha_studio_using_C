import { Footer } from "@/components/public/footer";
import type { CSSProperties } from "react";
import { Header } from "@/components/public/header";
import { LanguageProvider } from "@/components/language-provider";
import { getSiteSettings } from "@/lib/site-settings";
import { getThemeImageUrl } from "@/lib/theme-images";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <LanguageProvider defaultLanguage={settings.default_language}>
      <div
        className="public-theme flex min-h-screen flex-col"
        data-theme={settings.active_theme}
        style={
          {
            "--theme-background-image": settings.theme.background_path
              ? `url(${getThemeImageUrl(settings.theme.background_path)})`
              : "none",
            "--theme-primary": settings.theme.colors.primary,
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
        <a
          className="sr-only z-50 rounded-md bg-white px-4 py-3 text-slate-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
          href="#main-content"
        >
          Skip to content
        </a>
        <Header
          businessName={settings.business_name_en}
          businessNameBn={settings.business_name_bn}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
          logoPath={settings.theme.logo_path}
          logoAlt={settings.theme.logo_alt_en}
        />
        <div className="flex-1">{children}</div>
        <Footer
          address={settings.address_en}
          addressBn={settings.address_bn}
          businessName={settings.business_name_en}
          email={settings.email}
          phone={settings.phone}
          whatsapp={settings.whatsapp}
        />
      </div>
    </LanguageProvider>
  );
}
