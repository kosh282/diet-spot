"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useI18n } from "@/components/i18n/LocaleProvider";
import CloseButton from "@/components/shell/CloseButton";
import PlaceAddress from "@/components/spot/PlaceAddress";
import PlaceName from "@/components/spot/PlaceName";
import TagPicker from "@/components/spot/TagPicker";
import { kakaoDirectionsUrl, kakaoPlacePageUrl, resolveKakaoPlacePage } from "@/lib/kakao";
import { memoForLocale } from "@/lib/place-name";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { cuisineLabel, dietChipLabel, dietLabel, venueLabel, type CuisineTag, type DietTag, type VenueTag } from "@/lib/tags";
import { hasHalal, halalDietChanged, spotTrust } from "@/lib/trust";
import type { Spot } from "@/lib/types";
import { formatDate, isSameLocalDay } from "@/lib/user";

type Props = {
  spot: Spot;
  user: User | null;
  onClose: () => void;
  onRequestLogin: () => void;
  onSave: (patch: {
    diet_tags: string[];
    cuisine_tags: string[];
    venue_tags: string[];
    memo: string;
    memo_en: string;
    address: string | null;
  }) => Promise<void>;
  onSetClosed: (closed: boolean) => Promise<void>;
  onStartRelocate: () => void;
  onDelete: () => Promise<void>;
  onShare: () => Promise<void>;
  onConfirmVisit: () => Promise<void>;
};

export default function DetailPanel({
  spot,
  user,
  onClose,
  onRequestLogin,
  onSave,
  onSetClosed,
  onStartRelocate,
  onDelete,
  onShare,
  onConfirmVisit,
}: Props) {
  const { locale, t } = useI18n();
  const isOwner = Boolean(user && user.id === spot.created_by);
  const trust = spotTrust(spot);
  const [editing, setEditing] = useState(false);
  const [diet, setDiet] = useState<DietTag[]>(spot.diet_tags as DietTag[]);
  const [cuisine, setCuisine] = useState<CuisineTag[]>(spot.cuisine_tags as CuisineTag[]);
  const [venue, setVenue] = useState<VenueTag[]>(spot.venue_tags as VenueTag[]);
  const [memo, setMemo] = useState(spot.memo);
  const [memoEn, setMemoEn] = useState(spot.memo_en ?? "");
  const [address, setAddress] = useState(spot.address ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState(spot.phone);
  const [placeUrl, setPlaceUrl] = useState(kakaoPlacePageUrl(spot.place_url, spot.place_id));
  const [lookingUp, setLookingUp] = useState(!kakaoPlacePageUrl(spot.place_url, spot.place_id));
  const [edits, setEdits] = useState<{ edited_nickname: string; diet_tags: string[]; created_at: string }[]>([]);

  useEffect(() => {
    const stored = kakaoPlacePageUrl(spot.place_url, spot.place_id);
    setPhone(spot.phone);
    setPlaceUrl(stored);
    if (stored && spot.phone) {
      setLookingUp(false);
      return;
    }
    let cancelled = false;
    setLookingUp(!stored);
    void resolveKakaoPlacePage(spot).then((kakao) => {
      if (cancelled || !kakao) {
        if (!cancelled) setLookingUp(false);
        return;
      }
      if (!spot.phone && kakao.phone) setPhone(kakao.phone);
      if (kakao.place_url) setPlaceUrl(kakao.place_url);
      setLookingUp(false);
    });
    return () => {
      cancelled = true;
    };
  }, [spot]);

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    const supabase = createClient();
    void supabase
      .from("spot_edits")
      .select("edited_nickname,diet_tags,created_at")
      .eq("spot_id", spot.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setEdits(data ?? []));
  }, [spot.id, spot.updated_at]);

  const summary = [
    ...spot.diet_tags.slice(0, 2).map((tag) => dietLabel(tag, locale)),
    ...spot.venue_tags.slice(0, 1).map((tag) => venueLabel(tag, locale)),
  ].join(" · ");
  const shownMemo = memoForLocale(spot, locale);

  async function save() {
    if (diet.length < 1) return;
    if (halalDietChanged(spot.diet_tags, diet) && !window.confirm(t("confirmHalalTag"))) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSave({
        diet_tags: diet,
        cuisine_tags: cuisine,
        venue_tags: venue,
        memo: memo.slice(0, 300),
        memo_en: memoEn.slice(0, 300),
        address: address.trim() || null,
      });
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("saveFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function toggleClosed() {
    if (!user) {
      onRequestLogin();
      return;
    }
    const next = !spot.closed;
    if (
      !confirm(
        next ? t("confirmClose") : t("confirmReopen"),
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onSetClosed(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("statusFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(t("confirmDelete"))) return;
    setBusy(true);
    setError(null);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("deleteFailed"));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">
            <PlaceName name={spot.name} as="span" />
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">{summary}</p>
          {spot.closed ? (
            <p className="mt-1 text-xs font-medium text-slate-500">{t("closedBadge")}</p>
          ) : null}
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div
        className={`rounded-xl px-3 py-2.5 text-sm ${
          trust === "unverified" ? "bg-amber-50 text-amber-950" : "bg-slate-100 text-slate-800"
        }`}
      >
        <p className="font-semibold">
          {trust === "unverified" ? t("trustUnverifiedTitle") : t("trustListedTitle")}
        </p>
        <p className="mt-0.5 text-xs leading-snug">
          {trust === "unverified" ? t("trustUnverifiedBody") : t("trustListedBody")}
        </p>
        {hasHalal(spot.diet_tags) ? (
          <p className="mt-1 text-xs font-medium">{t("halalNotCertified")}</p>
        ) : null}
        <p className="mt-2 text-xs">
          {t("lastConfirmed")}:{" "}
          {spot.last_confirmed_at
            ? isSameLocalDay(spot.last_confirmed_at)
              ? t("lastConfirmedToday", { name: spot.last_confirmed_nickname ?? "" })
              : t("lastConfirmedOn", {
                  date: formatDate(spot.last_confirmed_at),
                  name: spot.last_confirmed_nickname ?? "",
                })
            : t("lastConfirmedNever")}
        </p>
        {!editing ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!user) {
                onRequestLogin();
                return;
              }
              if (!window.confirm(t("confirmVisitHint"))) return;
              setBusy(true);
              setError(null);
              void onConfirmVisit()
                .catch((err) => {
                  setError(err instanceof Error ? err.message : t("confirmVisitFailed"));
                })
                .finally(() => setBusy(false));
            }}
            className="mt-2 text-xs font-medium text-[var(--pin)]"
          >
            {t("confirmVisit")}
          </button>
        ) : null}
      </div>

      {editing ? (
        <div>
          <label className="block text-xs font-medium text-slate-600">
            {t("address")}
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-800"
              placeholder={t("roadAddressPlaceholder")}
            />
          </label>
          {phone ? <p className="mt-1 text-sm text-slate-600">{phone}</p> : null}
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {spot.address ? (
              <PlaceAddress address={spot.address} className="text-sm text-slate-700" />
            ) : null}
            {phone ? (
              <p className={`text-sm text-slate-600 ${spot.address ? "mt-1" : ""}`}>{phone}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              if (!user) {
                onRequestLogin();
                return;
              }
              onStartRelocate();
            }}
            className="shrink-0 text-sm text-[var(--pin)]"
          >
            {t("fixLocation")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {placeUrl ? (
          <a
            href={placeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 items-center justify-center rounded-xl px-1 text-center text-xs font-medium text-[var(--pin)] ring-1 ring-slate-200 md:text-sm"
          >
            {t("kakaoPlace")}
          </a>
        ) : lookingUp ? (
          <span className="flex h-11 items-center justify-center rounded-xl px-1 text-center text-xs text-slate-400 ring-1 ring-slate-200">
            {t("lookingUpPlace")}
          </span>
        ) : (
          <span className="flex h-11 items-center justify-center rounded-xl px-1 text-center text-xs text-slate-400 ring-1 ring-slate-200">
            {t("kakaoPlace")}
          </span>
        )}
        <a
          href={kakaoDirectionsUrl(spot)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 items-center justify-center rounded-xl text-sm font-medium text-[var(--pin)] ring-1 ring-slate-200"
        >
          {t("directions")}
        </a>
        <button
          type="button"
          onClick={() => void onShare()}
          className="flex h-11 items-center justify-center rounded-xl text-sm font-medium text-slate-700 ring-1 ring-slate-200"
        >
          {t("sharePlace")}
        </button>
      </div>

      {editing ? (
        <>
          <TagPicker
            diet={diet}
            cuisine={cuisine}
            venue={venue}
            onDiet={setDiet}
            onCuisine={setCuisine}
            onVenue={setVenue}
            lockHalal={Boolean(user) && !isOwner}
            lockDiet={Boolean(user) && !isOwner && hasHalal(spot.diet_tags)}
          />
          <label className="block text-xs font-medium text-slate-600">
            {t("memo")}
            <textarea
              value={memo}
              maxLength={300}
              onChange={(event) => setMemo(event.target.value)}
              className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-2 text-sm"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t("memoEn")}
            <textarea
              value={memoEn}
              maxLength={300}
              onChange={(event) => setMemoEn(event.target.value)}
              className="mt-1 h-24 w-full rounded-xl border border-slate-200 p-2 text-sm"
            />
          </label>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {spot.diet_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--pin-soft)] px-2.5 py-1 text-xs text-[var(--pin)]">
                {dietLabel(tag, locale)}
              </span>
            ))}
            {spot.cuisine_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">
                {cuisineLabel(tag, locale)}
              </span>
            ))}
            {spot.venue_tags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs">
                {venueLabel(tag, locale)}
              </span>
            ))}
          </div>
          {shownMemo ? (
            <p className="whitespace-pre-wrap text-sm text-slate-700">{shownMemo}</p>
          ) : null}
        </>
      )}

      <p className="text-xs text-slate-500">
        {t("registeredBy")}: {spot.created_by_nickname}
        {spot.last_edited_nickname ? (
          <>
            <br />
            {t("lastEdited")}: {spot.last_edited_nickname} · {formatDate(spot.updated_at)}
          </>
        ) : (
          <>
            <br />
            {t("registeredOn")}: {formatDate(spot.created_at)}
          </>
        )}
      </p>
      {edits.length > 1 ? (
        <div>
          <p className="text-xs font-medium text-slate-500">{t("editHistory")}</p>
          <ul className="mt-1 space-y-1">
            {edits.map((edit) => (
              <li key={edit.created_at} className="text-xs text-slate-500">
                {edit.edited_nickname} · {formatDate(edit.created_at)}
                {edit.diet_tags.length > 0 ? (
                  <> · {edit.diet_tags.map((tag) => dietChipLabel(tag, locale)).join(", ")}</>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="text-[11px] text-slate-500">{t("disclaimer")}</p>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex gap-2">
        {editing ? (
          <button
            type="button"
            disabled={diet.length < 1 || busy}
            onClick={save}
            className="h-10 flex-1 rounded-xl bg-[var(--pin)] text-sm font-medium text-white disabled:opacity-40"
          >
            {t("save")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (!user) {
                onRequestLogin();
                return;
              }
              setEditing(true);
            }}
            className="h-10 flex-1 rounded-xl bg-[var(--pin)] text-sm font-medium text-white"
          >
            {t("edit")}
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={toggleClosed}
          className="h-10 rounded-xl px-3 text-sm text-slate-600 ring-1 ring-slate-200"
        >
          {spot.closed ? t("reopen") : t("closed")}
        </button>
        {isOwner ? (
          <button
            type="button"
            disabled={busy}
            onClick={remove}
            className="h-10 rounded-xl px-4 text-sm text-red-600 ring-1 ring-red-200"
          >
            {t("delete")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
