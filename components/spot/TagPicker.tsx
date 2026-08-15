"use client";

import {
  CUISINE_TAGS,
  DIET_TAGS,
  VENUE_TAGS,
  cuisineLabel,
  dietLabel,
  toggleTag,
  venueLabel,
  type CuisineTag,
  type DietTag,
  type VenueTag,
} from "@/lib/tags";
import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  diet: DietTag[];
  cuisine: CuisineTag[];
  venue: VenueTag[];
  onDiet: (diet: DietTag[]) => void;
  onCuisine: (cuisine: CuisineTag[]) => void;
  onVenue: (venue: VenueTag[]) => void;
  lockHalal?: boolean;
  lockDiet?: boolean;
};

export default function TagPicker({
  diet,
  cuisine,
  venue,
  onDiet,
  onCuisine,
  onVenue,
  lockHalal = false,
  lockDiet = false,
}: Props) {
  const { locale, t } = useI18n();

  return (
    <div className="space-y-3">
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-slate-600">
          {t("dietRequired")}
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {DIET_TAGS.map((tag) => {
            const on = diet.includes(tag.value);
            const locked = lockDiet || (lockHalal && tag.value === "halal");
            return (
              <button
                key={tag.value}
                type="button"
                disabled={locked}
                onClick={() => onDiet(toggleTag(diet, tag.value))}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  on ? "bg-[var(--pin)] text-white" : "bg-slate-100"
                } ${locked ? "cursor-not-allowed opacity-50" : ""}`}
              >
                {dietLabel(tag.value, locale)}
              </button>
            );
          })}
        </div>
        {lockDiet || lockHalal ? (
          <p className="mt-1.5 text-[11px] text-slate-500">{t("halalLocked")}</p>
        ) : null}
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-slate-600">{t("cuisine")}</legend>
        <div className="flex flex-wrap gap-1.5">
          {CUISINE_TAGS.map((tag) => {
            const on = cuisine.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => onCuisine(toggleTag(cuisine, tag.value))}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  on ? "bg-[var(--pin)] text-white" : "bg-slate-100"
                }`}
              >
                {cuisineLabel(tag.value, locale)}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-slate-600">{t("venue")}</legend>
        <div className="flex flex-wrap gap-1.5">
          {VENUE_TAGS.map((tag) => {
            const on = venue.includes(tag.value);
            return (
              <button
                key={tag.value}
                type="button"
                onClick={() => onVenue(toggleTag(venue, tag.value))}
                className={`rounded-full px-2.5 py-1 text-xs ${
                  on ? "bg-[var(--pin)] text-white" : "bg-slate-100"
                }`}
              >
                {venueLabel(tag.value, locale)}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
