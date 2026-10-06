import type { Metadata } from "next";
import { PageContainer } from "@/components/public/page-container";
import { ThemeForm } from "@/components/admin/theme-form";
import { requireAdmin } from "@/lib/auth/server";
import { getAdminTheme } from "@/lib/admin-themes";
export const metadata: Metadata = { title: "Edit theme | Admin | Shudha Studio" };
export const dynamic = "force-dynamic";
export default async function EditThemePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const theme = await getAdminTheme((await params).id);
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <a className="text-sm font-semibold text-rose-700" href="/admin/themes">
            ← Themes
          </a>
          <h1 className="mt-4 text-3xl font-semibold">Edit theme</h1>
          <div className="mt-8">
            <ThemeForm id={theme.id} initial={theme} />
          </div>
        </div>
      </PageContainer>
    </main>
  );
}
