-- English notes for foreign users. Korean memo stays in memo.
alter table public.spots
  add column if not exists memo_en text not null default '';

alter table public.spots
  drop constraint if exists spots_memo_en_len;

alter table public.spots
  add constraint spots_memo_en_len check (char_length(memo_en) <= 300);

update public.spots
set memo_en = 'Candidate from web research · estimated tags · not phone/visit verified · not an official certification'
where source = 'seed'
  and memo_en = ''
  and memo like '%기획 후보%';

update public.spots as s
set memo_en = v.memo_en
from (
  values
    ('seed:halal:bombay-grill', 'Halal seed · biryani, curry, naan · reconfirm before visiting · not an official certification'),
    ('seed:halal:eid', 'Reported KMF halal certification · bulgogi, samgyetang, jjimdak · reconfirm before visiting · not an official certification'),
    ('seed:halal:plant', 'Vegan restaurant · reported on a halal list · veggie burger · reconfirm before visiting · not an official certification'),
    ('seed:halal:pizza-burger-plus', 'Halal seed · halal fast food · reconfirm before visiting · not an official certification'),
    ('seed:halal:halal-guys-itaewon', 'Halal seed · chicken and beef gyro · reconfirm before visiting · not an official certification'),
    ('seed:halal:nostalgia-151', 'Halal seed · grilled bulgogi, sundubu-jjigae · reconfirm before visiting · not an official certification'),
    ('seed:halal:osegyehyang', 'Korean vegetarian · reported on a halal list · veg jajang, vegan steak · reconfirm before visiting · not an official certification'),
    ('seed:halal:alchon-edae', 'Halal seed · albap (rice in a hot stone bowl) · reconfirm before visiting · not an official certification'),
    ('seed:halal:jjukkumi-king', 'Halal seed · grilled fish · reconfirm before visiting · not an official certification'),
    ('seed:halal:makan', 'Confirmed closed as of 2026 · kept in seed · was halal Korean food'),
    ('seed:halal:halal-kitchen-samcheong', 'Likely closed · kept in seed · was halal Korean food'),
    ('seed:halal:jibbap-kim', 'Reported KMF halal certification · Korean set, bulgogi · reconfirm before visiting · not an official certification'),
    ('seed:halal:kervan-itaewon', 'VisitSeoul lists halal certification · Turkish kebab · reconfirm before visiting · not an official certification'),
    ('seed:halal:kervan-coex', 'VisitSeoul lists halal certification · COEX / Parnas · reconfirm before visiting · not an official certification'),
    ('seed:halal:kervan-banpo', 'VisitSeoul lists halal certification · Shinsegae Gangnam · reconfirm before visiting · not an official certification'),
    ('seed:halal:yang-good', 'Halal lamb BBQ · alcohol served (Muslim Friendly) · reconfirm before visiting · not an official certification'),
    ('seed:halal:petra', 'VisitSeoul lists as halal · Middle Eastern food · reconfirm before visiting · not an official certification'),
    ('seed:halal:salam', 'Halal seed · Turkish food · reconfirm before visiting · not an official certification'),
    ('seed:halal:murree', 'VisitKorea lists as halal · Korean and curry · reconfirm before visiting · not an official certification'),
    ('seed:halal:cherry-garden', 'Reported KIHI halal certification · prayer room · Korean set · reconfirm before visiting · not an official certification'),
    ('seed:halal:sechawan', 'Reported halal-certified cafe · Myeongdong breakfast · reconfirm before visiting · not an official certification'),
    ('seed:halal:seoul-iya', 'Muslim-run halal Korean food · Hongdae · closed Fridays · reconfirm before visiting · not an official certification'),
    ('seed:halal:baraka-cafe', 'Cafe at Seoul Central Mosque · halal dessert and tea · reconfirm hours before visiting · not an official certification'),
    ('seed:halal:star-samarkand', 'Uzbek Muslim-run · plov, shashlik · reconfirm before visiting · not an official certification')
) as v(place_id, memo_en)
where s.place_id = v.place_id
  and s.memo_en = '';

update public.spots
set memo_en = 'Seed listing · reconfirm before visiting · not an official certification'
where source = 'seed'
  and memo_en = '';
