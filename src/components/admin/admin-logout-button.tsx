"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/components/language-provider";

export function AdminLogoutButton() {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isSigningOut}
      onClick={handleLogout}
      type="button"
    >
      {isSigningOut ? t("signingOut") : t("signOut")}
    </button>
  );
}
