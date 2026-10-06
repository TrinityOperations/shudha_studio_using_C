# Administrator setup

The application distinguishes authentication from authorization:

- Supabase Auth verifies the email/password session.
- `public.profiles.role = 'admin'` authorizes access to admin pages and admin
  mutations.

Creating an Auth user alone does not grant administrator access.

## Create the first Auth user

1. Open the Supabase Dashboard for the intended project.
2. Go to **Authentication > Users**.
3. Create the user with the email address that should administer the application.
4. Complete the email confirmation or password setup required by the project
   Auth configuration.

Do not place the user's password in this repository, in documentation, or in
support tickets.

## Promote the profile to admin

After the Auth user exists, copy its UUID from the Supabase Dashboard. Run this
query in the Supabase SQL Editor using that UUID:

```sql
update public.profiles
set role = 'admin', updated_at = timezone('utc', now())
where id = 'AUTH_USER_UUID_HERE';
```

The profile is normally created automatically by the
`public.handle_new_user()` trigger. If the Auth user predates the migration or
the trigger failed, create the profile first:

```sql
insert into public.profiles (id, display_name, role)
values ('AUTH_USER_UUID_HERE', 'Administrator', 'admin')
on conflict (id) do update
set role = 'admin', updated_at = timezone('utc', now());
```

Use a neutral display name or update it later. Do not store a password in the
display name or profile metadata.

## Verify the promotion

```sql
select id, display_name, role, created_at, updated_at
from public.profiles
where id = 'AUTH_USER_UUID_HERE';
```

The result must contain exactly the intended Auth UUID and `role = 'admin'`.

## Sign in

1. Start the application with `npm run dev`, or open the deployed site.
2. Visit `/admin/login`.
3. Sign in with the Auth user's email and password.
4. Confirm that `/admin` loads.
5. Confirm that category, product, meetings, and settings pages are available.

The session is maintained through Supabase SSR cookies. The request proxy refreshes
the session, while each admin page still checks the profile role.

## Add another administrator

Repeat the same process for each trusted operator:

1. Create the user in Supabase Auth.
2. Find the exact Auth UUID.
3. Promote only that UUID in `public.profiles`.
4. Verify the role.
5. Test sign-in and the intended admin workflows.

Prefer the smallest practical administrator group. There is no separate
permission tier in the current application.

## Remove administrator access

To demote a user without deleting the Auth account:

```sql
update public.profiles
set role = 'user', updated_at = timezone('utc', now())
where id = 'AUTH_USER_UUID_HERE';
```

To revoke access permanently, demote or delete the profile as appropriate and
disable/delete the corresponding Auth user through the Supabase Dashboard.
Coordinate this with any active sessions and organizational offboarding process.

## Security rules

- Never let public signup choose `role = 'admin'`.
- Never expose role promotion through an application API route.
- Never use the server-only Supabase secret key in browser code.
- Review the administrator list periodically.
- Use separate Supabase projects for development, staging, and production when
  practical.
