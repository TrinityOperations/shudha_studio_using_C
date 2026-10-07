# Shudha Studio — coding-agent context

This document is the safe extension guide for future coding agents. It describes
the final application state as implemented in the repository. Verify code and
migrations before making assumptions when a later change modifies behavior.

## Handoff status (October 7, 2026)

The storefront restructure and marketplace-discovery work described in the later
sections is implemented in the current repository. The public route family now
includes `/shop`, `/search`, `/shop/category/[slug]`, `/shop/occasion/[slug]`,
`/shop/recipient/[slug]`, and configured `/shop/price/[range]`. `/products` and
`/category/[slug]` are compatibility redirects; `/product/[slug]`, `/contact`,
and `/book-a-meeting` remain active.

Occasion, recipient, collection, and price-range discovery are configuration over
existing categories and optional product pricing, not separate database entities.
Do not describe them as independent admin-managed taxonomies or invent filters not
implemented by the current query layer. Preserve bilingual content, public theme
settings, admin authorization/RLS, image storage safety, and the meeting-request
workflow when extending the storefront. `storefront_restructure_plan.md` is the
historical design record; this document describes the current implementation.

## Phase 2 shared storefront shell (October 7, 2026)

- The `(public)` layout now passes theme-managed English/Bangla announcement text
  to `AnnouncementBar` and queries active categories once for shared navigation.
  Catalog query failure hides category groups and shows a localized unavailable
  notice without preventing the shell from rendering. The group builder in
  `src/lib/storefront-navigation.ts` resolves theme-curated category IDs against
  active categories, so inactive/missing IDs never become links.
- `Header` uses compatibility catalog redirects plus `/shop`, `/#contact`, `/contact`,
  and `/book-a-meeting` URLs; the mobile drawer has focus trapping/restoration,
  Escape and backdrop dismissal, scroll locking, nested groups and search. The
  discovery routes listed above are implemented in the current storefront. Theme editor fields for
  occasion/recipient/collection groups select existing categories only, and are
  not separate taxonomies. A theme's announcement is optional and dismissal is
  remembered per session and per message/theme.
- `/products?sort=newest` orders eligible products by `created_at` descending;
  other product listing order and public visibility constraints remain unchanged.
  Catalog controls and pagination preserve the new sort parameter.
- Footer draws active category links and contact details from existing data and
  supports bilingual business names/addresses. Social and policy links remain
  absent because there are no configured accounts or policy routes.
- Reusable states live in `src/components/public/storefront-states.tsx`:
  `StorefrontLoading`, `StorefrontEmpty`, `StorefrontError`,
  `StorefrontNotFound`, and `OfflineNotice`. The offline notice reports connection
  state only; it does not queue requests or offer offline catalog access.
  `src/app/global-error.tsx` provides a generic bilingual retry state if the
  public layout itself (or root application) fails before its language context
  and theme can load.
- Public shell CSS in `src/app/globals.css` is scoped under `.public-theme`.
  Reuse the existing `--theme-*` color variables; shell primitives add
  `--store-radius`, `--store-shadow`, `--store-space`, `.store-primary`,
  `.store-focus`, `.store-search`, and `.store-state`. Tailwind responsive
  breakpoints used by the shell: `sm` 640px, `lg` 1024px (desktop menu), and
  `xl` 1280px; the drawer covers smaller viewports including tablets.

## Phase 3 editorial homepage and optional pricing (October 7, 2026)

- The public homepage retains the Phase 2 announcement/header shell and now
  presents category discovery, occasion and recipient guides, featured products,
  a theme-specific seasonal campaign, trust values, a meeting CTA, optional
  editorial story copy, and the existing contact area. The guides map labels to
  active existing category IDs; no guessed product classifications or new routes
  are introduced. Unmapped guides link to `/products` with explanatory copy.
- Theme editor campaign, trust, meeting, and story copy has English/Bangla fields.
  Campaign destination is an optional existing category. Legacy occasion and
  recipient category-ID arrays migrate to the new guide mapping in order; no
  category is automatically assigned a semantic meaning. Legacy theme JSON is
  normalized with empty defaults before public/admin use.
- Product pricing is optional and requires applying
  `supabase/migrations/20261007000100_product_pricing.sql` **before deploying
  application code that selects the new columns**. The migration adds nullable
  `price` and `compare_at_price`, plus `currency_code` (default `USD`). No product
  price is invented. Admin validation enforces nonnegative values and requires a
  compare-at price to exceed a configured current price. Cards and product detail
  show localized prices or an inquiry prompt when price is null.
- Public category/product images are optimized through Next Image only for the
  configured Supabase public-storage host; external URLs bypass the optimizer.
  Category discovery and product cards fall back to decorative/no-image states.
  Theme imagery is layered in the hero; meeting links retain the existing
  `/book-a-meeting` workflow. No newsletter, cart, checkout, delivery guarantee,
  or payment claim has been added.
- Current price/currency defaults are USD solely as a storage/UI default; confirm
  the operating currency and update product records before publicly configuring
  any prices. The database values remain nullable until an administrator enters
  them.

## Phase 4 marketplace discovery (October 7, 2026)

- Discovery routes: `/shop`, `/search`, `/shop/category/[slug]`,
  `/shop/occasion/[slug]`, `/shop/recipient/[slug]`, and configured
  `/shop/price/[range]`. `/products` and `/category/[slug]` redirect to the new
  equivalents while preserving single-valued query parameters. Product detail
  remains `/product/[slug]`.
- URL filters: `q`, `category`, `featured=1`, `range`, `currency`, `min_price`,
  `max_price`, `sort` (`newest`, `name-asc`, `name-desc`, `price-asc`,
  `price-desc`), and `page`. Pagination retains active constraints. Price sorting
  is offered only when currency is explicit. Price ranges are optional bilingual
  theme settings with ISO 4217 currency and nullable inclusive bounds; none are
  preconfigured by code. A selected range fixes its currency and bounds. Price
  filters exclude null-priced products. No currency conversion is performed.
- Occasion and recipient routes are backed by theme-configured mappings to an
  active category; they do not constitute product-level taxonomies. The occasion
  landing may use optional bilingual theme editorial intro. Missing mappings or
  inactive category targets return not-found. Category, occasion, and recipient
  membership is exactly that configured category membership, not inferred
- Search covers English/Bangla product title and description, category name
  through the joined relation, and configured occasion/recipient labels by
  resolving their existing category mappings into the backend query.
- Backend query filters are category, featured, currency/price, title/description
  search, and sort. Availability remains restricted to publicly available active
  products in active categories by query and RLS. No favorites, tags, maker,
  personalization, material, or style facet exists. Listing pages use server-side
  count and 12-item pagination; no client-only partial-page filtering is used.
- Cards retain a 4:3 image, show a gallery hover/focus image only when an
  alternate image exists, honor reduced-motion preferences, and show configured
  category, featured badge, actual price/currency, and compare-at price only when
  greater. No favorite action is shown. Cards link by keyboard-accessible product
  anchors. Missing images and prices retain their established fallbacks.
- Shared discovery listing provides breadcrumbs, count, responsive controls/grid,
  and an empty result with filter/search guidance. Search is URL-submitted (not
  debounced) and has a clear action; empty query shows the catalog rather than
  issuing per-keystroke requests. Existing public loading and retryable error
  boundaries apply to routes. Search pages currently query product titles and
- Search combines title/description/category-name OR conditions with configured
  guide-category membership in one backend query, so count and pagination apply to
  the same result set. Guide membership is considered only when the query matches
  a configured bilingual guide label.

## Phase 5 product detail (October 7, 2026)

- Product detail at `/product/[slug]` presents breadcrumbs, a responsive editorial
  gallery, localized title/description/price, availability state, existing contact
  methods, and meeting-request CTA. `/book-a-meeting`, phone, WhatsApp, and email
  actions are preserved; no cart, quantity, checkout, or payment system exists.
- `ProductGallery` supports main and thumbnail selection, native-dialog larger
  preview with Escape/close handling and focus return, deduplicated image paths, and
  an accessible no-image/failed-image fallback. Image containers reserve a square
  aspect ratio to prevent layout shift. Product descriptions use a native disclosure
  element and all new controls have English/Bangla labels.
- Same-category products are queried under the same active/available public catalog
  constraints, with featured products used only to fill remaining related slots.
  The current product and duplicate recommendations are excluded. Ratings, reviews,
  specifications, personalization fields, inventory counts, and product-specific
  delivery/pickup claims are not modeled and are not fabricated. Generic delivery
  copy only invites customers to discuss arrangements with the team.
- Product JSON-LD contains supported product name, description, images, category,
  identifier, and an Offer only when an actual price exists. Availability reflects
  the current public available-product query. No aggregate rating/review data is
  emitted. Missing/invalid and unavailable products remain not-found under the
  existing catalog query and Supabase RLS rules.
- Recently viewed history is intentionally omitted; the application has no consent,
  retention, or privacy behavior for browsing-history persistence.

## Phase 6 contact and booking (October 7, 2026)

- `/contact` presents configured phone, WhatsApp, email, bilingual contact copy, and
  configured address only. Header/footer contact links now point there; the homepage
  `#contact` section remains intact for existing deep links. Business hours and
  service area are not represented in the settings schema, so the contact page asks
  visitors to inquire rather than inventing either.
- Booking retains `/api/meeting-requests`, the existing `meeting_requests` schema,
  server-side date/time and input validation, timezone conversion, honeypot, unique
  duplicate key, privileged server-only insert, and pending status. No email sender
  or notification service currently exists. Meeting type is stored as a bilingual
  label in the existing message, not a new database field.
- Product booking links pass only the product slug. The booking page and API resolve
  it independently with `getPublicProductBySlug`, so product names shown/stored are
  sourced from public active/available catalog data. Invalid or unavailable product
  references are rejected by the API; admin-only product data is never selected.
  Product type and requirements are included in the existing message, subject to the
  existing 5,000-character limit.
- The form has localized choice labels, bilingual future-date/client feedback,
  server feedback, keyboard focus to the validation summary, autocomplete/input
  hints, a pending-disabled submit button, and an in-memory confirmation summary.
  Confirmation explicitly remains a request until the business responds. No
  meeting availability/schedule is promised. The hidden honeypot is preserved.
- `TURNSTILE_SECRET_KEY` remains fail-closed when configured without token support;
  no secret is exposed to the client, and authorization/RLS are unchanged.
- Browser/mobile visual checks and the authorized database test request were not
  run because this workspace's credentials target an unidentified
  hosted Supabase project; localhost `NEXT_PUBLIC_SITE_URL` is insufficient proof
  that database writes are non-production. No test row was inserted or deleted.

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

The six migrations are applied in filename order: initial schema/RLS; image
storage; corrected public-read policies; gallery-validator grant; custom themes;
and optional product pricing.

The initial migration creates:

- `profiles`: Auth-linked profile with `role` defaulting to `user`.
- `categories`: unique slug, bilingual names/descriptions/SEO, active flag,
  sort order, and image fields.
- `products`: required category, unique slug, bilingual fields, active/available/
  featured flags, sort order, image path, `gallery_images` JSONB, and optional
  `price`, `compare_at_price`, and `currency_code` fields from the pricing migration.
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

Phase 8 keeps that persistence mechanism and aligns the public layout, server
routes, document language, and client provider to the effective language: a valid
`shudha-language` cookie takes precedence over the configured site default. Client
local storage restores the same preference after hydration. Catalog, search,
category, product, contact, and booking UI copy uses translation keys; product and
category records continue to use `localizedValue` with the English fallback only
when the requested bilingual field is empty.

Themes are defined in `src/lib/theme.ts` and constrained by the database and Zod
schema to:

```text
everyday, wedding, festival
```

The public layout writes the selected theme to `data-theme`. CSS variables and
theme selectors live in `src/app/globals.css`. Theme changes are administrator-
only and revalidate the public layout.

Phase 8 adds token-driven contrast protection for the primary button color,
comfortable Bengali line height and wrapping, consistent card-height behavior,
shared focus styles, reduced-motion handling, and safer image fallback behavior.
The three seeded palettes pass the implemented normal-text white-on-primary
contrast checks. No schema migration or live data write was used. Browser matrix
verification is still not available in this repository; automated Phase 8 tests
cover language resolution, translation usage, palette contrast values, theme
activation wiring, and responsive/polish conventions.

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

## Phase 9 quality pass

Phase 9 added a focused quality regression suite at
`tests/phase9-quality.test.mjs`. It verifies accessible booking-field validation
state (`aria-invalid` and `aria-describedby`), mobile keyboard hints, localized
catalog navigation/sorting labels, environment-backed metadata configuration,
server-aligned public language initialization, and the existing reduced-motion,
keyboard-menu, image-dialog, and wrapping safeguards.

The final static test suite passed **27/27 tests**, including **4/4 Phase 9
tests**. The production build compiled successfully, completed TypeScript
checking during the build, and generated all application routes. Targeted
Prettier formatting for Phase 9 files passed, and `git diff --check` reported no
whitespace errors; Git's LF/CRLF normalization warnings are not source errors.

The Phase 9 implementation also associates booking validation messages with
their controls, localizes the catalog breadcrumb and sort label, initializes the
public language provider with the server-resolved language, enables optimized
category images for configured Supabase storage URLs, and uses
`NEXT_PUBLIC_SITE_URL` as the root metadata base when configured.

Responsive review covered the source-level safeguards for 320px, 375px, 414px,
tablet, 1024px, desktop, and large-desktop layouts: flexible grids, wrapping
bilingual content, minimum touch targets, mobile menu focus trapping/Escape
close behavior, reserved image aspect ratios, and reduced-motion CSS. A full
browser viewport matrix was not executed because the repository has no browser
automation dependency or test suite. Microsoft Edge is installed locally, but a
repeatable automated Edge harness is not part of the project.

There is no live Supabase integration test suite; no production account,
meeting request, storage object, or database record was changed during Phase 9.
Sitemap and robots routes remain absent, as documented above. The repository-wide
format check continues to flag the existing `src/app/globals.css` line-1
formatting issue; it was not introduced by Phase 9.

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
