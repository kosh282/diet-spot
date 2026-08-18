"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import CloseButton from "@/components/shell/CloseButton";
import PlaceAddress from "@/components/spot/PlaceAddress";
import PlaceName from "@/components/spot/PlaceName";
import TagPicker from "@/components/spot/TagPicker";
import { searchKakaoPlaces } from "@/lib/kakao";
import { searchNeedle, spotSearchHaystack } from "@/lib/place-name";
import type { CuisineTag, DietTag, VenueTag } from "@/lib/tags";
import { hasHalal } from "@/lib/trust";
import type { KakaoPlace, Spot } from "@/lib/types";

type Props = {
  spots: Spot[];
  initialQuery?: string;
  onClose: () => void;
  onOpenRegistered: (spot: Spot) => void;
  onExisting: (spot: Spot) => void;
  onSave: (input: {
    place: KakaoPlace;
    diet: DietTag[];
    cuisine: CuisineTag[];
    venue: VenueTag[];
    memo: string;
    memo_en: string;
  }) => Promise<void>;
};

export default function RegisterSheet({ spots, initialQuery = "", onClose, onOpenRegistered, onExisting, onSave }: Props) {
  const { t } = useI18n();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [selected, setSelected] = useState<KakaoPlace | null>(null);
  const [diet, setDiet] = useState<DietTag[]>([]);
  const [cuisine, setCuisine] = useState<CuisineTag[]>([]);
  const [venue, setVenue] = useState<VenueTag[]>([]);
  const [memo, setMemo] = useState("");
  const [memoEn, setMemoEn] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emptySearch, setEmptySearch] = useState(false);

  const searchIndex = useMemo(
    () => spots.map((spot) => ({ spot, hay: spotSearchHaystack(spot) })),
    [spots],
  );
  const registeredHits = useMemo(() => {
    const needle = searchNeedle(query);
    if (!needle) return [];
    return searchIndex
      .filter((item) => item.hay.includes(needle))
      .slice(0, 8)
      .map((item) => item.spot);
  }, [query, searchIndex]);
  const kakaoHits = useMemo(() => {
    const ids = new Set(registeredHits.map((spot) => spot.place_id));
    return results.filter((place) => !ids.has(place.id));
  }, [results, registeredHits]);

  async function lookup(keyword: string) {
    if (!keyword) return;
    setBusy(true);
    setError(null);
    setEmptySearch(false);
    try {
      const found = await searchKakaoPlaces(keyword);
      setResults(found);
      const needle = searchNeedle(keyword);
      const localHits = needle
        ? searchIndex.some((item) => item.hay.includes(needle))
        : false;
      setEmptySearch(found.length === 0 && !localHits);
    } catch {
      setError(t("searchFailed"));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!initialQuery.trim()) return;
    void lookup(initialQuery.trim());
    // First open from the browse search box should run Kakao once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  async function search(event: FormEvent) {
    event.preventDefault();
    await lookup(query.trim());
  }

  function pick(place: KakaoPlace) {
    const existing = spots.find((spot) => spot.place_id === place.id);
    if (existing) {
      onExisting(existing);
      return;
    }
    setSelected(place);
    setResults([]);
    setQuery("");
  }

  async function save() {
    if (!selected || diet.length < 1) return;
    if (hasHalal(diet) && !window.confirm(t("confirmHalalAdd"))) return;
    setBusy(true);
    setError(null);
    try {
      await onSave({
        place: selected,
        diet,
        cuisine,
        venue,
        memo: memo.slice(0, 300),
        memo_en: memoEn.slice(0, 300),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("registerTitle")}</h2>
        <CloseButton onClick={onClose} />
      </div>

      {!selected ? (
        <>
          <form onSubmit={search} className="flex gap-2">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setResults([]);
                setEmptySearch(false);
              }}
              placeholder={t("registerSearchPlaceholder")}
              autoFocus
              className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm"
            />
            <button
              type="submit"
              disabled={busy || !query.trim()}
              className="h-11 rounded-xl bg-[var(--pin)] px-4 text-sm font-medium text-white disabled:opacity-40"
            >
              {t("search")}
            </button>
          </form>
          {emptySearch ? (
            <p className="text-sm text-slate-500">{t("registerSearchEmpty")}</p>
          ) : null}
          {registeredHits.length > 0 ? (
            <div>
              <p className="text-xs font-medium text-slate-500">{t("searchRegistered")}</p>
              <ul className="divide-y divide-slate-100">
                {registeredHits.map((spot) => (
                  <li key={spot.id}>
                    <button
                      type="button"
                      onClick={() => onOpenRegistered(spot)}
                      className="w-full py-3 text-left"
                    >
                      <PlaceName name={spot.name} className="text-sm font-medium" />
                      {spot.address ? (
                        <PlaceAddress address={spot.address} className="text-xs text-slate-500" />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {kakaoHits.length > 0 ? (
            <div>
              {registeredHits.length > 0 ? (
                <p className="text-xs font-medium text-slate-500">{t("searchKakao")}</p>
              ) : null}
              <ul className="divide-y divide-slate-100">
                {kakaoHits.map((place) => (
                  <li key={place.id}>
                    <button
                      type="button"
                      onClick={() => pick(place)}
                      className="w-full py-3 text-left"
                    >
                      <PlaceName name={place.place_name} className="text-sm font-medium" />
                      {place.road_address_name || place.address_name ? (
                        <PlaceAddress
                          address={place.road_address_name || place.address_name}
                          className="text-xs text-slate-500"
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div>
            <PlaceName name={selected.place_name} className="font-medium" />
            {selected.road_address_name || selected.address_name ? (
              <PlaceAddress
                address={selected.road_address_name || selected.address_name}
                className="text-sm text-slate-500"
              />
            ) : null}
            {selected.phone ? <p className="text-sm text-slate-500">{selected.phone}</p> : null}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-1 text-xs text-[var(--pin)]"
            >
              {t("searchOther")}
            </button>
          </div>
          <TagPicker
            diet={diet}
            cuisine={cuisine}
            venue={venue}
            onDiet={setDiet}
            onCuisine={setCuisine}
            onVenue={setVenue}
          />
          <label className="block text-xs font-medium text-slate-600">
            {t("memo")}
            <textarea
              value={memo}
              maxLength={300}
              onChange={(event) => setMemo(event.target.value)}
              className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t("memoEn")}
            <textarea
              value={memoEn}
              maxLength={300}
              onChange={(event) => setMemoEn(event.target.value)}
              className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={diet.length < 1 || busy}
            onClick={save}
            className="h-11 w-full rounded-xl bg-[var(--pin)] text-sm font-medium text-white disabled:opacity-40"
          >
            {t("save")}
          </button>
        </>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
