import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    LocateFixed,
    Maximize2,
    Minimize2,
    Navigation,
    Phone,
    MessageSquare,
    Route,
} from "lucide-react";
import { createStoreIcon, createStopIcon, createDriverIcon } from "./Map/MapIcons";
import {
    sortStopsNearestSequence,
    fetchOsrmPolylineCoords,
    GeoLocationItem,
} from "./Map/osrmRouting";
import { useBatchMapCamera } from "./Map/useBatchMapCamera";

export interface StopLocation extends GeoLocationItem {
    id: number;
    stop_number: number;
    status: string;
    customer_name: string;
    customer_phone?: string;
    shipping_address: string;
    shipping_latitude: number | null;
    shipping_longitude: number | null;
    invoice_number?: string;
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
    isDriver?: boolean;
    refreshCounter?: number;
    selectedTargetStopId?: number | null;
    onSelectTargetStop?: (stopId: number) => void;
}

export default function BatchMap({
    store,
    stops,
    driverPos,
    deliveredCount,
    totalStops,
    progressPercent,
    isDriver = false,
    refreshCounter = 0,
    selectedTargetStopId = null,
    onSelectTargetStop,
}: Props) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<{ [key: string]: L.Marker }>({});
    const activePolylineRef = useRef<L.Polyline | null>(null);
    const upcomingPolylineRef = useRef<L.Polyline | null>(null);

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [showUpcomingRoute, setShowUpcomingRoute] = useState<boolean>(false);

    // Clean Architecture: Delegate camera viewport orchestration to Custom Hook
    const camera = useBatchMapCamera({
        mapRef,
        driverPos,
        store,
        stops,
    });

    // 1. Initialize Map Instance (Pure Leaflet + OSM)
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapRef.current) {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView([-7.6974, 108.6534], 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            L.control.zoom({ position: "bottomright" }).addTo(map);

            map.on("dragstart", () => camera.setFreeMode());
            map.on("zoomstart", () => camera.setFreeMode());

            mapRef.current = map;
        }
    }, [camera]);

    // Handle Fullscreen Transitions & Invalidate Map Dimensions
    const toggleFullscreen = () => {
        setIsFullscreen((prev) => {
            const next = !prev;
            camera.invalidateSize();
            return next;
        });
    };

    // 2. Render Markers, Polylines & Live Sync
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const bounds = L.latLngBounds([]);

        // Store Pin
        if (store.latitude && store.longitude) {
            const storePos: [number, number] = [Number(store.latitude), Number(store.longitude)];
            bounds.extend(storePos);

            if (!markersRef.current["store"]) {
                markersRef.current["store"] = L.marker(storePos, { icon: createStoreIcon() })
                    .addTo(map)
                    .bindPopup(`<b>${store.name}</b><br><small>Titik Ambil Toko</small>`);
            }
        }

        // Stop Pins
        stops.forEach((stop) => {
            if (stop.shipping_latitude && stop.shipping_longitude) {
                const pos: [number, number] = [Number(stop.shipping_latitude), Number(stop.shipping_longitude)];
                bounds.extend(pos);

                const isDelivered = stop.status === "delivered";
                const isSelected = selectedTargetStopId === stop.id;
                const markerKey = `stop_${stop.id}`;
                const icon = createStopIcon(stop.stop_number, isDelivered, isSelected);

                if (markersRef.current[markerKey]) {
                    markersRef.current[markerKey].setIcon(icon);
                } else {
                    const marker = L.marker(pos, { icon }).addTo(map);
                    marker.on("click", () => {
                        onSelectTargetStop?.(stop.id);
                    });
                    markersRef.current[markerKey] = marker;
                }

                markersRef.current[markerKey].bindPopup(
                    `<b>Stop ${stop.stop_number}: ${stop.customer_name}</b><br><small>${stop.shipping_address}</small>${
                        !isDelivered
                            ? `<br><div style="margin-top:4px;"><span style="color:#0284C7;font-weight:bold;font-size:11px;">${
                                  isSelected ? "★ Target Rute Aktif" : "Klik untuk arahkan rute ke sini"
                              }</span></div>`
                            : ""
                    }`
                );
            }
        });

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

        // 3. Dynamic Route Computation
        const undeliveredStops = stops.filter(
            (s) => s.status !== "delivered" && s.shipping_latitude && s.shipping_longitude
        );

        const effectiveOrigin: [number, number] | null = driverPos
            ? driverPos
            : store.latitude && store.longitude
            ? [Number(store.latitude), Number(store.longitude)]
            : null;

        if (!effectiveOrigin || undeliveredStops.length === 0) {
            if (activePolylineRef.current) {
                activePolylineRef.current.remove();
                activePolylineRef.current = null;
            }
            if (upcomingPolylineRef.current) {
                upcomingPolylineRef.current.remove();
                upcomingPolylineRef.current = null;
            }
        } else {
            let activeStop: StopLocation;
            let upcomingStops: StopLocation[];

            if (selectedTargetStopId) {
                const target = undeliveredStops.find((s) => s.id === selectedTargetStopId);
                if (target) {
                    activeStop = target;
                    const others = undeliveredStops.filter((s) => s.id !== selectedTargetStopId);
                    upcomingStops = sortStopsNearestSequence(
                        [Number(target.shipping_latitude), Number(target.shipping_longitude)],
                        others
                    );
                } else {
                    const seq = sortStopsNearestSequence(effectiveOrigin, undeliveredStops);
                    activeStop = seq[0];
                    upcomingStops = seq.slice(1);
                }
            } else {
                const seq = sortStopsNearestSequence(effectiveOrigin, undeliveredStops);
                activeStop = seq[0];
                upcomingStops = seq.slice(1);
            }

            const activeStopPos: [number, number] = [
                Number(activeStop.shipping_latitude),
                Number(activeStop.shipping_longitude),
            ];

            // 1. ACTIVE LEG (Vibrant Blue #0284C7): Driver -> Current Target Stop
            fetchOsrmPolylineCoords([effectiveOrigin, activeStopPos]).then((coords) => {
                if (activePolylineRef.current) {
                    activePolylineRef.current.remove();
                }
                const points = coords || [effectiveOrigin, activeStopPos];
                activePolylineRef.current = L.polyline(points, {
                    color: "#0284C7",
                    weight: 6,
                    opacity: 0.95,
                    lineJoin: "round",
                    lineCap: "round",
                }).addTo(map);
            });

            // 2. UPCOMING LEG (Vivid Orange Dashed #EA580C): Target Stop -> Remaining Stops
            // Only rendered if enabled via toggle or in fullscreen to prevent road overlap
            if (showUpcomingRoute && upcomingStops.length > 0) {
                const waypoints: [number, number][] = [
                    activeStopPos,
                    ...upcomingStops.map(
                        (s) => [Number(s.shipping_latitude), Number(s.shipping_longitude)] as [number, number]
                    ),
                ];

                fetchOsrmPolylineCoords(waypoints).then((coords) => {
                    if (upcomingPolylineRef.current) {
                        upcomingPolylineRef.current.remove();
                    }
                    const points = coords || waypoints;
                    upcomingPolylineRef.current = L.polyline(points, {
                        color: "#EA580C",
                        weight: 4.5,
                        opacity: 0.9,
                        dashArray: "8, 9",
                        lineJoin: "round",
                        lineCap: "round",
                    }).addTo(map);
                });
            } else if (upcomingPolylineRef.current) {
                upcomingPolylineRef.current.remove();
                upcomingPolylineRef.current = null;
            }
        }

        // Camera initial auto-fit
        if (!camera.hasFittedOnceRef.current && bounds.isValid()) {
            camera.fitAllRoutes();
            camera.hasFittedOnceRef.current = true;
        } else if (camera.cameraMode === "driver" && driverPos) {
            map.panTo(driverPos, { animate: true, duration: 0.8 });
        }
    }, [stops, driverPos, store, selectedTargetStopId, showUpcomingRoute, camera]);

    // External Refresh Trigger
    useEffect(() => {
        if (refreshCounter > 0) {
            camera.fitAllRoutes();
        }
    }, [refreshCounter, camera]);

    // Active stop details for Fullscreen bottom navigation sheet
    const undelivered = stops.filter((s) => s.status !== "delivered");
    const activeTargetStop =
        (selectedTargetStopId ? stops.find((s) => s.id === selectedTargetStopId) : null) ||
        undelivered[0] ||
        null;

    return (
        <div
            className={`transition-all duration-300 font-sans ${
                isFullscreen
                    ? "fixed inset-0 z-50 w-screen h-screen bg-slate-900"
                    : "relative w-full h-90 bg-slate-200 shadow-inner"
            }`}
        >
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* TOP BAR OVERLAYS (Responsive & Collision-Free) */}
            <div className="absolute top-3 inset-x-3 z-400 flex items-center justify-between gap-2 pointer-events-none">
                {/* Left: Compact Progress Pill & Optional Upcoming Route Toggle */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200/70 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-brand-blue text-white flex items-center justify-center font-black text-xs">
                            {deliveredCount}/{totalStops}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800">
                            {progressPercent}%
                        </span>
                    </div>

                    {/* Toggle Rute Lanjutan (Opsi A+B) */}
                    <button
                        type="button"
                        onClick={() => setShowUpcomingRoute((prev) => !prev)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold shadow-md border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                            showUpcomingRoute
                                ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                                : "bg-white/95 backdrop-blur-md text-slate-700 border-slate-200/70 hover:bg-white"
                        }`}
                        title="Tampilkan / Sembunyikan garis rute lanjutan ke titik berikutnya"
                    >
                        <Route className={`w-3.5 h-3.5 ${showUpcomingRoute ? "text-white" : "text-amber-600"}`} />
                        <span className="hidden sm:inline">
                            {showUpcomingRoute ? "Rute Lanjutan Aktif" : "+ Rute Lanjutan"}
                        </span>
                    </button>
                </div>

                {/* Right: Fullscreen Toggle Button */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                            isFullscreen
                                ? "bg-slate-900/90 text-white border-slate-700 hover:bg-slate-900"
                                : "bg-white/95 backdrop-blur-md text-slate-800 border-slate-200/70 hover:bg-white"
                        }`}
                        title={isFullscreen ? "Keluar Layar Penuh" : "Buka Tampilan Layar Penuh (Navigasi Lapangan)"}
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                                <span>Tutup</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-3.5 h-3.5 text-brand-blue" />
                                <span className="hidden xs:inline sm:inline">Layar Penuh</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* BOTTOM-LEFT: Camera Mode Buttons */}
            <div
                className={`absolute left-3 z-400 flex items-center gap-2 ${
                    isFullscreen && activeTargetStop ? "bottom-28 sm:bottom-24" : "bottom-3"
                }`}
            >
                <button
                    type="button"
                    onClick={camera.fitAllRoutes}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${
                        camera.cameraMode === "fit"
                            ? "bg-brand-blue text-white border border-brand-blue shadow-brand-blue/30"
                            : "bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white"
                    }`}
                    title="Tampilkan seluruh rute kurir dan semua titik tujuan agar tidak terpotong"
                >
                    <Maximize2 className={`w-3.5 h-3.5 ${camera.cameraMode === "fit" ? "text-white" : "text-brand-blue"}`} />
                    <span>Semua Rute</span>
                </button>

                {driverPos && (
                    <button
                        type="button"
                        onClick={camera.focusDriver}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${
                            camera.cameraMode === "driver"
                                ? "bg-brand-blue text-white border border-brand-blue shadow-brand-blue/30"
                                : "bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white"
                        }`}
                        title="Perbesar dan ikuti posisi kurir secara dekat"
                    >
                        <LocateFixed className={`w-3.5 h-3.5 ${camera.cameraMode === "driver" ? "text-white" : "text-brand-blue"}`} />
                        <span>{isDriver ? "Fokus Saya" : "Fokus Kurir"}</span>
                    </button>
                )}
            </div>

            {/* FULLSCREEN BOTTOM SHEET (Driver Turn-by-Turn Action Card) */}
            {isFullscreen && activeTargetStop && (
                <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto z-400 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/80 flex items-center justify-between gap-3 animate-fade-in-up">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-brand-blue text-white flex items-center justify-center font-black text-[11px] shrink-0">
                                {activeTargetStop.stop_number}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm truncate">
                                {activeTargetStop.customer_name}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                            {activeTargetStop.shipping_address}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {activeTargetStop.customer_phone && (
                            <a
                                href={`https://wa.me/${activeTargetStop.customer_phone
                                    .replace(/\D/g, "")
                                    .replace(/^0/, "62")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-9 h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition border border-emerald-200/60"
                                title="WhatsApp Pembeli"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </a>
                        )}

                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${activeTargetStop.shipping_latitude},${activeTargetStop.shipping_longitude}&travelmode=driving`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-brand-blue hover:bg-brand-blue-hover text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-brand-blue/20 transition cursor-pointer"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Navigasi</span>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
