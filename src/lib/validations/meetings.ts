import { z } from "zod";

export const meetingRequestSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(160),
  phone: z.string().trim().min(5, "Please enter a valid phone number.").max(40),
  email: z
    .string()
    .trim()
    .max(320)
    .refine((value) => value === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Please enter a valid email address.",
    }),
  preferredDate: z.string().min(1, "Please choose a date."),
  preferredTime: z.string().min(1, "Please choose a time."),
  message: z.string().trim().max(5000, "Message must be 5,000 characters or fewer."),
  website: z.string().max(0, "Please leave this field empty."),
  submissionLanguage: z.enum(["en", "bn"]).default("en"),
});

export type MeetingRequestInput = z.input<typeof meetingRequestSchema>;

export function combineMeetingDateTime(
  date: string,
  time: string,
  timeZone = "UTC",
): string | null {
  const value = new Date(`${date}T${time}:00Z`);

  if (Number.isNaN(value.getTime())) return null;

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone,
      year: "numeric",
    }).formatToParts(value);
    const values = Object.fromEntries(
      parts
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );
    const representedTime = Date.UTC(
      values.year,
      values.month - 1,
      values.day,
      values.hour,
      values.minute,
      values.second,
    );
    const offset = representedTime - value.getTime();
    return new Date(value.getTime() - offset).toISOString();
  } catch {
    return null;
  }
}

export function isFutureMeetingDate(
  date: string,
  time: string,
  timeZone = "UTC",
): boolean {
  const combined = combineMeetingDateTime(date, time, timeZone);
  return combined !== null && new Date(combined).getTime() > Date.now();
}
