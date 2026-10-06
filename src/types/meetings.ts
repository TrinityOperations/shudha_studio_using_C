export const meetingStatuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
] as const;

export type MeetingStatus = (typeof meetingStatuses)[number];

export type MeetingRequest = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  preferred_at: string;
  message: string | null;
  submission_language: "en" | "bn";
  status: MeetingStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};
