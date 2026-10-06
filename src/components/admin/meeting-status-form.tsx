"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { meetingStatuses, type MeetingStatus } from "@/types/meetings";

export function MeetingStatusForm({
  id,
  status,
}: {
  id: string;
  status: MeetingStatus;
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState(status);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateStatus(nextStatus: MeetingStatus) {
    setValue(nextStatus);
    setMessage("");
    setSaving(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("meeting_requests")
      .update({ status: nextStatus })
      .eq("id", id);
    setSaving(false);
    setMessage(error ? t("unableToSave") : t("savedSuccessfully"));
  }

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={t("status")}
        className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
        disabled={saving}
        onChange={(event) => updateStatus(event.target.value as MeetingStatus)}
        value={value}
      >
        {meetingStatuses.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span aria-live="polite" className="text-xs text-slate-500">
        {saving ? t("saving") : message}
      </span>
    </div>
  );
}
