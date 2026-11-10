-- The web code of the native apps, signed. Public, so the apps can download
-- it before sign-in; only the service role writes it.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('live-updates', 'live-updates', true, 50 * 1024 * 1024, array['application/zip', 'application/json'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
