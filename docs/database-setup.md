# Supabase setup

This guide applies the six migrations currently used by the application. Apply
them in filename order:

1. `supabase/migrations/20261006000100_initial_schema.sql`
2. `supabase/migrations/20261006000200_image_storage.sql`
3. `supabase/migrations/20261006000300_fix_public_read_policies.sql`
4. `supabase/migrations/20261006000400_grant_gallery_validator.sql`
5. `supabase/migrations/20261006000500_custom_themes.sql`
6. `supabase/migrations/20261007000100_product_pricing.sql`

The first migration creates the relational schema, functions, triggers, grants,
RLS policies, and the singleton site-settings row. The second migration adds
catalog image metadata, creates the two public image buckets, and adds
administrator-only Storage policies. The third migration separates anonymous
public-read policies from authenticated administrator-read policies so public
visitors do not need to execute the private administrator helper.
The fourth migration grants authenticated users permission to evaluate the
product gallery validator during product inserts and updates; product RLS
authorization is unchanged.
The fifth migration adds editable saved themes, seeds the Everyday, Wedding, and
Festival presets, adds the active-theme reference, creates the public
`theme-images` bucket, and restricts theme management to administrators. The sixth
migration adds nullable product pricing, compare-at pricing, and the default USD
currency code; it must be applied before deploying code that selects those columns.

## Prerequisites

- A Supabase project.
- Access to the Supabase Dashboard SQL Editor, or the Supabase CLI.
- Permission to manage database schema, Auth users, and Storage.
- A local `.env.local` based on the repository `.env.example`.

Never put database passwords, access tokens, publishable keys, or server-only
keys in committed documentation or migration files.

## Option A: Supabase Dashboard SQL Editor

1. Open the Supabase Dashboard and select the intended project.
2. Open **SQL Editor** and create a new query.
3. Copy the complete contents of
   `supabase/migrations/20261006000100_initial_schema.sql` into the query.
4. Run it once.
5. Create another SQL Editor query.
6. Copy the complete contents of
   `supabase/migrations/20261006000200_image_storage.sql` into the query.
7. Run it after the initial migration succeeds.
8. Create another SQL Editor query.
9. Copy the complete contents of
   `supabase/migrations/20261006000300_fix_public_read_policies.sql` into the query.
10. Run it after the image migration succeeds.
11. Create another SQL Editor query.
12. Copy the complete contents of
    `supabase/migrations/20261006000400_grant_gallery_validator.sql` into the query.
13. Run it after the public-read policy migration succeeds.
14. Create another SQL Editor query.
15. Copy the complete contents of
    `supabase/migrations/20261006000500_custom_themes.sql` into the query.
16. Run it after the gallery-validator migration succeeds.
17. Create another SQL Editor query.
18. Copy the complete contents of
    `supabase/migrations/20261007000100_product_pricing.sql` into the query.
19. Run it after the custom-themes migration succeeds.
20. Confirm the tables, buckets, functions, grants, and policies listed below.

The migrations use `if exists`, `if not exists`, and policy replacement patterns
for their owned objects. Do not edit an applied production migration. Add a new
timestamped migration for future schema changes.

## Option B: Supabase CLI

From the project root:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

For a new local Supabase workspace:

```powershell
supabase init
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

The repository contains migration files but does not require committing local
Supabase credentials or generated secret configuration.

For local development, use:

```powershell
supabase start
supabase db reset
```

`supabase db reset` reapplies the migrations to the local database and can erase
local data. Do not run it against a production project.

## Created database objects

### Tables

- `public.profiles` — one profile per `auth.users` record; roles are `user` or
  `admin`.
- `public.categories` — bilingual categories with unique slugs, visibility, SEO,
  ordering, and optional image metadata.
- `public.products` — bilingual products linked to one category, with active,
  available, featured, ordering, SEO, main image, and gallery fields.
- `public.meeting_requests` — public meeting submissions plus private admin
  workflow fields and a unique duplicate-submission key.
- `public.site_settings` — boolean singleton containing business contact data,
  timezone, default language, and active theme.
- `public.site_themes` — administrator-managed color, image, and bilingual
  homepage-content configurations. Only the active theme is publicly readable.

### Functions and triggers

- `private.set_updated_at()` updates timestamps.
- `private.is_valid_gallery_images(jsonb)` validates gallery structure.
- `private.is_admin(uuid)` is a restricted `SECURITY DEFINER` authorization
  helper.
- `public.handle_new_user()` creates a non-admin profile after Auth signup.
- Update triggers exist for the five public tables.

### Storage buckets

The image migration creates these public buckets:

- `product-images`
- `category-images`

The application accepts JPEG, PNG, and WebP files, with a 5 MiB limit and a
maximum of ten gallery images per product. Public image URLs are used for public
catalog rendering, but Storage insert/update/delete policies require an admin.

## Row Level Security behavior

RLS is enabled on all public application tables. Important behavior:

- Anonymous and authenticated visitors can read active categories.
- Anonymous and authenticated visitors can read products only when the product
  is active and available and its category is active.
- Authenticated administrators can additionally read inactive categories and
  unavailable products through a separate administrator-only read policy.
- Only administrators can create, update, or delete categories and products.
- Only administrators can read or update meeting requests through the normal
  Supabase client.
- The public meeting endpoint uses the server-only admin client only after
  validation, future-date checks, honeypot checks, and duplicate-key generation.
- Public users can read the singleton site settings row.
- Only administrators can change site settings.
- Public users can read only the active row in `site_themes`; administrators can
  manage every saved theme.
- Storage mutations are restricted to administrators by `private.is_admin`.

RLS is the database authorization boundary. Page-level checks and hidden UI
controls are not sufficient protection.

The gallery validator also requires an `EXECUTE` grant for `authenticated` so
the database can evaluate the product constraint during admin writes. This grant
does not grant product insert or update access; those operations remain protected
by the product RLS policies.

## Site settings defaults

The initial row uses these safe application defaults:

- `default_language`: `en` or `bn`
- `active_theme`: legacy preset slug, kept for compatibility
- `active_theme_id`: foreign key to the active `site_themes` row
- `business_timezone`: initially `Asia/Dhaka`

The current admin settings page changes only the active theme. Complete business
name and contact fields through a controlled SQL operation or a future settings
feature, after reviewing the relevant RLS and operational permissions.

## Custom theme workflow

After applying the fifth and sixth migrations, open `/admin/themes` to create, edit, activate,
and delete themes. Save a theme before uploading its logo, background, or hero
image. Images use the public `theme-images` bucket and accept JPEG, PNG, and WebP
files up to 5 MiB. The active theme cannot be deleted.

Theme colors are stored as validated hex values. Theme homepage writing supports
English and Bangla overrides; empty overrides fall back to the application’s
translated defaults. Product, category, contact, and meeting data remain separate
from themes.

## Verification queries

Confirm the tables:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'profiles',
    'categories',
    'products',
    'meeting_requests',
    'site_settings',
    'site_themes'
  )
order by table_name;
```

Confirm RLS:

```sql
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'categories',
    'products',
    'meeting_requests',
    'site_settings'
  )
order by tablename;
```

Confirm settings:

```sql
select id, business_name_en, business_name_bn, business_timezone,
       default_language, active_theme
from public.site_settings;
```

Confirm image buckets:

```sql
select id, name, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('product-images', 'category-images', 'theme-images')
order by id;
```

Confirm policies:

```sql
select policyname, schemaname, tablename, roles, cmd
from pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, policyname;
```

## Security notes

- Never expose `SUPABASE_SECRET_KEY` in browser code or a `NEXT_PUBLIC_*`
  variable.
- Do not grant anonymous insert access to `meeting_requests`.
- Do not promote a role from user-controlled metadata or a public API.
- Use a new migration for every later schema change.
- Restrict Supabase Dashboard and SQL Editor access to trusted operators.
- Back up production data before destructive schema or data operations.
