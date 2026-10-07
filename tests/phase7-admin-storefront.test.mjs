import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("admin category mutations preserve storefront relationships and safe deletion", async () => {
  const create = await source("src/app/api/admin/categories/route.ts");
  const updateDelete = await source("src/app/api/admin/categories/[id]/route.ts");
  const catalog = await source("src/lib/catalog.ts");
  const header = await source("src/components/public/header.tsx");
  const category = await source("src/app/(public)/shop/category/[slug]/page.tsx");
  const adminForm = await source("src/components/admin/catalog-form.tsx");

  assert.match(create, /categoryAdminSchema/);
  assert.match(
    updateDelete,
    /Move or delete its products before deleting this category/,
  );
  assert.match(updateDelete, /Category not found/);
  assert.match(updateDelete, /revalidatePath\("\/", "layout"\)/);
  assert.match(catalog, /getActiveCategories/);
  assert.match(header, /href=\{`\/shop\/category\/\$\{item\.slug\}`\}/);
  assert.match(category, /getActiveCategoryBySlug/);
  assert.match(adminForm, /categoryFields/);
});

test("admin product mutations preserve category, visibility, featured, translation, and image workflows", async () => {
  const create = await source("src/app/api/admin/products/route.ts");
  const updateDelete = await source("src/app/api/admin/products/[id]/route.ts");
  const validation = await source("src/lib/validations/catalog-admin.ts");
  const catalog = await source("src/lib/catalog.ts");
  const card = await source("src/components/public/product-card.tsx");
  const image = await source("src/components/admin/image-manager.tsx");
  const adminForm = await source("src/components/admin/catalog-form.tsx");
  const header = await source("src/components/public/header.tsx");
  const imageApi = await source("src/app/api/admin/images/[kind]/[id]/route.ts");

  assert.match(validation, /category_id: z\.string\(\)\.uuid/);
  assert.match(create, /gallery_images: \[\]/);
  assert.match(updateDelete, /Product not found/);
  assert.match(updateDelete, /revalidatePath\("\/", "layout"\)/);
  assert.match(validation, /name_en/);
  assert.match(validation, /name_bn/);
  assert.match(validation, /is_featured/);
  assert.match(catalog, /\.eq\("is_active", true\)/);
  assert.match(catalog, /\.eq\("is_available", true\)/);
  assert.match(catalog, /\.eq\("is_featured", true\)/);
  assert.match(card, /localizedValue\(product, "name", language\)/);
  assert.match(image, /uploadImage|upload/);
  assert.match(imageApi, /gallery_images/);
  assert.match(create, /parsed\.error\.issues\[0\]/);
  assert.match(updateDelete, /parsed\.error\.issues\[0\]/);
  assert.match(updateDelete, /productAdminUpdateSchema\.safeParse/);
  assert.match(validation, /toUpperCase\(\)/);
  assert.match(validation, /value === "" \|\| value == null/);
  assert.match(adminForm, /lowercase letters, numbers, and hyphens only/);
  assert.match(adminForm, /imageManager/);
  assert.match(header, /lucide-react/);
  assert.doesNotMatch(header, /store-search|desktop-store-search|mobile-store-search/);
});

test("discovery mappings, search, and meeting records remain connected to existing models", async () => {
  const themes = await source("src/lib/admin-themes.ts");
  const themeForm = await source("src/components/admin/theme-form.tsx");
  const occasion = await source("src/app/(public)/shop/occasion/[slug]/page.tsx");
  const recipient = await source("src/app/(public)/shop/recipient/[slug]/page.tsx");
  const search = await source("src/app/(public)/search/page.tsx");
  const meetings = await source("src/app/api/meeting-requests/route.ts");

  assert.match(themes, /migrateLegacyDiscoveryContent/);
  assert.match(themeForm, /occasion_links/);
  assert.match(themeForm, /recipient_links/);
  assert.match(themeForm, /collection_category_ids/);
  assert.match(occasion, /resolveDiscoveryLink/);
  assert.match(occasion, /localizedValue\(category, "description", language\)/);
  assert.match(recipient, /resolveDiscoveryLink/);
  assert.match(recipient, /localizedValue\(category, "description", language\)/);
  assert.match(search, /includeCategoryNames: true/);
  assert.match(meetings, /from\("meeting_requests"\)/);
});
