# Storefront Restructure Audit and Plan

**Phase 1 scope:** audit and planning only. No route, component, styling, database,
or behavior changes are part of this phase. This document records the repository
state inspected on October 7, 2026. Verify the source again before implementation.

## 1. Current architecture

- **Framework:** Next.js 16.3.8 App Router, React 19.2.8, strict TypeScript,
  Tailwind CSS 4. Root scripts include `dev`, `build`, `start`, `lint`,
  `typecheck`, `test`, and Prettier formatting/checks.
- **Application entry points:** `src/app/layout.tsx` is the root HTML layout and
  loads global CSS/language context. `src/app/(public)/layout.tsx` loads database
  site settings, applies the public theme and CSS variables, and renders storefront
  header/footer and skip link. `src/app/admin/` contains the separate admin route
  tree. `src/app/api/` contains route handlers. `src/proxy.ts` refreshes Supabase
  auth sessions; it is not the admin authorization boundary.
- **Data services:** public catalog queries are in `src/lib/catalog.ts`; admin
  catalog/theme queries are in `src/lib/admin-catalog.ts` and
  `src/lib/admin-themes.ts`; settings are loaded by `src/lib/site-settings.ts`;
  meetings by `src/lib/meetings.ts`. Supabase browser, request-aware server, and
  privileged server clients are separated in `src/lib/supabase/`.
- **Persistence/security:** Supabase Postgres and Storage are defined/configured
  with versioned migrations in `supabase/migrations/`. RLS policies protect
  public reads and administrator writes. Zod schemas validate environment,
  admin input, theme values, and meeting submissions.
- **Styling:** `src/app/globals.css` contains global base rules, theme tokens, and
  storefront-scoped editorial rules. Public theme styling is scoped under
  `.public-theme`; admin styling is not intended to inherit storefront styling.
- **Tests:** `tests/` uses Node's built-in test runner for source-level regression
  checks. These do not substitute for browser or live Supabase tests.

## 2. Existing public routes

Route groups in parentheses are organizational and do not appear in URLs.

| URL                | App Router file                             | Current purpose                                                                        |
| ------------------ | ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `/`                | `src/app/(public)/page.tsx`                 | Home, featured products/categories, contact section; theme-managed hero content.       |
| `/products`        | `src/app/(public)/products/page.tsx`        | Search/filter/paginated catalog; query parameters include `q`, `category`, and `page`. |
| `/category/[slug]` | `src/app/(public)/category/[slug]/page.tsx` | Active category and its available products.                                            |
| `/product/[slug]`  | `src/app/(public)/product/[slug]/page.tsx`  | Active/available product detail and contact/meeting actions.                           |
| `/book-a-meeting`  | `src/app/(public)/book-a-meeting/page.tsx`  | Meeting request form and business contact/timezone details.                            |

Public loading and error boundaries are in `src/app/(public)/loading.tsx` and
`error.tsx`. There are no dedicated `/about`, `/contact`, `/search`, `/shop`,
occasion, recipient, price-range, or curated collection routes at audit time.
Contact content is currently a home-page section, not a standalone route.

## 3. Existing admin routes

| URL                           | Purpose/access                                                     |
| ----------------------------- | ------------------------------------------------------------------ |
| `/admin/login`                | Supabase email/password sign-in.                                   |
| `/admin`                      | Protected dashboard.                                               |
| `/admin/unauthorized`         | Authenticated account without admin role.                          |
| `/admin/categories`           | Protected category list.                                           |
| `/admin/categories/new`       | Protected category creation.                                       |
| `/admin/categories/[id]/edit` | Protected category editing and image management.                   |
| `/admin/products`             | Protected product list.                                            |
| `/admin/products/new`         | Protected product creation.                                        |
| `/admin/products/[id]/edit`   | Protected product editing and image/gallery management.            |
| `/admin/meetings`             | Protected meeting review/status management; `status` query filter. |
| `/admin/themes`               | Protected theme management.                                        |
| `/admin/themes/new`           | Protected theme creation.                                          |
| `/admin/themes/[id]/edit`     | Protected theme editing.                                           |
| `/admin/settings`             | Legacy route redirects to `/admin/themes`.                         |

Admin loading/error boundaries are in `src/app/admin/loading.tsx` and `error.tsx`.
Admin JSON endpoints are under `/api/admin/`; the public meeting submission
endpoint is `POST /api/meeting-requests`.

## 4. Existing data entities and fields

Fields below summarize the SQL migrations and application types; nullable fields
are indicated where applicable. Timestamps and constraints are noted where useful.

- **`profiles`** (linked to Supabase Auth): `id`, nullable `display_name`,
  `role` (`user` or `admin`), `created_at`, `updated_at`.
- **`categories`**: `id`, unique `slug`, `name_en`, `name_bn`, nullable
  `description_en`, `description_bn`, `seo_title_en`, `seo_title_bn`,
  `seo_description_en`, `seo_description_bn`, `is_active`, `sort_order`,
  nullable `image_path`, `image_alt_en`, `image_alt_bn`, timestamps.
- **`products`**: `id`, required `category_id`, unique `slug`, `name_en`,
  `name_bn`, nullable `description_en`, `description_bn`, `seo_title_en`,
  `seo_title_bn`, `seo_description_en`, `seo_description_bn`, `is_active`,
  `is_available`, `is_featured`, `sort_order`, nullable `main_image_path`,
  `main_image_alt_en`, `main_image_alt_bn`, `gallery_images` JSONB (array of
  image objects with path and optional bilingual alt text/dimensions), timestamps.
- **`meeting_requests`**: `id`, `name`, `phone`, nullable `email`, `preferred_at`,
  nullable `message`, `submission_language` (`en`/`bn`), `status` (`pending`,
  `confirmed`, `completed`, `cancelled`, `rejected`), nullable `admin_notes`,
  nullable `assigned_to`, unique `submission_key`, timestamps.
- **`site_settings`** (boolean singleton): bilingual business name, address and
  contact descriptions; nullable phone, WhatsApp, email and addresses;
  `business_timezone`, `default_language` (`en`/`bn`), legacy `active_theme`,
  nullable `active_theme_id`, timestamps.
- **`site_themes`**: `id`, `name`, unique `slug`, JSONB `colors`, JSONB `content`
  (bilingual hero/section copy and tags), nullable logo/background/hero image
  paths, nullable bilingual logo alt text, timestamps. Theme content/colors are
  schema-validated; active theme is administered.
- **No current data entities:** price, occasion, recipient, and curated
  collections are not represented by the audited schema/query/types. Do not
  imply those facets exist just because their routes are proposed.
- **Application types:** `src/types/catalog.ts` models `Category`, `Product`,
  `GalleryImage`, and paginated `ProductPage`; `src/types/meetings.ts` models
  meeting statuses/requests; `src/types/domain.ts` defines `SupportedLanguage`.

## 5. Existing reusable components

- **Public shell/UI:** `Header`, `Footer`, `PageContainer`, `ContactActions`,
  `ProductCard`, `ProductGrid`, `CatalogControls`, `Pagination`,
  `MeetingRequestForm`, `LanguageProvider`, and `LanguageSwitcher`.
- **Admin UI:** `CatalogForm`, `ImageManager`, `DeleteButton`,
  `AdminLogoutButton`, `MeetingStatusForm`, `ThemeForm`, and
  `ThemeActivateButton`.
- **Shared data/helpers:** `src/lib/catalog.ts`, `admin-catalog.ts`,
  `site-settings.ts`, `admin-themes.ts`, `meetings.ts`; localized value/translation
  helpers; image URL helpers; Supabase client factories; validation schemas.
- **Boundary/layout components:** root and public/admin layouts plus route-level
  loading/error boundaries. The existing public layout is the natural place to
  preserve the common storefront shell during route organization.

## 6. Existing risks and constraints

1. **Do not invent unsupported merchandising.** There are no price, occasion,
   recipient, or curated-collection fields/tables. Related routes require a
   defined, admin-manageable content model and query semantics before they can
   show real results. Deriving occasions/recipients from category names would be
   an unverified assumption.
2. **Route changes affect links and SEO.** Existing public URLs are `/products`
   and `/category/[slug]`; requested targets introduce `/shop` and
   `/shop/category/[slug]`. Preserve old URLs with redirects or aliases and
   verify canonical metadata/internal links before removing any route.
3. **Admin contract is protected.** Every admin page/mutation must retain
   `requireAdmin()` or equivalent authorization; RLS and server-only privileged
   credentials remain security boundaries. `src/proxy.ts` only refreshes auth
   session state.
4. **Keep public catalog filtering.** Public products must be active, available,
   and attached to active categories. Keep pagination bounds, bilingual search,
   not-found behavior, and safe query handling.
5. **Images are managed content.** Storage buckets are public for display, while
   upload/delete and database image-reference changes are admin constrained.
   Preserve JPEG/PNG/WebP and 5 MiB validation, product gallery cap, entity-scoped
   safe paths, alt text, and cleanup/error handling. Public display currently uses
   `next/image` with `unoptimized`; theme/admin forms also use native `<img>`.
6. **Translations are coupled across server/client.** English/Bengali are
   supported via `LanguageProvider`, local storage/cookie, server preference,
   translation dictionaries, and bilingual database content. Add route labels,
   metadata, empty/error states, and accessible names in both languages.
7. **Theme values are admin-driven.** Preserve the selected custom theme, its
   CSS variables, theme images/content, public scope, and admin isolation.
8. **Meeting workflow is not checkout or confirmed scheduling.** The booking form
   posts to `/api/meeting-requests`; server validation checks business timezone,
   future date, honeypot and duplicate key, then inserts pending via a privileged
   server client. A configured Turnstile secret currently blocks submission with
   `503` because token verification is incomplete. Booking UX/route work must not
   suggest appointments are confirmed immediately.
9. **No commerce features exist.** No cart, payment, order, inventory transaction,
   or customer account is present. Do not introduce them as part of route
   restructuring without a separately approved scope and data/security design.
10. **Responsive/accessibility baseline matters.** Preserve mobile navigation,
    focus visibility, labels, skip link/`main-content`, status announcements,
    loading/error states, and external-link safety. Check Bengali text and small
    viewports in browser testing; current static tests do not cover visual layout.
11. **Working tree is not pristine.** At audit, prior storefront changes were
    modified in public pages/components, `globals.css`, and tests; an existing
    modification to `src/app/admin/page.tsx` is also present. Avoid overwriting
    unrelated or pre-existing changes during implementation. No changes were
    made to those files in this audit phase.

## 7. Proposed new route structure

Use Next.js App Router filesystem routing and route groups (parentheses do not
change URLs). Proposed target URLs, conditional on compatible data/content:

```text
src/app/(storefront)/page.tsx                         -> /
src/app/(storefront)/shop/page.tsx                    -> /shop
src/app/(storefront)/shop/category/[slug]/page.tsx    -> /shop/category/[slug]
src/app/(storefront)/shop/occasion/[slug]/page.tsx    -> /shop/occasion/[slug]
src/app/(storefront)/shop/recipient/[slug]/page.tsx   -> /shop/recipient/[slug]
src/app/(storefront)/shop/price/[range]/page.tsx      -> /shop/price/[range]
src/app/(storefront)/product/[slug]/page.tsx          -> /product/[slug]
src/app/(storefront)/search/page.tsx                  -> /search
src/app/(storefront)/collections/[slug]/page.tsx      -> /collections/[slug]
src/app/(storefront)/about/page.tsx                   -> /about
src/app/(storefront)/contact/page.tsx                 -> /contact
src/app/(storefront)/book-a-meeting/page.tsx           -> /book-a-meeting
src/app/admin/...                                     -> /admin and existing admin URLs
src/app/api/...                                       -> existing API URLs
```

The current public route group is `(public)`; renaming it to `(storefront)` is
optional, not a prerequisite. Keep `/admin` and `/api` outside the storefront
shell. Initially retain compatibility for `/products` and `/category/[slug]`
through redirects or thin aliases to `/shop` and `/shop/category/[slug]`;
preserve `/product/[slug]` and `/book-a-meeting`. Decide redirect permanence and
canonical URLs with SEO review.

`/shop` can initially host the existing searchable/filterable catalog, and
`/search` can reuse its search behavior. `/shop/category/[slug]` can reuse current
category queries. Occasion, recipient, price, and curated collection routes are
**conditional**: first establish whether admin-managed theme/category/product
content can express them adequately, or define/administer suitable data. Until
then, omit these links or show only honest, backed content—never hard-code
marketplace features or fabricate product facets. `/about` and `/contact` likewise
need approved content sources; contact details can draw from current settings.

## 8. Proposed component structure

Keep server data access and server-rendered route composition as the default;
make only interactive controls client components. Reuse current components
before extracting new abstractions.

```text
src/components/storefront/
  StorefrontHeader       (evolve public Header; navigation/search/language)
  StorefrontFooter       (evolve public Footer; settings-driven contact)
  StorefrontShell        (theme, skip link, header/footer; likely current public layout)
  PageContainer          (retain shared responsive width wrapper)
  ProductCard            (retain; localized image/title/detail link)
  ProductGrid            (retain)
  CatalogFilters         (evolve CatalogControls; only supported facets)
  Pagination             (retain)
  ProductGallery         (possible extraction if interactions justify it)
  ContactActions         (retain)
  MeetingRequestForm     (retain and preserve API contract)
src/components/admin/    (retain existing admin forms and controls)
src/lib/catalog.ts       (extend only for backed query/data requirements)
src/lib/i18n/            (retain shared language cookie, translations, helpers)
src/lib/theme.ts         (retain theme schema and token contract)
```

Avoid creating one-off abstractions for every static section. Keep admin visual
components separate from storefront-specific typography/surfaces. New reusable
components should have clear server/client boundaries and accessible responsive
behavior.

## 9. Proposed implementation order

1. **Baseline and inventory:** capture current routes, status, links, screenshots
   at mobile/desktop sizes, and run tests/typecheck/lint/build; preserve unrelated
   working-tree changes. This phase's audit is the prerequisite, not redesign.
2. **Content/data decision:** map target facets to existing admin-controlled
   fields. For unsupported occasion/recipient/price/collection concepts, agree a
   minimal admin-editable model before implementing routes. Add versioned
   migrations, Zod validation, API/admin controls, types and RLS only if needed.
3. **Route compatibility:** introduce `/shop` and `/shop/category/[slug]` using
   existing catalog query functions; retain old route behavior via redirects or
   aliases and update canonical metadata/internal links deliberately.
4. **Search and backed discovery routes:** consolidate search under `/search` and
   build occasion/recipient/price/collections only after their data contracts
   exist. Provide empty/not-found/loading states and bilingual metadata.
5. **Informational routes:** build `/about` and `/contact` from explicitly
   approved/database-backed content; keep booking separate and preserve settings.
6. **Product/home composition:** align `/`, product detail, cards, galleries and
   navigation with the approved editorial design while reusing data and admin
   content, without adding commerce behaviors.
7. **Responsive/accessibility pass:** verify English/Bengali, keyboard/mobile
   navigation, image alternatives, focus, forms, loading/error states and theme
   variants at real viewport sizes.
8. **Regression/SEO/security validation:** run tests, lint, typecheck, formatting,
   production build; check canonical/redirect behavior, RLS/auth and Storage
   flows. Use a non-production Supabase account for live workflow checks.

## 10. Features that must not regress

- Current public products/categories remain driven by admin-managed Supabase data;
  inactive/unavailable content remains excluded as currently specified.
- Product/category slug routes, detail content, bilingual names/descriptions/SEO,
  canonical metadata, search/filter/pagination, featured products and not-found
  behavior remain valid during migration.
- Admin category/product CRUD, active/available/featured/order controls, image
  management, theme management, and meeting review/status controls remain intact.
- `/admin` authorization, login/logout, unauthorized handling, `requireAdmin()`,
  RLS, server-only secrets, and safe admin Storage mutations remain intact.
- English/Bengali switching and persistence, localized database fields, theme
  selection/content/assets, business settings, contact details and timezone remain
  intact.
- Meeting form/API validation, future-time and timezone conversion, honeypot,
  pending status, idempotent duplicate handling, and truthful “request, not
  confirmed appointment” messaging remain intact.
- Product/category/theme images retain storage path safety, alt text, file type/
  size limits, gallery bounds and failure cleanup.
- Responsive layout, mobile menu, keyboard focus, skip link, semantic headings,
  associated form labels, accessible async feedback, loading/error boundaries,
  contact links and external-link protections remain intact.
- Do not add cart, payment, order, inventory or customer-account claims/features
  without separately scoped product, data, security and operational work.
