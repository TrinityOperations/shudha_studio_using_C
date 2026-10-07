"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export function AnnouncementBar({
  english,
  bangla,
  themeId,
}: {
  english: string;
  bangla: string;
  themeId: string;
}) {
  const { language, t } = useLanguage();
  const storageKey = `shudha-announcement:${themeId}:${english}:${bangla}`;
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === "dismissed") {
        // Defer the state update so the server and hydration markup match.
        const timer = window.setTimeout(() => setDismissed(true), 0);
        return () => window.clearTimeout(timer);
      }
    } catch {
      // Private browsing may prevent access to session storage.
    }
  }, [storageKey]);
  if (dismissed || (!english.trim() && !bangla.trim())) return null;
  return (
    <div
      className="store-announcement relative px-12 py-2 text-center text-sm"
      role="status"
    >
      <p>{(language === "bn" ? bangla || english : english || bangla).trim()}</p>
      <button
        aria-label={t("dismissAnnouncement")}
        className="store-focus absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full"
        onClick={() => {
          setDismissed(true);
          try {
            sessionStorage.setItem(storageKey, "dismissed");
          } catch {
            // Dismissal still works for this page.
          }
        }}
        type="button"
      >
        <X aria-hidden="true" size={18} />
      </button>
    </div>
  );
}
