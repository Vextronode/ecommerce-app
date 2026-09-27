import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    Maximize2,
    Minimize2,
    LocateFixed,
    Navigation,
    Compass,
    MessageSquare,
} from "lucide-react";
import { createStoreIcon, createStopIcon, createDriverIcon } from "./Map/MapIcons";
import { fetchOsrmPolylineCoords } from "./Map/osrmRouting";

interface DeliveryMapProps {
    storePos: [number, number] | null;
    buyerPos: [number, number] | null;
    driverPos: [number, number] | null;
    order: any;
    isDriver?: boolean;
    refreshCounter?: number;
}

export type CameraMode = "fit" | "driver" | "free";

export default function DeliveryMap({
    storePos,
    buyerPos,
    driverPos,
    order,
    isDriver = false,
    refreshCounter = 0,
}: DeliveryMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const storeMarkerRef = useRef<L.Marker | null>(null);
    const buyerMarkerRef = useRef<L.Marker | null>(null);
    const driverMarkerRef = useRef<L.Marker | null>(null);
    const routePolylineRef = useRef<L.Polyline | null>(null);

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [cameraMode, setCameraMode] = useState<CameraMode>("fit");
    const [roadDistanceKm, setRoadDistanceKm] = useState<string | null>(null);
    const hasFittedOnceRef = useRef<boolean>(false);

    // Fit bounds across all active points (store, buyer, driver)
    const fitAllRoutes = useCallback(() => {
        setCameraMode("fit");
        const map = mapInstance.current;
        if (!map) return;

        const bounds = L.latLngBounds([]);
        if (storePos) bounds.extend(storePos);
        if (buyerPos) bounds.extend(buyerPos);
        if (driverPos) bounds.extend(driverPos);

        if (bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 16,
                animate: true,
            });
        }
    }, [storePos, buyerPos, driverPos]);

    // Focus camera on driver
    const focusDriver = useCallback(() => {
        setCameraMode("driver");
        const map = mapInstance.current;
        if (!map || !driverPos) return;

        map.flyTo(driverPos, 16, {
            animate: true,
            duration: 0.8,
        });
    }, [driverPos]);

    // Handle Fullscreen Transitions & Invalidate Map Dimensions
    const toggleFullscreen = () => {
        setIsFullscreen((prev) => {
            const next = !prev;
            setTimeout(() => {
                mapInstance.current?.invalidateSize();
            }, 150);
            return next;
        });
    };

    // 1. Initialize Map Instance (Pure Leaflet + OSM)
    useEffect(() => {
        if (!mapContainerRef.current || order.status === "delivered") return;

        if (!mapInstance.current) {
            const initialCenter = storePos || buyerPos || [-7.6974, 108.6534];
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
            }).setView(initialCenter, 13);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            L.control.zoom({ position: "bottomright" }).addTo(map);

            // User manual interaction switches to free mode
            map.on("dragstart", () => setCameraMode("free"));
            map.on("zoomstart", () => setCameraMode("free"));

            mapInstance.current = map;
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                storeMarkerRef.current = null;
                buyerMarkerRef.current = null;
                driverMarkerRef.current = null;
                routePolylineRef.current = null;
            }
        };
    }, []);

    // 2. Render Markers, Real-Road Polylines & Live Sync
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;

        const bounds = L.latLngBounds([]);

        // Store Pin
        if (storePos) {
            bounds.extend(storePos);
            if (!storeMarkerRef.current) {
                storeMarkerRef.current = L.marker(storePos, { icon: createStoreIcon() })
                    .addTo(map)
                    .bindPopup(`<b>${order.store_name}</b><br><small>Titik Ambil Toko</small>`);
            } else {
                storeMarkerRef.current.setLatLng(storePos);
            }
        }

        // Buyer Pin
        if (buyerPos) {
            bounds.extend(buyerPos);
            if (!buyerMarkerRef.current) {
                buyerMarkerRef.current = L.marker(buyerPos, {
                    icon: createStopIcon(1, false, true),
                })
                    .addTo(map)
                    .bindPopup(
                        `<b>Tujuan: ${order.customer_name}</b><br><small>${order.shipping_address}</small>`
                    );
            } else {
                buyerMarkerRef.current.setLatLng(buyerPos);
            }
        }

        // Driver Live Marker
        if (driverPos) {
            bounds.extend(driverPos);
            if (!driverMarkerRef.current) {
                driverMarkerRef.current = L.marker(driverPos, { icon: createDriverIcon() })
                    .addTo(map)
                    .bindPopup(`<b>Kurir Toko (Live Posisi GPS)</b>`);
            } else {
                driverMarkerRef.current.setLatLng(driverPos);
            }
        }

        // Route Calculation (Origin: Driver if available, otherwise Store -> Buyer Destination)
        const effectiveOrigin: [number, number] | null = driverPos || storePos;
        if (effectiveOrigin && buyerPos) {
            fetchOsrmPolylineCoords([effectiveOrigin, buyerPos]).then((coords) => {
                if (routePolylineRef.current) {
                    routePolylineRef.current.remove();
                }

                const points = coords || [effectiveOrigin, buyerPos];
                routePolylineRef.current = L.polyline(points, {
                    color: "#0284C7",
                    weight: 6,
                    opacity: 0.95,
                    lineJoin: "round",
                    lineCap: "round",
                }).addTo(map);

                // Calculate distance from road points or straight-line approximation
                if (coords && coords.length > 1) {
                    let totalMeters = 0;
                    for (let i = 0; i < coords.length - 1; i++) {
                        totalMeters += L.latLng(coords[i]).distanceTo(L.latLng(coords[i + 1]));
                    }
                    setRoadDistanceKm((totalMeters / 1000).toFixed(1));
                } else {
                    const distKm = (
                        L.latLng(effectiveOrigin).distanceTo(L.latLng(buyerPos)) / 1000
                    ).toFixed(1);
                    setRoadDistanceKm(distKm);
                }
            });
        }

        // Camera initial auto-fit
        if (!hasFittedOnceRef.current && bounds.isValid()) {
            map.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 16,
                animate: true,
            });
            hasFittedOnceRef.current = true;
        } else if (cameraMode === "driver" && driverPos) {
            map.panTo(driverPos, { animate: true, duration: 0.8 });
        }
    }, [storePos, buyerPos, driverPos, cameraMode]);

    // External Refresh Trigger
    useEffect(() => {
        if (refreshCounter > 0) {
            fitAllRoutes();
        }
    }, [refreshCounter, fitAllRoutes]);

    const googleMapsUrl =
        storePos && buyerPos
            ? `https://www.google.com/maps/dir/?api=1&origin=${(driverPos || storePos)?.[0]},${
                  (driverPos || storePos)?.[1]
              }&destination=${buyerPos[0]},${buyerPos[1]}&travelmode=driving`
            : "#";

    return (
        <div
            className={`transition-all duration-300 font-sans ${
                isFullscreen
                    ? "fixed inset-0 z-50 w-screen h-screen bg-slate-900"
                    : "relative w-full h-84 sm:h-96 rounded-3xl overflow-hidden shadow-lg border border-gray-100 mb-6 bg-slate-200"
            }`}
        >
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* TOP BAR OVERLAYS */}
            <div className="absolute top-3 inset-x-3 z-400 flex items-center justify-between gap-2 pointer-events-none">
                {/* Left: Distance & Status Badge */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    {roadDistanceKm && (
                        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-md border border-slate-200/70 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#006591]" />
                            <span className="text-[11px] font-bold text-slate-800">
                                ~{roadDistanceKm} KM (Jalur Darat)
                            </span>
                        </div>
                    )}
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
                        title={
                            isFullscreen
                                ? "Keluar Layar Penuh"
                                : "Buka Tampilan Layar Penuh (Navigasi Lapangan)"
                        }
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
                                <span>Tutup</span>
                            </>
                        ) : (
                            <>
                                <Maximize2 className="w-3.5 h-3.5 text-[#006591]" />
                                <span className="hidden xs:inline sm:inline">Layar Penuh</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* BOTTOM-LEFT: Camera Mode Buttons */}
            <div
                className={`absolute left-3 z-400 flex items-center gap-2 ${
                    isFullscreen ? "bottom-28 sm:bottom-24" : "bottom-3"
                }`}
            >
                <button
                    type="button"
                    onClick={fitAllRoutes}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${
                        cameraMode === "fit"
                            ? "bg-[#006591] text-white border border-[#006591] shadow-[#006591]/30"
                            : "bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white"
                    }`}
                    title="Tampilkan seluruh rute (toko, kurir, dan tujuan) agar tidak terpotong"
                >
                    <Maximize2
                        className={`w-3.5 h-3.5 ${
                            cameraMode === "fit" ? "text-white" : "text-[#006591]"
                        }`}
                    />
                    <span>Semua Rute</span>
                </button>

                {driverPos && (
                    <button
                        type="button"
                        onClick={focusDriver}
                        className={`px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all duration-300 active:scale-95 cursor-pointer ${
                            cameraMode === "driver"
                                ? "bg-[#006591] text-white border border-[#006591] shadow-[#006591]/30"
                                : "bg-white/95 backdrop-blur-md text-slate-700 border border-slate-200 hover:bg-white"
                        }`}
                        title="Perbesar dan ikuti posisi kurir secara dekat"
                    >
                        <LocateFixed
                            className={`w-3.5 h-3.5 ${
                                cameraMode === "driver" ? "text-white" : "text-[#006591]"
                            }`}
                        />
                        <span>{isDriver ? "Fokus Saya" : "Fokus Kurir"}</span>
                    </button>
                )}
            </div>

            {/* BOTTOM-RIGHT: Google Maps Navigation in Normal Mode */}
            {!isFullscreen && (
                <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 z-400 bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-white flex items-center gap-2 border border-slate-200/80 transition-all hover:scale-102 active:scale-95 cursor-pointer"
                >
                    <Navigation className="w-3.5 h-3.5 text-[#006591]" />
                    <span className="hidden xs:inline sm:inline">Navigasi</span> Google Maps
                </a>
            )}

            {/* FULLSCREEN BOTTOM SHEET (Driver Turn-by-Turn Action Card) */}
            {isFullscreen && (
                <div className="absolute bottom-4 inset-x-4 max-w-xl mx-auto z-400 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200/80 flex items-center justify-between gap-3 animate-fade-in-up">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-[#006591] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                                1
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm truncate">
                                {order.customer_name}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                            {order.shipping_address}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {order.customer_phone && (
                            <a
                                href={`https://wa.me/${order.customer_phone
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
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#006591] hover:bg-[#005174] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#006591]/20 transition cursor-pointer"
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
