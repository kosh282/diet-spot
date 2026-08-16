"use client";

import type { ReactNode } from "react";
import Sheet from "@/components/shell/Sheet";

type Props = {
  children: ReactNode;
  onClose: () => void;
};

export default function SearchModal({ children, onClose }: Props) {
  return (
    <Sheet
      onClose={onClose}
      className="card card-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-30 max-h-[min(56dvh,30rem)] overflow-y-auto overscroll-contain p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:left-4 md:right-auto md:top-[4.85rem] md:bottom-auto md:w-[26rem] md:max-h-[min(72vh,34rem)] md:p-4"
    >
      {children}
    </Sheet>
  );
}
