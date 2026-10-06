"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";

import {
  isFutureMeetingDate,
  meetingRequestSchema,
  type MeetingRequestInput,
} from "@/lib/validations/meetings";

type MeetingRequestFormProps = {
  businessTimezone: string;
};

const initialValues: MeetingRequestInput = {
  name: "",
  phone: "",
  email: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
  website: "",
  submissionLanguage: "en",
};

export function MeetingRequestForm({ businessTimezone }: MeetingRequestFormProps) {
  const { language, t } = useLanguage();
  const [values, setValues] = useState({
    ...initialValues,
    submissionLanguage: language,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const minimumDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function updateValue(field: keyof MeetingRequestInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    setFormError("");

    const result = meetingRequestSchema.safeParse(values);
    const nextErrors: Record<string, string> = {};

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      }
    } else if (
      !isFutureMeetingDate(values.preferredDate, values.preferredTime, businessTimezone)
    ) {
      nextErrors.preferredDate =
        language === "bn"
          ? "ভবিষ্যতের তারিখ ও সময় বেছে নিন।"
          : "Please choose a future date and time.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/meeting-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok)
        throw new Error(
          payload.error ??
            (language === "bn"
              ? "আপনার অনুরোধ পাঠানো যায়নি।"
              : "Unable to submit your request."),
        );

      setValues({ ...initialValues, submissionLanguage: language });
      setSuccess(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("unableToSave"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} name="name" error={errors.name}>
          <input
            className="form-input"
            id="name"
            name="name"
            onChange={(event) => updateValue("name", event.target.value)}
            value={values.name}
          />
        </Field>
        <Field label={t("phone")} name="phone" error={errors.phone}>
          <input
            className="form-input"
            id="phone"
            name="phone"
            onChange={(event) => updateValue("phone", event.target.value)}
            type="tel"
            value={values.phone}
          />
        </Field>
      </div>

      <Field label={t("emailOptional")} name="email" error={errors.email}>
        <input
          className="form-input"
          id="email"
          name="email"
          onChange={(event) => updateValue("email", event.target.value)}
          type="email"
          value={values.email}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("preferredDate")}
          name="preferredDate"
          error={errors.preferredDate}
        >
          <input
            className="form-input"
            id="preferredDate"
            min={minimumDate}
            name="preferredDate"
            onChange={(event) => updateValue("preferredDate", event.target.value)}
            type="date"
            value={values.preferredDate}
          />
        </Field>
        <Field
          label={t("preferredTime")}
          name="preferredTime"
          error={errors.preferredTime}
        >
          <input
            className="form-input"
            id="preferredTime"
            name="preferredTime"
            onChange={(event) => updateValue("preferredTime", event.target.value)}
            type="time"
            value={values.preferredTime}
          />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        {t("timesRequested", { timezone: businessTimezone })}
      </p>

      <Field label={t("messageOptional")} name="message" error={errors.message}>
        <textarea
          className="form-input min-h-32 resize-y"
          id="message"
          name="message"
          onChange={(event) => updateValue("message", event.target.value)}
          value={values.message}
        />
      </Field>

      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Website</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          onChange={(event) => updateValue("website", event.target.value)}
          tabIndex={-1}
          value={values.website}
        />
      </div>

      {formError ? (
        <p aria-live="polite" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">
          {formError}
        </p>
      ) : null}
      {success ? (
        <p
          aria-live="polite"
          className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          {t("requestReceived")}
        </p>
      ) : null}

      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-rose-700 px-5 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? t("sendingRequest") : t("requestMeeting")}
      </button>
    </form>
  );
}

function Field({
  children,
  error,
  label,
  name,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
  name: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor={name}>
        {label}
      </label>
      {children}
      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
