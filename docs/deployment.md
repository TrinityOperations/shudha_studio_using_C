# Deployment

Shudha Studio is a Next.js App Router application with server-rendered pages,
API routes, Supabase Auth cookies, and a server-only meeting insertion path. It
must be deployed to a runtime that supports Next.js server execution; it is not
a static-only export.

## Deployment prerequisites

Before deploying, complete these tasks:

1. Create or select the production Supabase project.
2. Apply all five migrations in
   [`database-setup.md`](database-setup.md).
3. Verify RLS, Storage buckets, and the singleton `site_settings` row.
4. Create and promote at least one administrator using
   [`admin-user-setup.md`](admin-user-setup.md).
5. Prepare the production environment variables from `.env.example`.
6. Decide the production business timezone and confirm it in `site_settings`.

## Production environment variables

Configure these in the hosting provider's server/project settings, not in the
repository:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SECRET_KEY`

`NEXT_PUBLIC_SITE_URL` must be the exact public origin, including the scheme and
without a path suffix. Do not use a local development URL in production.

Leave `TURNSTILE_SECRET_KEY` unset. The current form does not send a Turnstile
token; setting this variable causes the meeting endpoint to return `503` by
design. Add Turnstile only together with the corresponding form/token
implementation and verification changes.

## Build and start

Install dependencies and validate locally:

```powershell
npm ci
npm run lint
npm run typecheck
npm test
npm run format:check
npm run build
```

Start the production server with:

```powershell
npm run start
```

The hosting platform should run `npm run build` during deployment and
`npm run start` or its equivalent for the resulting Next.js server.

## Vercel-style deployment checklist

For a managed Next.js host such as Vercel:

1. Import the repository.
2. Use the repository root as the project root.
3. Use the default Next.js build detection, or set the build command to
   `npm run build`.
4. Add the production environment variables for the correct deployment scope.
5. Deploy a preview first.
6. Run the post-deployment checks below.
7. Promote the verified preview to production.

The exact provider UI and deployment settings can change. The application-level
requirements above are the source of truth.

## Supabase Auth URL configuration

In Supabase Dashboard **Authentication > URL Configuration**:

- Set the Site URL to the deployed public origin.
- Add the deployed origin to allowed redirect URLs if required by the selected
  Auth configuration.
- Add preview origins only when they are controlled and needed.

The current login flow redirects to `/admin` after successful sign-in and does
not implement an arbitrary user-controlled return URL.

## Post-deployment verification

Run these checks against the deployed origin:

1. Open `/` and confirm site settings load.
2. Open `/products` and confirm the catalog responds.
3. Switch between English and Bengali.
4. Open `/admin/themes`, create/edit a test theme, and activate it.
5. Sign in at `/admin/login` with the promoted administrator.
6. Create and edit a test category and product.
7. Upload and remove a test image in each required bucket.
8. Submit one future meeting request with `TURNSTILE_SECRET_KEY` unset.
9. Change its status from `/admin/meetings`.
10. Confirm unauthenticated access redirects away from admin pages.
11. Review server logs for environment-validation or Supabase errors.

Use a controlled test record and remove it after verification if production
policy permits. Do not use real customer information for smoke tests.

## Rollback and migration safety

- Keep the previous deployment available until the new deployment passes smoke
  checks.
- Do not edit an already-applied migration in place.
- Add a new migration for schema changes and test it against a staging project.
- Back up production data before destructive operations.
- If an application rollback requires a database rollback, confirm compatibility
  between the old application and current schema before reverting code.
