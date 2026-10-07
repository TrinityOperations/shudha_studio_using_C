import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  combineMeetingDateTime,
  isFutureMeetingDate,
  meetingRequestSchema,
} from "@/lib/validations/meetings";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPublicProductBySlug } from "@/lib/catalog";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const result = meetingRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Please check the form fields." },
        { status: 400 },
      );
    }

    const input = result.data;
    const publicSupabase = await createSupabaseServerClient();
    const { data: settings, error: settingsError } = await publicSupabase
      .from("site_settings")
      .select("business_timezone")
      .eq("id", true)
      .single();
    if (settingsError || !settings) {
      return NextResponse.json(
        { error: "Meeting settings are not available right now." },
        { status: 503 },
      );
    }

    if (
      !isFutureMeetingDate(
        input.preferredDate,
        input.preferredTime,
        settings.business_timezone,
      )
    ) {
      return NextResponse.json(
        { error: "Please choose a future date and time." },
        { status: 400 },
      );
    }

    if (input.website) {
      return NextResponse.json(
        { error: "Unable to submit this request." },
        { status: 400 },
      );
    }

    const env = getServerEnv();
    if (env.TURNSTILE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Turnstile is configured but the form token is not available yet." },
        { status: 503 },
      );
    }

    const meetingLabels = {
      "gift-guidance": "Gift guidance",
      "celebration-planning": "Celebration planning",
      "product-question": "Product question",
      other: "Other",
    };
    let productName = "";
    if (input.productSlug) {
      try {
        const product = await getPublicProductBySlug(input.productSlug);
        productName = product.name_en;
      } catch {
        return NextResponse.json(
          { error: "That product is no longer available. Please choose it again." },
          { status: 400 },
        );
      }
    }
    const storedMessage = [
      `[${meetingLabels[input.meetingType]}]`,
      productName ? `Product: ${productName} (${input.productSlug})` : "",
      input.message,
    ]
      .filter(Boolean)
      .join("\n\n");
    if (storedMessage.length > 5000) {
      return NextResponse.json(
        { error: "Please keep your message within 5,000 characters." },
        { status: 400 },
      );
    }

    const preferredAt = combineMeetingDateTime(
      input.preferredDate,
      input.preferredTime,
      settings.business_timezone,
    );
    if (!preferredAt) {
      return NextResponse.json(
        { error: "Please choose a valid date and time." },
        { status: 400 },
      );
    }

    const normalized = [
      input.name.toLowerCase(),
      input.phone.replace(/\D/g, ""),
      input.email.toLowerCase(),
      preferredAt,
    ].join("|");
    const submissionKey = createHash("sha256").update(normalized).digest("hex");
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("meeting_requests").insert({
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      preferred_at: preferredAt,
      message: storedMessage || null,
      submission_language: input.submissionLanguage,
      status: "pending",
      submission_key: submissionKey,
    });

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "This request has already been submitted." },
        { status: 409 },
      );
    }
    if (error) throw error;

    return NextResponse.json({ submitted: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "We could not submit your request. Please try again." },
      { status: 500 },
    );
  }
}
