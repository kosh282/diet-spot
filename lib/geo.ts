export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)}km`;
}

export function sortByDistance<T extends { lat: number; lng: number }>(
  items: T[],
  origin: { lat: number; lng: number },
) {
  return [...items].sort(
    (a, b) =>
      distanceMeters(origin.lat, origin.lng, a.lat, a.lng) -
      distanceMeters(origin.lat, origin.lng, b.lat, b.lng),
  );
}
