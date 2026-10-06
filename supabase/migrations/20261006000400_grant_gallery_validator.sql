-- Allow authenticated writes to evaluate the products gallery constraint.
-- The function only validates JSON structure; product authorization remains
-- enforced by the products RLS policies.

grant execute
on function private.is_valid_gallery_images(jsonb)
to authenticated;
