"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";

type Props = {
  children: ReactNode;
  onClose?: () => void;
  className: string;
};

const DISMISS_PX = 88;

export default function Sheet({ children, onClose, className }: Props) {
  const { t } = useI18n();
  const startY = useRef<number | null>(null);
  const lastDy = useRef(0);
  const [dy, setDy] = useState(0);

  function onTouchStart(event: React.TouchEvent) {
    if (!onClose) return;
    startY.current = event.touches[0].clientY;
    lastDy.current = 0;
  }

  function onTouchMove(event: React.TouchEvent) {
    if (startY.current == null || !onClose) return;
    const next = Math.max(0, event.touches[0].clientY - startY.current);
    lastDy.current = next;
    setDy(next);
  }

  function onTouchEnd() {
    if (!onClose) {
      startY.current = null;
      lastDy.current = 0;
      return;
    }
    if (lastDy.current >= DISMISS_PX) {
      onClose();
    } else {
      setDy(0);
    }
    startY.current = null;
    lastDy.current = 0;
  }

  const style: CSSProperties | undefined =
    dy > 0
      ? { transform: `translateY(${dy}px)`, transition: "none" }
      : { transition: "transform 180ms ease-out" };

  return (
    <>
      {onClose ? (
        <button
          type="button"
          aria-label={t("close")}
          onClick={onClose}
          className="pointer-events-auto absolute inset-0 z-20 bg-slate-900/20"
        />
      ) : null}
      <aside className={className} style={style}>
        <div
          className="mx-auto -mt-1 mb-2 flex h-7 w-full max-w-full items-center justify-center touch-none md:hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          aria-hidden
        >
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>
        {children}
      </aside>
    </>
  );
}
