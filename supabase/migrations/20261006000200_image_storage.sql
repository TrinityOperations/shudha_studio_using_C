-- Image storage setup for category and product images.
-- Apply after 20261006000100_initial_schema.sql.

alter table public.categories
  add column if not exists image_path text,
  add column if not exists image_alt_en text,
  add column if not exists image_alt_bn text;

alter table public.categories
  drop constraint if exists categories_image_path_length,
  add constraint categories_image_path_length check (
    image_path is null or char_length(image_path) between 1 and 500
  ),
  drop constraint if exists categories_image_alt_en_length,
  add constraint categories_image_alt_en_length check (
    image_alt_en is null or char_length(image_alt_en) <= 200
  ),
  drop constraint if exists categories_image_alt_bn_length,
  add constraint categories_image_alt_bn_length check (
    image_alt_bn is null or char_length(image_alt_bn) <= 200
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists catalog_images_admin_select on storage.objects;
create policy catalog_images_admin_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id in ('product-images', 'category-images')
    and (select private.is_admin(auth.uid()))
  );

drop policy if exists product_images_admin_insert on storage.objects;
create policy product_images_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (select private.is_admin(auth.uid()))
  );

drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select private.is_admin(auth.uid()))
  )
  with check (
    bucket_id = 'product-images'
    and (select private.is_admin(auth.uid()))
  );

drop policy if exists product_images_admin_delete on storage.objects;
create policy product_images_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (select private.is_admin(auth.uid()))
  );

drop policy if exists category_images_admin_insert on storage.objects;
create policy category_images_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'category-images'
    and (select private.is_admin(auth.uid()))
  );

drop policy if exists category_images_admin_update on storage.objects;
create policy category_images_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'category-images'
    and (select private.is_admin(auth.uid()))
  )
  with check (
    bucket_id = 'category-images'
    and (select private.is_admin(auth.uid()))
  );

drop policy if exists category_images_admin_delete on storage.objects;
create policy category_images_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'category-images'
    and (select private.is_admin(auth.uid()))
  );