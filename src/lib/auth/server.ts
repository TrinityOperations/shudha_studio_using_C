import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAuthResult = {
  userId: string;
  email: string | null;
  displayName: string | null;
};

export async function getCurrentAdmin(): Promise<AdminAuthResult | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    return null;
  }

  return {
    userId: user.id,
    email: user.email ?? null,
    displayName: profile.display_name,
  };
}

export async function requireAdmin(): Promise<AdminAuthResult> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    redirect(user ? "/admin/unauthorized" : "/admin/login");
  }

  return admin;
}
