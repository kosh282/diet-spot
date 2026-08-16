"use client";

import type { ReactNode } from "react";
import Sheet from "@/components/shell/Sheet";

type Props = {
  children: ReactNode;
  onClose?: () => void;
};

export default function OverlayPanel({ children, onClose }: Props) {
  return (
    <Sheet
      onClose={onClose}
      className="card card-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[min(56dvh,30rem)] overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-auto md:bottom-8 md:right-4 md:top-24 md:w-[380px] md:max-h-[calc(100dvh-8rem)] md:pb-4"
    >
      {children}
    </Sheet>
  );
}
