import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("booking fields expose accessible validation state and mobile keyboard hints", async () => {
  const form = await source("src/components/public/meeting-request-form.tsx");

  for (const field of [
    "meetingType",
    "name",
    "phone",
    "email",
    "preferredDate",
    "preferredTime",
    "message",
  ]) {
    assert.match(form, new RegExp(`aria-invalid=\\{Boolean\\(errors\\.${field}\\)\\}`));
    assert.match(form, new RegExp(`aria-describedby=\\{errors\\.${field} \\?`));
  }

  assert.match(form, /id=\{`\$\{name\}-error`\}/);

  assert.match(form, /inputMode="tel"/);
  assert.match(form, /autoComplete="tel"/);
  assert.match(form, /role="alert"/);
});

test("catalog navigation and sorting labels remain localized", async () => {
  const listing = await source("src/components/public/catalog-listing.tsx");
  const controls = await source("src/components/public/catalog-controls.tsx");
  const translations = await source("src/lib/i18n/translations.ts");

  assert.match(listing, /aria-label=\{breadcrumbLabel\}/);
  assert.match(listing, /translate\(language, "shop"\)/);
  assert.match(controls, /t\("sortProducts"\)/);
  assert.match(translations, /sortProducts: "Sort products"/);
  assert.match(translations, /sortProducts: "পণ্য সাজান"/);
});

test("metadata has an environment-backed base and public language is server-aligned", async () => {
  const rootLayout = await source("src/app/layout.tsx");
  const publicLayout = await source("src/app/(public)/layout.tsx");
  const category = await source("src/app/(public)/shop/category/[slug]/page.tsx");

  assert.match(rootLayout, /metadataBase: process\.env\.NEXT_PUBLIC_SITE_URL/);
  assert.match(publicLayout, /LanguageProvider defaultLanguage=\{language\}/);
  assert.ok(
    category.includes('unoptimized={!image.includes("/storage/v1/object/public/")}'),
  );
});

test("existing quality safeguards remain present", async () => {
  const css = await source("src/app/globals.css");
  const header = await source("src/components/public/header.tsx");
  const gallery = await source("src/components/public/product-gallery.tsx");

  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /overflow-wrap: anywhere/);
  assert.match(header, /aria-modal="true"/);
  assert.match(header, /Escape/);
  assert.match(gallery, /showModal\(\)/);
});
