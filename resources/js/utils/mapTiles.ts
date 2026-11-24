import L from "leaflet";

const OSM_TILE_URL =
    import.meta.env.VITE_MAP_TILE_URL ||
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const FALLBACK_TILE_URL =
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const OSM_ATTRIBUTION =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const MAP_REFERRER_POLICY = "strict-origin-when-cross-origin" as const;

/**
 * Adds a Leaflet tile layer with an explicit referrerPolicy so upstream
 * proxy `Referrer-Policy: no-referrer` headers do not trigger OSM 403 blocks,
 * and falls back to CARTO Voyager if the primary tile server fails.
 */
export function addBaseTileLayer(
    map: L.Map,
    options: { maxZoom?: number; attribution?: string } = {},
): L.TileLayer {
    const primaryLayer = L.tileLayer(OSM_TILE_URL, {
        maxZoom: options.maxZoom ?? 19,
        attribution: options.attribution ?? OSM_ATTRIBUTION,
        referrerPolicy: MAP_REFERRER_POLICY,
    });

    let switchedToFallback = false;
    primaryLayer.on("tileerror", () => {
        if (switchedToFallback || OSM_TILE_URL === FALLBACK_TILE_URL) return;
        switchedToFallback = true;
        primaryLayer.setUrl(FALLBACK_TILE_URL);
    });

    primaryLayer.addTo(map);
    return primaryLayer;
}

/**
 * Fetches from Nominatim with an explicit referrerPolicy so upstream
 * `no-referrer` headers do not strip the origin Referer.
 */
export function fetchNominatim(
    pathAndQuery: string,
    init: RequestInit = {},
): Promise<Response> {
    const baseUrl =
        import.meta.env.VITE_NOMINATIM_URL ||
        "https://nominatim.openstreetmap.org";

    return fetch(`${baseUrl}${pathAndQuery}`, {
        ...init,
        referrerPolicy: MAP_REFERRER_POLICY,
    });
}
