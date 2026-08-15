"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";
import { displayPlaceName } from "@/lib/place-name";
import { pinCaption } from "@/lib/tags";
import { spotTrust } from "@/lib/trust";
import { DONGUK_CENTER, type Spot } from "@/lib/types";
import type { UserLocation } from "@/lib/user-location";
import type {
  KakaoCircle,
  KakaoCustomOverlay,
  KakaoMap as KakaoMapHandle,
  KakaoMarker,
  KakaoMouseEvent,
} from "@/types/kakao";

const Z_BASE = 1;
const Z_HOVER = 9000;
const Z_SELECTED = 10000;
const Z_RELOCATE = 10010;

type Props = {
  spots: Spot[];
  selectedId: string | null;
  relocatingId?: string | null;
  relocatingPosition?: { lat: number; lng: number } | null;
  userLocation?: UserLocation | null;
  onSelect: (spot: Spot) => void;
  onRelocate?: (lat: number, lng: number) => void;
  onReady?: (api: { panTo: (lat: number, lng: number) => void }) => void;
};

type OverlayEntry = {
  spot: Spot;
  index: number;
  overlay: KakaoCustomOverlay;
  root: HTMLDivElement;
  marker: KakaoMarker | null;
};

type StackPick = {
  items: { spot: Spot; index: number }[];
  x: number;
  y: number;
};

const PIN_GREEN = "#2a7a4f";
const ME_TEAL = "#2f7f9a";

const DRAG_HANDLE = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
    <circle cx="9" cy="9" r="7" fill="${PIN_GREEN}" stroke="white" stroke-width="2"/>
  </svg>`;
  return {
    src: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    width: 18,
    height: 18,
  };
})();

function pinZ(entry: OverlayEntry, selectedId: string | null, hoverId: string | null, relocatingId: string | null) {
  if (entry.spot.id === relocatingId) return Z_RELOCATE;
  if (entry.spot.id === selectedId) return Z_SELECTED;
  if (entry.spot.id === hoverId) return Z_HOVER;
  return Z_BASE + entry.index;
}

function applyPinLayer(
  entry: OverlayEntry,
  selectedId: string | null,
  hoverId: string | null,
  relocatingId: string | null,
) {
  const z = pinZ(entry, selectedId, hoverId, relocatingId);
  entry.overlay.setZIndex(z);
  const wrap = entry.root.parentElement;
  if (wrap) wrap.style.zIndex = String(z);
  entry.root.classList.toggle("ds-pin--selected", entry.spot.id === selectedId);
  entry.root.classList.toggle("ds-pin--relocating", entry.spot.id === relocatingId);
}

function spotsAtPoint(entries: OverlayEntry[], x: number, y: number) {
  const byRoot = new Map(entries.map((entry) => [entry.root, entry]));
  const hits: OverlayEntry[] = [];
  const seen = new Set<string>();
  for (const node of document.elementsFromPoint(x, y)) {
    const pin = node instanceof Element ? node.closest(".ds-pin") : null;
    if (!(pin instanceof HTMLDivElement)) continue;
    const entry = byRoot.get(pin);
    if (!entry || seen.has(entry.spot.id)) continue;
    seen.add(entry.spot.id);
    hits.push(entry);
  }
  return hits;
}

function createPinElement(
  spot: Spot,
  index: number,
  locale: Locale,
  compact: boolean,
) {
  const root = document.createElement("div");
  root.className = [
    "ds-pin",
    spot.closed ? "ds-pin--closed" : "",
    !spot.closed && spotTrust(spot) === "unverified" ? "ds-pin--unverified" : "",
    compact ? "ds-pin--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const name = displayPlaceName(spot.name, locale).primary;
  const tags = pinCaption(spot, locale);

  const body = document.createElement("div");
  body.className = "ds-pin-body";

  const num = document.createElement("span");
  num.className = "ds-pin-num";
  num.textContent = String(index + 1);

  const copy = document.createElement("div");
  copy.className = "ds-pin-copy";

  const title = document.createElement("div");
  title.className = "ds-pin-name";
  title.textContent = name;

  const subtitle = document.createElement("div");
  subtitle.className = "ds-pin-tags";
  subtitle.textContent = tags;

  copy.append(title, subtitle);
  body.append(num, copy);

  const stem = document.createElement("i");
  stem.className = "ds-pin-stem";

  root.append(body, stem);
  return root;
}

function createMeElement(source: UserLocation["source"]) {
  const root = document.createElement("div");
  root.className = source === "ip" ? "ds-me ds-me--ip" : "ds-me";
  root.innerHTML = '<i class="ds-me-pulse"></i><i class="ds-me-dot"></i>';
  return root;
}

export default function KakaoMap({
  spots,
  selectedId,
  relocatingId = null,
  relocatingPosition = null,
  userLocation = null,
  onSelect,
  onRelocate,
  onReady,
}: Props) {
  const { t, locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapHandle | null>(null);
  const overlaysRef = useRef<OverlayEntry[]>([]);
  const relocatingOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const relocatingMarkerRef = useRef<KakaoMarker | null>(null);
  const meOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const meCircleRef = useRef<KakaoCircle | null>(null);
  const meRootRef = useRef<HTMLDivElement | null>(null);
  const hoverIdRef = useRef<string | null>(null);
  const selectedIdRef = useRef(selectedId);
  const relocatingIdRef = useRef(relocatingId);
  const [mapReady, setMapReady] = useState(false);
  const [stack, setStack] = useState<StackPick | null>(null);
  const onSelectRef = useRef(onSelect);
  const onReadyRef = useRef(onReady);
  const onRelocateRef = useRef(onRelocate);

  useEffect(() => {
    onSelectRef.current = onSelect;
    onReadyRef.current = onReady;
    onRelocateRef.current = onRelocate;
    relocatingIdRef.current = relocatingId;
    selectedIdRef.current = selectedId;
  }, [onSelect, onReady, onRelocate, relocatingId, selectedId]);

  function restack(nextSelected = selectedIdRef.current, nextHover = hoverIdRef.current) {
    overlaysRef.current.forEach((entry) => {
      applyPinLayer(entry, nextSelected, nextHover, relocatingIdRef.current);
    });
  }

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    const container = containerRef.current;
    if (!key || !container) return;

    const scriptId = "kakao-map-sdk";
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const init = () => {
      window.kakao.maps.load(() => {
        if (!containerRef.current || mapRef.current) return;
        const center = new window.kakao.maps.LatLng(DONGUK_CENTER.lat, DONGUK_CENTER.lng);
        const map = new window.kakao.maps.Map(containerRef.current, {
          center,
          level: 4,
        });
        mapRef.current = map;
        setMapReady(true);
        onReadyRef.current?.({
          panTo(lat, lng) {
            map.panTo(new window.kakao.maps.LatLng(lat, lng));
          },
        });
      });
    };

    if (existing) {
      if (window.kakao?.maps) init();
      else existing.addEventListener("load", init, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    script.onload = init;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !window.kakao?.maps) return;

    overlaysRef.current.forEach((entry) => {
      entry.overlay.setMap(null);
      entry.marker?.setMap(null);
    });
    relocatingOverlayRef.current = null;
    relocatingMarkerRef.current = null;
    hoverIdRef.current = null;
    setStack(null);

    const compact = map.getLevel() >= 6;
    overlaysRef.current = spots.map((spot, index) => {
      const relocating = spot.id === relocatingId;
      const lat = relocating && relocatingPosition ? relocatingPosition.lat : spot.lat;
      const lng = relocating && relocatingPosition ? relocatingPosition.lng : spot.lng;
      const position = new window.kakao.maps.LatLng(lat, lng);
      const root = createPinElement(spot, index, locale, compact);
      const overlay = new window.kakao.maps.CustomOverlay({
        map,
        position,
        content: root,
        xAnchor: 0,
        yAnchor: 1,
        zIndex: Z_BASE + index,
        clickable: true,
      });

      root.addEventListener("pointerenter", () => {
        hoverIdRef.current = spot.id;
        restack();
      });
      root.addEventListener("pointerleave", () => {
        if (hoverIdRef.current === spot.id) hoverIdRef.current = null;
        restack();
      });
      root.addEventListener("click", (event) => {
        event.stopPropagation();
        if (relocatingIdRef.current) return;
        const hits = spotsAtPoint(overlaysRef.current, event.clientX, event.clientY);
        const chosen = hits[0] ?? overlaysRef.current.find((item) => item.root === root);
        if (!chosen) return;
        onSelectRef.current(chosen.spot);
        if (hits.length <= 1) {
          setStack(null);
          return;
        }
        const box = containerRef.current?.getBoundingClientRect();
        const x = box ? event.clientX - box.left : event.clientX;
        const y = box ? event.clientY - box.top : event.clientY;
        setStack({
          items: hits.map((hit) => ({ spot: hit.spot, index: hit.index })),
          x,
          y,
        });
      });

      let marker: KakaoMarker | null = null;
      if (relocating) {
        const handle = DRAG_HANDLE;
        marker = new window.kakao.maps.Marker({
          map,
          position,
          image: new window.kakao.maps.MarkerImage(
            handle.src,
            new window.kakao.maps.Size(handle.width, handle.height),
            { offset: new window.kakao.maps.Point(handle.width / 2, handle.height / 2) },
          ),
          clickable: true,
          draggable: true,
          zIndex: Z_RELOCATE,
        });
        relocatingOverlayRef.current = overlay;
        relocatingMarkerRef.current = marker;
        window.kakao.maps.event.addListener(marker, "dragend", () => {
          const next = marker!.getPosition();
          overlay.setPosition(next);
          onRelocateRef.current?.(next.getLat(), next.getLng());
        });
      }

      return { spot, index, overlay, root, marker };
    });
    restack();
    // relocatingPosition is applied when overlays rebuild, then kept in sync below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spots, relocatingId, mapReady, locale]);

  useEffect(() => {
    restack(selectedId, hoverIdRef.current);
  }, [selectedId, relocatingId]);

  useEffect(() => {
    const overlay = relocatingOverlayRef.current;
    const marker = relocatingMarkerRef.current;
    if (!mapReady || !relocatingId || !relocatingPosition || !window.kakao?.maps) return;
    const position = new window.kakao.maps.LatLng(relocatingPosition.lat, relocatingPosition.lng);
    overlay?.setPosition(position);
    marker?.setPosition(position);
  }, [mapReady, relocatingId, relocatingPosition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !window.kakao?.maps) return;

    const applyZoom = () => {
      const compact = map.getLevel() >= 6;
      overlaysRef.current.forEach((entry) => {
        entry.root.classList.toggle("ds-pin--compact", compact);
      });
    };
    window.kakao.maps.event.addListener(map, "zoom_changed", applyZoom);
    applyZoom();
    return () => {
      window.kakao.maps.event.removeListener(map, "zoom_changed", applyZoom);
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !window.kakao?.maps) return;

    const closeStack = () => setStack(null);
    window.kakao.maps.event.addListener(map, "click", closeStack);
    window.kakao.maps.event.addListener(map, "dragstart", closeStack);
    window.kakao.maps.event.addListener(map, "zoom_changed", closeStack);
    return () => {
      window.kakao.maps.event.removeListener(map, "click", closeStack);
      window.kakao.maps.event.removeListener(map, "dragstart", closeStack);
      window.kakao.maps.event.removeListener(map, "zoom_changed", closeStack);
    };
  }, [mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !relocatingId || !window.kakao?.maps) return;

    const handler = (event?: KakaoMouseEvent) => {
      if (!event?.latLng) return;
      onRelocateRef.current?.(event.latLng.getLat(), event.latLng.getLng());
    };
    window.kakao.maps.event.addListener(map, "click", handler);
    return () => {
      window.kakao.maps.event.removeListener(map, "click", handler);
    };
  }, [mapReady, relocatingId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !window.kakao?.maps) return;

    if (!userLocation) {
      meOverlayRef.current?.setMap(null);
      meCircleRef.current?.setMap(null);
      meOverlayRef.current = null;
      meCircleRef.current = null;
      meRootRef.current = null;
      return;
    }

    const position = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
    if (!meOverlayRef.current || !meRootRef.current) {
      const root = createMeElement(userLocation.source);
      meRootRef.current = root;
      meOverlayRef.current = new window.kakao.maps.CustomOverlay({
        map,
        position,
        content: root,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: 8000,
        clickable: false,
      });
    } else {
      meRootRef.current.className = userLocation.source === "ip" ? "ds-me ds-me--ip" : "ds-me";
      meOverlayRef.current.setPosition(position);
    }

    const showCircle = userLocation.source === "gps";
    const radius = Math.min(Math.max(userLocation.accuracy, 18), 220);
    if (showCircle) {
      if (!meCircleRef.current) {
        meCircleRef.current = new window.kakao.maps.Circle({
          map,
          center: position,
          radius,
          strokeWeight: 1,
          strokeColor: ME_TEAL,
          strokeOpacity: 0.35,
          fillColor: ME_TEAL,
          fillOpacity: 0.12,
          zIndex: 1,
        });
      } else {
        meCircleRef.current.setPosition(position);
        meCircleRef.current.setRadius(radius);
        meCircleRef.current.setMap(map);
      }
    } else {
      meCircleRef.current?.setMap(null);
    }
  }, [mapReady, userLocation]);

  if (!process.env.NEXT_PUBLIC_KAKAO_JS_KEY) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 text-sm text-slate-600">
        {t("mapFailed")}
      </div>
    );
  }

  const pickerStyle = stack
    ? {
        left: `min(${stack.x}px, calc(100% - 12.5rem))`,
        top: `min(${stack.y + 10}px, calc(100% - 8rem))`,
      }
    : undefined;

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {stack ? (
        <div className="ds-pin-stack" style={pickerStyle} role="listbox">
          <p className="ds-pin-stack-title">{t("overlapPick", { count: stack.items.length })}</p>
          {stack.items.map((item) => {
            const name = displayPlaceName(item.spot.name, locale).primary;
            const on = item.spot.id === selectedId;
            return (
              <button
                key={item.spot.id}
                type="button"
                role="option"
                aria-selected={on}
                className={`ds-pin-stack-item${on ? " is-on" : ""}`}
                onClick={() => {
                  setStack(null);
                  onSelect(item.spot);
                }}
              >
                <span className="ds-pin-stack-num">{item.index + 1}</span>
                <span className="ds-pin-stack-copy">
                  <span className="ds-pin-stack-name">{name}</span>
                  <span className="ds-pin-stack-tags">{pinCaption(item.spot, locale)}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
