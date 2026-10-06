# Shudha Studio — coding-agent context

This document is the safe extension guide for future coding agents. It describes
the final application state as implemented in the repository. Verify code and
migrations before making assumptions when a later change modifies behavior.

## Product purpose

Shudha Studio is a bilingual gift-shop catalog and meeting-request application.
Visitors browse active products and categories, switch between English and
Bengali, view contact information, and request a future meeting. Trusted
administrators sign in, manage catalog content and images, review meeting
requests, and select the active visual theme.

The application is not an ecommerce checkout. There is no cart, payment flow,
inventory transaction, order system, or customer account area in the current
codebase.

## Runtime and framework

- Next.js App Router 16.3.8.
- React 19.2.8.
- TypeScript with strict checking.
- Tailwind CSS 4 through PostCSS.
- Supabase SSR/browser clients and Supabase Storage.
- Zod 4 for environment and input validation.
- ESLint, Prettier, and Node's built-in test runner.

The root scripts are defined in `package.json`:

```text
dev, build, start, lint, typecheck, test, format, format:check
```

Do not introduce a library until its need is confirmed and its compatibility with
Next.js 16, React 19, and the existing conventions is understood.

## Source layout

```text
src/app/                 Routes, layouts, loading/error boundaries, API routes
src/components/          Client and server UI components
src/lib/auth/            Server authentication and admin authorization
src/lib/i18n/            Language cookie, server preference, translations
src/lib/supabase/        Browser/server/proxy/admin client boundaries
src/lib/validations/     Zod schemas and meeting time conversion
src/types/               Domain types
supabase/migrations/     Database, RLS, and Storage migrations
tests/                   Static Node regression tests
docs/                    Operational documentation
```

The project uses the `@/*` TypeScript path alias for `src/*`.

## Route map

### Public pages

- `/` — public home page with featured products, categories, and contact section.
- `/products` — catalog search/filter/pagination.
- `/category/[slug]` — active category page.
- `/product/[slug]` — active product detail page.
- `/book-a-meeting` — meeting-request form.

The public layout loads site settings, wraps the UI in `LanguageProvider`, applies
`data-theme={settings.active_theme}`, renders the header/footer, and provides the
skip link. Public pages are dynamic because catalog/settings values are read from
Supabase.

### Admin pages

- `/admin/login` — Supabase email/password login.
- `/admin` — dashboard.
- `/admin/categories`, `/admin/categories/new`, `/admin/categories/[id]/edit`.
- `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`.
- `/admin/meetings` — list/filter/update meeting requests.
- `/admin/themes` — create, edit, activate, and delete custom themes. The legacy
  `/admin/settings` route redirects here.

Admin pages call `requireAdmin()` before loading protected content. A missing
session redirects to `/admin/login`; an authenticated non-admin redirects to
`/admin/unauthorized`.

### API routes

- `POST /api/meeting-requests` validates a public request and inserts it through
  the privileged server-only client.
- Category/product POST routes create rows after `requireAdmin()` and Zod
  validation.
- Category/product dynamic routes PATCH or DELETE rows after `requireAdmin()`.
- `/api/admin/images/[kind]/[id]` changes image references after authorization
  and safe-path validation.
- `/api/admin/settings` changes `active_theme` after authorization and schema
  validation.

When adding an API route, handle malformed JSON, validation failures, database
errors, authorization, missing affected rows, and safe response status codes.
Do not expose raw secrets or internal database details in responses.

## Environment contract

Defined in `src/lib/env.ts`:

- `NEXT_PUBLIC_SUPABASE_URL` — valid URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — nonempty public key.
- `NEXT_PUBLIC_SITE_URL` — valid URL.
- `SUPABASE_SECRET_KEY` — nonempty server-only key.
- `TURNSTILE_SECRET_KEY` — optional nonempty server key.

`getPublicEnv()` validates only public variables. `getServerEnv()` validates the
public variables plus the server-only values. Never import the admin client into
browser code. Never rename the secret with a `NEXT_PUBLIC_` prefix.

The current meeting route treats any configured Turnstile secret as an enabled
but incomplete integration and returns `503`, because the form does not send a
Turnstile token. Do not document Turnstile as active unless both form and server
verification are implemented.

## Supabase client boundaries

### Browser client

`src/lib/supabase/browser.ts` uses `createBrowserClient` and public environment
values. It is used by login, image management, and other client interactions.

### Request-aware server client

`src/lib/supabase/server.ts` uses request cookies and public environment values.
Use it for server-rendered catalog/settings queries and authenticated operations
that must observe the current user session.

### Session proxy

`src/proxy.ts` calls `updateSupabaseSession` for the configured matcher. The
proxy refreshes Supabase Auth cookies by calling `auth.getUser()`. It is not the
administrator authorization boundary by itself.

### Privileged admin client

`src/lib/supabase/admin.ts` uses `SUPABASE_SECRET_KEY` and disables session
persistence/refresh. It is intentionally used by the public meeting route after
validation. Treat it as dangerous: keep its imports server-only and keep its
operations narrowly scoped.

## Data model and RLS

The initial migration creates:

- `profiles`: Auth-linked profile with `role` defaulting to `user`.
- `categories`: unique slug, bilingual names/descriptions/SEO, active flag,
  sort order, and image fields.
- `products`: required category, unique slug, bilingual fields, active/available/
  featured flags, sort order, image path, and `gallery_images` JSONB.
- `meeting_requests`: contact details, preferred timestamp, language, status,
  admin notes, assignment, unique `submission_key`, and timestamps.
- `site_settings`: boolean singleton with business information, timezone,
  default language, and active theme.

The image migration adds category image metadata and the public
`product-images`/`category-images` buckets with 5 MiB JPEG/PNG/WebP limits.

RLS rules are essential:

- Public reads see only active categories and active/available products belonging
  to active categories.
- The corrective public-read migration keeps administrator-only read access in
  separate authenticated policies so anonymous visitors do not execute the
  private administrator helper.
- Admins can manage categories, products, site settings, and meeting requests.
- Meeting requests have no anonymous direct insert policy; the server route uses
  the privileged client after checks.
- Storage mutations require `private.is_admin(auth.uid())`.

Any schema change requires a new migration. Do not edit an applied migration in
place. Update this document and the operational docs if behavior changes.

The fourth migration grants `authenticated` permission to execute
`private.is_valid_gallery_images(jsonb)`, which is required when PostgreSQL
evaluates the product `gallery_images` constraint during admin writes.

## Authentication and authorization

Login uses `supabase.auth.signInWithPassword` in
`src/app/admin/login/login-form.tsx`. Authorization uses the server helper in
`src/lib/auth/server.ts`:

1. Read the authenticated user with `auth.getUser()`.
2. Read the matching `profiles` row.
3. Require `profile.role === 'admin'`.

The Auth user trigger creates a profile with a non-admin role. A trusted operator
must promote the profile through SQL or an equivalent controlled operation. Never
allow user metadata, public signup, or a client API to select `admin`.

## Catalog behavior

`src/lib/catalog.ts` contains public query functions:

- `getActiveCategories()` returns active categories.
- `getFeaturedProducts(limit)` returns active, available, featured products.
- `getProductPage()` filters by category slug/search text and paginates with a
  maximum page size of 48.
- `getActiveCategoryBySlug()` and `getPublicProductBySlug()` call `notFound()`
  when no eligible record exists.

Public product queries use the category relation as an inner relation and filter
active/available state. Preserve those constraints when adding a new public
catalog query.

## Meetings workflow

The form and API use `src/lib/validations/meetings.ts`:

- name: trimmed, 1–160 characters;
- phone: trimmed, 5–40 characters;
- optional email: maximum 320 characters and basic email shape;
- date/time: required and converted using `business_timezone`;
- message: maximum 5,000 characters;
- website: honeypot that must remain empty;
- submission language: `en` or `bn`.

The API then:

1. Parses JSON and validates the schema.
2. Reads the business timezone from `site_settings`.
3. Rejects non-future dates.
4. Rejects populated honeypot values.
5. Rejects if Turnstile secret configuration is enabled without token support.
6. Converts the local date/time to ISO form.
7. Hashes normalized name/phone/email/time into a unique submission key.
8. Inserts with status `pending` using the privileged client.
9. Returns `409` on duplicate submission key.

Allowed admin statuses are `pending`, `confirmed`, `completed`, `cancelled`, and
`rejected`.

## Images

`ImageManager` validates JPEG, PNG, and WebP files, a 5 MiB maximum, and a ten
image product-gallery maximum. It uploads to the correct public bucket, then
updates the database image reference through the admin image API. If the
reference update fails after upload, it attempts to delete the newly uploaded
object. Existing image removal updates the reference and then attempts Storage
cleanup.

Image paths are expected to remain scoped under the entity ID. Preserve the
server-side safe-path checks when changing image APIs.

## Localization and themes

`LanguageProvider` supports `en` and `bn`. The selected language is stored in
local storage and the `shudha-language` cookie; server pages read the cookie with
`getPreferredLanguage`. Translations live in
`src/lib/i18n/translations.ts`, and bilingual database fields are selected with
`localizedValue`.

Themes are defined in `src/lib/theme.ts` and constrained by the database and Zod
schema to:

```text
everyday, wedding, festival
```

The public layout writes the selected theme to `data-theme`. CSS variables and
theme selectors live in `src/app/globals.css`. Theme changes are administrator-
only and revalidate the public layout.

## Accessibility and UX conventions

- Preserve the skip link and `main-content` target.
- Maintain visible keyboard focus styles.
- Keep form labels associated with inputs.
- Use `aria-live` for async success/error/loading status.
- Keep mobile navigation language access available.
- Keep external WhatsApp links explicitly marked with `target` and `rel`.
- Preserve loading and error boundaries when adding dynamic route groups.

## Metadata and known omissions

Product and category pages generate language-aware title/description metadata and
canonical paths. Root and listing metadata remain static English declarations.

The repository currently has no `sitemap.ts` or `robots.ts` route. Do not claim
automated sitemap/robots generation unless those files are added and verified.

There is also no browser automation suite, live Supabase integration suite,
rate-limit service, payment system, or full Turnstile integration.

## Tests and verification

`tests/phase11-audit.test.mjs` uses Node's built-in test runner and reads source
files to verify security and accessibility invariants. It does not connect to
Supabase or render a browser.

Recommended checks after code changes:

```powershell
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

For database/auth/storage/responsive changes, also perform the live checks in
`docs/deployment.md` using a non-production test account and controlled data.

## Safe extension checklist

Before implementing a new feature:

1. Identify whether it is public, authenticated, or admin-only.
2. Define validation at the API/database boundary, not only in the UI.
3. Confirm the correct Supabase client boundary.
4. Add or update RLS and a versioned migration if data changes.
5. Preserve bilingual fields and theme behavior where applicable.
6. Add a loading/error/accessibility state.
7. Update operational docs and this context document.
8. Run all verification commands.
9. Distinguish static verification from live Supabase/browser verification.
