"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { PageContainer } from "@/components/public/page-container";

export function StorefrontEmpty({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section
      className="store-state rounded-2xl border border-dashed p-10 text-center"
      role="status"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-sm">{description}</p> : null}
    </section>
  );
}

export function StorefrontLoading() {
  const { t } = useLanguage();
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-[70vh] py-16"
      id="main-content"
    >
      <PageContainer>
        <span className="sr-only">{t("loadingPage")}</span>
        <div className="animate-pulse space-y-6" aria-hidden="true">
          <div className="h-4 w-32 rounded bg-slate-200" />
          <div className="h-16 max-w-3xl rounded bg-slate-200" />
          <div className="h-6 max-w-xl rounded bg-slate-200" />
        </div>
      </PageContainer>
    </main>
  );
}

export function StorefrontError({ reset }: { reset: () => void }) {
  const { t } = useLanguage();
  return (
    <main
      className="store-state flex min-h-[70vh] items-center justify-center px-6 py-16"
      id="main-content"
    >
      <section className="max-w-md text-center" role="alert">
        <h1 className="text-3xl font-semibold">{t("somethingWentWrong")}</h1>
        <p className="mt-4">{t("publicErrorHelp")}</p>
        <button
          className="store-primary store-focus mt-6 rounded-full px-6 py-3 font-semibold"
          onClick={reset}
          type="button"
        >
          {t("tryAgain")}
        </button>
      </section>
    </main>
  );
}

export function StorefrontNotFound() {
  const { t } = useLanguage();
  return (
    <main
      className="store-state flex min-h-[70vh] items-center justify-center px-6 py-16"
      id="main-content"
    >
      <section className="max-w-md text-center">
        <h1 className="text-3xl font-semibold">{t("pageNotFound")}</h1>
        <p className="mt-4">{t("pageNotFoundHelp")}</p>
        <Link
          className="store-primary store-focus mt-6 inline-flex rounded-full px-6 py-3 font-semibold"
          href="/shop"
        >
          {t("viewAllProducts")}
        </Link>
      </section>
    </main>
  );
}

export function OfflineNotice() {
  const { t } = useLanguage();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return offline ? (
    <div className="store-offline px-4 py-2 text-center text-sm" role="status">
      {t("offlineMessage")}
    </div>
  ) : null;
}

export function StorefrontSkipLink() {
  const { t } = useLanguage();
  return (
    <a
      className="store-focus sr-only z-[60] rounded-md bg-white px-4 py-3 text-slate-950 focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      href="#main-content"
    >
      {t("skipToContent")}
    </a>
  );
}
