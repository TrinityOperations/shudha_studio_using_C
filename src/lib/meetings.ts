import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MeetingRequest, MeetingStatus } from "@/types/meetings";

export async function getMeetingRequests(
  status?: MeetingStatus,
): Promise<MeetingRequest[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("meeting_requests")
    .select(
      "id, name, phone, email, preferred_at, message, submission_language, status, admin_notes, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) throw new Error("Unable to load meeting requests.");
  return (data ?? []) as MeetingRequest[];
}
