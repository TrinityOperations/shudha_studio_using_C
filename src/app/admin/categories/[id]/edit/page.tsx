import type { Metadata } from "next";

import { CategoryForm } from "@/components/admin/catalog-form";
import { ImageManager } from "@/components/admin/image-manager";
import { PageContainer } from "@/components/public/page-container";
import { getAdminCategory } from "@/lib/admin-catalog";
import { requireAdmin } from "@/lib/auth/server";
import { getPreferredLanguage } from "@/lib/i18n/server-language";
import { translate } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit category | Admin | Shudha Studio" };

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const category = await getAdminCategory((await params).id);
  const language = await getPreferredLanguage();
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <a
            className="text-sm font-semibold text-rose-700 hover:underline"
            href="/admin/categories"
          >
            ← {translate(language, "categories")}
          </a>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">
            {translate(language, "editCategory")}
          </h1>
          <div className="mt-8">
            <CategoryForm id={category.id} initial={category} />
            <ImageManager
              id={category.id}
              initialMainPath={category.image_path}
              kind="category"
            />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
