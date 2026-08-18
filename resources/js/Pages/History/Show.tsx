import React, { useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import ConfirmModal from "@/Components/ConfirmModal";
import { Store, ChevronLeft, AlertCircle, MessageSquare, CheckCircle, Navigation } from "lucide-react";
import { useOrderHistoryActions } from "@/Hooks/Storefront/useOrderHistoryActions";

export default function Show({ order }: { order: any }) {
    const {
        isCancelModalOpen,
        setIsCancelModalOpen,
        isCompleteModalOpen,
        setIsCompleteModalOpen,
        handleCancelOrder,
        handleCompleteOrder,
        getStatusColor,
    } = useOrderHistoryActions();

    // Real-Time WebSocket Order Status Synchronization for Buyer
    useEffect(() => {
        if (!order?.id || typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.channel(`order-tracking.${order.invoice_number}`);
        const handleUpdate = () => {
            router.reload({ only: ["order"] });
        };

        channel.listen(".OrderStatusUpdated", handleUpdate);
        channel.listen("OrderStatusUpdated", handleUpdate);

        return () => {
            window.Echo.leaveChannel(`order-tracking.${order.invoice_number}`);
        };
    }, [order?.id, order?.invoice_number]);

    const canCancel = order.shipping_status === 'pending';
    const canComplete = order.shipping_status === 'shipped';
    const showRatingButton = order.status === 'Selesai' && order.items && order.items.length > 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title={`Pesanan ${order.invoice_number}`} />
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32">
                <Link
                    href={route("history.index")}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-[#ED7218] mb-6 transition-colors font-medium"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Kembali ke Riwayat
                </Link>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                #{order.invoice_number}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Dipesan pada {order.created_at}
                            </p>
                        </div>
                        <div
                            className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-bold ${getStatusColor(
                                order.status
                            )}`}
                        >
                            {order.status}
                        </div>
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">
                                    Alamat Pengiriman
                                </h3>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-semibold text-gray-900">
                                        {order.customer_name}
                                    </p>
                                    <p>{order.customer_phone}</p>
                                    <p className="whitespace-pre-line leading-relaxed">
                                        {order.shipping_address}
                                    </p>
                                    {order.shipping_status === 'shipped' && order.delivery_method === 'local_delivery' && order.shipping_pin && (
                                        <div className="mt-4 bg-[#EAF7F7] p-4 rounded-xl border border-[#41B9C5]/30">
                                            <p className="text-xs font-bold text-[#14433D] uppercase tracking-wider mb-1">PIN Pengiriman</p>
                                            <div className="text-3xl font-black text-[#41B9C5] tracking-[0.2em]">{order.shipping_pin}</div>
                                            <p className="text-[10px] text-gray-500 mt-1">Berikan PIN ini kepada kurir toko saat menerima barang untuk menyelesaikan pesanan.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3">
                                    Metode Pembayaran
                                </h3>
                                <p className="text-sm text-gray-600 uppercase font-medium">
                                    {order.payment_channel ? order.payment_channel.replace('_', ' ') : order.payment_method}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Status:{" "}
                                    <span className="font-semibold text-gray-900 capitalize">
                                        {order.payment_status === 'pending' ? 'Belum Bayar' : order.payment_status === 'paid' ? 'Sudah Bayar / Lunas' : order.payment_status}
                                    </span>
                                </p>
                                
                                {order.payment_status === 'pending' && order.payment_method !== 'cod' && (
                                    <div className="mt-3">
                                        <Link
                                            href={`/payment/${order.id}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#ED7218] hover:bg-[#d66311] px-3.5 py-2 rounded-xl shadow-xs transition"
                                        >
                                            Bayar Sekarang
                                        </Link>
                                    </div>
                                )}

                                {/* Lacak Pengiriman Button */}
                                {order.shipping_status === 'shipped' && order.delivery_method === 'local_delivery' && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <a
                                            href={`/tracker/${order.invoice_number}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center justify-center w-full gap-2 text-xs font-bold text-white bg-[#41B9C5] hover:bg-[#3498a3] px-4 py-2.5 rounded-xl shadow-md shadow-[#41B9C5]/30 transition"
                                        >
                                            <Navigation className="w-4 h-4" /> Lacak Pengiriman Live
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Store & Products */}
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-[#ED7218] text-white p-1.5 rounded-md">
                                <Store className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-gray-900">
                                {order.store_name}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {order.items.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/30"
                                >
                                    <img
                                        src={item.image}
                                        alt={item.product_name}
                                        className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-gray-900 font-bold text-base truncate">
                                            {item.product_name}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Variasi:{" "}
                                            {item.variant_name || "Default"}
                                        </p>
                                        <p className="text-sm font-medium text-gray-600 mt-1">
                                            x{item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-[#281B7A]">
                                            Rp
                                            {Number(item.price).toLocaleString(
                                                "id-ID"
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 p-6 border-t border-gray-100">
                        <div className="w-full md:w-1/2 ml-auto space-y-3">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal Produk</span>
                                <span>
                                    Rp
                                    {Number(order.subtotal).toLocaleString(
                                        "id-ID"
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Ongkos Kirim</span>
                                <span>
                                    Rp
                                    {Number(order.shipping_cost).toLocaleString(
                                        "id-ID"
                                    )}
                                </span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-900">
                                    Total Pesanan
                                </span>
                                <span className="text-xl font-bold text-[#281B7A]">
                                    Rp
                                    {Number(order.total_amount).toLocaleString(
                                        "id-ID"
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end bg-white">
                        {(() => {
                            if (order.shipping_status === 'cancelled') return null;
                            if (order.shipping_status === 'delivered' && order.updated_at) {
                                const updatedTime = new Date(order.updated_at).getTime();
                                const currentTime = new Date().getTime();
                                // Hide after 30 minutes
                                if (currentTime - updatedTime > 1800000) return null;
                            }
                            return (
                                <a 
                                    href={order.store_phone ? `https://wa.me/${order.store_phone.replace(/\D/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(`Halo admin ${order.store_name}, saya pembeli dengan nomor pesanan #${order.invoice_number}. Saya ingin bertanya mengenai pesanan saya...`)}` : '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#281B7A]/5 border border-[#281B7A]/20 text-[#281B7A] text-sm font-bold rounded-xl hover:bg-[#281B7A]/10 transition-colors"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Hubungi Penjual
                                </a>
                            );
                        })()}
                        
                        {(order.shipping_status === 'pending' || order.shipping_status === 'processing') && (
                            <button
                                onClick={() => setIsCancelModalOpen(true)}
                                disabled={order.shipping_status === 'processing' || order.payment_status === 'paid'}
                                className={`inline-flex items-center justify-center px-6 py-2.5 bg-white border text-sm font-bold rounded-lg transition-colors ${
                                    order.shipping_status === 'processing' || order.payment_status === 'paid'
                                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'border-red-500 text-red-500 hover:bg-red-50'
                                }`}
                                title={order.payment_status === 'paid' ? 'Pesanan yang sudah dibayar tidak dapat dibatalkan secara langsung' : ''}
                            >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Batalkan Pesanan
                            </button>
                        )}

                        {canComplete && (
                            <button
                                onClick={() => setIsCompleteModalOpen(true)}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#ED7218] text-white text-sm font-bold rounded-xl hover:bg-[#d66311] transition-colors shadow-xs"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Pesanan Diterima
                            </button>
                        )}
                        
                        {showRatingButton && order.items?.[0]?.id && (
                            <Link
                                href={route("history.rating.create", { order_item: order.items[0].id })}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#ED7218] text-white text-sm font-bold rounded-xl hover:bg-[#d66311] transition-colors shadow-xs"
                            >
                                Beri Penilaian
                            </Link>
                        )}

                        {order.status === "Selesai" && order.items?.[0] && (
                            <Link
                                href={route("product.detail", order.items[0].product_slug || order.items[0].product_id)}
                                className="inline-flex items-center justify-center px-6 py-2.5 bg-[#ED7218] text-white text-sm font-bold rounded-xl hover:bg-[#d66311] transition-colors shadow-xs"
                            >
                                Beli Lagi
                            </Link>
                        )}
                    </div>
                </div>
            </main>

            <ConfirmModal
                isOpen={isCancelModalOpen}
                title="Batalkan Pesanan"
                message="Apakah Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat diurungkan."
                confirmText="Ya, Batalkan"
                cancelText="Tutup"
                onConfirm={() => handleCancelOrder(order.id)}
                onClose={() => setIsCancelModalOpen(false)}
                isDanger={true}
            />

            <ConfirmModal
                isOpen={isCompleteModalOpen}
                title="Selesaikan Pesanan"
                message="Apakah Anda yakin pesanan telah diterima dengan baik? Jika ya, dana akan diteruskan ke penjual."
                confirmText="Ya, Pesanan Diterima"
                cancelText="Batal"
                onConfirm={() => handleCompleteOrder(order.id)}
                onClose={() => setIsCompleteModalOpen(false)}
            />
        </div>
    );
}
