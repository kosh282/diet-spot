export type UserLocation = {
  lat: number;
  lng: number;
  accuracy: number;
  source: "gps" | "ip";
};

export function isLikelyMobile() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function gpsOptions(highAccuracy: boolean): PositionOptions {
  return {
    enableHighAccuracy: highAccuracy,
    timeout: highAccuracy ? 10000 : 6000,
    maximumAge: highAccuracy ? 8000 : 30000,
  };
}

export function getGpsPosition(highAccuracy = true) {
  return new Promise<UserLocation>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation unavailable"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy || 40,
          source: "gps",
        });
      },
      reject,
      gpsOptions(highAccuracy),
    );
  });
}

export function watchGps(onChange: (location: UserLocation) => void) {
  if (!navigator.geolocation) return () => undefined;
  const id = navigator.geolocation.watchPosition(
    (pos) => {
      onChange({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy || 40,
        source: "gps",
      });
    },
    () => undefined,
    gpsOptions(true),
  );
  return () => navigator.geolocation.clearWatch(id);
}

async function ipFromWho() {
  const res = await fetch("https://ipwho.is/?fields=success,latitude,longitude,country_code");
  if (!res.ok) throw new Error("ipwho failed");
  const data = (await res.json()) as {
    success?: boolean;
    latitude?: number;
    longitude?: number;
  };
  if (!data.success || typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error("ipwho empty");
  }
  return { lat: data.latitude, lng: data.longitude };
}

async function ipFromApiCo() {
  const res = await fetch("https://ipapi.co/json/");
  if (!res.ok) throw new Error("ipapi failed");
  const data = (await res.json()) as { latitude?: number; longitude?: number };
  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    throw new Error("ipapi empty");
  }
  return { lat: data.latitude, lng: data.longitude };
}

export async function getIpPosition(): Promise<UserLocation> {
  const coords = await ipFromWho().catch(() => ipFromApiCo());
  return { ...coords, accuracy: 4000, source: "ip" };
}

export async function getUserLocation(preferGps: boolean): Promise<UserLocation> {
  if (preferGps) {
    try {
      return await getGpsPosition(true);
    } catch {
      return getIpPosition();
    }
  }
  try {
    return await getIpPosition();
  } catch {
    return getGpsPosition(false);
  }
}
