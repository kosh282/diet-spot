"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import PlaceName from "@/components/spot/PlaceName";
import { DONGUK_CENTER, type Spot } from "@/lib/types";
import { distanceMeters, formatDistance, sortByDistance } from "@/lib/geo";
import { pinCaption } from "@/lib/tags";

const LIMIT = 6;
const OPEN_KEY = "dietspot_nearby_open";

type Props = {
  spots: Spot[];
  origin: { lat: number; lng: number } | null;
  fromYou: boolean;
  onPick: (spot: Spot) => void;
};

function readOpen(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(OPEN_KEY) === "1";
}

export default function NearbyList({ spots, origin, fromYou, onPick }: Props) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(readOpen);
  const center = origin ?? DONGUK_CENTER;
  const rows = sortByDistance(spots, center).slice(0, LIMIT);

  if (rows.length === 0) return null;

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      sessionStorage.setItem(OPEN_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div
      className={`card pointer-events-auto overflow-hidden ${
        open ? "w-[min(20.5rem,calc(100vw-5.75rem))]" : ""
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? t("nearbyHide") : t("nearbyShow")}
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-slate-50"
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-xs font-semibold text-slate-800">{t("nearbyTitle")}</span>
          {open ? (
            <span className="truncate text-[11px] text-slate-500">
              {fromYou ? t("nearbyFromMe") : t("nearbyFromCenter")}
            </span>
          ) : (
            <span className="text-[11px] tabular-nums text-slate-500">{rows.length}</span>
          )}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M7.4 14.6 12 10l4.6 4.6L18 13.2l-6-6-6 6z"
          />
        </svg>
      </button>
      {open ? (
        <ul className="max-h-[min(28vh,16rem)] overflow-y-auto overscroll-contain border-t border-slate-100 py-1">
          {rows.map((spot) => (
            <li key={spot.id}>
              <button
                type="button"
                onClick={() => onPick(spot)}
                className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50"
              >
                <span className="min-w-0">
                  <PlaceName
                    name={spot.name}
                    as="span"
                    className="block truncate text-sm font-medium text-slate-800"
                    secondaryClassName="mt-0 block truncate text-[11px] font-normal text-slate-500"
                  />
                  <span className="mt-0.5 block truncate text-[11px] text-slate-500">
                    {pinCaption(spot, locale)}
                  </span>
                </span>
                <span className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-[var(--pin)]">
                  {formatDistance(distanceMeters(center.lat, center.lng, spot.lat, spot.lng))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
