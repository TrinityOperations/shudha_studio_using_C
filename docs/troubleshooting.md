# Troubleshooting

## Environment validation fails

### Symptoms

- `Invalid environment configuration` appears in the terminal.
- Pages or middleware fail before rendering.
- The build fails while collecting page data.

### Checks

Confirm all required variables are present and nonempty:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
SUPABASE_SECRET_KEY
```

Check that URLs include `https://` or another valid URL scheme. Do not add the
server-only key under a `NEXT_PUBLIC_` name. Do not commit `.env.local`.

If `TURNSTILE_SECRET_KEY` is present, remember that it activates the current
unsupported Turnstile gate for meeting requests. Remove it unless the form has
also been updated to send and verify a token.

## Public pages fail to load

Confirm that:

1. The Supabase URL and publishable key belong to the intended project.
2. All five migrations have been applied in order.
3. The singleton `site_settings` row exists.
4. RLS policies were not removed or replaced incorrectly.
5. The deployment can reach Supabase over the network.

The public layout reads site settings on every dynamic request. A missing row or
Supabase error can therefore affect the entire public shell.

## `/admin/login` succeeds but `/admin` redirects to unauthorized

Authentication and authorization are separate. Verify the Auth user's UUID and
profile role:

```sql
select id, role
from public.profiles
where id = 'AUTH_USER_UUID_HERE';
```

The role must be `admin`. If no profile exists, review the
`public.handle_new_user()` trigger and follow
[`admin-user-setup.md`](admin-user-setup.md).

## Login does not work

- Confirm the user exists under Supabase **Authentication > Users**.
- Confirm the password is correct without recording it anywhere.
- Check Supabase Auth email confirmation settings.
- Confirm the deployed origin is configured in Supabase Auth URL settings.
- Check browser cookies and server logs for session errors.
- Do not test an administrator account against the wrong Supabase project.

## Categories or products are missing

Public catalog queries intentionally require:

- category `is_active = true`;
- product `is_active = true`;
- product `is_available = true`; and
- an active linked category.

Administrators can see/manage more rows than public visitors because the admin
queries use authenticated admin access. Confirm the flags, category relation,
and RLS policies before changing application code.

## Product or category deletion fails

Category deletion is restricted when products still reference the category. Move
or delete those products first. Other database errors should be inspected in the
server response and Supabase logs; do not bypass the foreign-key constraint.

## Product creation returns `400 Unable to create product`

Confirm that all five migrations have been applied, especially
`20261006000400_grant_gallery_validator.sql`. The product table validates
`gallery_images` with `private.is_valid_gallery_images(jsonb)`, and authenticated
admin writes need `EXECUTE` permission on that validator.

Verify the grant in SQL Editor:

```sql
select has_function_privilege(
  'authenticated',
  'private.is_valid_gallery_images(jsonb)',
  'EXECUTE'
);
```

The result must be `true`. The server logs also record the sanitized Supabase
error code, message, hint, and status for product create/update failures; they do
not log the submitted product payload.

## Image upload fails

Check all of the following:

1. The second image-storage migration was applied.
2. `product-images` and `category-images` exist.
3. The signed-in user has `profiles.role = 'admin'`.
4. The file is JPEG, PNG, or WebP.
5. The file is no larger than 5 MiB.
6. A product gallery contains no more than ten images.
7. The Storage policies still call `private.is_admin(auth.uid())`.

If the database reference update fails after upload, the client attempts to
remove the newly uploaded object. If storage cleanup fails while removing an
existing image, the reference may be removed while the object remains; review
Storage manually.

## Meeting request returns an error

The form requires a name, phone, date, time, and valid optional email. The date
and time must be in the future according to `site_settings.business_timezone`.

Other common causes:

- `site_settings` is missing or unavailable.
- `SUPABASE_SECRET_KEY` is missing or invalid.
- `TURNSTILE_SECRET_KEY` is set even though no form token is implemented; this
  returns `503` intentionally.
- The hidden honeypot field was populated.
- The same normalized name/phone/email/time combination was already submitted;
  the unique submission key returns `409`.

The endpoint converts the requested local business time to an ISO timestamp and
stores it in `preferred_at`.

## Meeting status update fails

Confirm the user is an administrator and that the request ID exists. Meeting
status updates are restricted to the allowed values:

```text
pending, confirmed, completed, cancelled, rejected
```

Review browser network responses and Supabase RLS policies if the UI appears to
save but the value does not persist.

## Language or theme does not persist

- Language is stored in local storage and the `shudha-language` cookie.
- Theme is stored in the singleton `site_settings.active_theme` value.
- Clear stale cookies/local storage and reload if testing across environments.
- Confirm the admin theme request succeeds with status 200.
- Confirm the selected theme is one of `everyday`, `wedding`, or `festival`.

## Build passes but runtime fails

A successful build proves compilation and route generation only. It does not
prove that the deployed environment has valid Supabase credentials, data,
Storage, Auth users, RLS, or network access. Run the deployment smoke checks in
[`deployment.md`](deployment.md).

## Tests do not prove live behavior

`npm test` runs static Node tests that inspect source-level security, theme,
navigation, and validation invariants. There is currently no browser automation
suite and no live Supabase integration suite. Treat live authentication, RLS,
CRUD, uploads, meetings, and responsive behavior as separately requiring a
configured test environment.
