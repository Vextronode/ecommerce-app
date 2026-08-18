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

    useEffect(() => {
        if (!mapContainerRef.current) return;

        const L = (window as any).L;
        if (!L) return;

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView([-7.6974, 108.6534], 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
            }).addTo(map);

            L.control.zoom({ position: "bottomright" }).addTo(map);
            mapRef.current = map;
        }

        const map = mapRef.current;
        const bounds = L.latLngBounds([]);

        // Store Marker
        if (store.latitude && store.longitude) {
            const storeLatLng = [store.latitude, store.longitude];
            bounds.extend(storeLatLng);

            if (!markersRef.current["store"]) {
                const storeIcon = L.divIcon({
                    className: "custom-store-pin",
                    html: `<div style="background:#14433D;color:white;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);font-size:16px;">🏪</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                });
                markersRef.current["store"] = L.marker(storeLatLng, { icon: storeIcon })
                    .addTo(map)
                    .bindPopup(`<b>${store.name}</b><br><small>Titik Ambil Toko</small>`);
            }
        }

        // Stop Markers
        stops.forEach((stop) => {
            if (stop.shipping_latitude && stop.shipping_longitude) {
                const stopLatLng = [stop.shipping_latitude, stop.shipping_longitude];
                bounds.extend(stopLatLng);

                const isDeliveredStop = stop.status === "delivered";
                const bgColor = isDeliveredStop ? "#10B981" : "#ED7218";
                const markerKey = `stop_${stop.id}`;

                const stopIcon = L.divIcon({
                    className: `custom-stop-pin-${stop.id}`,
                    html: `<div style="background:${bgColor};color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;border:3px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);">${stop.stop_number}</div>`,
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                });

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

        // Driver Live Marker
        if (driverPos) {
            bounds.extend(driverPos);
            const driverIcon = L.divIcon({
                className: "custom-driver-pin",
                html: `<div style="background:#10B981;color:white;width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 4px 14px rgba(16,185,129,0.5);font-size:18px;">🛵</div>`,
                iconSize: [38, 38],
                iconAnchor: [19, 19],
            });

            if (markersRef.current["driver"]) {
                markersRef.current["driver"].setLatLng(driverPos);
            } else {
                markersRef.current["driver"] = L.marker(driverPos, { icon: driverIcon })
                    .addTo(map)
                    .bindPopup(`<b>Kurir (Live Posisi)</b>`);
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
