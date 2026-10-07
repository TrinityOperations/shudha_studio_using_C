import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("contact page only exposes configured contact methods and does not invent hours", async () => {
  const page = await source("src/app/(public)/contact/page.tsx");
  assert.match(page, /settings\.phone/);
  assert.match(page, /settings\.whatsapp/);
  assert.match(page, /settings\.email/);
  assert.match(page, /settings\.address/);
  assert.match(page, /businessHoursContact/);
  assert.match(page, /book-a-meeting/);
});

test("booking preserves server validation and adds only safe optional meeting context", async () => {
  const api = await source("src/app/api/meeting-requests/route.ts");
  const validation = await source("src/lib/validations/meetings.ts");
  const form = await source("src/components/public/meeting-request-form.tsx");
  assert.match(api, /meetingRequestSchema\.safeParse/);
  assert.match(api, /isFutureMeetingDate/);
  assert.match(api, /input\.website/);
  assert.match(api, /getPublicProductBySlug\(input\.productSlug\)/);
  assert.match(api, /createSupabaseAdminClient\(\)/);
  assert.match(api, /status: "pending"/);
  assert.match(api, /submission_key: submissionKey/);
  assert.match(validation, /meetingType: z\s+\.enum/);
  assert.match(validation, /productSlug/);
  assert.match(form, /bookingSummary/);
  assert.match(form, /errorSummary\.current\?\.focus\(\)/);
});

test("contact navigation and product booking carry public slug context", async () => {
  const header = await source("src/components/public/header.tsx");
  const footer = await source("src/components/public/footer.tsx");
  const product = await source("src/app/(public)/product/[slug]/page.tsx");
  const booking = await source("src/app/(public)/book-a-meeting/page.tsx");
  assert.match(header, /href="\/contact"/);
  assert.match(footer, /href="\/contact"/);
  assert.match(product, /book-a-meeting\?product=/);
  assert.match(booking, /getPublicProductBySlug\(requestedSlug\)/);
});
