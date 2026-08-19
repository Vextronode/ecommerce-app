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
    initialDriverPos?: [number, number] | null;
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
    initialDriverPos,
    store,
    stops: initialStops,
    googleMapsUrl,
}: Props) {
    const [stops, setStops] = useState<BatchStopData[]>(initialStops);
    const [driverPos, setDriverPos] = useState<[number, number] | null>(() => initialDriverPos || null);
    const [pinErrors, setPinErrors] = useState<{ [invoice: string]: string }>({});
    const [submittingInvoice, setSubmittingInvoice] = useState<string | null>(null);

    const isDriver = role === "driver";
    const totalStops = stops.length;
    const deliveredCount = stops.filter((s) => s.status === "delivered").length;
    const isAllDelivered = deliveredCount === totalStops && totalStops > 0;
    const progressPercent = totalStops > 0 ? Math.round((deliveredCount / totalStops) * 100) : 0;

    // Sync props with state on re-render
    useEffect(() => {
        setStops(initialStops);
    }, [initialStops]);

    // Driver GPS Broadcasting vs Spectator Polling
    useEffect(() => {
        if (isAllDelivered) return;

        if (isDriver) {
            const sendBatchGps = (latitude: number, longitude: number) => {
                setDriverPos([latitude, longitude]);

                fetch(`/tracker/batch/${batchToken}/location`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ latitude, longitude }),
                }).catch(() => {});
            };

            if (navigator.geolocation) {
                // Initial immediate position fix
                navigator.geolocation.getCurrentPosition(
                    (pos) => sendBatchGps(pos.coords.latitude, pos.coords.longitude),
                    (err) => console.warn("Initial batch GPS warning:", err),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
                );

                // Continuous watcher
                const watchId = navigator.geolocation.watchPosition(
                    (pos) => sendBatchGps(pos.coords.latitude, pos.coords.longitude),
                    (err) => console.warn("Driver batch GPS error:", err),
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
                );

                return () => navigator.geolocation.clearWatch(watchId);
            }
        } else {
            // Real-time WebSocket Listener via Laravel Reverb
            if (typeof window !== "undefined" && window.Echo) {
                const channel = window.Echo.channel(`batch.${batchToken}`);

                const handleBatchLocation = (e: any) => {
                    if (e.latitude && e.longitude) {
                        setDriverPos([parseFloat(e.latitude), parseFloat(e.longitude)]);
                    }
                };

                const handleBatchStatus = (e: any) => {
                    if (e.invoice_number && e.shipping_status) {
                        setStops((prev) =>
                            prev.map((stop) =>
                                stop.invoice_number === e.invoice_number
                                    ? { ...stop, status: e.shipping_status }
                                    : stop
                            )
                        );
                    }
                };

                channel.listen(".DriverLocationBroadcasted", handleBatchLocation);
                channel.listen("DriverLocationBroadcasted", handleBatchLocation);
                channel.listen(".OrderStatusUpdated", handleBatchStatus);
                channel.listen("OrderStatusUpdated", handleBatchStatus);

                return () => {
                    window.Echo.leaveChannel(`batch.${batchToken}`);
                };
            }

            const fetchBatchLocation = async () => {
                try {
                    const res = await fetch(`/tracker/batch/${batchToken}/location`);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data && data.latitude && data.longitude) {
                        setDriverPos([parseFloat(data.latitude), parseFloat(data.longitude)]);
                    }
                } catch {}
            };

            fetchBatchLocation();
            const interval = setInterval(fetchBatchLocation, 10000);
            return () => clearInterval(interval);
        }
    }, [isAllDelivered, isDriver, batchToken]);

    const handlePinSubmit = (invoice_number: string, pin: string) => {
        if (!pin || pin.length !== 4) {
            setPinErrors((prev) => ({
                ...prev,
                [invoice_number]: "PIN harus tepat 4 angka.",
            }));
            return;
        }

        setSubmittingInvoice(invoice_number);
        setPinErrors((prev) => ({ ...prev, [invoice_number]: "" }));

        router.post(
            route("tracker.completeBatchStop", {
                batch_token: batchToken,
                invoice_number: invoice_number,
            }),
            { pin },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSubmittingInvoice(null);
                },
                onError: (errors: any) => {
                    setSubmittingInvoice(null);
                    setPinErrors((prev) => ({
                        ...prev,
                        [invoice_number]:
                            errors.pin || errors.error || "Gagal verifikasi PIN. Coba lagi.",
                    }));
                },
            }
        );
    };

    // ALL DELIVERED CELEBRATION SCREEN
    if (isAllDelivered) {
        return (
            <div className="min-h-screen bg-[#14433D] flex flex-col items-center justify-center p-6 text-center text-white relative overflow-hidden font-sans">
                <Head title="Pengiriman Selesai - Cibenda Mart" />
                <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl" />

                <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full relative z-10 animate-fade-in-up">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>

                    <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                        Semua Pengantaran Selesai!
                    </h1>
                    <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                        Kerja bagus! Sebanyak <strong>{totalStops} pesanan</strong> dalam
                        pengiriman gabungan ini telah sukses sampai ke masing-masing alamat
                        pelanggan.
                    </p>

                    <button
                        onClick={() => (window.location.href = "/")}
                        className="w-full bg-[#14433D] hover:bg-[#0f342f] text-white font-bold py-3.5 rounded-2xl transition shadow-lg shadow-[#14433D]/30 text-sm cursor-pointer"
                    >
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title={`Rute Pengiriman (${totalStops} Alamat) - CiMart`} />

            {/* Header Sticky */}
            <header className="bg-[#14433D] text-white py-3.5 px-4 sticky top-0 z-30 shadow-md">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-300">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-sm font-black tracking-wide flex items-center gap-2">
                                RUTE GABUNGAN
                                <span className="bg-teal-500/30 text-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-400/30">
                                    {totalStops} Alamat
                                </span>
                            </h1>
                            <p className="text-[11px] text-teal-200/80 truncate max-w-[180px] sm:max-w-xs">
                                {store.name}
                            </p>
                        </div>
                    </div>

                    {/* Role Indicator Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
                        {isDriver ? (
                            <>
                                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span className="text-emerald-300 font-bold">Driver Mode</span>
                            </>
                        ) : (
                            <>
                                <Eye className="w-3.5 h-3.5 text-teal-300" />
                                <span className="text-slate-200 font-medium">Live Viewer</span>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-2xl w-full mx-auto pb-24 flex flex-col">
                {/* Live Interactive Map with Real Road OSRM Route */}
                <BatchMap
                    store={store}
                    stops={stops}
                    driverPos={driverPos}
                    deliveredCount={deliveredCount}
                    totalStops={totalStops}
                    progressPercent={progressPercent}
                />

                {/* Google Maps Master Navigation Bar for Driver */}
                {isDriver && googleMapsUrl && googleMapsUrl !== "#" && (
                    <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 flex items-center justify-between gap-3 shadow-xs">
                        <div className="text-xs text-slate-700 min-w-0">
                            <span className="font-bold text-slate-900 block truncate">
                                Navigasi Suara Belokan demi Belokan
                            </span>
                            <span className="text-[11px] text-slate-500">
                                Buka rute Google Maps resmi terurut otomatis
                            </span>
                        </div>
                        <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 bg-[#006591] hover:bg-[#005174] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#006591]/25 transition shrink-0 cursor-pointer"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>Buka Google Maps</span>
                            <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                    </div>
                )}

                {/* Stops Checklist Section */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Urutan Pengantaran (Terdekat ke Terjauh)
                        </h2>
                        <span className="text-xs font-bold text-[#14433D]">
                            {deliveredCount} dari {totalStops} Selesai
                        </span>
                    </div>

                    <div className="space-y-3">
                        {stops.map((stop) => (
                            <BatchStopCard
                                key={stop.id}
                                stop={stop}
                                isDriver={isDriver}
                                onSubmitPin={(pin) => handlePinSubmit(stop.invoice_number, pin)}
                                isSubmitting={submittingInvoice === stop.invoice_number}
                                errorMessage={pinErrors[stop.invoice_number]}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
