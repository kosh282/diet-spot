export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "DietSpot";

export const SITE_DESCRIPTION =
  "채식·할랄 태그를 지도에서 걸러 보는 공유 맛집 지도. A shared restaurant map for vegetarian and halal tags.";
