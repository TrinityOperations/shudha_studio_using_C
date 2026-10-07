import type { Metadata } from "next";
import { PageContainer } from "@/components/public/page-container";
import { DeleteButton } from "@/components/admin/delete-button";
import { ImportBackupButton } from "@/components/admin/backup-controls";
import { ThemeActivateButton } from "@/components/admin/theme-activate-button";
import { requireAdmin } from "@/lib/auth/server";
import { getAdminThemes } from "@/lib/admin-themes";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Themes | Admin | Shudha Studio" };

export default async function ThemesPage() {
  await requireAdmin();
  const [themes, settings] = await Promise.all([getAdminThemes(), getSiteSettings()]);
  return (
    <main className="min-h-screen bg-slate-100 py-10">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
              Appearance
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Themes</h1>
            <p className="mt-2 text-slate-600">
              Create reusable colors, writing, logos, and images for the public website.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ImportBackupButton
              endpoint="/api/admin/themes/import"
              label="Import theme"
            />
            <a
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold"
              href="/admin"
            >
              Admin
            </a>
            <a
              className="rounded-xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white"
              href="/admin/themes/new"
            >
              Create theme
            </a>
          </div>
        </div>
        <section className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              key={theme.id}
            >
              <div
                className="h-20 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.hero})`,
                }}
              />
              <h2 className="mt-4 text-xl font-semibold">{theme.name}</h2>
              <p className="text-sm text-slate-500">{theme.slug}</p>
              {settings.active_theme_id === theme.id ? (
                <p className="mt-3 text-sm font-semibold text-emerald-700">
                  Active theme
                </p>
              ) : (
                <div className="mt-3">
                  <ThemeActivateButton id={theme.id} />
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <a
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                  href={`/admin/themes/${theme.id}/edit`}
                >
                  Edit
                </a>
                <a
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"
                  download
                  href={`/api/admin/themes/${theme.id}/export`}
                >
                  Export
                </a>
                {settings.active_theme_id !== theme.id ? (
                  <DeleteButton endpoint={`/api/admin/themes/${theme.id}`} />
                ) : null}
              </div>
            </article>
          ))}
        </section>
      </PageContainer>
    </main>
  );
}
