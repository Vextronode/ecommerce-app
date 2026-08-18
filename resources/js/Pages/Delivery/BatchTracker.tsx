import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import {
    CheckCircle2,
    Radio,
    Eye,
    Navigation,
    ExternalLink,
    Layers,
} from "lucide-react";
import BatchMap, { StopLocation } from "@/Components/Delivery/BatchMap";
import BatchStopCard, { BatchStopData } from "@/Components/Delivery/BatchStopCard";

interface Props {
    batchToken: string;
    role: string;
    store: {
        name: string;
        phone: string;
        latitude: number | null;
        longitude: number | null;
    };
    stops: BatchStopData[];
    googleMapsUrl: string | null;
}

export default function BatchTracker({
    batchToken,
    role,
    store,
    stops: initialStops,
    googleMapsUrl,
}: Props) {
    const [stops, setStops] = useState<BatchStopData[]>(initialStops);
    const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
    const [pinErrors, setPinErrors] = useState<{ [invoice: string]: string }>({});
    const [submittingInvoice, setSubmittingInvoice] = useState<string | null>(null);

    const isDriver = role === "driver";
    const totalStops = stops.length;
    const deliveredCount = stops.filter((s) => s.status === "delivered").length;
    const isAllDelivered = deliveredCount === totalStops && totalStops > 0;
    const progressPercent = Math.round((deliveredCount / totalStops) * 100);

    // Sync props with state on re-render
    useEffect(() => {
        setStops(initialStops);
    }, [initialStops]);

    // Driver GPS Broadcasting vs Spectator Polling
    useEffect(() => {
        if (isAllDelivered) return;

        if (isDriver) {
            if (navigator.geolocation) {
                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setDriverPos([latitude, longitude]);

                        fetch(`/tracker/batch/${batchToken}/location`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as any)?.content,
                            },
                            body: JSON.stringify({ latitude, longitude }),
                        }).catch(() => {});
                    },
                    (err) => console.error("Driver GPS error:", err),
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 5000 }
                );

                return () => navigator.geolocation.clearWatch(watchId);
            }
        } else {
            // Real-time WebSocket Listener via Laravel Reverb
            if (typeof window !== "undefined" && window.Echo) {
                const channel = window.Echo.channel(`batch.${batchToken}`);

                channel.listen(".DriverLocationBroadcasted", (e: any) => {
                    if (e.latitude && e.longitude) {
                        setDriverPos([parseFloat(e.latitude), parseFloat(e.longitude)]);
                    }
                });

                channel.listen(".OrderStatusUpdated", (e: any) => {
                    if (e.invoice_number && e.shipping_status) {
                        setStops((prev) =>
                            prev.map((stop) =>
                                stop.invoice_number === e.invoice_number
                                    ? { ...stop, status: e.shipping_status }
                                    : stop
                            )
                        );
                    }
                });
            }

            // Fallback HTTP poller for resilience
            const fetchBatchLocation = async () => {
                try {
                    const res = await fetch(`/tracker/batch/${batchToken}/location`);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data?.latitude && data?.longitude) {
                        setDriverPos([parseFloat(data.latitude), parseFloat(data.longitude)]);
                    }
                } catch {}
            };

            fetchBatchLocation();
            const interval = setInterval(fetchBatchLocation, 12000);

            return () => {
                clearInterval(interval);
                if (typeof window !== "undefined" && window.Echo) {
                    window.Echo.leaveChannel(`batch.${batchToken}`);
                }
            };
        }
    }, [batchToken, isDriver, isAllDelivered]);

    // Handle individual PIN verification for a stop
    const handleVerifyPin = (invoiceNumber: string, pin: string) => {
        setSubmittingInvoice(invoiceNumber);
        setPinErrors({ ...pinErrors, [invoiceNumber]: "" });

        router.post(
            route("tracker.completeBatchStop", [batchToken, invoiceNumber]),
            { pin },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmittingInvoice(null);
                },
                onError: (err: any) => {
                    setPinErrors({
                        ...pinErrors,
                        [invoiceNumber]: err?.error || "PIN tidak valid.",
                    });
                    setSubmittingInvoice(null);
                },
            }
        );
    };

    // Full Screen All Delivered Celebration
    if (isAllDelivered) {
        return (
            <div className="min-h-screen bg-[#14433D] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
                <Head title={`Semua Pesanan Selesai - #${batchToken}`} />

                <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#41B9C5] rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-30 animate-pulse delay-700" />

                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative z-10 text-center space-y-5 animate-[bounceIn_0.6s_ease-out]">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-[#14433D]">Semua Pesanan Terkirim!</h1>
                        <p className="text-xs text-gray-500 mt-1">
                            Batch Pengiriman <span className="font-mono font-bold">#{batchToken}</span> ({totalStops} pesanan) telah selesai diantar dengan sukses.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl text-left divide-y divide-gray-100 text-xs">
                        <div className="pb-2 flex justify-between items-center text-gray-500 font-medium">
                            <span>Total Pesanan Selesai</span>
                            <span className="font-bold text-[#14433D]">{totalStops} Titik Stop</span>
                        </div>
                        <div className="pt-2 flex justify-between items-center text-gray-500 font-medium">
                            <span>Status Escrow</span>
                            <span className="font-bold text-emerald-600">✅ Saldo Diteruskan</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => (window.location.href = "/")}
                        className="w-full py-3.5 bg-[#14433D] hover:bg-[#0f342f] text-white font-bold rounded-xl transition shadow-lg cursor-pointer"
                    >
                        Tutup Halaman
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
            <Head title={`Multi-Stop Tracker - #${batchToken}`} />

            {/* Header */}
            <header className="bg-[#14433D] text-white p-4 shadow-md sticky top-0 z-20">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Layers className="w-5 h-5 text-[#41B9C5]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-extrabold tracking-wider">MULTI-STOP TRACKER</h1>
                            <p className="text-xs text-[#41B9C5] font-mono">#{batchToken}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
                        {isDriver ? (
                            <>
                                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span className="text-emerald-300">Driver Mode</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-3.5 h-3.5 text-[#41B9C5]" />
                                <span className="text-slate-200">Viewer Mode</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto pb-24 space-y-4">
                {/* Clean Modular Multi-Stop Map */}
                <BatchMap
                    store={store}
                    stops={stops as StopLocation[]}
                    driverPos={driverPos}
                    deliveredCount={deliveredCount}
                    totalStops={totalStops}
                    progressPercent={progressPercent}
                />

                {/* Google Maps Multi-Waypoint Navigation Button */}
                {googleMapsUrl && (
                    <div className="px-4">
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition cursor-pointer"
                        >
                            <Navigation className="w-4 h-4" />
                            <span>📍 Buka Navigasi Rute di Google Maps</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
                        </a>
                    </div>
                )}

                {/* List of Ordered Stops */}
                <div className="px-4 space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                        Daftar Titik Pengantaran ({totalStops} Stop)
                    </h3>

                    {stops.map((stop) => (
                        <BatchStopCard
                            key={stop.id}
                            stop={stop}
                            isDriver={isDriver}
                            onVerifyPin={handleVerifyPin}
                            isSubmitting={submittingInvoice === stop.invoice_number}
                            errorMessage={pinErrors[stop.invoice_number]}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
