"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  onOpenRegister: () => void;
  active?: boolean;
};

export default function SearchBar({ onOpenRegister, active = false }: Props) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onOpenRegister}
      aria-expanded={active}
      className={`card flex h-12 min-w-0 flex-1 items-center gap-2 px-3 text-left text-sm text-slate-500 md:max-w-md ${
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
