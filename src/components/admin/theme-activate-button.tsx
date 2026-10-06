"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ThemeActivateButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function activate() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/themes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_theme_id: id }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Unable to activate theme.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to activate theme.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        className="text-sm font-semibold text-rose-700 disabled:opacity-60"
        disabled={busy}
        onClick={activate}
        type="button"
      >
        {busy ? "Activating…" : "Activate"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
