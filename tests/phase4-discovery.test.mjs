import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("Phase 4 provides shareable discovery routes and redirects", async () => {
  for (const path of [
    "src/app/(public)/shop/page.tsx",
    "src/app/(public)/search/page.tsx",
    "src/app/(public)/shop/category/[slug]/page.tsx",
    "src/app/(public)/shop/occasion/[slug]/page.tsx",
    "src/app/(public)/shop/recipient/[slug]/page.tsx",
    "src/app/(public)/shop/price/[range]/page.tsx",
  ])
    assert.ok((await source(path)).length > 0, `${path} exists`);
  assert.match(await source("src/app/(public)/products/page.tsx"), /redirect\(`\/shop/);
  assert.match(
    await source("src/app/(public)/category/[slug]/page.tsx"),
    /redirect\(`\/shop\/category/,
  );
});

test("catalog filters and editorial mappings are backed by actual fields", async () => {
  const catalog = await source("src/lib/catalog.ts");
  const theme = await source("src/lib/custom-themes.ts");
  const occasion = await source("src/app/(public)/shop/occasion/[slug]/page.tsx");
  assert.match(catalog, /is_featured/);
  assert.match(catalog, /currency_code/);
  assert.match(catalog, /description_en\.ilike/);
  assert.match(theme, /price_ranges/);
  assert.match(theme, /currency_code: z\.string\(\)\.regex/);
  assert.match(occasion, /resolveDiscoveryLink/);
  assert.match(occasion, /notFound\(\)/);
});

test("URL parameters are preserved and cards only swap when a gallery image exists", async () => {
  const pagination = await source("src/components/public/pagination.tsx");
  const card = await source("src/components/public/product-card.tsx");
  const controls = await source("src/components/public/catalog-controls.tsx");
  assert.match(pagination, /extraParams/);
  assert.match(controls, /showCategory/);
  assert.match(card, /gallery_images\.find/);
  assert.match(card, /focus-within:opacity-100/);
  assert.doesNotMatch(card, /favorite|wishlist/i);
});
