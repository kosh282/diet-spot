"use client";

import { useI18n } from "@/components/i18n/LocaleProvider";
import CloseButton from "@/components/shell/CloseButton";

type Props = {
  error?: string | null;
  onLogin: () => void;
  onClose: () => void;
};

export default function LoginSheet({ error, onLogin, onClose }: Props) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("loginTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("loginHint")}</p>
        </div>
        <CloseButton onClick={onClose} />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        onClick={onLogin}
        className="flex h-11 w-full items-center justify-center rounded-xl bg-[var(--pin)] text-sm font-medium text-white"
      >
        {t("continueWithGoogle")}
      </button>
    </div>
  );
}
