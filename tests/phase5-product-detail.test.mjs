import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("product detail preserves public lookup, localized content, and existing inquiry routes", async () => {
  const page = await source("src/app/(public)/product/[slug]/page.tsx");
  assert.match(page, /getPublicProductBySlug/);
  assert.match(page, /localizedValue\(product, "name", language\)/);
  assert.match(page, /ContactActions/);
  assert.match(page, /href=\{`\/book-a-meeting\?product=/);
  assert.match(page, /availableNow/);
  assert.match(page, /priceOnRequest/);
});

test("gallery handles absent and multiple images accessibly with larger preview", async () => {
  const gallery = await source("src/components/public/product-gallery.tsx");
  assert.match(gallery, /product\.gallery_images/);
  assert.match(gallery, /images\.length > 1/);
  assert.match(gallery, /showModal\(\)/);
  assert.match(gallery, /Escape/);
  assert.match(gallery, /imageComingSoon/);
  assert.match(gallery, /onError/);
  assert.match(gallery, /aspect-square/);
});

test("related products use same-category public visibility and exclude the current product", async () => {
  const catalog = await source("src/lib/catalog.ts");
  const page = await source("src/app/(public)/product/[slug]/page.tsx");
  assert.match(catalog, /getPublicProductsInCategory/);
  assert.match(catalog, /\.neq\("id", excludeProductId\)/);
  assert.match(catalog, /\.eq\("is_available", true\)/);
  assert.match(page, /sameCategory/);
});

test("metadata and structured data do not invent review or checkout claims", async () => {
  const page = await source("src/app/(public)/product/[slug]/page.tsx");
  const context = await source("custom_context.md");
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /product\.price != null/);
  assert.doesNotMatch(page, /aggregateRating|reviewCount|checkout|add to cart/i);
  assert.match(context, /Recently viewed history is intentionally omitted/);
});
