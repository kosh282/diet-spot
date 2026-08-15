-- Logged-in users can mark a spot closed (hidden from the map, row kept).
alter table public.spots
  add column if not exists closed boolean not null default false;
