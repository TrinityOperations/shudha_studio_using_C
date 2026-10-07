import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/server";

export const metadata: Metadata = {
  title: "Admin | Shudha Studio",
  description: "Protected Shudha Studio administration area.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <section className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
              Shudha Studio
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Admin access verified
            </h1>
            <p className="mt-3 text-slate-600">
              Signed in as {admin.email ?? admin.displayName ?? "administrator"}.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Manage your studio</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use the sidebar or choose a section below to manage every part of your
              storefront.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                href: "/admin/products",
                eyebrow: "Catalog",
                title: "Manage products",
                copy: "Create products, update pricing, and manage product images.",
              },
              {
                href: "/admin/categories",
                eyebrow: "Catalog",
                title: "Manage categories",
                copy: "Organize products and update category images and content.",
              },
              {
                href: "/admin/themes",
                eyebrow: "Appearance",
                title: "Manage themes",
                copy: "Control colors, homepage sections, writing, and theme backups.",
              },
              {
                href: "/admin/meetings",
                eyebrow: "Requests",
                title: "View meeting requests",
                copy: "Review customer requests and update their status.",
              },
            ].map((item) => (
              <a
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
                href={item.href}
                key={item.href}
              >
                <p className="text-xs font-semibold tracking-[0.16em] text-rose-700 uppercase">
                  {item.eyebrow}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950 group-hover:text-rose-800">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
                <span className="mt-4 inline-flex text-sm font-semibold text-rose-700">
                  Open section →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
