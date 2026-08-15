"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  visible: number;
  total: number;
};

export default function PlaceCountBadge({ visible, total }: Props) {
  const { t } = useI18n();
  const label =
    visible === total
      ? t("placesCount", { count: total })
      : t("placesCountFiltered", { visible, total });
  return (
    <div className="card px-3 py-1.5 text-xs font-medium text-slate-700">
      {label}
    </div>
  );
}
