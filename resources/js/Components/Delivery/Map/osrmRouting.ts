export interface GeoLocationItem {
    id: number;
    shipping_latitude: number | null;
    shipping_longitude: number | null;
    [key: string]: any;
}

/**
 * Calculates geographical distance in kilometers between two coordinates using Haversine formula.
 */
export function calculateHaversineKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Orders unvisited stops by shortest travel sequence from an origin point (Greedy TSP Nearest-Neighbor).
 */
export function sortStopsNearestSequence<T extends GeoLocationItem>(
    origin: [number, number],
    unvisited: T[]
): T[] {
    if (unvisited.length <= 1) return unvisited;

    const remaining = [...unvisited];
    const sequence: T[] = [];
    let current = origin;

    while (remaining.length > 0) {
        let bestIdx = 0;
        let bestDist = Infinity;

        for (let i = 0; i < remaining.length; i++) {
            const stop = remaining[i];
            if (stop.shipping_latitude && stop.shipping_longitude) {
                const d = calculateHaversineKm(
                    current[0],
                    current[1],
                    Number(stop.shipping_latitude),
                    Number(stop.shipping_longitude)
                );
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = i;
                }
            }
        }

        const nextStop = remaining.splice(bestIdx, 1)[0];
        sequence.push(nextStop);
        if (nextStop.shipping_latitude && nextStop.shipping_longitude) {
            current = [Number(nextStop.shipping_latitude), Number(nextStop.shipping_longitude)];
        }
    }

    return sequence;
}

/**
 * Fetches real-road driving route coordinates from OpenStreetMap OSRM routing service.
 * @param waypoints Array of [latitude, longitude] pairs.
 * @returns Array of [latitude, longitude] road points for Leaflet polyline, or null if failed.
 */
export async function fetchOsrmPolylineCoords(
    waypoints: [number, number][]
): Promise<[number, number][] | null> {
    if (waypoints.length < 2) return null;

    try {
        const queryParams = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${queryParams}?overview=full&geometries=geojson`;

        const res = await fetch(url);
        if (!res.ok) return null;

        const data = await res.json();
        if (data?.routes?.[0]?.geometry?.coordinates) {
            return data.routes[0].geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
            );
        }
        return null;
    } catch {
        return null;
    }
}
