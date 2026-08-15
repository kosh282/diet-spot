-- Logged-in users may correct address and pin (lat/lng).
-- Identity columns stay locked: place_id, name, created_by, source.

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
