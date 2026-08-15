import type { SpotTrust } from "@/lib/types";

export type { SpotTrust };

export function isSpotTrust(value: unknown): value is SpotTrust {
  return value === "unverified" || value === "listed";
}

export function spotTrust(spot: { trust?: string | null }): SpotTrust {
  return isSpotTrust(spot.trust) ? spot.trust : "unverified";
}

export function hasHalal(tags: string[]) {
  return tags.includes("halal");
}

export function canEditHalalDiet(userId: string | null | undefined, createdBy: string) {
  return Boolean(userId && userId === createdBy);
}

export function halalDietChanged(prev: string[], next: string[]) {
  return hasHalal(prev) !== hasHalal(next);
}
