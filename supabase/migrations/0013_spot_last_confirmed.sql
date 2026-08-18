-- Wiki "I checked today" stamp. Does not change trust or last-edited.

alter table public.spots
  add column if not exists last_confirmed_at timestamptz;

alter table public.spots
  add column if not exists last_confirmed_by uuid references auth.users (id);

alter table public.spots
  add column if not exists last_confirmed_nickname text;

create or replace function public.spots_protect_columns()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  confirm_only boolean;
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

  confirm_only :=
    new.last_confirmed_at is distinct from old.last_confirmed_at
    and new.diet_tags is not distinct from old.diet_tags
    and new.cuisine_tags is not distinct from old.cuisine_tags
    and new.venue_tags is not distinct from old.venue_tags
    and new.memo is not distinct from old.memo
    and new.memo_en is not distinct from old.memo_en
    and new.address is not distinct from old.address
    and new.lat is not distinct from old.lat
    and new.lng is not distinct from old.lng
    and new.closed is not distinct from old.closed
    and new.phone is not distinct from old.phone
    and new.place_url is not distinct from old.place_url
    and new.trust is not distinct from old.trust
    and new.last_edited_by is not distinct from old.last_edited_by
    and new.last_edited_nickname is not distinct from old.last_edited_nickname;

  if confirm_only then
    new.updated_at = old.updated_at;
    return new;
  end if;

  new.updated_at = now();
  return new;
end;
$$;
