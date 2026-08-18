"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import LoginSheet from "@/components/auth/LoginSheet";
import UserMenu from "@/components/auth/UserMenu";
import { LocaleProvider, useI18n } from "@/components/i18n/LocaleProvider";
import KakaoMap from "@/components/map/KakaoMap";
import DisclaimerBar from "@/components/shell/DisclaimerBar";
import FilterChips from "@/components/shell/FilterChips";
import LanguageSelect from "@/components/shell/LanguageSelect";
import PlaceCountBadge from "@/components/shell/PlaceCountBadge";
import SearchBar from "@/components/shell/SearchBar";
import ShareButton from "@/components/shell/ShareButton";
import DetailPanel from "@/components/spot/DetailPanel";
import NearbyList from "@/components/spot/NearbyList";
import OverlayPanel from "@/components/spot/OverlayPanel";
import PlaceName from "@/components/spot/PlaceName";
import RegisterSheet from "@/components/spot/RegisterSheet";
import SearchModal from "@/components/spot/SearchModal";
import SpotSearchSheet from "@/components/spot/SpotSearchSheet";
import { localSeedSpots, persistSeedSpots } from "@/lib/seed-candidates";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { matchesFilters, type TagFilters } from "@/lib/tags";
import { emptyMapSearch, parseMapSearch, replaceMapUrl } from "@/lib/map-url";
import { displayPlaceName } from "@/lib/place-name";
import { REGISTER_QUERY_KEY, RETURN_TO_KEY, type KakaoPlace, type Spot } from "@/lib/types";
import { displayNameFromUser } from "@/lib/user";
import {
  getUserLocation,
  isLikelyMobile,
  watchGps,
  type UserLocation,
} from "@/lib/user-location";

type Panel = "none" | "detail" | "register" | "login" | "search";

type RelocateDraft = {
  lat: number;
  lng: number;
  address: string;
};

function inKorea(lat: number, lng: number) {
  return lat >= 33 && lat <= 39 && lng >= 124 && lng <= 132;
}

export default function MapApp() {
  return (
    <LocaleProvider>
      <MapAppScreen />
    </LocaleProvider>
  );
}

function MapAppScreen() {
  const { locale, t } = useI18n();
  const bootShare = useMemo(
    () => (typeof window === "undefined" ? emptyMapSearch() : parseMapSearch(window.location.search)),
    [],
  );
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(() => (supabaseReady ? createClient() : null), [supabaseReady]);
  const mapApi = useRef<{ panTo: (lat: number, lng: number) => void } | null>(null);
  const pendingReturn = useRef<string | null>(
    typeof window === "undefined" ? null : sessionStorage.getItem(RETURN_TO_KEY),
  );
  const bootAuthError =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("auth") === "error"
      ? t("loginFailed")
      : null;

  const [user, setUser] = useState<User | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [filters, setFilters] = useState<TagFilters>(bootShare.filters);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [panel, setPanel] = useState<Panel>(bootAuthError ? "login" : "none");
  const [loading, setLoading] = useState(supabaseReady);
  const [loadError, setLoadError] = useState<string | null>(
    supabaseReady ? null : t("missingSupabase"),
  );
  const [toast, setToast] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(bootAuthError);
  const [mapReady, setMapReady] = useState(false);
  const [showClosed, setShowClosed] = useState(bootShare.showClosed);
  const [relocating, setRelocating] = useState<RelocateDraft | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const seedingRef = useRef(false);
  const gpsWatchRef = useRef<(() => void) | null>(null);
  const [registerQuery, setRegisterQuery] = useState("");
  const sharedSpotId = useRef(bootShare.spotId);

  const openSpots = useMemo(() => spots.filter((spot) => !spot.closed), [spots]);
  const visible = useMemo(() => {
    const pool = showClosed ? spots : openSpots;
    return pool.filter(
      (spot) => spot.id === selected?.id || matchesFilters(spot, filters),
    );
  }, [spots, openSpots, filters, showClosed, selected]);

  const loadSpots = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("spots")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      setLoadError(t("loadFailed"));
      setSpots(localSeedSpots());
    } else {
      setLoadError(null);
      const rows = (data ?? []) as Spot[];
      setSpots(rows.length > 0 ? rows : localSeedSpots());
    }
    setLoading(false);
  }, [supabase, t]);

  useEffect(() => {
    if (!supabase) return;

    void loadSpots();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase, loadSpots]);

  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;
    void (async () => {
      try {
        const loc = await getUserLocation(isLikelyMobile());
        if (cancelled) return;
        setUserLocation(loc);
        if (!sharedSpotId.current && inKorea(loc.lat, loc.lng)) {
          mapApi.current?.panTo(loc.lat, loc.lng);
        }
        if (loc.source === "gps") {
          gpsWatchRef.current ??= watchGps((next) => setUserLocation(next));
        }
      } catch {
        // Keep the default map center if location is unavailable.
      }
    })();
    return () => {
      cancelled = true;
      gpsWatchRef.current?.();
      gpsWatchRef.current = null;
    };
  }, [mapReady]);

  useEffect(() => {
    if (!user) return;
    const next = pendingReturn.current ?? sessionStorage.getItem(RETURN_TO_KEY);
    if (!next) return;
    sessionStorage.removeItem(RETURN_TO_KEY);
    pendingReturn.current = null;
    if (next === "register") {
      const saved = sessionStorage.getItem(REGISTER_QUERY_KEY) ?? "";
      sessionStorage.removeItem(REGISTER_QUERY_KEY);
      setRegisterQuery(saved);
      setPanel("register");
      return;
    }
    if (next.startsWith("edit:") || next.startsWith("confirm:")) {
      const id = next.slice(next.indexOf(":") + 1);
      const spot = spots.find((item) => item.id === id);
      if (spot) {
        setSelected(spot);
        setPanel("detail");
      }
      return;
    }
    if (next.startsWith("relocate:")) {
      const id = next.slice(9);
      const spot = spots.find((item) => item.id === id);
      if (spot) {
        setSelected(spot);
        setRelocating({
          lat: spot.lat,
          lng: spot.lng,
          address: spot.address ?? "",
        });
        setPanel("none");
        mapApi.current?.panTo(spot.lat, spot.lng);
      }
    }
  }, [user, spots]);

  useEffect(() => {
    const id = sharedSpotId.current;
    if (!id || !mapReady || spots.length === 0) return;
    const spot = spots.find((item) => item.id === id);
    if (!spot) return;
    sharedSpotId.current = null;
    setSelected(spot);
    setPanel("detail");
    mapApi.current?.panTo(spot.lat, spot.lng);
  }, [spots, mapReady]);

  useEffect(() => {
    replaceMapUrl({
      filters,
      showClosed,
      spotId: panel === "detail" && selected ? selected.id : null,
      locale,
    });
  }, [filters, showClosed, selected, panel, locale]);

  useEffect(() => {
    if (!supabase || !user || !mapReady || seedingRef.current) return;
    seedingRef.current = true;
    void persistSeedSpots(supabase, user)
      .then(() => loadSpots())
      .catch(() => {
        seedingRef.current = false;
      });
  }, [supabase, user, mapReady, loadSpots]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function shareCurrent() {
    replaceMapUrl({
      filters,
      showClosed,
      spotId: panel === "detail" && selected ? selected.id : null,
      locale,
    });
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}`;
    const title =
      panel === "detail" && selected
        ? displayPlaceName(selected.name, locale).primary
        : "DietSpot";
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: t("shareMap"), url });
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(t("linkCopied"));
    } catch {
      setToast(t("copyFailed"));
    }
  }

  function requireLogin(returnTo: string) {
    sessionStorage.setItem(RETURN_TO_KEY, returnTo);
    setPanel("login");
  }

  function openSearch() {
    if (panel === "search") {
      setPanel("none");
      return;
    }
    setPanel("search");
  }

  function openRegister(prefill = "") {
    if (panel === "register" && !prefill) {
      setPanel("none");
      return;
    }
    if (!user) {
      if (prefill) sessionStorage.setItem(REGISTER_QUERY_KEY, prefill);
      else sessionStorage.removeItem(REGISTER_QUERY_KEY);
      requireLogin("register");
      return;
    }
    setRegisterQuery(prefill);
    setSelected(null);
    setPanel("register");
  }

  async function loginWithGoogle() {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setAuthError(t("loginFailed"));
    }
  }

  async function logout() {
    await supabase?.auth.signOut();
    setPanel("none");
  }

  async function saveSpot(input: {
    place: KakaoPlace;
    diet: string[];
    cuisine: string[];
    venue: string[];
    memo: string;
    memo_en: string;
  }) {
    if (!supabase || !user) {
      requireLogin("register");
      throw new Error(t("loginAgain"));
    }
    const nickname = displayNameFromUser(user, t("userFallback"));
    const payload = {
      place_id: input.place.id,
      name: input.place.place_name,
      address: input.place.road_address_name || input.place.address_name || null,
      lat: Number(input.place.y),
      lng: Number(input.place.x),
      diet_tags: input.diet,
      cuisine_tags: input.cuisine,
      venue_tags: input.venue,
      memo: input.memo,
      memo_en: input.memo_en,
      created_by: user.id,
      created_by_nickname: nickname,
      last_edited_by: user.id,
      last_edited_nickname: nickname,
      source: "user",
      phone: input.place.phone,
      place_url: input.place.place_url,
      closed: false,
    };
    const { data, error } = await supabase.from("spots").insert(payload).select("*").single();
    if (error) {
      if (error.code === "23505") {
        throw new Error(t("alreadyRegistered"));
      }
      throw new Error(error.message);
    }
    const created = data as Spot;
    setSpots((current) => [...current, created]);
    setSelected(created);
    setPanel("detail");
    mapApi.current?.panTo(created.lat, created.lng);
  }

  async function updateSpot(patch: {
    diet_tags?: string[];
    cuisine_tags?: string[];
    venue_tags?: string[];
    memo?: string;
    memo_en?: string;
    address?: string | null;
    lat?: number;
    lng?: number;
    closed?: boolean;
  }) {
    if (!supabase || !user || !selected) {
      requireLogin(selected ? `edit:${selected.id}` : "register");
      throw new Error(t("loginAgain"));
    }
    if (
      (patch.lat != null || patch.lng != null) &&
      !inKorea(patch.lat ?? selected.lat, patch.lng ?? selected.lng)
    ) {
      throw new Error(t("koreaOnly"));
    }
    const nickname = displayNameFromUser(user, t("userFallback"));
    const { data, error } = await supabase
      .from("spots")
      .update({
        ...patch,
        last_edited_by: user.id,
        last_edited_nickname: nickname,
      })
      .eq("id", selected.id)
      .select("*")
      .single();
    if (error) {
      if (error.message.includes("halal_diet_locked")) {
        throw new Error(t("halalLocked"));
      }
      throw new Error(error.message);
    }
    const updated = data as Spot;
    setSpots((current) => current.map((spot) => (spot.id === updated.id ? updated : spot)));
    setSelected(updated);
  }

  function openSpot(spot: Spot, already = false) {
    setSelected(spot);
    setPanel("detail");
    mapApi.current?.panTo(spot.lat, spot.lng);
    if (already) setToast(t("alreadyRegistered"));
  }

  function startRelocate() {
    if (!selected) return;
    if (!user) {
      requireLogin(`relocate:${selected.id}`);
      return;
    }
    setRelocating({
      lat: selected.lat,
      lng: selected.lng,
      address: selected.address ?? "",
    });
    setPanel("none");
    mapApi.current?.panTo(selected.lat, selected.lng);
  }

  async function saveRelocate() {
    if (!relocating) return;
    try {
      await updateSpot({
        lat: relocating.lat,
        lng: relocating.lng,
        address: relocating.address.trim() || null,
      });
      setRelocating(null);
      setPanel("detail");
      setToast(t("pinUpdated"));
    } catch (err) {
      setToast(err instanceof Error ? err.message : t("saveLocationFailed"));
    }
  }

  async function confirmVisit() {
    if (!supabase || !user || !selected) {
      requireLogin(selected ? `confirm:${selected.id}` : "register");
      throw new Error(t("loginAgain"));
    }
    const nickname = displayNameFromUser(user, t("userFallback"));
    const { data, error } = await supabase
      .from("spots")
      .update({
        last_confirmed_at: new Date().toISOString(),
        last_confirmed_by: user.id,
        last_confirmed_nickname: nickname,
      })
      .eq("id", selected.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    const updated = data as Spot;
    setSpots((current) => current.map((spot) => (spot.id === updated.id ? updated : spot)));
    setSelected(updated);
    setToast(t("confirmVisitDone"));
  }

  async function setSpotClosed(closed: boolean) {
    await updateSpot({ closed });
    setToast(closed ? t("markedClosed") : t("markedOpen"));
  }

  async function deleteSpot() {
    if (!supabase || !selected) return;
    const { error } = await supabase.from("spots").delete().eq("id", selected.id);
    if (error) throw new Error(error.message);
    setSpots((current) => current.filter((spot) => spot.id !== selected.id));
    setSelected(null);
    setPanel("none");
  }

  async function goToMyLocation() {
    setLocating(true);
    try {
      const loc = await getUserLocation(true);
      setUserLocation(loc);
      if (inKorea(loc.lat, loc.lng)) {
        mapApi.current?.panTo(loc.lat, loc.lng);
        setToast(loc.source === "gps" ? t("locationFoundGps") : t("locationFoundIp"));
      } else {
        setToast(t("locationOutsideKorea"));
      }
      if (loc.source === "gps") {
        gpsWatchRef.current ??= watchGps((next) => setUserLocation(next));
      }
    } catch {
      setToast(t("locationFailed"));
    } finally {
      setLocating(false);
    }
  }

  return (
    <div className="relative h-dvh w-full">
      <KakaoMap
        spots={visible}
        selectedId={selected?.id ?? null}
        relocatingId={relocating && selected ? selected.id : null}
        relocatingPosition={relocating}
        userLocation={userLocation}
        onSelect={(spot) => {
          if (relocating) return;
          setSelected(spot);
          setPanel("detail");
        }}
        onRelocate={(lat, lng) => {
          setRelocating((current) => (current ? { ...current, lat, lng } : current));
        }}
        onReady={(api) => {
          mapApi.current = api;
          setMapReady(true);
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-40 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:p-4">
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="card hidden h-12 items-center px-3 text-sm font-semibold text-[var(--pin)] md:flex">
            DietSpot
          </span>
          <SearchBar onOpenSearch={openSearch} active={panel === "search"} />
          <div className="flex shrink-0 items-center gap-2">
            <ShareButton onClick={() => void shareCurrent()} />
            <LanguageSelect />
            <UserMenu user={user} onLogin={() => setPanel("login")} onLogout={logout} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-10">
        {panel !== "register" && panel !== "search" ? (
          <div className="pointer-events-auto min-w-0 px-3 pt-[calc(3.85rem+env(safe-area-inset-top))] md:px-4 md:pt-[4.85rem]">
            <FilterChips
              filters={filters}
              onChange={setFilters}
              showClosed={showClosed}
              onShowClosed={setShowClosed}
            />
          </div>
        ) : null}

        <div
          className={`absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 flex flex-col items-start gap-2 md:left-4 ${
            relocating || panel !== "none" ? "max-md:hidden" : ""
          } ${relocating ? "hidden" : ""}`}
        >
          {panel === "none" && !relocating ? (
            <NearbyList
              spots={visible.filter((spot) => !spot.closed || showClosed)}
              origin={userLocation}
              fromYou={Boolean(userLocation)}
              onPick={(spot) => {
                setSelected(spot);
                setPanel("detail");
                mapApi.current?.panTo(spot.lat, spot.lng);
              }}
            />
          ) : null}
          <PlaceCountBadge visible={visible.length} total={showClosed ? spots.length : openSpots.length} />
          <DisclaimerBar />
        </div>

        <button
          type="button"
          onClick={() => void goToMyLocation()}
          disabled={locating}
          title={t("myLocation")}
          aria-label={t("myLocation")}
          className={`pointer-events-auto absolute right-4 bottom-[max(5.75rem,calc(env(safe-area-inset-bottom)+4.5rem))] flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--pin)] shadow-lg disabled:opacity-60 md:bottom-[6.5rem] ${
            panel === "none" && !relocating ? "md:right-4" : "md:right-[420px]"
          } ${relocating || panel !== "none" ? "max-md:hidden" : ""} ${relocating ? "hidden" : ""} ${
            userLocation ? "ring-2 ring-[var(--me)]/30" : ""
          }`}
        >
          {locating ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--pin)] border-t-transparent" />
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0-6.5a1 1 0 0 1 1 1V4.1a8.01 8.01 0 0 1 6.9 6.9H22a1 1 0 1 1 0 2h-2.1a8.01 8.01 0 0 1-6.9 6.9V21.5a1 1 0 1 1-2 0v-2.1a8.01 8.01 0 0 1-6.9-6.9H2a1 1 0 1 1 0-2h2.1A8.01 8.01 0 0 1 11 4.1V2.5a1 1 0 0 1 1-1Zm0 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"
              />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => openRegister()}
          className={`pointer-events-auto absolute right-4 bottom-[max(1.5rem,calc(env(safe-area-inset-bottom)+0.75rem))] flex h-12 items-center rounded-full bg-[var(--pin)] px-5 text-sm font-medium text-white shadow-lg md:bottom-8 ${
            panel === "none" && !relocating ? "md:right-4" : "md:right-[420px]"
          } ${relocating || panel !== "none" ? "hidden" : ""}`}
        >
          {t("registerFab")}
        </button>
      </div>

      {relocating && selected ? (
        <div className="card card-sheet pointer-events-auto absolute inset-x-0 bottom-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:inset-auto md:bottom-8 md:left-4 md:w-[380px] md:pb-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 md:hidden" aria-hidden />
          <p className="text-sm font-semibold">
            {t("fixLocation")} · <PlaceName name={selected.name} as="span" secondaryClassName="mt-0.5 text-xs font-normal text-slate-500" />
          </p>
          <p className="mt-1 text-xs text-slate-500">{t("relocateHint")}</p>
          <label className="mt-3 block text-xs font-medium text-slate-600">
            {t("address")}
            <input
              value={relocating.address}
              onChange={(event) =>
                setRelocating((current) =>
                  current ? { ...current, address: event.target.value } : current,
                )
              }
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 px-3 text-sm font-normal text-slate-800"
              placeholder={t("roadAddressPlaceholder")}
            />
          </label>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRelocating(null);
                setPanel("detail");
              }}
              className="h-10 flex-1 rounded-xl text-sm text-slate-600 ring-1 ring-slate-200"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={() => void saveRelocate()}
              className="h-10 flex-1 rounded-xl bg-[var(--pin)] text-sm font-medium text-white"
            >
              {t("saveLocation")}
            </button>
          </div>
        </div>
      ) : null}

      {panel === "search" ? (
        <SearchModal onClose={() => setPanel("none")}>
          <SpotSearchSheet
            spots={showClosed ? spots : openSpots}
            origin={userLocation}
            onClose={() => setPanel("none")}
            onSelect={(spot) => openSpot(spot)}
            onAdd={(query) => openRegister(query)}
          />
        </SearchModal>
      ) : null}

      {panel === "register" ? (
        <SearchModal onClose={() => setPanel("none")}>
          <RegisterSheet
            spots={spots}
            initialQuery={registerQuery}
            onClose={() => setPanel("none")}
            onOpenRegistered={(spot) => openSpot(spot)}
            onExisting={(spot) => openSpot(spot, true)}
            onSave={saveSpot}
          />
        </SearchModal>
      ) : null}

      {panel === "login" || (panel === "detail" && selected) ? (
        <OverlayPanel
          onClose={
            panel === "detail"
              ? () => {
                  setSelected(null);
                  setPanel("none");
                }
              : undefined
          }
        >
          {panel === "login" ? (
            <LoginSheet
              error={authError}
              onLogin={loginWithGoogle}
              onClose={() => setPanel("none")}
            />
          ) : null}
          {panel === "detail" && selected ? (
            <DetailPanel
              key={selected.id}
              spot={selected}
              user={user}
              onClose={() => {
                setSelected(null);
                setPanel("none");
              }}
              onRequestLogin={() => requireLogin(`edit:${selected.id}`)}
              onSave={updateSpot}
              onSetClosed={setSpotClosed}
              onStartRelocate={startRelocate}
              onDelete={deleteSpot}
              onShare={shareCurrent}
              onConfirmVisit={confirmVisit}
            />
          ) : null}
        </OverlayPanel>
      ) : null}

      {loading ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/50 text-sm text-slate-600">
          {t("loading")}
        </div>
      ) : null}

      {loadError ? (
        <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-xl bg-white px-4 py-3 text-sm shadow-lg">
          {loadError}
          <button
            type="button"
            className="ml-3 text-[var(--pin)]"
            onClick={() => {
              setLoading(true);
              void loadSpots();
            }}
          >
            {t("retry")}
          </button>
        </div>
      ) : null}

      {!loading && !loadError && spots.length === 0 && panel === "none" ? (
        <div className="absolute left-1/2 top-28 z-20 w-[min(90vw,22rem)] -translate-x-1/2 rounded-2xl bg-white/95 p-4 text-center text-sm shadow-lg">
          {t("emptySpots")}
        </div>
      ) : null}

      {toast ? (
        <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      ) : null}

      {visible.length === 0 && openSpots.length === 0 && spots.length > 0 && !showClosed ? (
        <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
          {t("onlyClosed")}
        </div>
      ) : null}

      {visible.length === 0 && (showClosed ? spots : openSpots).length > 0 ? (
        <div className="absolute left-1/2 top-24 z-20 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
          {t("noMatches")}
        </div>
      ) : null}
    </div>
  );
}
