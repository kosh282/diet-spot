"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  children: ReactNode;
  onClose: () => void;
};

export default function SearchModal({ children, onClose }: Props) {
  const { t } = useI18n();
  return (
    <>
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="pointer-events-auto absolute inset-0 z-20 bg-slate-900/20"
      />
      <aside className="card card-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[min(78vh,36rem)] overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:left-4 md:right-auto md:top-[4.85rem] md:bottom-auto md:w-[26rem] md:max-h-[min(72vh,34rem)] md:p-4">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" aria-hidden />
        {children}
      </aside>
    </>
  );
}
