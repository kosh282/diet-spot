"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import CloseButton from "@/components/shell/CloseButton";
import {
  appleDirectionsUrl,
  googleDirectionsUrl,
  kakaoDirectionsUrl,
  naverDirectionsUrl,
  routeSummary,
} from "@/lib/directions";

type SpotPoint = { name: string; lat: number; lng: number };

type Props = {
  spot: SpotPoint;
  origin: { lat: number; lng: number };
  fromYou: boolean;
  onClose: () => void;
};

export default function DirectionsSheet({ spot, origin, fromYou, onClose }: Props) {
  const { locale, t } = useI18n();
  const summary = routeSummary(origin, spot);

  const apps = [
    { href: kakaoDirectionsUrl(spot), label: t("openInKakao") },
    { href: naverDirectionsUrl(spot), label: t("openInNaver") },
    { href: googleDirectionsUrl(spot), label: t("openInGoogle") },
    { href: appleDirectionsUrl(spot, locale), label: t("openInApple") },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 md:items-center md:p-4">
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dietspot-directions-title"
        className="card relative z-10 w-full max-w-md rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:rounded-2xl md:p-5"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-slate-200 md:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p id="dietspot-directions-title" className="text-lg font-semibold text-slate-900">
              {t("directions")}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {t("walkEta", {
                distance: summary.distanceLabel,
                minutes: summary.walkMin,
              })}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {fromYou ? t("nearbyFromMe") : t("nearbyFromCenter")} · {t("routeApproxHint")}
            </p>
          </div>
          <CloseButton onClick={onClose} />
        </div>

        <p className="mt-4 text-xs font-semibold text-slate-500">{t("openInMaps")}</p>
        <ul className="mt-2 space-y-2">
          {apps.map((app) => (
            <li key={app.label}>
              <a
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center justify-center rounded-xl text-sm font-medium text-slate-700 ring-1 ring-slate-200"
              >
                {app.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
