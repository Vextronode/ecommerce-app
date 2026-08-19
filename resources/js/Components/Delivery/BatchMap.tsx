import React, { useEffect, useRef } from "react";

export interface StopLocation {
    id: number;
    stop_number: number;
    status: string;
    customer_name: string;
    shipping_address: string;
    shipping_latitude: number | null;
    shipping_longitude: number | null;
}

interface Props {
    store: {
        name: string;
        latitude: number | null;
        longitude: number | null;
    };
    stops: StopLocation[];
    driverPos: [number, number] | null;
    deliveredCount: number;
    totalStops: number;
    progressPercent: number;
}

const createStoreIcon = () => {
    const L = (window as any).L;
    return L.divIcon({
        className: "custom-modern-store-pin",
        html: `
            <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
                <div style="background:#14433D;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 16px rgba(20,67,61,0.4);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                        <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
                        <path d="M2 7h20"/>
                        <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -22],
    });
};

const createStopIcon = (stopNumber: number, isDelivered: boolean) => {
    const L = (window as any).L;
    const bgColor = isDelivered ? "#10B981" : "#ED7218";
    const shadowColor = isDelivered ? "rgba(16,185,129,0.4)" : "rgba(237,114,24,0.4)";
    const innerContent = isDelivered
        ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<span style="font-weight:900;font-size:14px;color:#ffffff;line-height:1;">${stopNumber}</span>`;

    return L.divIcon({
        className: `custom-modern-stop-pin-${stopNumber}`,
        html: `
            <div style="position:relative;width:38px;height:38px;display:flex;align-items:center;justify-content:center;">
                <div style="background:${bgColor};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 16px ${shadowColor};">
                    ${innerContent}
                </div>
            </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -20],
    });
};

const createDriverIcon = () => {
    const L = (window as any).L;
    return L.divIcon({
        className: "custom-modern-driver-pin",
        html: `
            <div style="position:relative;width:44px;height:44px;display:flex;align-items:center;justify-content:center;">
                <div style="position:absolute;inset:0;background:#006591;border-radius:50%;opacity:0.25;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                <div style="background:#006591;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:0 6px 18px rgba(0,101,145,0.45);z-index:2;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="18.5" cy="17.5" r="3.5"/>
                        <circle cx="5.5" cy="17.5" r="3.5"/>
                        <circle cx="15" cy="5" r="1"/>
                        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                    </svg>
                </div>
            </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -24],
    });
};

export default function BatchMap({
    store,
    stops,
    driverPos,
    deliveredCount,
    totalStops,
    progressPercent,
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<{ [key: string]: any }>({});
    const routePolylineRef = useRef<any>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const L = (window as any).L;
        if (!L) return;

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView([-7.6974, 108.6534], 13);

            L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                maxZoom: 19,
            }).addTo(map);

            L.control.zoom({ position: "bottomright" }).addTo(map);
            mapRef.current = map;
        }

        const map = mapRef.current;
        const bounds = L.latLngBounds([]);
        const waypoints: [number, number][] = [];

        // Store Marker
        if (store.latitude && store.longitude) {
            const storeLatLng: [number, number] = [store.latitude, store.longitude];
            bounds.extend(storeLatLng);
            waypoints.push(storeLatLng);

            if (!markersRef.current["store"]) {
                markersRef.current["store"] = L.marker(storeLatLng, { icon: createStoreIcon() })
                    .addTo(map)
                    .bindPopup(`<b>${store.name}</b><br><small>Titik Ambil Toko</small>`);
            }
        }

        // Stop Markers
        stops.forEach((stop) => {
            if (stop.shipping_latitude && stop.shipping_longitude) {
                const stopLatLng: [number, number] = [stop.shipping_latitude, stop.shipping_longitude];
                bounds.extend(stopLatLng);
                waypoints.push(stopLatLng);

                const isDeliveredStop = stop.status === "delivered";
                const markerKey = `stop_${stop.id}`;
                const stopIcon = createStopIcon(stop.stop_number, isDeliveredStop);

                if (markersRef.current[markerKey]) {
                    markersRef.current[markerKey].setIcon(stopIcon);
                } else {
                    markersRef.current[markerKey] = L.marker(stopLatLng, { icon: stopIcon })
                        .addTo(map)
                        .bindPopup(
                            `<b>Stop ${stop.stop_number}: ${stop.customer_name}</b><br><small>${stop.shipping_address}</small>`
                        );
                }
            }
        });

        // Fetch OSRM Road Route along all waypoints
        if (waypoints.length >= 2) {
            const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';')}?overview=full&geometries=geojson`;

            fetch(osrmUrl)
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
                        const coords = data.routes[0].geometry.coordinates.map(
                            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
                        );

                        if (routePolylineRef.current) {
                            routePolylineRef.current.remove();
                        }

                        routePolylineRef.current = L.polyline(coords, {
                            color: "#006591",
                            weight: 5,
                            opacity: 0.85,
                            lineJoin: "round",
                            lineCap: "round",
                        }).addTo(map);
                    }
                })
                .catch(() => {
                    // Fallback to straight dashed lines
                    if (!routePolylineRef.current) {
                        routePolylineRef.current = L.polyline(waypoints, {
                            color: "#006591",
                            weight: 4,
                            dashArray: "6, 8",
                        }).addTo(map);
                    }
                });
        }

        // Driver Live Marker
        if (driverPos) {
            bounds.extend(driverPos);

            if (markersRef.current["driver"]) {
                markersRef.current["driver"].setLatLng(driverPos);
            } else {
                markersRef.current["driver"] = L.marker(driverPos, { icon: createDriverIcon() })
                    .addTo(map)
                    .bindPopup(`<b>Kurir Toko (Live Posisi GPS)</b>`);
            }
        }

        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        }
    }, [stops, driverPos, store]);

    return (
        <div className="relative w-full h-[360px] bg-slate-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Progress floating badge */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-200/60 z-[1000] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#14433D] flex items-center justify-center font-black text-xs border border-teal-200">
                    {deliveredCount}/{totalStops}
                </div>
                <div>
                    <p className="text-[11px] font-bold text-slate-800">Progres Pengantaran</p>
                    <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                            className="bg-emerald-500 h-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
