import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Package, CheckCircle2, Radio, Eye, RefreshCw } from 'lucide-react';
import DeliveryMap from '@/Components/Delivery/DeliveryMap';
import DeliveryOrderSummary from '@/Components/Delivery/DeliveryOrderSummary';
import DriverPinForm from '@/Components/Delivery/DriverPinForm';

interface OrderItem {
    name: string;
    qty: number;
    price: number;
}

interface OrderData {
    id: number;
    invoice_number: string;
    status: string;
    customer_name: string;
    customer_phone: string;
    shipping_address: string;
    shipping_latitude: number | null;
    shipping_longitude: number | null;
    driver_latitude?: number | null;
    driver_longitude?: number | null;
    store_name: string;
    store_phone: string;
    store_latitude: number | null;
    store_longitude: number | null;
    subtotal: number;
    shipping_cost: number;
    total_amount: number;
    payment_method: string;
    payment_status: string;
    items: OrderItem[];
}

interface Props {
    order: OrderData;
    role: string;
}

export default function Tracker({ order, role }: Props) {
    const isDriver = role === 'driver';

    const [driverPos, setDriverPos] = useState<[number, number] | null>(() => {
        return order.driver_latitude && order.driver_longitude
            ? [order.driver_latitude, order.driver_longitude]
            : null;
    });

    const [distanceToBuyer, setDistanceToBuyer] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const storePos = React.useMemo<[number, number] | null>(() => {
        return order.store_latitude && order.store_longitude 
            ? [order.store_latitude, order.store_longitude] 
            : null;
    }, [order.store_latitude, order.store_longitude]);
        
    const buyerPos = React.useMemo<[number, number] | null>(() => {
        return order.shipping_latitude && order.shipping_longitude 
            ? [order.shipping_latitude, order.shipping_longitude] 
            : null;
    }, [order.shipping_latitude, order.shipping_longitude]);

    // Haversine distance in meters
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Manual Refresh Handler (Shopee/Gojek style)
    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch(`/tracker/${order.invoice_number}/location`);
            if (res.ok) {
                const data = await res.json();
                if (data && data.latitude && data.longitude) {
                    const lat = parseFloat(data.latitude);
                    const lng = parseFloat(data.longitude);
                    setDriverPos([lat, lng]);
                    if (buyerPos) {
                        const dist = getDistance(lat, lng, buyerPos[0], buyerPos[1]);
                        setDistanceToBuyer(Math.round(dist));
                    }
                }
            }
        } catch {}
        setTimeout(() => setIsRefreshing(false), 600);
    };

    useEffect(() => {
        if (order.status !== 'shipped') return;

        if (isDriver) {
            // DRIVER MODE: Broadcast live GPS coordinates continuously
            const sendGpsUpdate = (latitude: number, longitude: number) => {
                setDriverPos([latitude, longitude]);

                if (buyerPos) {
                    const dist = getDistance(latitude, longitude, buyerPos[0], buyerPos[1]);
                    setDistanceToBuyer(Math.round(dist));
                }

                // Send to backend (CSRF-exempt route)
                fetch(`/tracker/${order.invoice_number}/location`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ latitude, longitude }),
                }).catch(() => {});
            };

            if (navigator.geolocation) {
                // 1. Immediate initial GPS fix
                navigator.geolocation.getCurrentPosition(
                    (pos) => sendGpsUpdate(pos.coords.latitude, pos.coords.longitude),
                    (err) => console.warn('Initial GPS fix warning:', err),
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
                );

                // 2. Continuous watch GPS movement
                const watchId = navigator.geolocation.watchPosition(
                    (pos) => sendGpsUpdate(pos.coords.latitude, pos.coords.longitude),
                    (err) => {
                        console.warn('GPS watch error:', err);
                        if (err.code === err.TIMEOUT) {
                            navigator.geolocation.getCurrentPosition(
                                (pos) => sendGpsUpdate(pos.coords.latitude, pos.coords.longitude),
                                () => {},
                                { enableHighAccuracy: false, timeout: 10000 }
                            );
                        }
                    },
                    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
                );

                return () => navigator.geolocation.clearWatch(watchId);
            }
        } else {
            // SPECTATOR MODE (Buyer & Merchant): Real-time WebSocket + fallback polling
            if (typeof window !== 'undefined' && window.Echo) {
                const channel = window.Echo.channel(`order-tracking.${order.invoice_number}`);

                const handleLocation = (e: any) => {
                    if (e.latitude && e.longitude) {
                        const lat = parseFloat(e.latitude);
                        const lng = parseFloat(e.longitude);
                        setDriverPos([lat, lng]);

                        if (buyerPos) {
                            const dist = getDistance(lat, lng, buyerPos[0], buyerPos[1]);
                            setDistanceToBuyer(Math.round(dist));
                        }
                    }
                };

                const handleStatus = (e: any) => {
                    if (e.shipping_status === 'delivered') {
                        window.location.reload();
                    }
                };

                channel.listen('.DriverLocationBroadcasted', handleLocation);
                channel.listen('DriverLocationBroadcasted', handleLocation);
                channel.listen('.OrderStatusUpdated', handleStatus);
                channel.listen('OrderStatusUpdated', handleStatus);
            }

            const fetchLocation = async () => {
                try {
                    const res = await fetch(`/tracker/${order.invoice_number}/location`);
                    if (!res.ok) return;
                    const data = await res.json();
                    if (data && data.latitude && data.longitude) {
                        const lat = parseFloat(data.latitude);
                        const lng = parseFloat(data.longitude);
                        setDriverPos([lat, lng]);

                        if (buyerPos) {
                            const dist = getDistance(lat, lng, buyerPos[0], buyerPos[1]);
                            setDistanceToBuyer(Math.round(dist));
                        }
                    }
                } catch {}
            };

            fetchLocation(); // Initial fetch
            const interval = setInterval(fetchLocation, 10000); 

            return () => {
                clearInterval(interval);
                if (typeof window !== 'undefined' && window.Echo) {
                    window.Echo.leaveChannel(`order-tracking.${order.invoice_number}`);
                }
            };
        }
    }, [order.status, buyerPos, isDriver, order.invoice_number]);

    // SUCCESS FULL SCREEN STATE
    if (order.status === 'delivered') {
        return (
            <div className="min-h-screen bg-[#281B7A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <Head title={`Selesai - ${order.invoice_number}`} />
                
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ED7218] rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse delay-700"></div>

                <div className="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full relative z-10 transform scale-100 animate-[bounceIn_0.6s_ease-out]">
                    <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Pesanan Selesai!</h1>
                    <p className="text-sm text-gray-500 font-medium mb-6">
                        Pengiriman #{order.invoice_number} berhasil diselesaikan. Saldo telah diteruskan ke toko.
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-2xl mb-6 text-left">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Rincian Transaksi</div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                            <span>Subtotal</span>
                            <span className="font-medium">Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                            <span>Ongkos Kirim</span>
                            <span className="font-medium">Rp {Number(order.shipping_cost).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-900">Total</span>
                            <span className="text-lg font-black text-[#281B7A]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/'}
                        className="block w-full bg-[#281B7A] text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-colors cursor-pointer"
                    >
                        Tutup Halaman
                    </button>
                    <p className="text-[10px] text-gray-400 mt-3">Anda dapat menutup tab browser ini.</p>
                </div>
                
                <style>{`
                    @keyframes bounceIn {
                        0% { opacity: 0; transform: scale(0.3); }
                        50% { opacity: 1; transform: scale(1.05); }
                        70% { transform: scale(0.9); }
                        100% { transform: scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Head title={`Delivery Tracker - ${order.invoice_number}`} />

            <header className="bg-[#281B7A] text-white p-4 shadow-md z-10 sticky top-0">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-[#ED7218]" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm font-extrabold tracking-wider truncate">DELIVERY TRACKER</h1>
                            <p className="text-xs text-[#ED7218] font-medium truncate">#{order.invoice_number}</p>
                        </div>
                    </div>

                    {/* Right Controls: Role Badge & Manual Refresh Button */}
                    <div className="flex items-center gap-2 shrink-0">
                        {!isDriver && (
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-xs font-bold text-white transition-all shadow-xs border border-white/20 cursor-pointer disabled:opacity-50"
                                title="Perbarui posisi kurir sekarang"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#40E0D0]' : ''}`} />
                                <span className="hidden sm:inline">{isRefreshing ? 'Memperbarui...' : 'Refresh'}</span>
                            </button>
                        )}

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold">
                            {isDriver ? (
                                <>
                                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                    <span className="text-emerald-300 font-bold">Driver Mode</span>
                                </>
                            ) : (
                                <>
                                    <Eye className="w-3.5 h-3.5 text-[#41B9C5]" />
                                    <span className="text-slate-200 font-medium">Live Viewer</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-3xl w-full mx-auto pb-24">
                <DeliveryMap 
                    storePos={storePos} 
                    buyerPos={buyerPos} 
                    driverPos={driverPos} 
                    order={order} 
                />

                {/* Status & Distance Indicator */}
                {order.status === 'shipped' && (
                    <div className="bg-[#281B7A] text-white p-4 flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-[#40E0D0] rounded-full animate-ping absolute"></div>
                                <div className="w-3 h-3 bg-[#40E0D0] rounded-full relative"></div>
                            </div>
                            <span className="text-sm font-semibold text-white/90">
                                {isDriver ? "GPS Aktif: Siaran Posisi Live" : "Kurir Sedang Dalam Perjalanan"}
                            </span>
                        </div>
                        {distanceToBuyer !== null && (
                            <div className="text-right">
                                <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Jarak ke Pembeli</div>
                                <div className="font-extrabold text-[#40E0D0]">
                                    {distanceToBuyer < 1000 ? `${distanceToBuyer} m` : `${(distanceToBuyer/1000).toFixed(1)} km`}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DeliveryOrderSummary order={order} />

                {order.status === 'shipped' && isDriver && (
                    <div className="p-4 pt-0">
                        <DriverPinForm invoice_number={order.invoice_number} />
                    </div>
                )}
            </main>
        </div>
    );
}
