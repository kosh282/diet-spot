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
          d="M12 3.25a.75.75 0 0 1 .75.75v8.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V4a.75.75 0 0 1 .75-.75ZM5 14.5a.75.75 0 0 1 .75.75v3.25h12.5V15.25a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-.75.75H4.75a.75.75 0 0 1-.75-.75v-4a.75.75 0 0 1 .75-.75Z"
        />
      </svg>
    </button>
  );
}
