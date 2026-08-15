import { isLocale, type Locale } from "@/lib/i18n";
import {
  CUISINE_TAGS,
  DIET_TAGS,
  EMPTY_FILTERS,
  VENUE_TAGS,
  type CuisineTag,
  type DietTag,
  type TagFilters,
  type VenueTag,
} from "@/lib/tags";

export type MapSearchState = {
  filters: TagFilters;
  showClosed: boolean;
  spotId: string | null;
  locale: Locale | null;
};

const DIET = new Set<string>(DIET_TAGS.map((tag) => tag.value));
const CUISINE = new Set<string>(CUISINE_TAGS.map((tag) => tag.value));
const VENUE = new Set<string>(VENUE_TAGS.map((tag) => tag.value));

function csv<T extends string>(raw: string | null, allowed: Set<string>) {
  if (!raw) return [] as T[];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is T => allowed.has(item));
}

export function emptyMapSearch(): MapSearchState {
  return {
    filters: { ...EMPTY_FILTERS, diet: [], cuisine: [], venue: [] },
    showClosed: false,
    spotId: null,
    locale: null,
  };
}

export function parseMapSearch(search: string): MapSearchState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const lang = params.get("lang");
  return {
    filters: {
      diet: csv<DietTag>(params.get("diet"), DIET),
      cuisine: csv<CuisineTag>(params.get("cuisine"), CUISINE),
      venue: csv<VenueTag>(params.get("venue"), VENUE),
    },
    showClosed: params.get("closed") === "1",
    spotId: params.get("spot"),
    locale: isLocale(lang) ? lang : null,
  };
}

export function mapSearchParams(state: {
  filters: TagFilters;
  showClosed: boolean;
  spotId: string | null;
  locale: Locale;
}) {
  const params = new URLSearchParams();
  if (state.filters.diet.length) params.set("diet", state.filters.diet.join(","));
  if (state.filters.cuisine.length) params.set("cuisine", state.filters.cuisine.join(","));
  if (state.filters.venue.length) params.set("venue", state.filters.venue.join(","));
  if (state.showClosed) params.set("closed", "1");
  if (state.spotId) params.set("spot", state.spotId);
  if (state.locale === "en") params.set("lang", "en");
  return params;
}

export function replaceMapUrl(state: {
  filters: TagFilters;
  showClosed: boolean;
  spotId: string | null;
  locale: Locale;
}) {
  if (typeof window === "undefined") return;
  const query = mapSearchParams(state).toString();
  const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  if (`${window.location.pathname}${window.location.search}` !== next) {
    window.history.replaceState(null, "", next);
  }
}

export function currentMapHref() {
  return `${window.location.origin}${window.location.pathname}${window.location.search}`;
}
