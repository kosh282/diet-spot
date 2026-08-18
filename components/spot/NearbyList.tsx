"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import PlaceName from "@/components/spot/PlaceName";
import { DONGUK_CENTER, type Spot } from "@/lib/types";
import { distanceMeters, formatDistance, sortByDistance } from "@/lib/geo";
import { pinCaption } from "@/lib/tags";

const LIMIT = 6;

type Props = {
  spots: Spot[];
  origin: { lat: number; lng: number } | null;
  fromYou: boolean;
  onPick: (spot: Spot) => void;
};

export default function NearbyList({ spots, origin, fromYou, onPick }: Props) {
  const { locale, t } = useI18n();
  const center = origin ?? DONGUK_CENTER;
  const rows = sortByDistance(spots, center).slice(0, LIMIT);

  if (rows.length === 0) return null;

  return (
    <div className="card pointer-events-auto w-[min(20.5rem,calc(100vw-5.75rem))] overflow-hidden">
      <div className="flex items-baseline justify-between gap-2 px-3 pt-2.5">
        <p className="text-xs font-semibold text-slate-800">{t("nearbyTitle")}</p>
        <p className="text-[11px] text-slate-500">{fromYou ? t("nearbyFromMe") : t("nearbyFromCenter")}</p>
      </div>
      <ul className="max-h-[min(28vh,16rem)] overflow-y-auto overscroll-contain py-1">
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
    </div>
  );
}
