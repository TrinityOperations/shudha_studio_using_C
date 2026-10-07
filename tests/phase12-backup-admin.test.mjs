import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("self-contained ZIP backups include data, images, and safe import limits", async () => {
  const formats = await source("src/lib/backup-formats.ts");
  const request = await source("src/lib/backup-request.ts");
  const storage = await source("src/lib/backup-storage.ts");
  const catalogExport = await source("src/app/api/admin/catalog/export/route.ts");
  const themeExport = await source("src/app/api/admin/themes/[id]/export/route.ts");

  assert.match(formats, /zipSync/);
  assert.match(formats, /unzipSync/);
  assert.match(formats, /manifest\.json/);
  assert.match(formats, /data\.json/);
  assert.match(formats, /maxBackupBytes/);
  assert.match(formats, /unsafe file path/);
  assert.match(request, /legacyCatalogBackupSchema/);
  assert.match(request, /legacyThemeBackupSchema/);
  assert.match(storage, /\.download\(reference\.path\)/);
  assert.match(storage, /reference\.buckets/);
  assert.match(storage, /\.upload\(file\.path/);
  assert.match(storage, /error\.message/);
  assert.match(formats, /maxBackupFileBytes = 5 \* 1024 \* 1024/);
  assert.match(catalogExport, /application\/zip/);
  assert.match(themeExport, /application\/zip/);
  assert.match(themeExport, /product-images/);
});

test("admin navigation exposes all management sections and storefront access", async () => {
  const navigation = await source("src/components/admin/admin-navigation.tsx");
  const layout = await source("src/app/admin/layout.tsx");
  const dashboard = await source("src/app/admin/page.tsx");

  for (const path of [
    "/admin",
    "/admin/products",
    "/admin/categories",
    "/admin/themes",
    "/admin/meetings",
  ]) {
    assert.match(navigation, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(navigation, /View storefront/);
  assert.match(navigation, /usePathname/);
  assert.match(layout, /AdminNavigation/);
  assert.match(dashboard, /View meeting requests/);
  assert.match(dashboard, /Manage themes/);
});
