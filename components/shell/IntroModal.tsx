"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import CloseButton from "@/components/shell/CloseButton";

export const INTRO_KEY = "dietspot_intro_dismissed";

export default function IntroModal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(INTRO_KEY) === "1") return;
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  function dismiss(permanent: boolean) {
    if (permanent) window.localStorage.setItem(INTRO_KEY, "1");
    setOpen(false);
  }

  const steps = [t("introStepFilter"), t("introStepPin"), t("introStepSearch"), t("introStepLogin")];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("close")}
        onClick={() => dismiss(false)}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dietspot-intro-title"
        className="card relative z-10 w-[min(22.5rem,calc(100vw-2rem))] max-h-[min(88dvh,36rem)] overflow-y-auto overscroll-contain p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="dietspot-intro-title" className="text-lg font-semibold text-[var(--pin)]">
              {t("introTitle")}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{t("introLead")}</p>
          </div>
          <CloseButton onClick={() => dismiss(false)} />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("introBody")}</p>
        <p className="mt-4 text-xs font-semibold text-slate-500">{t("introHowTitle")}</p>
        <ol className="mt-2 space-y-2">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-2.5 text-sm leading-snug text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--pin-soft)] text-[11px] font-semibold text-[var(--pin)]">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-[var(--pin)] text-sm font-medium text-white"
          >
            {t("introStart")}
          </button>
          <button
            type="button"
            onClick={() => dismiss(true)}
            className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-slate-600 ring-1 ring-slate-200"
          >
            {t("introDontShow")}
          </button>
        </div>
      </div>
    </div>
  );
}
