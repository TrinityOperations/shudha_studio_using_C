"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { LanguageSwitcher } from "@/components/language-provider";

type NavigationItem = { href: string; label: string; exact?: boolean };
type NavigationGroup = { label: string; items: NavigationItem[] };

const groups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
    ],
  },
  {
    label: "Appearance",
    items: [{ href: "/admin/themes", label: "Themes" }],
  },
  {
    label: "Requests",
    items: [{ href: "/admin/meetings", label: "Meeting requests" }],
  },
];

export function AdminNavigation() {
  const pathname = usePathname();
  const hidden = pathname === "/admin/login" || pathname === "/admin/unauthorized";
  if (hidden) return null;
  return (
    <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-4 px-5 py-5 lg:block lg:px-6">
        <Link className="block" href="/admin">
          <p className="text-xs font-semibold tracking-[0.24em] text-rose-700 uppercase">
            Shudha Studio
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-950">Admin panel</p>
        </Link>
        <Link
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 lg:mt-5 lg:inline-flex"
          href="/"
        >
          View storefront
        </Link>
      </div>
      <nav
        aria-label="Admin navigation"
        className="flex gap-2 overflow-x-auto px-5 pb-4 lg:block lg:flex-1 lg:space-y-6 lg:overflow-y-auto lg:px-4 lg:pb-6"
      >
        {groups.map((group) => (
          <div className="min-w-max lg:min-w-0" key={group.label}>
            <p className="hidden px-3 text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase lg:block">
              {group.label}
            </p>
            <div className="flex gap-2 lg:mt-2 lg:block lg:space-y-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-rose-50 text-rose-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4 lg:block lg:px-6">
        <LanguageSwitcher />
        <div className="mt-3">
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}
