"use client";

import { useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import {
  CUISINE_TAGS,
  DIET_TAGS,
  VENUE_TAGS,
  cuisineLabel,
  dietChipLabel,
  toggleTag,
  venueLabel,
  type TagFilters,
} from "@/lib/tags";

type Props = {
  filters: TagFilters;
  onChange: (filters: TagFilters) => void;
  showClosed: boolean;
  onShowClosed: (value: boolean) => void;
};

export default function FilterChips({ filters, onChange, showClosed, onShowClosed }: Props) {
  const { locale, t } = useI18n();
  const [more, setMore] = useState(
    () => filters.cuisine.length > 0 || filters.venue.length > 0 || showClosed,
  );

  return (
    <div className="card max-w-full space-y-2 px-3 py-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {DIET_TAGS.map((tag) => {
          const on = filters.diet.includes(tag.value);
          return (
            <button
              key={tag.value}
              type="button"
              onClick={() =>
                onChange({ ...filters, diet: toggleTag(filters.diet, tag.value) })
              }
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                on ? "bg-[var(--pin)] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {dietChipLabel(tag.value, locale)}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMore((value) => !value)}
          className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200"
        >
          {more ? t("less") : t("more")}
        </button>
      </div>
      {more ? (
        <div className="space-y-2">
          <ChipRow
            label={t("cuisine")}
            options={CUISINE_TAGS.map((tag) => ({
              value: tag.value,
              label: cuisineLabel(tag.value, locale),
            }))}
            selected={filters.cuisine}
            onToggle={(value) =>
              onChange({ ...filters, cuisine: toggleTag(filters.cuisine, value) })
            }
          />
          <ChipRow
            label={t("venue")}
            options={VENUE_TAGS.map((tag) => ({
              value: tag.value,
              label: venueLabel(tag.value, locale),
            }))}
            selected={filters.venue}
            onToggle={(value) =>
              onChange({ ...filters, venue: toggleTag(filters.venue, value) })
            }
          />
          <div>
            <p className="mb-1 text-[11px] text-slate-500">{t("status")}</p>
            <button
              type="button"
              onClick={() => onShowClosed(!showClosed)}
              className={`rounded-full px-2.5 py-1 text-xs ${
                showClosed ? "bg-[var(--pin)] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {t("showClosed")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ChipRow<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: { value: T; label: string }[];
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((tag) => {
          const on = selected.includes(tag.value);
          return (
            <button
              key={tag.value}
              type="button"
              onClick={() => onToggle(tag.value)}
              className={`rounded-full px-2.5 py-1 text-xs ${
                on ? "bg-[var(--pin)] text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
