"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "@/components/i18n/LocaleProvider";

export default function LanguageSelect() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("language")}
      className="card flex h-12 shrink-0 overflow-hidden text-xs font-semibold"
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
  );
}
