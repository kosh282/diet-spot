"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  onOpenSearch: () => void;
  active?: boolean;
};

export default function SearchBar({ onOpenSearch, active = false }: Props) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onOpenSearch}
      aria-expanded={active}
      className={`card flex h-11 min-w-0 flex-1 items-center gap-2 px-3 text-left text-sm text-slate-500 md:h-12 md:max-w-md ${
        active ? "ring-2 ring-[var(--pin)]" : ""
      }`}
    >
      <span aria-hidden className="text-base text-slate-400">
        ⌕
      </span>
      <span className="truncate">{t("searchPlaces")}</span>
    </button>
  );
}
