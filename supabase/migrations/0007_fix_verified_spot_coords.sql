-- Excel-imported spots were geocoded at neighborhood centroids (충무로3가 등).
-- Move them to confirmed road addresses. Location columns are immutable, so
-- the protect trigger is disabled for this data fix only.

alter table public.spots disable trigger spots_protect_columns;

update public.spots
set
  address = '서울 중구 퇴계로27길 16',
  lat = 37.5627489,
  lng = 126.9912314,
  updated_at = now()
where place_id = 'verified:slowcali-chungmuro';

update public.spots
set
  address = '서울 중구 퇴계로36길 36',
  lat = 37.5623097,
  lng = 126.9936669,
  updated_at = now()
where place_id = 'verified:heehee-katsu';

update public.spots
set
  address = '서울 중구 필동로 30-1',
  lat = 37.5609435,
  lng = 126.9961914,
  updated_at = now()
where place_id = 'verified:kimchiman-chungmuro';

update public.spots
set
  address = '서울 중구 퇴계로 197',
  lat = 37.5614032,
  lng = 126.9938944,
  closed = true,
  updated_at = now()
where place_id = 'verified:subway-chungmuro';

update public.spots
set
  address = '서울 중구 장충단로 174',
  lat = 37.5609763,
  lng = 127.0075809,
  updated_at = now()
where place_id = 'verified:jangchung-halmeoni';

-- 엑셀 상호는 충무로 닭한마리. 공개 주소는 동대닭한마리(서애로 16-5).
update public.spots
set
  address = '서울 중구 서애로 16-5',
  lat = 37.560385,
  lng = 126.996970,
  updated_at = now()
where place_id = 'verified:chungmuro-dakhanmari';

update public.spots
set
  address = '서울 중구 서애로 12-20',
  lat = 37.560370,
  lng = 126.997020,
  updated_at = now()
where place_id = 'verified:hayan-jip';

update public.spots
set
  address = '서울 중구 장충단로 207',
  lat = 37.5632373,
  lng = 127.0067064,
  updated_at = now()
where place_id = 'verified:pyongyang-myeonok';

update public.spots
set
  address = '서울 중구 퇴계로31길 11',
  lat = 37.5617290,
  lng = 126.9921675,
  updated_at = now()
where place_id = 'verified:chungmuro-jjuggumi';

-- 엑셀 상호는 동대입구역점. 공개 주소는 서애로 12-6(서울동국대점).
update public.spots
set
  address = '서울 중구 서애로 12-6',
  lat = 37.560340,
  lng = 126.997180,
  updated_at = now()
where place_id = 'verified:isaac-toast-dongdae';

alter table public.spots enable trigger spots_protect_columns;
