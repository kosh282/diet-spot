"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import CloseButton from "@/components/shell/CloseButton";
import PlaceAddress from "@/components/spot/PlaceAddress";
import PlaceName from "@/components/spot/PlaceName";
import { DONGUK_CENTER, type Spot } from "@/lib/types";
import { searchNeedle, spotSearchHaystack } from "@/lib/place-name";
import { dietChipLabel } from "@/lib/tags";

type Props = {
  spots: Spot[];
  origin?: { lat: number; lng: number } | null;
  onClose: () => void;
  onSelect: (spot: Spot) => void;
  onAdd: (query: string) => void;
};

function nearer(origin: { lat: number; lng: number }) {
  return (a: Spot, b: Spot) => {
    const da = (a.lat - origin.lat) ** 2 + (a.lng - origin.lng) ** 2;
    const db = (b.lat - origin.lat) ** 2 + (b.lng - origin.lng) ** 2;
    return da - db;
  };
}

export default function SpotSearchSheet({ spots, origin, onClose, onSelect, onAdd }: Props) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const from = origin ?? DONGUK_CENTER;

  const index = useMemo(
    () => spots.map((spot) => ({ spot, hay: spotSearchHaystack(spot) })),
    [spots],
  );

  const needle = searchNeedle(query);
  const hits = useMemo(() => {
    const pool = needle
      ? index.filter((item) => item.hay.includes(needle)).map((item) => item.spot)
      : [...spots].sort(nearer(from)).slice(0, 8);
    return (needle ? pool.sort(nearer(from)) : pool).slice(0, 12);
  }, [index, needle, spots, from]);

  const emptyQuery = !needle;
  const noHits = Boolean(needle) && hits.length === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("searchTitle")}</h2>
        <CloseButton onClick={onClose} />
      </div>
      <div className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (needle && hits[0]) onSelect(hits[0]);
            else if (noHits) onAdd(query.trim());
          }}
          placeholder={t("searchPlaceholder")}
          autoFocus
          className="h-11 w-full rounded-xl border border-slate-200 px-3 pr-10 text-sm"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t("close")}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-lg text-slate-400"
          >
            ×
          </button>
        ) : null}
      </div>
      {emptyQuery ? <p className="text-xs text-slate-500">{t("searchNearby")}</p> : null}
      {noHits ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">{t("searchEmpty")}</p>
          <button
            type="button"
            onClick={() => onAdd(query.trim())}
            className="h-11 w-full rounded-xl bg-[var(--pin)] text-sm font-medium text-white"
          >
            {t("registerFab")}
          </button>
        </div>
      ) : null}
      {hits.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {hits.map((spot) => (
            <li key={spot.id}>
              <button type="button" onClick={() => onSelect(spot)} className="w-full py-3 text-left">
                <PlaceName name={spot.name} className="text-sm font-medium" />
                {spot.address ? (
                  <PlaceAddress address={spot.address} className="text-xs text-slate-500" />
                ) : null}
                {spot.diet_tags.length > 0 ? (
                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    {spot.diet_tags
                      .slice(0, 3)
                      .map((tag) => dietChipLabel(tag, locale))
                      .join(" · ")}
                  </p>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : emptyQuery ? (
        <p className="text-sm text-slate-500">{t("searchHint")}</p>
      ) : null}
    </div>
  );
}
