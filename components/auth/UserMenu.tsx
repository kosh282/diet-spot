"use client";

import type { User } from "@supabase/supabase-js";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { displayNameFromUser } from "@/lib/user";

type Props = {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
};

export default function UserMenu({ user, onLogin, onLogout }: Props) {
  const { t } = useI18n();

  if (!user) {
    return (
      <button
        type="button"
        onClick={onLogin}
        className="card flex h-11 w-11 shrink-0 items-center justify-center text-slate-800 md:h-12 md:w-auto md:px-3.5 md:text-sm md:font-semibold"
        aria-label={t("login")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 md:hidden" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 12a4.25 4.25 0 1 0-4.25-4.25A4.25 4.25 0 0 0 12 12Zm0 1.75c-3.4 0-7.25 1.7-7.25 4.25v.75A.75.75 0 0 0 5.5 20h13a.75.75 0 0 0 .75-.75v-.75c0-2.55-3.85-4.25-7.25-4.25Z"
          />
        </svg>
        <span className="hidden md:inline">{t("login")}</span>
      </button>
    );
  }

  const name = displayNameFromUser(user, t("userFallback"));
  const avatar = typeof user.user_metadata?.avatar_url === "string"
    ? user.user_metadata.avatar_url
    : null;

  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(t("confirmLogout"))) onLogout();
      }}
      title={`${name} · ${t("logout")}`}
      aria-label={t("logout")}
      className="card flex h-11 w-11 shrink-0 items-center justify-center md:h-12 md:w-12"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt="" className="h-8 w-8 rounded-full" />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pin-soft)] text-xs font-semibold text-[var(--pin)]">
          {name.slice(0, 1)}
        </span>
      )}
    </button>
  );
}
