export {};

declare global {
  interface Window {
    kakao: KakaoNamespace;
  }
}

type KakaoNamespace = {
  maps: {
    load: (callback: () => void) => void;
    Map: new (
      container: HTMLElement,
      options: { center: KakaoLatLng; level: number },
    ) => KakaoMap;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Marker: new (options: {
      map?: KakaoMap;
      position: KakaoLatLng;
      image?: KakaoMarkerImage;
      clickable?: boolean;
      draggable?: boolean;
      zIndex?: number;
    }) => KakaoMarker;
    MarkerImage: new (
      src: string,
      size: KakaoSize,
      options?: { offset?: KakaoPoint },
    ) => KakaoMarkerImage;
    CustomOverlay: new (options: {
      map?: KakaoMap;
      position: KakaoLatLng;
      content: HTMLElement | string;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
      clickable?: boolean;
    }) => KakaoCustomOverlay;
    Circle: new (options: {
      map?: KakaoMap;
      center: KakaoLatLng;
      radius: number;
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      fillColor?: string;
      fillOpacity?: number;
      zIndex?: number;
    }) => KakaoCircle;
    Polyline: new (options: {
      map?: KakaoMap;
      path: KakaoLatLng[];
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
      zIndex?: number;
    }) => KakaoPolyline;
    LatLngBounds: new () => KakaoLatLngBounds;
    Size: new (width: number, height: number) => KakaoSize;
    Point: new (x: number, y: number) => KakaoPoint;
    event: {
      addListener: (
        target: unknown,
        type: string,
        handler: (event?: KakaoMouseEvent) => void,
      ) => void;
      removeListener: (
        target: unknown,
        type: string,
        handler: (event?: KakaoMouseEvent) => void,
      ) => void;
    };
    services: {
      Places: new () => KakaoPlaces;
      Status: { OK: string };
      SortBy?: { DISTANCE: string; ACCURACY: string };
    };
  };
};

export type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

export type KakaoMouseEvent = {
  latLng: KakaoLatLng;
};

export type KakaoMap = {
  setCenter: (latlng: KakaoLatLng) => void;
  panTo: (latlng: KakaoLatLng) => void;
  setBounds: (
    bounds: KakaoLatLngBounds,
    paddingTop?: number,
    paddingRight?: number,
    paddingBottom?: number,
    paddingLeft?: number,
  ) => void;
  getCenter: () => KakaoLatLng;
  getLevel: () => number;
  setLevel: (level: number) => void;
  relayout: () => void;
};

export type KakaoLatLngBounds = {
  extend: (latlng: KakaoLatLng) => void;
};

export type KakaoPolyline = {
  setMap: (map: KakaoMap | null) => void;
  setPath: (path: KakaoLatLng[]) => void;
};

export type KakaoCustomOverlay = {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (latlng: KakaoLatLng) => void;
  setZIndex: (zIndex: number) => void;
};

export type KakaoCircle = {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (latlng: KakaoLatLng) => void;
  setRadius: (radius: number) => void;
};

export type KakaoMarker = {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (latlng: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setZIndex: (zIndex: number) => void;
  setDraggable: (draggable: boolean) => void;
};

export type KakaoMarkerImage = object;
export type KakaoSize = object;
export type KakaoPoint = object;

export type KakaoPlaces = {
  keywordSearch: (
    keyword: string,
    callback: (data: KakaoPlaceResult[], status: string) => void,
    options?: {
      location?: KakaoLatLng;
      radius?: number;
      sort?: string;
    },
  ) => void;
};

export type KakaoPlaceResult = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  phone?: string;
  place_url?: string;
};
