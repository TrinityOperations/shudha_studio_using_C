-- Custom theme management. Apply after 20261006000400.

create table if not exists public.site_themes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  colors jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  logo_path text,
  background_path text,
  hero_path text,
  logo_alt_en text,
  logo_alt_bn text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_themes_name_length check (char_length(name) between 1 and 120),
  constraint site_themes_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint site_themes_path_length check (
    (logo_path is null or char_length(logo_path) between 1 and 500) and
    (background_path is null or char_length(background_path) between 1 and 500) and
    (hero_path is null or char_length(hero_path) between 1 and 500)
  )
);

alter table public.site_settings
  add column if not exists active_theme_id uuid references public.site_themes(id) on delete set null;

insert into public.site_themes (name, slug, colors, content)
values
  ('Everyday', 'everyday', '{"background":"#ffffff","surface":"#ffffff","mutedSurface":"#f8fafc","foreground":"#0f172a","mutedForeground":"#475569","border":"#e2e8f0","primary":"#be123c","primaryHover":"#9f1239","primarySoft":"#fecdd3","hero":"#020617","heroAccent":"#f43f5e","heroHighlight":"#fbbf24"}', '{}'),
  ('Wedding', 'wedding', '{"background":"#fffaf5","surface":"#fffdfb","mutedSurface":"#fff1f2","foreground":"#3f1d2e","mutedForeground":"#79505f","border":"#f3d5dc","primary":"#9f1239","primaryHover":"#881337","primarySoft":"#fbcfe8","hero":"#3f172e","heroAccent":"#fb7185","heroHighlight":"#f9a8d4"}', '{}'),
  ('Festival', 'festival', '{"background":"#fffaf0","surface":"#fffdf7","mutedSurface":"#fff7ed","foreground":"#351a46","mutedForeground":"#76546b","border":"#fed7aa","primary":"#c2410c","primaryHover":"#9a3412","primarySoft":"#fed7aa","hero":"#32104f","heroAccent":"#f97316","heroHighlight":"#facc15"}', '{}')
on conflict (slug) do nothing;

update public.site_settings s
set active_theme_id = t.id,
    updated_at = timezone('utc', now())
from public.site_themes t
where s.id = true and s.active_theme_id is null and t.slug = coalesce(s.active_theme, 'everyday');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('theme-images', 'theme-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

alter table public.site_themes enable row level security;
grant select on public.site_themes to anon, authenticated;
grant insert, update, delete on public.site_themes to authenticated;

drop policy if exists site_themes_public_active_read on public.site_themes;
create policy site_themes_public_active_read on public.site_themes for select to anon, authenticated
using (id = (select active_theme_id from public.site_settings where id = true));
drop policy if exists site_themes_admin_select on public.site_themes;
create policy site_themes_admin_select on public.site_themes for select to authenticated
using ((select private.is_admin(auth.uid())));
drop policy if exists site_themes_admin_insert on public.site_themes;
create policy site_themes_admin_insert on public.site_themes for insert to authenticated with check ((select private.is_admin(auth.uid())));
drop policy if exists site_themes_admin_update on public.site_themes;
create policy site_themes_admin_update on public.site_themes for update to authenticated using ((select private.is_admin(auth.uid()))) with check ((select private.is_admin(auth.uid())));
drop policy if exists site_themes_admin_delete on public.site_themes;
create policy site_themes_admin_delete on public.site_themes for delete to authenticated using ((select private.is_admin(auth.uid())));

drop policy if exists theme_images_admin_insert on storage.objects;
create policy theme_images_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'theme-images' and (select private.is_admin(auth.uid())));
drop policy if exists theme_images_admin_update on storage.objects;
create policy theme_images_admin_update on storage.objects for update to authenticated using (bucket_id = 'theme-images' and (select private.is_admin(auth.uid()))) with check (bucket_id = 'theme-images' and (select private.is_admin(auth.uid())));
drop policy if exists theme_images_admin_delete on storage.objects;
create policy theme_images_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'theme-images' and (select private.is_admin(auth.uid())));