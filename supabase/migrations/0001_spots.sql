-- DietSpot spots table, RLS, and immutable-column trigger
-- Run in Supabase SQL Editor (once).

create extension if not exists pgcrypto;

create table if not exists public.spots (
  id uuid primary key default gen_random_uuid(),
  place_id text unique not null,
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  diet_tags text[] not null,
  cuisine_tags text[] not null default '{}',
  venue_tags text[] not null default '{}',
  memo text not null default '',
  phone text,
  place_url text,
  created_by uuid not null references auth.users (id),
  created_by_nickname text not null,
  last_edited_by uuid references auth.users (id),
  last_edited_nickname text,
  source text not null default 'user' check (source in ('seed', 'user')),
  closed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint spots_diet_tags_min check (cardinality(diet_tags) >= 1),
  constraint spots_memo_len check (char_length(memo) <= 300)
);

create index if not exists spots_lat_lng_idx on public.spots (lat, lng);

create or replace function public.spots_protect_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.place_id is distinct from old.place_id
    or new.name is distinct from old.name
    or new.address is distinct from old.address
    or new.lat is distinct from old.lat
    or new.lng is distinct from old.lng
    or new.created_by is distinct from old.created_by
    or new.created_by_nickname is distinct from old.created_by_nickname
    or new.source is distinct from old.source
  then
    raise exception 'immutable column change is not allowed';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists spots_protect_columns on public.spots;
create trigger spots_protect_columns
  before update on public.spots
  for each row
  execute function public.spots_protect_columns();

alter table public.spots enable row level security;

drop policy if exists spots_select_public on public.spots;
create policy spots_select_public
  on public.spots
  for select
  using (true);

drop policy if exists spots_insert_own on public.spots;
create policy spots_insert_own
  on public.spots
  for insert
  to authenticated
  with check (
    auth.uid() = created_by
    and cardinality(diet_tags) >= 1
  );

drop policy if exists spots_update_auth on public.spots;
create policy spots_update_auth
  on public.spots
  for update
  to authenticated
  using (true)
  with check (cardinality(diet_tags) >= 1);

drop policy if exists spots_delete_own on public.spots;
create policy spots_delete_own
  on public.spots
  for delete
  to authenticated
  using (auth.uid() = created_by);

grant select on public.spots to anon, authenticated;
grant insert, update, delete on public.spots to authenticated;
