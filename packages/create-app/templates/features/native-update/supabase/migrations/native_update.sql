-- The oldest native build allowed to run on each platform. Readable before
-- sign-in, so an outdated app is stopped on its login screen too.
create table public.app_versions (
  platform text primary key check (platform in ('ios', 'android')),
  min_build integer not null check (min_build >= 1),
  store_url text
);

alter table public.app_versions enable row level security;

create policy "Anyone reads the minimum app versions"
  on public.app_versions for select to anon, authenticated
  using (true);

insert into public.app_versions (platform, min_build) values
  ('ios', 1),
  ('android', 1);
