"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function OverlayPanel({ children }: Props) {
  return (
    <aside className="card card-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-20 max-h-[min(78vh,36rem)] overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-auto md:bottom-8 md:right-4 md:top-24 md:w-[380px] md:max-h-[calc(100dvh-8rem)] md:pb-4">
      <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" aria-hidden />
      {children}
    </aside>
  );
}
