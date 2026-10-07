-- Repair all theme image policies used by backup restore. The direct profile
-- lookup avoids depending on a stale or incorrectly deployed helper function.

drop policy if exists theme_images_admin_select on storage.objects;
drop policy if exists theme_images_admin_insert on storage.objects;
drop policy if exists theme_images_admin_update on storage.objects;
drop policy if exists theme_images_admin_delete on storage.objects;

create policy theme_images_admin_select
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'theme-images'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy theme_images_admin_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'theme-images'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy theme_images_admin_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'theme-images'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    bucket_id = 'theme-images'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy theme_images_admin_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'theme-images'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );