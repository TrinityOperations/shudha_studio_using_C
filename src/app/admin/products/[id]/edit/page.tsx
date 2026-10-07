import type { Metadata } from "next";

import { ProductForm } from "@/components/admin/catalog-form";
import { ImageManager } from "@/components/admin/image-manager";
import { PageContainer } from "@/components/public/page-container";
import { getAdminCategories, getAdminProduct } from "@/lib/admin-catalog";
import { requireAdmin } from "@/lib/auth/server";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit product | Admin | Shudha Studio" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);
  const language = await getPreferredLanguage();
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <a
            className="text-sm font-semibold text-rose-700 hover:underline"
            href="/admin/products"
          >
            ← {translate(language, "products")}
          </a>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            {translate(language, "editProduct")}
          </h1>
          <div className="mt-8">
            <ProductForm
              id={id}
              initial={product}
              categories={categories.map((category) => ({
                id: category.id,
                name_en: category.name_en,
              }))}
              imageManager={
                <ImageManager
                  id={id}
                  initialGallery={
                    Array.isArray(product.gallery_images) ? product.gallery_images : []
                  }
                  initialMainPath={product.main_image_path}
                  kind="product"
                />
              }
            />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
