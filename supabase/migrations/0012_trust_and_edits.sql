-- Trust labels for seed vs wiki listings, halal diet lock, and edit history.

alter table public.spots
  add column if not exists trust text not null default 'unverified';

alter table public.spots
  drop constraint if exists spots_trust_check;

alter table public.spots
  add constraint spots_trust_check check (trust in ('unverified', 'listed'));

update public.spots
set trust = 'listed'
where source = 'seed'
  and (place_id like 'seed:halal:%' or place_id like 'seed:veg:%');

update public.spots
set trust = 'unverified'
where memo like '%기획 후보%'
   or memo like '%웹 조사%';

create table if not exists public.spot_edits (
  id uuid primary key default gen_random_uuid(),
  spot_id uuid not null references public.spots (id) on delete cascade,
  edited_by uuid references auth.users (id),
  edited_nickname text not null,
  diet_tags text[] not null,
  memo text not null default '',
  memo_en text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists spot_edits_spot_id_created_at_idx
  on public.spot_edits (spot_id, created_at desc);

alter table public.spot_edits enable row level security;

drop policy if exists spot_edits_select_public on public.spot_edits;
create policy spot_edits_select_public
  on public.spot_edits
  for select
  using (true);

grant select on public.spot_edits to anon, authenticated;

create or replace function public.spots_log_edit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.spot_edits (spot_id, edited_by, edited_nickname, diet_tags, memo, memo_en)
    values (
      new.id,
      new.created_by,
      new.created_by_nickname,
      new.diet_tags,
      new.memo,
      new.memo_en
    );
    return new;
  end if;

  if new.diet_tags is distinct from old.diet_tags
     or new.memo is distinct from old.memo
     or new.memo_en is distinct from old.memo_en
     or new.closed is distinct from old.closed then
    insert into public.spot_edits (spot_id, edited_by, edited_nickname, diet_tags, memo, memo_en)
    values (
      new.id,
      coalesce(new.last_edited_by, auth.uid()),
      coalesce(nullif(new.last_edited_nickname, ''), new.created_by_nickname),
      new.diet_tags,
      new.memo,
      new.memo_en
    );
  end if;

  return new;
end;
$$;

drop trigger if exists spots_log_edit on public.spots;
create trigger spots_log_edit
  after insert or update on public.spots
  for each row
  execute function public.spots_log_edit();

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
    or new.trust is distinct from old.trust
  then
    raise exception 'immutable column change is not allowed';
  end if;

  if new.lat is distinct from old.lat or new.lng is distinct from old.lng then
    if new.lat < 33 or new.lat > 39 or new.lng < 124 or new.lng > 132 then
      raise exception 'coordinates must be in Korea';
    end if;
  end if;

  if new.diet_tags is distinct from old.diet_tags
     and ('halal' = any (old.diet_tags) or 'halal' = any (new.diet_tags))
     and auth.uid() is distinct from old.created_by then
    raise exception 'halal_diet_locked';
  end if;

  new.updated_at = now();
  return new;
end;
$$;
