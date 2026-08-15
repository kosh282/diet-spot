import type { Locale } from "@/lib/i18n";

export const DIET_TAGS = [
  { value: "vegetarian", label: "채식", en: "Vegetarian" },
  { value: "vegan", label: "비건", en: "Vegan" },
  { value: "pescatarian", label: "페스코", en: "Pescatarian" },
  { value: "halal", label: "할랄", en: "Halal" },
  { value: "gluten_free", label: "글루텐프리", en: "Gluten-free" },
  { value: "no_seafood", label: "해산물 제외", en: "No seafood" },
  { value: "no_pork", label: "돼지고기 제외", en: "No pork" },
  { value: "dairy_free", label: "유제품 제외", en: "Dairy-free" },
] as const;

export const CUISINE_TAGS = [
  { value: "korean", label: "한식", en: "Korean" },
  { value: "chinese", label: "중식", en: "Chinese" },
  { value: "japanese", label: "일식", en: "Japanese" },
  { value: "western", label: "양식", en: "Western" },
  { value: "snack", label: "분식", en: "Snack" },
  { value: "asian", label: "아시안", en: "Asian" },
  { value: "south_asian", label: "인도/남아시아", en: "South Asian" },
  { value: "middle_eastern", label: "중동", en: "Middle Eastern" },
  { value: "dessert", label: "디저트", en: "Dessert" },
  { value: "other", label: "기타", en: "Other" },
] as const;

export const VENUE_TAGS = [
  { value: "restaurant", label: "식당", en: "Restaurant" },
  { value: "cafe", label: "카페", en: "Cafe" },
  { value: "bakery", label: "베이커리", en: "Bakery" },
  { value: "food_court", label: "푸드코트", en: "Food court" },
  { value: "takeout", label: "포장전문", en: "Takeout" },
  { value: "convenience", label: "편의점", en: "Convenience" },
] as const;

export type DietTag = (typeof DIET_TAGS)[number]["value"];
export type CuisineTag = (typeof CUISINE_TAGS)[number]["value"];
export type VenueTag = (typeof VENUE_TAGS)[number]["value"];

export type TagFilters = {
  diet: DietTag[];
  cuisine: CuisineTag[];
  venue: VenueTag[];
};

export const EMPTY_FILTERS: TagFilters = {
  diet: [],
  cuisine: [],
  venue: [],
};

function compactTag(
  list: readonly { value: string; label: string; en: string }[],
  value: string,
  locale: Locale,
) {
  const tag = list.find((item) => item.value === value);
  if (!tag) return value;
  return locale === "en" ? tag.en : tag.label;
}

export function dietChipLabel(value: string, locale: Locale = "ko") {
  return compactTag(DIET_TAGS, value, locale);
}

export function dietLabel(value: string, locale: Locale = "ko") {
  const tag = DIET_TAGS.find((item) => item.value === value);
  if (!tag) return value;
  return locale === "en" ? tag.en : `${tag.label} · ${tag.en}`;
}

export function cuisineLabel(value: string, locale: Locale = "ko") {
  return compactTag(CUISINE_TAGS, value, locale);
}

export function venueLabel(value: string, locale: Locale = "ko") {
  return compactTag(VENUE_TAGS, value, locale);
}

export function pinCaption(
  spot: { diet_tags: string[]; cuisine_tags: string[] },
  locale: Locale = "ko",
) {
  const parts: string[] = [];
  const cuisine = spot.cuisine_tags[0];
  if (cuisine) parts.push(cuisineLabel(cuisine, locale));

  const diets = spot.diet_tags.filter(
    (tag) => !(tag === "no_pork" && spot.diet_tags.includes("halal")),
  );
  for (const tag of diets.slice(0, 2)) {
    parts.push(compactTag(DIET_TAGS, tag, locale));
  }
  return parts.join(", ");
}

function tagMatches(selected: string, values: string[]) {
  if (values.includes(selected)) return true;
  return selected === "vegetarian" && values.includes("vegan");
}

function axisAnd(selected: string[], values: string[]) {
  return selected.length === 0 || selected.every((tag) => tagMatches(tag, values));
}

function axisOr(selected: string[], values: string[]) {
  return selected.length === 0 || selected.some((tag) => tagMatches(tag, values));
}

export function matchesFilters(
  spot: { diet_tags: string[]; cuisine_tags: string[]; venue_tags: string[] },
  filters: TagFilters,
) {
  return (
    axisAnd(filters.diet, spot.diet_tags) &&
    axisOr(filters.cuisine, spot.cuisine_tags) &&
    axisOr(filters.venue, spot.venue_tags)
  );
}

export function toggleTag<T extends string>(list: T[], value: T) {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
