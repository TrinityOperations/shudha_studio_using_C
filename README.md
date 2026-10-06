# Shudha Studio

Shudha Studio is a bilingual, mobile-first gift catalog and meeting-request
application built with Next.js, TypeScript, Tailwind CSS, and Supabase.

The application includes a public catalog, Bengali/English language switching,
three selectable visual themes, administrator authentication, category and
product CRUD, catalog image management, and a meeting-request workflow.

## Features

- Public home page, product catalog, category pages, product detail pages, and
  meeting-request page.
- English and Bengali UI/content support.
- Language persistence through browser storage and the `shudha-language` cookie.
- `everyday`, `wedding`, and `festival` site themes managed from the admin area.
- Supabase email/password authentication for administrators.
- Role-based administrator authorization through `public.profiles.role`.
- Category and product creation, editing, activation, availability, featuring,
  ordering, and deletion.
- Product main images, category images, and product galleries stored in Supabase
  Storage.
- Future-date meeting requests with timezone-aware conversion, honeypot spam
  protection, duplicate-submission detection, and administrator status updates.
- Dynamic product/category metadata and canonical paths.
- Loading and error boundaries for public and admin experiences.

## Technology

- Next.js App Router 16
- React 19
- TypeScript with strict checking
- Tailwind CSS 4
- Supabase SSR and browser clients
- Zod environment and request validation
- ESLint 9
- Prettier with Tailwind class sorting
- Node's built-in test runner for static regression checks

## Prerequisites

- Node.js 20 or newer.
- npm.
- A Supabase project for local runtime use.
- Supabase CLI only if you want to apply migrations through the CLI.

The repository does not contain a browser test framework or live Supabase test
credentials. The included tests verify source-level invariants; they do not
replace authenticated browser or database integration testing.

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy the environment template:

   ```powershell
   Copy-Item .env.example .env.local
   ```

3. Fill `.env.local` with values from the intended Supabase project. Use the
   project URL and publishable key for public variables, and keep the server-only
   secret key out of browser code and source control.

4. Apply the database migrations in order. See
   [`docs/database-setup.md`](docs/database-setup.md).

5. Create and promote an administrator. See
   [`docs/admin-user-setup.md`](docs/admin-user-setup.md).

6. Start the development server:

   ```powershell
   npm run dev
   ```

7. Open `http://localhost:3000`.

The public site can render catalog pages only after the database contains the
singleton `site_settings` row created by the initial migration. Product and
category pages can be empty until content is added in the admin area.

## Environment variables

The exact variable names are documented in [`.env.example`](.env.example).

| Variable                               | Used by                       | Required        | Purpose                                                            |
| -------------------------------------- | ----------------------------- | --------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | Browser and server            | Yes             | Supabase project URL                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server            | Yes             | Public Supabase key                                                |
| `NEXT_PUBLIC_SITE_URL`                 | Server metadata/configuration | Yes             | Canonical application URL                                          |
| `SUPABASE_SECRET_KEY`                  | Server-only meeting insertion | Yes for runtime | Privileged Supabase key; never expose it                           |
| `TURNSTILE_SECRET_KEY`                 | Meeting API gate              | Normally omit   | If set, submissions return `503` until a form token is implemented |

Environment values are validated at runtime with Zod. Do not use empty strings
for required values, and do not put secrets in variables prefixed with
`NEXT_PUBLIC_`.

## Application routes

### Public routes

- `/` — home page and contact section.
- `/products` — searchable, filterable, paginated catalog.
- `/category/[slug]` — active category listing.
- `/product/[slug]` — active product detail page.
- `/book-a-meeting` — public meeting-request form.

### Admin routes

- `/admin/login` — email/password sign-in.
- `/admin` — administrator dashboard.
- `/admin/categories` — category management.
- `/admin/categories/new` — create a category.
- `/admin/categories/[id]/edit` — edit category and image.
- `/admin/products` — product management.
- `/admin/products/new` — create a product.
- `/admin/products/[id]/edit` — edit product and images.
- `/admin/meetings` — review and update meeting-request statuses.
- `/admin/themes` — create, edit, activate, and delete custom site themes.

### API routes

- `POST /api/meeting-requests` — validate and create a public meeting request.
- `POST /api/admin/categories` — create a category.
- `PATCH`/`DELETE /api/admin/categories/[id]` — modify or delete a category.
- `POST /api/admin/products` — create a product.
- `PATCH`/`DELETE /api/admin/products/[id]` — modify or delete a product.
- `PATCH /api/admin/images/[kind]/[id]` — update image references.
- `PATCH /api/admin/settings` — legacy preset activation endpoint retained for
  compatibility; the admin UI uses the custom theme endpoints.

Every admin page and admin mutation calls `requireAdmin()` or an equivalent
server/database authorization boundary. RLS remains the final data boundary.

## Development commands

```powershell
npm run dev          # Start the development server
npm run build        # Create a production build
npm run start        # Start the production server after build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript without emitting files
npm test             # Run static regression tests
npm run format       # Format the repository
npm run format:check # Verify Prettier formatting
```

Recommended verification before merging:

```powershell
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

## Project structure

```text
src/app/                 Next.js routes, layouts, pages, API handlers
src/components/          Public, admin, language, and shared UI components
src/lib/auth/            Server-side authentication and admin authorization
src/lib/i18n/            Language cookie, server preference, and translations
src/lib/supabase/        Browser, request-aware server, proxy, and admin clients
src/lib/validations/     Zod schemas and meeting date/time validation
src/types/               Domain and Supabase-facing TypeScript types
supabase/migrations/     Versioned schema, RLS, and Storage migrations
tests/                   Node test-runner static regression checks
docs/                    Setup, deployment, admin, and troubleshooting guides
```

## Security boundaries

There are three Supabase client contexts:

1. `src/lib/supabase/browser.ts` uses only public environment variables.
2. `src/lib/supabase/server.ts` is request-aware and uses cookies for the
   authenticated session.
3. `src/lib/supabase/admin.ts` uses the server-only secret key and is reserved
   for the narrowly scoped public meeting insertion flow.

Do not import the admin client into browser components, ordinary user actions,
or general catalog reads. Do not treat a hidden button or server page check as a
replacement for RLS and database policies.

## Documentation

- [`docs/database-setup.md`](docs/database-setup.md) — migrations, tables, RLS,
  Storage, and verification.
- [`docs/admin-user-setup.md`](docs/admin-user-setup.md) — create and promote an
  administrator safely.
- [`docs/deployment.md`](docs/deployment.md) — production deployment procedure.
- [`docs/troubleshooting.md`](docs/troubleshooting.md) — common setup and runtime
  failures.
- [`custom_context.md`](custom_context.md) — detailed handoff for future coding
  agents.

## Current limitations

- No browser automation suite is configured.
- No live Supabase integration test suite or committed test account exists.
- `TURNSTILE_SECRET_KEY` is intentionally not usable yet: if configured, the
  meeting API rejects submissions because the form does not send a Turnstile
  token.
- Sitemap and robots metadata routes are not present in the current application.
- The application depends on the Supabase migrations and environment variables
  being configured before meaningful runtime verification is possible.

See [`docs/troubleshooting.md`](docs/troubleshooting.md) before treating a local
build as proof of live database, authentication, upload, or responsive-browser
behavior.
