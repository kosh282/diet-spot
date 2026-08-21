import type { KakaoPlace } from "@/lib/types";

type KakaoSearchItem = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  phone?: string;
  place_url?: string;
};

export function kakaoPlacePageUrl(placeUrl?: string | null, placeId?: string | null) {
  const raw = placeUrl?.trim();
  if (raw?.includes("place.map.kakao.com")) {
    return raw.replace(/^http:\/\//, "https://");
  }
  if (placeId && /^\d+$/.test(placeId)) {
    return `https://place.map.kakao.com/${placeId}`;
  }
  return null;
}

export function kakaoMapPinUrl(spot: { name: string; lat: number; lng: number }) {
  return `https://map.kakao.com/link/map/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`;
}

export { kakaoDirectionsUrl } from "@/lib/directions";

function toKakaoPlace(item: KakaoSearchItem): KakaoPlace {
  return {
    id: item.id,
    place_name: item.place_name,
    address_name: item.address_name,
    road_address_name: item.road_address_name,
    x: item.x,
    y: item.y,
    phone: item.phone?.trim() || null,
    place_url: kakaoPlacePageUrl(item.place_url, item.id),
  };
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

function pickNearbyPlace(
  results: KakaoPlace[],
  lat: number,
  lng: number,
  name: string,
  maxMeters = 800,
) {
  const compact = name.replace(/\s/g, "");
  const named = results.filter((item) => item.place_name.replace(/\s/g, "").includes(compact.slice(0, 3)));
  const pool = named.length > 0 ? named : results;
  let best: KakaoPlace | null = null;
  let bestDistance = Infinity;
  for (const item of pool) {
    const distance = distanceMeters(lat, lng, Number(item.y), Number(item.x));
    if (distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }
  return bestDistance < maxMeters ? best : null;
}

function waitForKakaoServices(timeoutMs = 4000) {
  return new Promise<boolean>((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (window.kakao?.maps?.services) {
        resolve(true);
        return;
      }
      if (Date.now() - started >= timeoutMs) {
        resolve(false);
        return;
      }
      window.setTimeout(tick, 100);
    };
    tick();
  });
}

export function searchKakaoPlaces(
  keyword: string,
  near?: { lat: number; lng: number },
): Promise<KakaoPlace[]> {
  return new Promise((resolve, reject) => {
    if (!window.kakao?.maps?.services) {
      reject(new Error("지도 검색을 아직 불러오지 못했어요."));
      return;
    }
    const places = new window.kakao.maps.services.Places();
    const options = near
      ? {
          location: new window.kakao.maps.LatLng(near.lat, near.lng),
          radius: 2000,
          sort: window.kakao.maps.services.SortBy?.DISTANCE,
        }
      : undefined;
    places.keywordSearch(
      keyword,
      (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          resolve(data.map(toKakaoPlace));
          return;
        }
        resolve([]);
      },
      options,
    );
  });
}

export function searchKakaoPlace(
  query: string,
  near?: { lat: number; lng: number },
): Promise<KakaoPlace | null> {
  return searchKakaoPlaces(query, near)
    .then((rows) => (near ? pickNearbyPlace(rows, near.lat, near.lng, query) : (rows[0] ?? null)))
    .catch(() => null);
}

export async function resolveKakaoPlacePage(spot: {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  place_url?: string | null;
  phone?: string | null;
}) {
  const stored = kakaoPlacePageUrl(spot.place_url, spot.place_id);
  if (stored && spot.phone) return { place_url: stored, phone: spot.phone };

  const ready = await waitForKakaoServices();
  if (!ready) return stored ? { place_url: stored, phone: spot.phone ?? null } : null;

  try {
    let rows = await searchKakaoPlaces(spot.name, { lat: spot.lat, lng: spot.lng });
    if (rows.length === 0) {
      rows = await searchKakaoPlaces(spot.name);
    }
    const match =
      pickNearbyPlace(rows, spot.lat, spot.lng, spot.name, 1500) ??
      pickNearbyPlace(rows, spot.lat, spot.lng, spot.name, 4000) ??
      rows[0] ??
      null;
    if (!match && !stored) return null;
    return {
      place_url: stored ?? kakaoPlacePageUrl(match?.place_url, match?.id),
      phone: spot.phone || match?.phone || null,
    };
  } catch {
    return stored ? { place_url: stored, phone: spot.phone ?? null } : null;
  }
}
