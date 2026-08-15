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
        className="card flex h-12 shrink-0 items-center justify-center px-3.5 text-sm font-semibold text-slate-800"
      >
        {t("login")}
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
      className="card flex h-12 w-12 shrink-0 items-center justify-center"
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
