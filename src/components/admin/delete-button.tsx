"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

export function DeleteButton({
  endpoint,
  label = "Delete",
  onDeleted,
}: {
  endpoint: string;
  label?: string;
  onDeleted?: () => void;
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function remove() {
    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? t("unableToDelete"));
        return;
      }
      onDeleted?.();
      window.location.reload();
    } catch {
      setError(t("unableToDelete"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        className="admin-button admin-button-danger rounded-lg px-3 py-2 text-sm font-semibold"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {label ?? t("delete")}
      </button>
      {isOpen ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-950">
              {t("confirmDeletion")}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t("cannotUndo")}</p>
            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="admin-button admin-button-secondary rounded-lg px-4 py-2 text-sm font-semibold"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                {t("cancel")}
              </button>
              <button
                className="admin-button rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDeleting}
                onClick={remove}
                type="button"
              >
                {isDeleting ? t("deleting") : t("delete")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
