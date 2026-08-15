-- Seoul vegetarian / vegan seed (prototype baseline).
-- Dedicated veg restaurants and temple kitchens with a vegetarian menu.
-- Not an official DietSpot certification. Reconfirm before visiting.

insert into public.spots (
  place_id, name, address, lat, lng, phone,
  diet_tags, cuisine_tags, venue_tags, memo, memo_en, closed,
  created_by, created_by_nickname, last_edited_by, last_edited_nickname, source
)
select
  v.place_id, v.name, v.address, v.lat, v.lng, v.phone,
  v.diet_tags, v.cuisine_tags, v.venue_tags, v.memo, v.memo_en, v.closed,
  u.id, 'DietSpot', u.id, 'DietSpot', 'seed'
from (select 'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5'::uuid as id) as u
cross join (
  values
    (
      'seed:veg:vegan-insa', '비건인사', '서울 종로구 삼일대로32가길 12-4',
      37.5748299, 126.9894682, '0507-1420-2296',
      array['vegetarian', 'vegan']::text[], array['korean']::text[], array['restaurant']::text[],
      '채식 시드 · 익선동 한옥 비건 한식 · 방문 전 영업 재확인 · 공식 인증 아님',
      'Vegetarian seed · vegan Korean in a hanok, Ikseon-dong · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:balwoo-gongyang', '발우공양', '서울 종로구 우정국로 56 템플스테이통합정보센터 5층',
      37.5738240, 126.9831659, '02-733-2081',
      array['vegetarian', 'vegan']::text[], array['korean']::text[], array['restaurant']::text[],
      '사찰음식 코스 · 오신채 미사용 · 예약 권장 · 방문 전 재확인 · 공식 인증 아님',
      'Temple cuisine tasting menu · no five pungent vegetables · reserve ahead · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:sanchon', '산촌', '서울 종로구 인사동길 30-13',
      37.5735445, 126.9855646, '02-735-0312',
      array['vegetarian', 'vegan']::text[], array['korean']::text[], array['restaurant']::text[],
      '사찰음식 한옥 코스 · 인사동 · 방문 전 예약·영업 재확인 · 공식 인증 아님',
      'Temple cuisine in a hanok · Insadong · reconfirm hours and reservation · not an official certification',
      false
    ),
    (
      'seed:veg:maji', '마지', '서울 종로구 자하문로5길 19',
      37.5776264, 126.9708062, '0507-1418-5228',
      array['vegetarian', 'vegan']::text[], array['korean']::text[], array['restaurant']::text[],
      '서촌 사찰음식 · 채식 한상 · 화요일 휴무 · 방문 전 재확인 · 공식 인증 아님',
      'Seochon temple food · vegetarian set · closed Tuesdays · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:kkotbape-pida', '꽃밥에피다', '서울 종로구 인사동16길 3-6',
      37.5750403, 126.9841923, '02-732-0276',
      array['vegetarian']::text[], array['korean']::text[], array['restaurant']::text[],
      '채식 코스 있음 · 육류·해산물 메뉴도 취급 · 방문 전 채식 메뉴 확인 · 공식 인증 아님',
      'Has a vegetarian course · also serves meat and seafood · ask for the veg menu · not an official certification',
      false
    ),
    (
      'seed:veg:monks-butcher', '몽크스부처', '서울 용산구 이태원로 228-1 3층',
      37.5354583, 126.9979045, '02-790-1108',
      array['vegetarian', 'vegan']::text[], array['korean', 'western']::text[], array['restaurant']::text[],
      '이태원 비건 · 대체육 한식 · 방문 전 영업 재확인 · 공식 인증 아님',
      'Itaewon vegan · plant-based Korean · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:vegan-kitchen-myeongdong', '비건키친 명동점', '서울 중구 퇴계로20길 21',
      37.5592554, 126.9859855, null::text,
      array['vegetarian', 'vegan']::text[], array['korean']::text[], array['restaurant']::text[],
      '명동 비건 한식 · 잡채·대체육 · 방문 전 영업 재확인 · 공식 인증 아님',
      'Myeongdong vegan Korean · japchae and plant-based meats · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:loving-hut-land', '러빙헛랜드', '서울 강남구 논현로16길 17',
      37.4765883, 127.0476670, '02-578-0512',
      array['vegetarian', 'vegan']::text[], array['korean', 'western']::text[], array['restaurant']::text[],
      '비건 체인 · 강남 개포 · 예약 필요할 수 있음 · 방문 전 재확인 · 공식 인증 아님',
      'Vegan chain · Gaepo, Gangnam · reservation may be required · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:bytofu', '바이두부', '서울 용산구 소월로20길 10',
      37.5438348, 126.9842728, '0507-1378-7019',
      array['vegetarian', 'vegan']::text[], array['western']::text[], array['cafe', 'restaurant']::text[],
      '해방촌 비건 · 두부 볼·랩 · 화·수 휴무 · 방문 전 재확인 · 공식 인증 아님',
      'Haebangchon vegan · tofu bowls and wraps · closed Tue–Wed · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:plant-yeonnam', '플랜트 연남점', '서울 마포구 월드컵북로4길 87',
      37.5597095, 126.9231842, '02-337-1982',
      array['vegetarian', 'vegan']::text[], array['western']::text[], array['cafe', 'restaurant']::text[],
      '연남 비건 브런치 · 보울·후무스 · 월요일 휴무 · 방문 전 재확인 · 공식 인증 아님',
      'Yeonnam vegan brunch · bowls and hummus · closed Mondays · reconfirm before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:the-bread-blue-sinchon', '더브레드블루 신촌점', '서울 마포구 신촌로12다길 3',
      37.5551725, 126.9328070, '02-866-0723',
      array['vegetarian', 'vegan', 'dairy_free']::text[], array['dessert']::text[], array['bakery', 'cafe']::text[],
      '비건 베이커리 · 계란·유제품 미사용 · 방문 전 영업 재확인 · 공식 인증 아님',
      'Vegan bakery · no eggs or dairy · reconfirm hours before visiting · not an official certification',
      false
    ),
    (
      'seed:veg:legume', '레귬', '서울 강남구 강남대로 652 신사스퀘어 2층',
      37.5195995, 127.0190719, null::text,
      array['vegetarian', 'vegan']::text[], array['western']::text[], array['restaurant']::text[],
      '채식 파인다이닝 · 예약 권장 · 방문 전 영업 재확인 · 공식 인증 아님',
      'Vegetable fine dining · reserve ahead · reconfirm before visiting · not an official certification',
      false
    )
) as v(
  place_id, name, address, lat, lng, phone,
  diet_tags, cuisine_tags, venue_tags, memo, memo_en, closed
)
on conflict (place_id) do nothing;
