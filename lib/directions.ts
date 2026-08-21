import { distanceMeters, formatDistance } from "@/lib/geo";
import { displayPlaceName } from "@/lib/place-name";
import type { Locale } from "@/lib/i18n";

const WALK_M_PER_MIN = 80;

export function walkMinutes(meters: number) {
  return Math.max(1, Math.round(meters / WALK_M_PER_MIN));
}

export function routeSummary(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const meters = distanceMeters(from.lat, from.lng, to.lat, to.lng);
  return {
    meters,
    distanceLabel: formatDistance(meters),
    walkMin: walkMinutes(meters),
  };
}

export function kakaoDirectionsUrl(spot: { name: string; lat: number; lng: number }) {
  const name = spot.name.replace(/,/g, " ").trim();
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${spot.lat},${spot.lng}`;
}

export function naverDirectionsUrl(spot: { name: string; lat: number; lng: number }) {
  const name = encodeURIComponent(spot.name);
  return `https://map.naver.com/p/directions/-/${spot.lng},${spot.lat},${name},PLACE_POI/-/walk`;
}

export function googleDirectionsUrl(spot: { lat: number; lng: number }) {
  return `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=walking`;
}

export function appleDirectionsUrl(spot: { name: string; lat: number; lng: number }, locale: Locale) {
  const label = encodeURIComponent(displayPlaceName(spot.name, locale).primary);
  return `https://maps.apple.com/?daddr=${spot.lat},${spot.lng}&q=${label}&dirflg=w`;
}
