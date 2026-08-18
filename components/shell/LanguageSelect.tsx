"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "@/components/i18n/LocaleProvider";

export default function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();
  const other = locale === "ko" ? "en" : "ko";

  return (
    <>
      <button
        type="button"
        onClick={() => setLocale(other)}
        aria-label={t("language")}
        title={t("language")}
        className="card flex h-11 w-11 shrink-0 items-center justify-center text-xs font-semibold text-slate-700 md:hidden"
      >
        {other.toUpperCase()}
      </button>
      <div
        role="group"
        aria-label={t("language")}
        className="card hidden h-12 shrink-0 overflow-hidden text-xs font-semibold md:flex"
      >
        {LOCALES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            className={`px-2.5 ${locale === item ? "bg-[var(--pin)] text-white" : "text-slate-600"}`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>
    </>
  );
}
