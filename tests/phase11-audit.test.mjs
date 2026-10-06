import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("theme settings are restricted, persisted, and rendered globally", async () => {
  const theme = await source("src/lib/theme.ts");
  const settingsApi = await source("src/app/api/admin/settings/route.ts");
  const publicLayout = await source("src/app/(public)/layout.tsx");
  const css = await source("src/app/globals.css");
  const settingsPage = await source("src/app/admin/settings/page.tsx");

  assert.match(theme, /everyday/);
  assert.match(theme, /wedding/);
  assert.match(theme, /festival/);
  assert.match(settingsApi, /requireAdmin/);
  assert.match(settingsApi, /active_theme/);
  assert.match(publicLayout, /data-theme=\{settings\.active_theme\}/);
  assert.match(css, /data-theme="wedding"/);
  assert.match(css, /data-theme="festival"/);
  assert.match(settingsPage, /redirect\("\/admin\/themes"\)/);
});

test("admin mutations require authorization and database policies protect data", async () => {
  const routes = await Promise.all([
    source("src/app/api/admin/categories/route.ts"),
    source("src/app/api/admin/products/route.ts"),
    source("src/app/api/admin/settings/route.ts"),
    source("src/app/api/admin/images/[kind]/[id]/route.ts"),
  ]);
  const migration = await source(
    "supabase/migrations/20261006000100_initial_schema.sql",
  );
  const storage = await source("supabase/migrations/20261006000200_image_storage.sql");
  const publicReadFix = await source(
    "supabase/migrations/20261006000300_fix_public_read_policies.sql",
  );
  const galleryGrant = await source(
    "supabase/migrations/20261006000400_grant_gallery_validator.sql",
  );
  const customThemes = await source(
    "supabase/migrations/20261006000500_custom_themes.sql",
  );
  const themeRoute = await source("src/app/api/admin/themes/route.ts");
  const themeItemRoute = await source("src/app/api/admin/themes/[id]/route.ts");
  const productsRoute = await source("src/app/api/admin/products/route.ts");
  const productUpdateRoute = await source("src/app/api/admin/products/[id]/route.ts");

  for (const route of routes) assert.match(route, /requireAdmin/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /site_settings_admin_update/);
  assert.match(migration, /categories_admin_insert/);
  assert.match(migration, /products_admin_delete/);
  assert.match(storage, /private\.is_admin\(auth\.uid\(\)\)/);
  assert.match(publicReadFix, /categories_admin_select/);
  assert.match(publicReadFix, /products_admin_select/);
  assert.match(publicReadFix, /using \(id = true\);/);
  assert.doesNotMatch(
    publicReadFix,
    /to anon, authenticated[\\s\\S]*private\\.is_admin/,
  );
  assert.match(
    galleryGrant,
    /grant execute[\s\S]*on function private\.is_valid_gallery_images\(jsonb\)[\s\S]*to authenticated/,
  );
  assert.match(customThemes, /create table if not exists public\.site_themes/);
  assert.match(customThemes, /active_theme_id uuid references public\.site_themes/);
  assert.match(customThemes, /theme-images/);
  assert.match(customThemes, /site_themes_public_active_read/);
  assert.match(customThemes, /site_themes_admin_insert/);
  assert.match(customThemes, /theme_images_admin_insert/);
  assert.match(themeRoute, /requireAdmin/);
  assert.match(themeRoute, /active_theme_id/);
  assert.match(themeItemRoute, /requireAdmin/);
  assert.match(themeItemRoute, /Activate another theme before deleting/);
  assert.match(productsRoute, /console\.error\("\[admin\/products\] create failed"/);
  assert.match(
    productUpdateRoute,
    /console\.error\("\[admin\/products\] update failed"/,
  );
  assert.doesNotMatch(productsRoute, /console\.error[\\s\\S]*parsed\.data/);
});

test("public workflows include validation, loading/error boundaries, and accessible navigation", async () => {
  const meetingValidation = await source("src/lib/validations/meetings.ts");
  const meetingApi = await source("src/app/api/meeting-requests/route.ts");
  const header = await source("src/components/public/header.tsx");
  const catalogControls = await source("src/components/public/catalog-controls.tsx");
  const productCard = await source("src/components/public/product-card.tsx");
  const pagination = await source("src/components/public/pagination.tsx");
  const loading = await source("src/app/(public)/loading.tsx");
  const error = await source("src/app/(public)/error.tsx");

  assert.match(meetingValidation, /isFutureMeetingDate/);
  assert.match(meetingApi, /submission_key/);
  assert.match(header, /aria-expanded/);
  assert.match(header, /Escape/);
  assert.match(header, /LanguageSwitcher/);
  for (const component of [catalogControls, productCard, pagination]) {
    assert.match(component, /^"use client";/);
    assert.match(component, /useLanguage\(/);
  }
  assert.match(loading, /aria-live/);
  assert.match(error, /role="button"|<button/);
});

test("privileged Supabase credentials are kept out of public client utilities", async () => {
  const browser = await source("src/lib/supabase/browser.ts");
  const admin = await source("src/lib/supabase/admin.ts");
  const env = await source("src/lib/env.ts");
  const login = await source("src/app/admin/login/login-form.tsx");

  assert.doesNotMatch(browser, /SUPABASE_SECRET_KEY/);
  assert.match(admin, /SUPABASE_SECRET_KEY/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
  assert.match(env, /SUPABASE_SECRET_KEY/);
  assert.match(env, /getPublicEnvInput/);
  assert.match(env, /process\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(login, /try \{/);
  assert.match(login, /catch \{/);
});
