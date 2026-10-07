import type { Metadata } from "next";
import { PageContainer } from "@/components/public/page-container";
import { ThemeForm } from "@/components/admin/theme-form";
import { requireAdmin } from "@/lib/auth/server";
import { getAdminCategories } from "@/lib/admin-catalog";
export const metadata: Metadata = { title: "New theme | Admin | Shudha Studio" };
export default async function NewThemePage() {
  await requireAdmin();
  const categories = await getAdminCategories();
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <a className="text-sm font-semibold text-rose-700" href="/admin/themes">
            ← Themes
          </a>
          <h1 className="mt-4 text-3xl font-semibold">Create theme</h1>
          <div className="mt-8">
            <ThemeForm categories={categories} />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
