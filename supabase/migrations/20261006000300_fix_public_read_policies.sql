-- Fix public read policies so anonymous visitors do not need to execute the
-- private administrator helper. Admin read access remains available through
-- separate authenticated-only policies.

drop policy if exists categories_public_read_active on public.categories;
create policy categories_public_read_active
  on public.categories
  for select
  to anon, authenticated
  using (is_active);

drop policy if exists categories_admin_select on public.categories;
create policy categories_admin_select
  on public.categories
  for select
  to authenticated
  using ((select private.is_admin(auth.uid())));

drop policy if exists products_public_read_available on public.products;
create policy products_public_read_available
  on public.products
  for select
  to anon, authenticated
  using (
    is_active
    and is_available
    and exists (
      select 1
      from public.categories
      where categories.id = products.category_id
        and categories.is_active
    )
  );

drop policy if exists products_admin_select on public.products;
create policy products_admin_select
  on public.products
  for select
  to authenticated
  using ((select private.is_admin(auth.uid())));

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read
  on public.site_settings
  for select
  to anon, authenticated
  using (id = true);
