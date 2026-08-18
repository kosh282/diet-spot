import type { SupabaseClient, User } from "@supabase/supabase-js";
import { searchKakaoPlace } from "@/lib/kakao";
import type { Spot } from "@/lib/types";
import { displayNameFromUser } from "@/lib/user";

export type SeedCandidate = {
  key: string;
  query: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  diet_tags: string[];
  cuisine_tags: string[];
  venue_tags: string[];
  memo: string;
  memo_en?: string;
};

const MEMO = "기획 후보 · 웹 조사 추정 태그 · 전화/방문 미확인 · 공식 인증 아님";
const MEMO_EN =
  "Candidate from web research · estimated tags · not phone/visit verified · not an official certification";

export const SEED_CANDIDATES: SeedCandidate[] = [
  {
    key: "jyoti-chungmuro",
    query: "죠티인도레스토랑 충무로",
    name: "죠티인도레스토랑",
    address: "서울 중구 서애로 12-4",
    lat: 37.5603142,
    lng: 126.9970992,
    diet_tags: ["vegetarian", "vegan"],
    cuisine_tags: ["south_asian"],
    venue_tags: ["restaurant"],
    memo: MEMO,
  },
  {
    key: "jeoksubang",
    query: "적수방 장충동",
    name: "적수방",
    address: "서울 중구 동호로24길 7-6",
    lat: 37.5597212,
    lng: 127.0048734,
    diet_tags: ["vegetarian", "vegan"],
    cuisine_tags: ["chinese", "asian"],
    venue_tags: ["restaurant"],
    memo: MEMO,
  },
  {
    key: "salady-chungmuro",
    query: "샐러디 충무로역점",
    name: "샐러디 충무로역점",
    address: "서울 중구 서애로1길 11",
    lat: 37.5613155,
    lng: 126.9985308,
    diet_tags: ["vegan"],
    cuisine_tags: ["other"],
    venue_tags: ["cafe", "takeout"],
    memo: MEMO,
  },
  {
    key: "kampungku",
    query: "캄퐁쿠 명동",
    name: "캄퐁쿠",
    address: "서울 중구 퇴계로20길 25",
    lat: 37.5581319,
    lng: 126.9866409,
    diet_tags: ["halal"],
    cuisine_tags: ["asian"],
    venue_tags: ["restaurant"],
    memo: MEMO,
  },
  {
    key: "coconuzm",
    query: "코코너즘 충무로",
    name: "코코너즘",
    address: "서울 중구 퇴계로36길 32",
    lat: 37.5621789,
    lng: 126.9935029,
    diet_tags: ["vegan", "dairy_free"],
    cuisine_tags: ["dessert"],
    venue_tags: ["cafe"],
    memo: MEMO,
  },
  {
    key: "earth-dome",
    query: "어스돔 필동",
    name: "어스돔",
    address: "서울 중구 퇴계로36가길 46",
    lat: 37.5611534,
    lng: 126.9965568,
    diet_tags: ["vegetarian"],
    cuisine_tags: ["dessert"],
    venue_tags: ["cafe"],
    memo: MEMO,
  },
  {
    key: "gurkha",
    query: "구르카 명동",
    name: "구르카",
    address: "서울 중구 명동10길 16-1",
    lat: 37.5630639,
    lng: 126.9851915,
    diet_tags: ["halal"],
    cuisine_tags: ["south_asian"],
    venue_tags: ["restaurant"],
    memo: MEMO,
  },
  {
    key: "busanjib",
    query: "부산집 명동8길",
    name: "부산집",
    address: "서울 중구 명동8길 11-4",
    lat: 37.5617707,
    lng: 126.9848871,
    diet_tags: ["halal", "no_pork"],
    cuisine_tags: ["korean"],
    venue_tags: ["restaurant"],
    memo: MEMO,
  },
];

export function localSeedSpots(): Spot[] {
  return SEED_CANDIDATES.map((item, index) => ({
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    place_id: `seed:${item.key}`,
    name: item.name,
    address: item.address,
    lat: item.lat,
    lng: item.lng,
    diet_tags: item.diet_tags,
    cuisine_tags: item.cuisine_tags,
    venue_tags: item.venue_tags,
    memo: item.memo,
    memo_en: item.memo_en ?? MEMO_EN,
    created_by: "00000000-0000-4000-8000-000000000000",
    created_by_nickname: "DietSpot",
    last_edited_by: null,
    last_edited_nickname: null,
    source: "seed",
    trust: "unverified",
    phone: null,
    place_url: null,
    closed: false,
    last_confirmed_at: null,
    last_confirmed_by: null,
    last_confirmed_nickname: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export async function persistSeedSpots(
  supabase: SupabaseClient,
  user: User,
) {
  const nickname = displayNameFromUser(user);
  const { data: rows } = await supabase.from("spots").select("id,place_id,name,phone,place_url");
  const existing = rows ?? [];
  const placeIds = new Set(existing.map((row) => row.place_id as string));
  const names = new Set(existing.map((row) => row.name as string));

  for (const candidate of SEED_CANDIDATES) {
    const row = existing.find(
      (item) => item.place_id === `seed:${candidate.key}` || item.name === candidate.name,
    );
    if (row?.phone && row.place_url) continue;

    const kakao = await searchKakaoPlace(candidate.query, {
      lat: candidate.lat,
      lng: candidate.lng,
    });

    if (row) {
      if (!kakao) continue;
      await supabase
        .from("spots")
        .update({
          phone: row.phone || kakao.phone,
          place_url: row.place_url || kakao.place_url,
        })
        .eq("id", row.id);
      continue;
    }

    const placeId = kakao?.id ?? `seed:${candidate.key}`;
    if (placeIds.has(placeId) || names.has(candidate.name)) continue;
    const { error } = await supabase.from("spots").insert({
      place_id: placeId,
      name: kakao?.place_name ?? candidate.name,
      address: kakao?.road_address_name || kakao?.address_name || candidate.address,
      lat: kakao ? Number(kakao.y) : candidate.lat,
      lng: kakao ? Number(kakao.x) : candidate.lng,
      diet_tags: candidate.diet_tags,
      cuisine_tags: candidate.cuisine_tags,
      venue_tags: candidate.venue_tags,
      memo: candidate.memo,
      memo_en: candidate.memo_en ?? MEMO_EN,
      phone: kakao?.phone ?? null,
      place_url: kakao?.place_url ?? null,
      created_by: user.id,
      created_by_nickname: nickname,
      last_edited_by: user.id,
      last_edited_nickname: nickname,
      source: "seed",
    });
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }
    placeIds.add(placeId);
    names.add(candidate.name);
  }
}
