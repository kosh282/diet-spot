"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  onClick: () => void;
};

export default function ShareButton({ onClick }: Props) {
  const { t } = useI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      title={t("shareMap")}
      aria-label={t("shareMap")}
      className="card flex h-11 w-11 shrink-0 items-center justify-center text-[var(--pin)] md:h-12 md:w-12"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 4v6C6.22 11.13 3.11 16.33 2 22c2.78-3.97 6.44-6 12-6v6l8-9-8-9z"
        />
      </svg>
    </button>
  );
}
