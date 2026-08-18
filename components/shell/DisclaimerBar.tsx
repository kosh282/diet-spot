"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";

export default function DisclaimerBar() {
  const { t } = useI18n();
  return (
    <p className="hidden max-w-[16rem] rounded-full bg-white/85 px-3 py-1 text-left text-[11px] leading-snug text-slate-600 shadow-sm backdrop-blur md:block md:max-w-xl md:text-center">
      {t("disclaimer")}
    </p>
  );
}
