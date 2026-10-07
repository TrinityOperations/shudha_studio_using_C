import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/server";
import { createBackupZip } from "@/lib/backup-formats";
import { downloadBackupImages } from "@/lib/backup-storage";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { selectAllRows } from "@/lib/supabase-pagination";

export async function GET() {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  let categories: Record<string, unknown>[];
  let products: Record<string, unknown>[];
  try {
    [categories, products] = await Promise.all([
      selectAllRows<Record<string, unknown>>(supabase, "categories", "*", "sort_order"),
      selectAllRows<Record<string, unknown>>(supabase, "products", "*", "sort_order"),
    ]);
  } catch {
    return NextResponse.json({ error: "Unable to export catalog." }, { status: 400 });
  }
  const categoryMap = new Map(
    categories.map((category) => [category.id, category.slug]),
  );
  const catalogProducts = (products ?? []).map(({ category_id, ...product }) => ({
    ...product,
    category_slug: categoryMap.get(category_id) ?? "",
  }));
  const imageReferences = [
    ...(categories ?? []).map((category) =>
      category.image_path
        ? { bucket: "category-images" as const, path: category.image_path }
        : null,
    ),
    ...(products ?? []).flatMap((product) => [
      product.main_image_path
        ? { bucket: "product-images" as const, path: product.main_image_path }
        : null,
      ...(Array.isArray(product.gallery_images)
        ? product.gallery_images.map((image: { path?: string }) =>
            image.path ? { bucket: "product-images" as const, path: image.path } : null,
          )
        : []),
    ]),
  ].filter(
    (image): image is { bucket: "category-images" | "product-images"; path: string } =>
      Boolean(image),
  );
  const payload = {
    format: "shudha-catalog-backup",
    exported_at: new Date().toISOString(),
    categories,
    products: catalogProducts,
  };
  let archive: Uint8Array;
  try {
    archive = createBackupZip(
      "shudha-catalog-backup",
      payload,
      await downloadBackupImages(supabase, imageReferences),
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to export catalog images.",
      },
      { status: 400 },
    );
  }
  return new NextResponse(archive as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=shudha-catalog-backup.zip",
    },
  });
}
