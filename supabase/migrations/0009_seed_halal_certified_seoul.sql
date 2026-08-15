-- Seoul halal / Muslim-friendly seed (prototype baseline).
-- User-submitted certified list + VisitSeoul / 2026 guides.
-- Closed places are stored with closed = true so they stay off the live map.
-- Not an official DietSpot certification.

insert into public.spots (
  place_id, name, address, lat, lng, phone,
  diet_tags, cuisine_tags, venue_tags, memo, closed,
  created_by, created_by_nickname, last_edited_by, last_edited_nickname, source
)
select
  v.place_id, v.name, v.address, v.lat, v.lng, v.phone,
  v.diet_tags, v.cuisine_tags, v.venue_tags, v.memo, v.closed,
  u.id, 'DietSpot', u.id, 'DietSpot', 'seed'
from (select 'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5'::uuid as id) as u
cross join (
  values
    -- User list
    (
      'seed:halal:bombay-grill', '봄베이그릴', '서울 용산구 우사단로10길 11',
      37.5331990, 126.9962347, '02-792-7155',
      array['halal', 'no_pork']::text[], array['south_asian']::text[], array['restaurant']::text[],
      '할랄 시드 · 비리야니·커리·난 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:eid', '이드', '서울 용산구 우사단로10길 67',
      37.5336500, 126.9979500, '070-8899-8210',
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      'KMF 할랄 인증 제보 · 불고기·삼계탕·찜닭 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:plant', '플랜트', '서울 용산구 보광로 117',
      37.5331798, 126.9943183, '02-749-1981',
      array['vegetarian', 'vegan', 'halal']::text[], array['western']::text[], array['cafe', 'restaurant']::text[],
      '비건 식당 · 할랄 목록 제보 · 베지버거 · 방문 전 인증 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:pizza-burger-plus', '피자앤버거플러스', '서울 용산구 우사단로 19-1',
      37.5328360, 126.9953127, '02-790-4883',
      array['halal', 'no_pork']::text[], array['western']::text[], array['restaurant']::text[],
      '할랄 시드 · 할랄 패스트푸드 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:halal-guys-itaewon', '할랄가이즈 이태원점', '서울 용산구 이태원로 187',
      37.5347271, 126.9947819, '02-794-8308',
      array['halal', 'no_pork']::text[], array['middle_eastern']::text[], array['restaurant']::text[],
      '할랄 시드 · 치킨·비프 자이로 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:nostalgia-151', '노스탤지아151 광화문점', '서울 종로구 새문안로9길 19',
      37.5708701, 126.9758872, '02-733-3522',
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      '할랄 시드 · 석쇠불고기·순두부찌개 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:osegyehyang', '오세계향', '서울 종로구 인사동12길 14-5',
      37.5746610, 126.9852825, '02-735-7171',
      array['vegetarian', 'vegan', 'halal']::text[], array['korean']::text[], array['restaurant']::text[],
      '채식 한식 · 할랄 목록 제보 · 채식짜장·비건스테이크 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:alchon-edae', '알촌 이대점', '서울 서대문구 이화여대7길 14',
      37.5588226, 126.9449546, '02-1661-1907',
      array['halal', 'pescatarian']::text[], array['korean']::text[], array['restaurant']::text[],
      '할랄 시드 · 알밥 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:jjukkumi-king', '쭈꾸미킹', '서울 광진구 능동로13길 39',
      37.5436362, 127.0698408, '02-469-3392',
      array['halal', 'pescatarian']::text[], array['korean']::text[], array['restaurant']::text[],
      '할랄 시드 · 생선구이 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:makan', '마칸', '서울 용산구 우사단로10길 52',
      37.5334500, 126.9979000, '02-6012-2231',
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      '2026 기준 폐업 확인 · 시드 보존 · 불고기·삼계탕 하던 할랄 한식',
      true
    ),
    (
      'seed:halal:halal-kitchen-samcheong', '할랄키친', '서울 종로구 삼청로 86-4',
      37.5830602, 126.9820580, '02-733-3106',
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      '폐업 추정 · 시드 보존 · 닭강정·한방삼계탕 하던 할랄 한식',
      true
    ),

    -- Additional Seoul listings (VisitSeoul / 2026 guides)
    (
      'seed:halal:jibbap-kim', '집밥김선생', '서울 용산구 녹사평대로32길 3',
      37.5321361, 126.9910236, '02-792-3731',
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      'KMF 할랄 인증 제보 · 한상차림·불고기 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:kervan-itaewon', '케르반 이태원점', '서울 용산구 이태원로 192',
      37.5343672, 126.9953445, '02-792-4767',
      array['halal', 'no_pork']::text[], array['middle_eastern']::text[], array['restaurant']::text[],
      'VisitSeoul 할랄 인증 표기 · 터키 케밥 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:kervan-coex', '케르반 코엑스점', '서울 강남구 봉은사로 524 H105',
      37.5128251, 127.0572645, '0507-1326-4767',
      array['halal', 'no_pork']::text[], array['middle_eastern']::text[], array['restaurant']::text[],
      'VisitSeoul 할랄 인증 표기 · 코엑스·파르나스 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:kervan-banpo', '케르반 반포점', '서울 서초구 신반포로 176 신세계강남 B1',
      37.5041078, 127.0040297, '02-797-2356',
      array['halal', 'no_pork']::text[], array['middle_eastern']::text[], array['restaurant']::text[],
      'VisitSeoul 할랄 인증 표기 · 신세계강남 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:yang-good', '양국', '서울 강남구 논현로95길 15',
      37.5020426, 127.0347007, '02-567-7060',
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      '할랄 양고기 BBQ · 주류 판매(Muslim Friendly) · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:petra', '페트라', '서울 용산구 녹사평대로40길 33',
      37.5344353, 126.9877051, '02-790-4433',
      array['halal', 'no_pork']::text[], array['middle_eastern']::text[], array['restaurant']::text[],
      'VisitSeoul 할랄 표기 · 중동 요리 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:salam', '쌀람', '서울 용산구 우사단로10길 39',
      37.5332495, 126.9976150, '02-793-4323',
      array['halal', 'no_pork']::text[], array['middle_eastern']::text[], array['restaurant']::text[],
      '할랄 시드 · 터키 요리 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:murree', '마리무슬림푸드', '서울 용산구 우사단로10길 20',
      37.5328406, 126.9962669, '02-3785-1436',
      array['halal', 'no_pork']::text[], array['korean', 'south_asian']::text[], array['restaurant']::text[],
      'VisitKorea 할랄 표기 · 한식·커리 · 방문 전 인증·영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:cherry-garden', '체리가든', '서울 종로구 종로 326 2층',
      37.5727000, 127.0148000, '02-6449-7043',
      array['halal', 'vegetarian', 'vegan']::text[], array['korean']::text[], array['restaurant']::text[],
      'KIHI 할랄 인증 제보 · 기도실 · 한식 반상 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:sechawan', '세차완', '서울 중구 소공로6길 13-7',
      37.5588841, 126.9838024, '010-5139-5711',
      array['halal']::text[], array['dessert']::text[], array['cafe']::text[],
      '할랄 인증 카페 제보 · 명동 조식 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:seoul-iya', '서울이야', '서울 마포구 동교로 212-22 2층',
      37.5592537, 126.9243724, null::text,
      array['halal', 'no_pork']::text[], array['korean']::text[], array['restaurant']::text[],
      '무슬림 운영 할랄 한식 · 홍대 · 금요일 휴무 · 방문 전 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:baraka-cafe', '바라카카페', '서울 용산구 우사단로10길 39 서울중앙성원 신관 1층',
      37.5335500, 126.9977500, '02-797-7774',
      array['halal']::text[], array['dessert']::text[], array['cafe']::text[],
      '서울중앙성원 부속 카페 · 할랄 디저트·차 · 방문 전 영업 재확인 · 공식 인증 아님',
      false
    ),
    (
      'seed:halal:star-samarkand', '스타사마르칸트', '서울 중구 을지로42길 14',
      37.5652125, 127.0054931, '02-2279-7780',
      array['halal', 'no_pork']::text[], array['other']::text[], array['restaurant']::text[],
      '우즈벡 무슬림 운영 · 플로프·샤슬릭 · 방문 전 인증 재확인 · 공식 인증 아님',
      false
    )
) as v(
  place_id, name, address, lat, lng, phone,
  diet_tags, cuisine_tags, venue_tags, memo, closed
)
on conflict (place_id) do nothing;

update public.spots
set
  phone = '02-310-9249',
  last_edited_by = 'a1a1a1a1-b2b2-c3c3-d4d4-e5e5e5e5e5e5',
  last_edited_nickname = 'DietSpot'
where place_id = 'seed:kampungku'
  and (phone is null or phone <> '02-310-9249');
