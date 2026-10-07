"use client";

import { useRef, useState } from "react";

export function ImportBackupButton({
  endpoint,
  label,
}: {
  endpoint: string;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={inputRef}
        accept="application/zip,application/json,.zip,.json"
        className="hidden"
        type="file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setStatus("Importing…");
          try {
            const body = await file.arrayBuffer();
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": file.name.toLowerCase().endsWith(".zip")
                  ? "application/zip"
                  : "application/json",
              },
              body,
            });
            const payload = (await response.json()) as { error?: string };
            setStatus(
              response.ok
                ? "Imported successfully."
                : (payload.error ?? "Import failed."),
            );
            if (response.ok) window.location.reload();
          } catch {
            setStatus("Import failed.");
          }
        }}
      />
      <button
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold"
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        {label}
      </button>
      {status ? (
        <span className="text-xs text-slate-500" role="status">
          {status}
        </span>
      ) : null}
    </div>
  );
}
