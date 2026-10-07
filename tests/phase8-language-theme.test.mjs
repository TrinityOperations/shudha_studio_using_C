import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

function channel(value) {
  const normalized = value / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const value = hex.slice(1);
  return (
    0.2126 * channel(Number.parseInt(value.slice(0, 2), 16)) +
    0.7152 * channel(Number.parseInt(value.slice(2, 4), 16)) +
    0.0722 * channel(Number.parseInt(value.slice(4, 6), 16))
  );
}

function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test("public language resolution and persistence are shared across server and client", async () => {
  const provider = await source("src/components/language-provider.tsx");
  const language = await source("src/lib/i18n/server-language.ts");
  const layout = await source("src/app/(public)/layout.tsx");
  const shop = await source("src/app/(public)/shop/page.tsx");
  const search = await source("src/app/(public)/search/page.tsx");

  assert.match(provider, /localStorage\.getItem\(LANGUAGE_COOKIE\)/);
  assert.match(provider, /document\.cookie = `\$\{LANGUAGE_COOKIE\}/);
  assert.match(provider, /document\.documentElement\.lang/);
  assert.match(language, /cookies\(\)/);
  assert.match(language, /defaultLanguage/);
  assert.match(layout, /getPreferredLanguage\(settings\.default_language\)/);
  assert.match(layout, /lang=\{language\}/);
  assert.match(shop, /getPreferredLanguage\(settings\.default_language\)/);
  assert.match(search, /getPreferredLanguage\(settings\.default_language\)/);
});

test("storefront routes use bilingual UI translations and stored content fallbacks", async () => {
  const listing = await source("src/components/public/catalog-listing.tsx");
  const controls = await source("src/components/public/catalog-controls.tsx");
  const search = await source("src/app/(public)/search/page.tsx");
  const category = await source("src/app/(public)/shop/category/[slug]/page.tsx");
  const product = await source("src/app/(public)/product/[slug]/page.tsx");
  const contact = await source("src/app/(public)/contact/page.tsx");
  const booking = await source("src/app/(public)/book-a-meeting/page.tsx");
  const localized = await source("src/lib/i18n/translations.ts");

  for (const key of [
    "searchTitle",
    "shopDescription",
    "changeFilters",
    "relatedCategories",
  ]) {
    assert.match(localized, new RegExp(`${key}:`));
  }
  assert.match(listing, /translate\(language, "relatedCategories"\)/);
  assert.match(controls, /t\("recommended"\)/);
  assert.match(search, /translate\(language, "searchTitle"\)/);
  assert.match(category, /localizedValue\(category, "name", language\)/);
  assert.match(product, /localizedValue\(product, "description", language\)/);
  assert.match(contact, /getPreferredLanguage\(settings\.default_language\)/);
  assert.match(booking, /getPreferredLanguage\(settings\.default_language\)/);
  assert.match(localized, /value\[`\$\{field\}_\$\{language\}`\]/);
});

test("all premade primary button palettes meet normal-text contrast with white text", async () => {
  const theme = await source("src/lib/theme.ts");
  const css = await source("src/app/globals.css");
  const colors = ["#be123c", "#9f1239", "#9a3412"];
  for (const color of colors) assert.ok(contrast("#ffffff", color) >= 4.5);
  assert.match(theme, /everyday/);
  assert.match(theme, /wedding/);
  assert.match(theme, /festival/);
  assert.match(css, /readablePrimaryColor|--theme-primary/);
});

test("theme switching and visual polish remain token-driven and responsive", async () => {
  const layout = await source("src/app/(public)/layout.tsx");
  const css = await source("src/app/globals.css");
  const card = await source("src/components/public/product-card.tsx");
  const gallery = await source("src/components/public/product-gallery.tsx");

  assert.match(layout, /data-theme=\{settings\.active_theme\}/);
  assert.match(layout, /readablePrimaryColor/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(css, /store-card > a/);
  assert.match(card, /showSecondary/);
  assert.match(card, /onError=\{\(\) => setImageFailed/);
  assert.match(gallery, /ImageOff/);
  assert.match(css, /:lang\(bn\)/);
});
