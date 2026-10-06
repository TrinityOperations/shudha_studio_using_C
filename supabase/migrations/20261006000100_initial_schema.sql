-- Shudha Studio initial database schema.
-- Apply this migration to a Supabase project with the Supabase CLI or SQL Editor.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 120
  ),
  constraint profiles_role_check check (role in ('user', 'admin'))
);

create index if not exists profiles_role_idx on public.profiles (role);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_bn text not null,
  description_en text,
  description_bn text,
  seo_title_en text,
  seo_title_bn text,
  seo_description_en text,
  seo_description_bn text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint categories_slug_length check (char_length(slug) between 1 and 120),
  constraint categories_name_en_length check (char_length(name_en) between 1 and 160),
  constraint categories_name_bn_length check (char_length(name_bn) between 1 and 160),
  constraint categories_description_en_length check (
    description_en is null or char_length(description_en) <= 5000
  ),
  constraint categories_description_bn_length check (
    description_bn is null or char_length(description_bn) <= 5000
  ),
  constraint categories_sort_order_check check (sort_order >= 0)
);

create index if not exists categories_active_sort_idx
  on public.categories (is_active, sort_order, name_en);
create index if not exists categories_name_en_trgm_idx
  on public.categories using gin (name_en gin_trgm_ops);
create index if not exists categories_name_bn_trgm_idx
  on public.categories using gin (name_bn gin_trgm_ops);

create or replace function private.is_valid_gallery_images(images jsonb)
returns boolean
language sql
immutable
set search_path = pg_temp
as $$
  select jsonb_typeof(images) = 'array'
    and not exists (
      select 1
      from jsonb_array_elements(images) as image
      where jsonb_typeof(image) <> 'object'
        or jsonb_typeof(image -> 'path') <> 'string'
    );
$$;

revoke all on function private.is_valid_gallery_images(jsonb) from public;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  slug text not null unique,
  name_en text not null,
  name_bn text not null,
  description_en text,
  description_bn text,
  seo_title_en text,
  seo_title_bn text,
  seo_description_en text,
  seo_description_bn text,
  is_active boolean not null default true,
  is_available boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  main_image_path text,
  main_image_alt_en text,
  main_image_alt_bn text,
  gallery_images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint products_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint products_slug_length check (char_length(slug) between 1 and 160),
  constraint products_name_en_length check (char_length(name_en) between 1 and 200),
  constraint products_name_bn_length check (char_length(name_bn) between 1 and 200),
  constraint products_description_en_length check (
    description_en is null or char_length(description_en) <= 10000
  ),
  constraint products_description_bn_length check (
    description_bn is null or char_length(description_bn) <= 10000
  ),
  constraint products_main_image_path_length check (
    main_image_path is null or char_length(main_image_path) between 1 and 500
  ),
  constraint products_gallery_images_check check (
    private.is_valid_gallery_images(gallery_images)
  ),
  constraint products_sort_order_check check (sort_order >= 0)
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_public_listing_idx
  on public.products (category_id, is_active, is_available, sort_order, name_en);
create index if not exists products_featured_idx
  on public.products (is_featured, is_active, is_available, sort_order)
  where is_featured = true;
create index if not exists products_name_en_trgm_idx
  on public.products using gin (name_en gin_trgm_ops);
create index if not exists products_name_bn_trgm_idx
  on public.products using gin (name_bn gin_trgm_ops);

create table if not exists public.meeting_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  preferred_at timestamptz not null,
  message text,
  submission_language text not null default 'en',
  status text not null default 'pending',
  admin_notes text,
  assigned_to uuid references public.profiles (id) on delete set null,
  submission_key text not null unique,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint meeting_requests_name_length check (char_length(name) between 1 and 160),
  constraint meeting_requests_phone_length check (char_length(phone) between 5 and 40),
  constraint meeting_requests_email_length check (
    email is null or char_length(email) between 3 and 320
  ),
  constraint meeting_requests_email_format check (
    email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint meeting_requests_message_length check (
    message is null or char_length(message) <= 5000
  ),
  constraint meeting_requests_language_check check (submission_language in ('en', 'bn')),
  constraint meeting_requests_status_check check (
    status in ('pending', 'confirmed', 'completed', 'cancelled', 'rejected')
  ),
  constraint meeting_requests_admin_notes_length check (
    admin_notes is null or char_length(admin_notes) <= 10000
  ),
  constraint meeting_requests_submission_key_length check (
    char_length(submission_key) between 16 and 200
  )
);

create index if not exists meeting_requests_status_created_idx
  on public.meeting_requests (status, created_at desc);
create index if not exists meeting_requests_preferred_at_idx
  on public.meeting_requests (preferred_at);
create index if not exists meeting_requests_assigned_to_idx
  on public.meeting_requests (assigned_to);

create table if not exists public.site_settings (
  id boolean primary key default true,
  business_name_en text not null,
  business_name_bn text not null,
  phone text,
  whatsapp text,
  email text,
  address_en text,
  address_bn text,
  contact_description_en text,
  contact_description_bn text,
  business_timezone text not null default 'Asia/Dhaka',
  default_language text not null default 'en',
  active_theme text not null default 'everyday',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_settings_singleton_check check (id),
  constraint site_settings_business_name_en_length check (
    char_length(business_name_en) between 1 and 160
  ),
  constraint site_settings_business_name_bn_length check (
    char_length(business_name_bn) between 1 and 160
  ),
  constraint site_settings_phone_length check (
    phone is null or char_length(phone) between 5 and 40
  ),
  constraint site_settings_whatsapp_length check (
    whatsapp is null or char_length(whatsapp) between 5 and 40
  ),
  constraint site_settings_email_length check (
    email is null or char_length(email) between 3 and 320
  ),
  constraint site_settings_email_format check (
    email is null or email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  constraint site_settings_timezone_length check (char_length(business_timezone) between 1 and 100),
  constraint site_settings_language_check check (default_language in ('en', 'bn')),
  constraint site_settings_theme_check check (active_theme in ('everyday', 'wedding', 'festival'))
);

create or replace function private.is_admin(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = user_id
      and profiles.role = 'admin'
  );
$$;

revoke all on function private.is_admin(uuid) from public;
grant execute on function private.is_admin(uuid) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(new.raw_user_meta_data ->> 'display_name', 120), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure private.set_updated_at();

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
  before update on public.categories
  for each row execute procedure private.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure private.set_updated_at();

drop trigger if exists meeting_requests_set_updated_at on public.meeting_requests;
create trigger meeting_requests_set_updated_at
  before update on public.meeting_requests
  for each row execute procedure private.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute procedure private.set_updated_at();

insert into public.site_settings (
  id,
  business_name_en,
  business_name_bn,
  business_timezone,
  default_language,
  active_theme
)
values (true, 'Shudha Studio', 'শুদ্ধা স্টুডিও', 'Asia/Dhaka', 'en', 'everyday')
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.meeting_requests enable row level security;
alter table public.site_settings enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.categories from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.meeting_requests from anon, authenticated;
revoke all on table public.site_settings from anon, authenticated;

grant select on table public.profiles to authenticated;
grant select on table public.categories to anon, authenticated;
grant select on table public.products to anon, authenticated;
grant select on table public.site_settings to anon, authenticated;
grant select, update on table public.meeting_requests to authenticated;
grant insert, update, delete on table public.categories to authenticated;
grant insert, update, delete on table public.products to authenticated;
grant insert, update, delete on table public.site_settings to authenticated;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or (select private.is_admin(auth.uid()))
  );

drop policy if exists categories_public_read_active on public.categories;
create policy categories_public_read_active
  on public.categories
  for select
  to anon, authenticated
  using (is_active or (select private.is_admin(auth.uid())));

drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert
  on public.categories
  for insert
  to authenticated
  with check ((select private.is_admin(auth.uid())));

drop policy if exists categories_admin_update on public.categories;
create policy categories_admin_update
  on public.categories
  for update
  to authenticated
  using ((select private.is_admin(auth.uid())))
  with check ((select private.is_admin(auth.uid())));

drop policy if exists categories_admin_delete on public.categories;
create policy categories_admin_delete
  on public.categories
  for delete
  to authenticated
  using ((select private.is_admin(auth.uid())));

drop policy if exists products_public_read_available on public.products;
create policy products_public_read_available
  on public.products
  for select
  to anon, authenticated
  using (
    (
      is_active
      and is_available
      and exists (
        select 1
        from public.categories
        where categories.id = products.category_id
          and categories.is_active
      )
    )
    or (select private.is_admin(auth.uid()))
  );

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert
  on public.products
  for insert
  to authenticated
  with check ((select private.is_admin(auth.uid())));

drop policy if exists products_admin_update on public.products;
create policy products_admin_update
  on public.products
  for update
  to authenticated
  using ((select private.is_admin(auth.uid())))
  with check ((select private.is_admin(auth.uid())));

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete
  on public.products
  for delete
  to authenticated
  using ((select private.is_admin(auth.uid())));

drop policy if exists meeting_requests_admin_select on public.meeting_requests;
create policy meeting_requests_admin_select
  on public.meeting_requests
  for select
  to authenticated
  using ((select private.is_admin(auth.uid())));

drop policy if exists meeting_requests_admin_update on public.meeting_requests;
create policy meeting_requests_admin_update
  on public.meeting_requests
  for update
  to authenticated
  using ((select private.is_admin(auth.uid())))
  with check ((select private.is_admin(auth.uid())));

drop policy if exists meeting_requests_admin_delete on public.meeting_requests;
create policy meeting_requests_admin_delete
  on public.meeting_requests
  for delete
  to authenticated
  using ((select private.is_admin(auth.uid())));

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings
  for select
  to anon, authenticated
  using (id = true or (select private.is_admin(auth.uid())));

drop policy if exists site_settings_admin_insert on public.site_settings;
create policy site_settings_admin_insert
  on public.site_settings
  for insert
  to authenticated
  with check ((select private.is_admin(auth.uid())));

drop policy if exists site_settings_admin_update on public.site_settings;
create policy site_settings_admin_update
  on public.site_settings
  for update
  to authenticated
  using ((select private.is_admin(auth.uid())))
  with check ((select private.is_admin(auth.uid())));

drop policy if exists site_settings_admin_delete on public.site_settings;
create policy site_settings_admin_delete
  on public.site_settings
  for delete
  to authenticated
  using ((select private.is_admin(auth.uid())));