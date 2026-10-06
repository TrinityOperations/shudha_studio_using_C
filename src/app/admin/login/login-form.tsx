"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/components/language-provider";

type LoginFormProps = {
  hasSessionError: boolean;
};

export function LoginForm({ hasSessionError }: LoginFormProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    hasSessionError ? t("sessionExpired") : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMessage(t("signInError"));
        setIsSubmitting(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setErrorMessage(t("signInError"));
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
      {errorMessage ? (
        <div
          aria-live="polite"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          {t("emailAddress")}
        </label>
        <input
          autoComplete="email"
          className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 transition outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          {t("password")}
        </label>
        <input
          autoComplete="current-password"
          className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-950 transition outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
          id="password"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </div>

      <button
        className="flex w-full items-center justify-center rounded-xl bg-rose-700 px-4 py-3 font-semibold text-white transition hover:bg-rose-800 focus:ring-2 focus:ring-rose-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? t("signingIn") : t("signIn")}
      </button>
    </form>
  );
}
