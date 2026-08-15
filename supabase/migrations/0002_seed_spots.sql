-- Seed restaurants from the DietSpot plan (unverified web-research tags).
-- Run in Supabase SQL Editor AFTER 0001_spots.sql.
-- Google로 한 번 로그인한 뒤 실행하세요. (created_by가 auth.users를 참조합니다)

insert into public.spots (
  place_id,
  name,
  address,
  lat,
  lng,
  diet_tags,
  cuisine_tags,
  venue_tags,
  memo,
  created_by,
  created_by_nickname,
  last_edited_by,
  last_edited_nickname,
  source
)
select
  v.place_id,
  v.name,
  v.address,
  v.lat,
  v.lng,
  v.diet_tags,
  v.cuisine_tags,
  v.venue_tags,
  v.memo,
  u.id,
  'DietSpot',
  u.id,
  'DietSpot',
  'seed'
from (
  select id
  from auth.users
  order by created_at asc
  limit 1
) as u
cross join (
  values
    (
      'seed:jyoti-chungmuro',
      '죠티인도레스토랑',
      '서울 중구 서애로 12-4',
      37.5603142,
      126.9970992,
      array['vegetarian', 'vegan']::text[],
      array['south_asian']::text[],
      array['restaurant']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:jeoksubang',
      '적수방',
      '서울 중구 동호로24길 7-6',
      37.5597212,
      127.0048734,
      array['vegetarian', 'vegan']::text[],
      array['chinese', 'asian']::text[],
      array['restaurant']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:salady-chungmuro',
      '샐러디 충무로역점',
      '서울 중구 서애로1길 11',
      37.5613155,
      126.9985308,
      array['vegan']::text[],
      array['other']::text[],
      array['cafe', 'takeout']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:kampungku',
      '캄퐁쿠',
      '서울 중구 퇴계로20길 25',
      37.5581319,
      126.9866409,
      array['halal']::text[],
      array['asian']::text[],
      array['restaurant']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:coconuzm',
      '코코너즘',
      '서울 중구 퇴계로36길 32',
      37.5621789,
      126.9935029,
      array['vegan', 'dairy_free']::text[],
      array['dessert']::text[],
      array['cafe']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:earth-dome',
      '어스돔',
      '서울 중구 퇴계로36가길 46',
      37.5611534,
      126.9965568,
      array['vegetarian']::text[],
      array['dessert']::text[],
      array['cafe']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:gurkha',
      '구르카',
      '서울 중구 명동10길 16-1',
      37.5630639,
      126.9851915,
      array['halal']::text[],
      array['south_asian']::text[],
      array['restaurant']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    ),
    (
      'seed:busanjib',
      '부산집',
      '서울 중구 명동8길 11-4',
      37.5617707,
      126.9848871,
      array['halal', 'no_pork']::text[],
      array['korean']::text[],
      array['restaurant']::text[],
      '기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님'
    )
) as v(
  place_id,
  name,
  address,
  lat,
  lng,
  diet_tags,
  cuisine_tags,
  venue_tags,
  memo
)
on conflict (place_id) do nothing;
