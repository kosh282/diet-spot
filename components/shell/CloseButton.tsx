"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  onClick: () => void;
};

export default function CloseButton({ onClick }: Props) {
  const { t } = useI18n();
  return (
    <button type="button" onClick={onClick} aria-label={t("close")} className="ds-close">
      ×
    </button>
  );
}
