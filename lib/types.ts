export type SpotSource = "seed" | "user";
export type SpotTrust = "unverified" | "listed";

export type Spot = {
  id: string;
  place_id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  diet_tags: string[];
  cuisine_tags: string[];
  venue_tags: string[];
  memo: string;
  memo_en: string;
  created_by: string;
  created_by_nickname: string;
  last_edited_by: string | null;
  last_edited_nickname: string | null;
  source: SpotSource;
  trust: SpotTrust;
  phone: string | null;
  place_url: string | null;
  closed: boolean;
  last_confirmed_at: string | null;
  last_confirmed_by: string | null;
  last_confirmed_nickname: string | null;
  created_at: string;
  updated_at: string;
};

export type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  phone: string | null;
  place_url: string | null;
};

export const DONGUK_CENTER = { lat: 37.5583, lng: 126.9990 };
export const RETURN_TO_KEY = "dietspot_return_to";
export const REGISTER_QUERY_KEY = "dietspot_register_query";
