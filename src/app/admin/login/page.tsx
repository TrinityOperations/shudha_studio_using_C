import type { Metadata } from "next";

import { LoginForm } from "./login-form";
import { LanguageSwitcher } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "Admin login | Shudha Studio",
  description: "Sign in to the Shudha Studio administration area.",
};

type AdminLoginPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold tracking-[0.2em] text-rose-700 uppercase">
          Shudha Studio
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Admin sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with an authorized administrator account to continue.
        </p>
        <LoginForm hasSessionError={params.reason === "session"} />
        <div className="mt-6">
          <LanguageSwitcher />
        </div>
      </section>
    </main>
  );
}
