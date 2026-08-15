-- Kakao contact fields for the detail panel (phone + place page URL).
alter table public.spots
  add column if not exists phone text,
  add column if not exists place_url text;
