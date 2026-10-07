"use client";

import { useMemo, useRef, useState } from "react";

import { useLanguage } from "@/components/language-provider";
import {
  isFutureMeetingDate,
  meetingRequestSchema,
  type MeetingRequestInput,
} from "@/lib/validations/meetings";

type MeetingRequestFormProps = {
  businessTimezone: string;
  productSlug?: string;
  productName?: string;
};

const initialValues: MeetingRequestInput = {
  name: "",
  phone: "",
  email: "",
  preferredDate: "",
  preferredTime: "",
  message: "",
  meetingType: "gift-guidance",
  productSlug: "",
  website: "",
  submissionLanguage: "en",
};

export function MeetingRequestForm({
  businessTimezone,
  productSlug = "",
  productName = "",
}: MeetingRequestFormProps) {
  const { language, t } = useLanguage();
  const [values, setValues] = useState<MeetingRequestInput>({
    ...initialValues,
    productSlug,
    submissionLanguage: language,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<MeetingRequestInput | null>(null);
  const errorSummary = useRef<HTMLDivElement>(null);
  const minimumDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const success = submitted !== null;

  function updateValue(field: keyof MeetingRequestInput, value: string) {
    setValues((current) => ({
      ...current,
      [field]: value,
      submissionLanguage: language,
    }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    const result = meetingRequestSchema.safeParse({
      ...values,
      submissionLanguage: language,
    });
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
      requestAnimationFrame(() => errorSummary.current?.focus());
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/meeting-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, submissionLanguage: language }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(
          payload.error ??
            (language === "bn"
              ? "আপনার অনুরোধ পাঠানো যায়নি।"
              : "Unable to submit your request."),
        );
      }
      setSubmitted({ ...values, submissionLanguage: language });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("unableToSave"));
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldError = (field: string) =>
    errors[field]
      ? language === "bn"
        ? "এই তথ্যটি যাচাই করুন।"
        : "Please check this field."
      : "";

  const fieldLabels: Record<string, string> = {
    name: t("name"),
    phone: t("phone"),
    email: t("emailOptional"),
    preferredDate: t("preferredDate"),
    preferredTime: t("preferredTime"),
    message: t("messageOptional"),
    meetingType: t("meetingType"),
    productSlug: t("productContext"),
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("meetingType")}
          name="meetingType"
          error={fieldError("meetingType")}
        >
          <select
            className="form-input min-h-12"
            id="meetingType"
            name="meetingType"
            aria-describedby={errors.meetingType ? "meetingType-error" : undefined}
            aria-invalid={Boolean(errors.meetingType)}
            onChange={(event) => updateValue("meetingType", event.target.value)}
            value={values.meetingType}
          >
            <option value="gift-guidance">{t("meetingGiftGuidance")}</option>
            <option value="celebration-planning">{t("meetingCelebration")}</option>
            <option value="product-question">{t("meetingProductQuestion")}</option>
            <option value="other">{t("meetingOther")}</option>
          </select>
        </Field>
        {productName ? (
          <p className="flex min-h-12 items-center rounded-xl bg-rose-50 px-4 text-sm text-slate-800">
            <span className="font-semibold">{t("productContext")}:&nbsp;</span>
            {productName}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t("name")} name="name" error={fieldError("name")}>
          <input
            autoComplete="name"
            className="form-input"
            id="name"
            name="name"
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            onChange={(event) => updateValue("name", event.target.value)}
            required
            value={values.name}
          />
        </Field>
        <Field label={t("phone")} name="phone" error={fieldError("phone")}>
          <input
            autoComplete="tel"
            className="form-input"
            id="phone"
            inputMode="tel"
            name="phone"
            aria-describedby={errors.phone ? "phone-error" : undefined}
            aria-invalid={Boolean(errors.phone)}
            onChange={(event) => updateValue("phone", event.target.value)}
            required
            type="tel"
            value={values.phone}
          />
        </Field>
      </div>

      <Field label={t("emailOptional")} name="email" error={fieldError("email")}>
        <input
          autoComplete="email"
          className="form-input"
          id="email"
          name="email"
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => updateValue("email", event.target.value)}
          type="email"
          value={values.email}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t("preferredDate")}
          name="preferredDate"
          error={fieldError("preferredDate")}
        >
          <input
            className="form-input"
            id="preferredDate"
            min={minimumDate}
            name="preferredDate"
            aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined}
            aria-invalid={Boolean(errors.preferredDate)}
            onChange={(event) => updateValue("preferredDate", event.target.value)}
            required
            type="date"
            value={values.preferredDate}
          />
        </Field>
        <Field
          label={t("preferredTime")}
          name="preferredTime"
          error={fieldError("preferredTime")}
        >
          <input
            className="form-input"
            id="preferredTime"
            name="preferredTime"
            aria-describedby={errors.preferredTime ? "preferredTime-error" : undefined}
            aria-invalid={Boolean(errors.preferredTime)}
            onChange={(event) => updateValue("preferredTime", event.target.value)}
            required
            type="time"
            value={values.preferredTime}
          />
        </Field>
      </div>
      <p className="-mt-2 text-xs text-slate-500">
        {t("timesRequested", { timezone: businessTimezone })}
      </p>

      <Field label={t("messageOptional")} name="message" error={fieldError("message")}>
        <textarea
          className="form-input min-h-32 resize-y"
          id="message"
          name="message"
          aria-describedby={errors.message ? "message-error" : undefined}
          aria-invalid={Boolean(errors.message)}
          onChange={(event) => updateValue("message", event.target.value)}
          value={values.message}
        />
      </Field>

      <div
        aria-hidden="true"
        className="absolute -left-[10000px] h-px w-px overflow-hidden"
        tabIndex={-1}
      >
        <label htmlFor="website">Website</label>
        <input
          autoComplete="off"
          id="website"
          name="website"
          onChange={(event) =>
            setValues((current) => ({ ...current, website: event.target.value }))
          }
          tabIndex={-1}
          value={values.website}
        />
      </div>

      {formError ? (
        <p
          aria-live="assertive"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      {Object.keys(errors).some((field) => errors[field]) ? (
        <div
          aria-label={t("formErrors")}
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          ref={errorSummary}
          role="alert"
          tabIndex={-1}
        >
          <p className="font-semibold">{t("formErrors")}</p>
          <ul className="mt-2 list-inside list-disc">
            {Object.keys(errors)
              .filter((field) => errors[field])
              .map((field) => (
                <li key={field}>
                  {t("checkField", { field: fieldLabels[field] ?? field })}
                </li>
              ))}
          </ul>
        </div>
      ) : null}
      {success ? (
        <section
          aria-live="polite"
          className="space-y-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900"
          role="status"
        >
          <h3 className="font-bold">{t("requestReceived")}</h3>
          <p>
            {t("bookingSummary", {
              name: submitted.name,
              date: submitted.preferredDate,
              time: submitted.preferredTime,
              product: productName || t("noProductContext"),
            })}
          </p>
          <button
            className="min-h-11 font-semibold underline"
            onClick={() => setSubmitted(null)}
            type="button"
          >
            {t("editRequest")}
          </button>
        </section>
      ) : null}

      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-rose-700 px-5 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isSubmitting || success}
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
      {error ? (
        <p className="mt-2 text-sm text-red-700" id={`${name}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
