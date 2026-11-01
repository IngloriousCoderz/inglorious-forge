create extension if not exists pg_net with schema extensions;

-- A token belongs to one user at a time, whoever last signed in on that device,
-- so two people sharing a phone never both get pushes on it.
create table public.push_tokens (
  token text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  platform text not null check (platform in ('web', 'android', 'ios')),
  created_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "Users can read their own push tokens"
  on public.push_tokens for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete their own push tokens"
  on public.push_tokens for delete to authenticated
  using (auth.uid() = user_id);

-- Security definer: the token may still be held by the device's previous user
-- (a sign-out that could not reach the server), and RLS would hide that row
-- from the one taking it over.
create function public.save_push_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;

  insert into public.push_tokens (token, user_id, platform)
  values (p_token, auth.uid(), p_platform)
  on conflict (token) do update
  set user_id = excluded.user_id,
      platform = excluded.platform;
end;
$$;

revoke execute on function public.save_push_token(text, text) from public, anon;
grant execute on function public.save_push_token(text, text) to authenticated;

-- Inserting a row is how the app sends a push: from a trigger, an edge function
-- or the dashboard. No insert policy, so clients cannot send pushes to others.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  url text not null default '/',
  created_at timestamptz not null default now(),
  pushed_at timestamptz
);

create index notifications_user_id_idx on public.notifications (user_id);

alter table public.notifications enable row level security;

create policy "Users can read their own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

-- The URL and the service-role key live in Vault, so neither is in a migration:
-- supabase/seed.sql sets the local ones, `pnpm vault:push` the linked project's.
create function public.wake_push_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url text;
  v_key text;
begin
  if not exists (
    select 1 from public.push_tokens where user_id = new.user_id
  ) then
    return new;
  end if;

  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'service_role_key';
  if v_url is null or v_key is null then
    return new;
  end if;

  perform net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/push-notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object('notification_id', new.id)
  );
  return new;
exception when others then
  -- A failed push must never fail the insert that asked for it.
  raise warning 'wake_push_notify: %', sqlerrm;
  return new;
end;
$$;

revoke execute on function public.wake_push_notify() from public, anon, authenticated;

create trigger wake_push_notify
  after insert on public.notifications
  for each row execute function public.wake_push_notify();
