import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Package, CheckCircle2 } from 'lucide-react';
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
    const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
    const [distanceToBuyer, setDistanceToBuyer] = useState<number | null>(null);

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
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
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

    // eslint-disable-next-line react-doctor/no-fetch-in-effect, react-doctor/no-set-state-after-await-in-effect
    useEffect(() => {
        if (order.status !== 'shipped') return;

        if (role === 'driver') {
            // DRIVER MODE: Track driver location and send to server
            if (navigator.geolocation) {
                const watchId = navigator.geolocation.watchPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setDriverPos([latitude, longitude]);

                        if (buyerPos) {
                            const dist = getDistance(latitude, longitude, buyerPos[0], buyerPos[1]);
                            setDistanceToBuyer(Math.round(dist));

                            fetch(`/tracker/${order.invoice_number}/location`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content
                                },
                                body: JSON.stringify({ latitude, longitude })
                            });
                        }
                    },
                    (error) => console.error("Error getting location", error),
                    { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
                );

                return () => navigator.geolocation.clearWatch(watchId);
            }
        } else if (role === 'user') {
            // BUYER MODE: Poll location from server every 30 seconds
            const fetchLocation = async () => {
                try {
                    const res = await fetch(`/tracker/${order.invoice_number}/location`);
                    if (!res.ok) throw new Error("Failed");
                    const data = await res.json();
                    if (data && data.latitude && data.longitude) {
                        const lat = parseFloat(data.latitude);
                        const lng = parseFloat(data.longitude);
                        // eslint-disable-next-line react-doctor/no-set-state-after-await-in-effect
                        setDriverPos([lat, lng]);

                        if (buyerPos) {
                            const dist = getDistance(lat, lng, buyerPos[0], buyerPos[1]);
                            // eslint-disable-next-line react-doctor/no-set-state-after-await-in-effect
                            setDistanceToBuyer(Math.round(dist));
                        }
                    }
                } catch (e) {
                    console.error("Failed fetching driver location", e);
                }
            };

            fetchLocation(); // Initial fetch
            const interval = setInterval(fetchLocation, 30000); 
            return () => clearInterval(interval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order.status, buyerPos, role]);

    // SUCCESS FULL SCREEN STATE
    if (order.status === 'delivered') {
        return (
            <div className="min-h-screen bg-[#004F54] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <Head title={`Selesai - ${order.invoice_number}`} />
                
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#41B9C5] rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
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
                            <span className="text-lg font-black text-[#004F54]">Rp {Number(order.total_amount).toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/'}
                        className="block w-full bg-[#004F54] text-white font-bold py-4 rounded-2xl hover:bg-[#003d42] transition-colors"
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Head title={`Delivery Tracker - ${order.invoice_number}`} />

            <header className="bg-[#004F54] text-white p-4 shadow-md z-10 sticky top-0">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-[#41B9C5]" />
                        </div>
                        <div>
                            <h1 className="text-sm font-extrabold tracking-wider">DELIVERY TRACKER</h1>
                            <p className="text-xs text-[#41B9C5] font-medium">{order.invoice_number}</p>
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
                {order.status === 'shipped' && distanceToBuyer !== null && (
                    <div className="bg-[#004F54] text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-3 h-3 bg-[#41B9C5] rounded-full animate-ping absolute"></div>
                                <div className="w-3 h-3 bg-[#41B9C5] rounded-full relative"></div>
                            </div>
                            <span className="text-sm font-medium text-white/90">Tracking Aktif</span>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-white/60 font-bold uppercase tracking-wider">Jarak ke Pembeli</div>
                            <div className="font-extrabold text-[#41B9C5]">
                                {distanceToBuyer < 1000 ? `${distanceToBuyer} m` : `${(distanceToBuyer/1000).toFixed(1)} km`}
                            </div>
                        </div>
                    </div>
                )}

                <DeliveryOrderSummary order={order} />

                {order.status === 'shipped' && role !== 'user' && (
                    <div className="p-4 pt-0">
                        <DriverPinForm invoice_number={order.invoice_number} />
                    </div>
                )}
            </main>
        </div>
    );
}
