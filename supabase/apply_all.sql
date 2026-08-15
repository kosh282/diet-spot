-- DietSpot: spots + profiles + seed restaurants
-- Paste into Supabase SQL Editor and Run.

create extension if not exists pgcrypto;

-- ---------- spots ----------
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
  memo_en text not null default '',
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
  constraint spots_memo_len check (char_length(memo) <= 300),
  constraint spots_memo_en_len check (char_length(memo_en) <= 300)
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
    or new.created_by is distinct from old.created_by
    or new.created_by_nickname is distinct from old.created_by_nickname
    or new.source is distinct from old.source
  then
    raise exception 'immutable column change is not allowed';
  end if;

  if new.lat is distinct from old.lat or new.lng is distinct from old.lng then
    if new.lat < 33 or new.lat > 39 or new.lng < 124 or new.lng > 132 then
      raise exception 'coordinates must be in Korea';
    end if;
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
create policy spots_select_public on public.spots for select using (true);

drop policy if exists spots_insert_own on public.spots;
create policy spots_insert_own on public.spots for insert to authenticated
  with check (auth.uid() = created_by and cardinality(diet_tags) >= 1);

drop policy if exists spots_update_auth on public.spots;
create policy spots_update_auth on public.spots for update to authenticated
  using (true) with check (cardinality(diet_tags) >= 1);

drop policy if exists spots_delete_own on public.spots;
create policy spots_delete_own on public.spots for delete to authenticated
  using (auth.uid() = created_by);

grant select on public.spots to anon, authenticated;
grant insert, update, delete on public.spots to authenticated;

-- ---------- profiles (Google 로그인 유저 공개 프로필) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '사용자',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_select_public on public.profiles;
create policy profiles_select_public on public.profiles for select using (true);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      '사용자'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to supabase_auth_admin;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    '사용자'
  ),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
on conflict (id) do nothing;

-- ---------- seed operator (spots.created_by FK) ----------
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5',
  'authenticated',
  'authenticated',
  'seed@dietspot.local',
  crypt('seed-not-for-login', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"DietSpot"}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
)
on conflict (id) do nothing;

insert into public.profiles (id, display_name)
values ('a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot')
on conflict (id) do nothing;

-- ---------- seed restaurants ----------
insert into public.spots (
  place_id, name, address, lat, lng,
  diet_tags, cuisine_tags, venue_tags, memo,
  created_by, created_by_nickname, last_edited_by, last_edited_nickname, source
)
values
  (
    'seed:jyoti-chungmuro', '죠티인도레스토랑', '서울 중구 서애로 12-4',
    37.5603142, 126.9970992,
    array['vegetarian', 'vegan'], array['south_asian'], array['restaurant'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:jeoksubang', '적수방', '서울 중구 동호로24길 7-6',
    37.5597212, 127.0048734,
    array['vegetarian', 'vegan'], array['chinese', 'asian'], array['restaurant'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:salady-chungmuro', '샐러디 충무로역점', '서울 중구 서애로1길 11',
    37.5613155, 126.9985308,
    array['vegan'], array['other'], array['cafe', 'takeout'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:kampungku', '캄퐁쿠', '서울 중구 퇴계로20길 25',
    37.5581319, 126.9866409,
    array['halal'], array['asian'], array['restaurant'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:coconuzm', '코코너즘', '서울 중구 퇴계로36길 32',
    37.5621789, 126.9935029,
    array['vegan', 'dairy_free'], array['dessert'], array['cafe'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:earth-dome', '어스돔', '서울 중구 퇴계로36가길 46',
    37.5611534, 126.9965568,
    array['vegetarian'], array['dessert'], array['cafe'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:gurkha', '구르카', '서울 중구 명동10길 16-1',
    37.5630639, 126.9851915,
    array['halal'], array['south_asian'], array['restaurant'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  ),
  (
    'seed:busanjib', '부산집', '서울 중구 명동8길 11-4',
    37.5617707, 126.9848871,
    array['halal', 'no_pork'], array['korean'], array['restaurant'],
    '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot',
    'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5', 'DietSpot', 'seed'
  )
on conflict (place_id) do nothing;
