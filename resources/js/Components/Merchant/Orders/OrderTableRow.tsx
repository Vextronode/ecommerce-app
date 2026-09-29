import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { formatRupiah } from "@/utils/formatters";
import {
    Truck,
    Package,
    Clock,
    ChevronDown,
    ChevronUp,
    QrCode,
    X,
    Navigation,
    MessageSquare,
    CheckSquare,
    Square,
    Eye,
    Edit3,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import OrderExpandedDetail from "./OrderExpandedDetail";
import Modal from "@/Components/Modal";

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
};

export default function OrderTableRow({
    order,
    onOpenAction,
    isSelected,
    onToggleSelect,
}: {
    order: any;
    onOpenAction: (order: any) => void;
    isSelected?: boolean;
    onToggleSelect?: (orderId: number) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    // Auto close QR modal if order status changes away from processing
    useEffect(() => {
        if (order.shipping_status !== "processing" && order.shipping_status !== "pending") {
            setShowQRModal(false);
        }
    }, [order.shipping_status]);

    // Live WebSocket listener to auto-close QR modal as soon as courier scans
    useEffect(() => {
        if (!showQRModal || !order?.invoice_number || typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.private(`order-tracking.${order.invoice_number}`);
        const handleScanned = () => {
            setShowQRModal(false);
            router.reload({ only: ["orders", "stats"] });
        };

        channel.listen(".OrderStatusUpdated", handleScanned);
        channel.listen("OrderStatusUpdated", handleScanned);

        return () => {
            window.Echo.leave(`order-tracking.${order.invoice_number}`);
        };
    }, [showQRModal, order?.invoice_number]);

    // Only orders that are already processed ('processing') are eligible for batch courier handover
    const isBatchable =
        order.delivery_method === "local_delivery" &&
        order.shipping_status === "processing";

    const handleSelfDelivery = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (order.handover_url) {
            window.location.href = order.handover_url;
        } else {
            window.location.href = `/tracker/${order.invoice_number}/handover`;
        }
    };

    const firstProduct = order.items?.[0];
    const otherProductsCount = (order.items?.length || 0) - 1;

    const isPaid = order.payment_status === "paid";
    const paymentLabel = isPaid ? "Sudah Bayar" : "Menunggu";

    const shippingMap: Record<string, { label: string; badge: string; icon: any }> = {
        shipped: { label: "Dikirim", badge: "bg-blue-50 text-blue-600 border-blue-200", icon: Truck },
        delivered: { label: "Selesai", badge: "bg-teal-50 text-teal-700 border-teal-200", icon: Package },
        processing: { label: "Diproses", badge: "bg-orange-50 text-brand-orange border-brand-orange/30", icon: Clock },
        pending: { label: "Menunggu", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
        cancelled: { label: "Dibatalkan", badge: "bg-red-50 text-red-600 border-red-200", icon: Clock },
    };

    const currentShipping = shippingMap[order.shipping_status] || {
        label: order.shipping_status,
        badge: "bg-gray-50 text-gray-600 border-gray-200",
        icon: Clock,
    };
    const ShippingIcon = currentShipping.icon;

    const initial = order.customer_name
        ? order.customer_name.charAt(0).toUpperCase()
        : "?";

    return (
        <>
            {/* eslint-disable-next-line react-doctor/no-static-element-interactions, react-doctor/click-events-have-key-events */}
            <tr
                onClick={() => setIsExpanded(!isExpanded)}
                className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer ${
                    isExpanded ? "bg-gray-50/50" : ""
                } ${isSelected ? "bg-brand-orange-tint/40" : ""}`}
            >
                <td className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        {isBatchable && onToggleSelect && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleSelect(order.id);
                                }}
                                className="text-brand-orange hover:text-brand-orange-hover transition rounded shrink-0 cursor-pointer"
                                title="Pilih untuk Pengiriman Gabungan"
                            >
                                {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-brand-orange" />
                                ) : (
                                    <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                                )}
                            </button>
                        )}
                        <span className="font-bold text-brand-orange text-sm">
                            #{order.invoice_number}
                        </span>
                    </div>

                    {/* QR Code Modal */}
                    {order.handover_url && (
                        <Modal show={showQRModal} onClose={() => setShowQRModal(false)} maxWidth="sm">
                            <div aria-label="Action" className="p-6 relative text-center">
                                <button
                                    aria-label="Tutup modal"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowQRModal(false);
                                    }}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="w-16 h-16 bg-brand-orange-tint text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <QrCode className="w-8 h-8" />
                                </div>

                                <h3 className="text-xl font-extrabold text-brand-orange mb-2">QR Serah Terima</h3>
                                <p className="text-sm text-gray-500 mb-6">
                                    Minta kurir untuk melakukan <strong>Scan QR Code</strong> ini menggunakan kamera HP mereka. Status pesanan akan otomatis menjadi "Dikirim".
                                </p>

                                <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-center mb-4">
                                    <QRCodeSVG value={order.handover_url} size={256} className="w-full h-auto max-w-[256px]" />
                                </div>

                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                    Invoice: #{order.invoice_number}
                                </div>
                            </div>
                        </Modal>
                    )}
                </td>
                <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-orange-tint text-brand-orange font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-brand-orange/20">
                            {order.user?.profile_photo_path ? (
                                <img
                                    src={`/storage/${order.user.profile_photo_path}`}
                                    alt={order.customer_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                initial
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-brand-orange text-sm leading-tight truncate max-w-30">
                                {order.customer_name}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-30">
                                {order.user?.email || order.customer_phone}
                            </p>
                        </div>
                    </div>
                </td>

                <td className="py-4 px-4">
                    <div className="flex flex-col max-w-40">
                        <span
                            className="text-sm font-semibold text-gray-800 truncate"
                            title={firstProduct?.product_name}
                        >
                            {firstProduct?.product_name || "Produk tidak diketahui"}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-gray-500 font-medium">
                                {firstProduct?.quantity} {firstProduct?.unit}{" "}
                                {firstProduct?.variant_name &&
                                    `• ${firstProduct.variant_name}`}
                            </span>

                            {otherProductsCount > 0 && (
                                <span className="text-[11px] font-bold text-brand-orange bg-brand-orange-tint px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    +{otherProductsCount} lainnya
                                    {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                </span>
                            )}
                        </div>
                    </div>
                </td>

                <td className="py-4 px-4 whitespace-nowrap">
                    <p className="text-xs text-gray-600">
                        {formatDate(order.created_at)}
                    </p>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                    <p className="text-sm font-bold text-brand-orange">
                        {formatRupiah(order.total_amount)}
                    </p>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                    <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isPaid
                                ? "bg-teal-50 text-teal-700"
                                : "bg-orange-50 text-brand-orange"
                        }`}
                    >
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${
                                isPaid ? "bg-teal-500" : "bg-brand-orange"
                            }`}
                        />
                        {paymentLabel}
                    </div>
                </td>
                <td className="py-4 px-4 whitespace-nowrap">
                    <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${currentShipping.badge}`}
                    >
                        <ShippingIcon className="w-3.5 h-3.5" />
                        {currentShipping.label}
                    </div>
                </td>
                <td className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                        {/* Tombol Lihat Detail */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isExpanded
                                    ? "bg-brand-orange text-white"
                                    : "bg-gray-50 text-gray-500 hover:bg-brand-orange-tint hover:text-brand-orange"
                            }`}
                            title={isExpanded ? "Tutup Rincian" : "Lihat Rincian"}
                        >
                            <Eye className="w-4 h-4" />
                        </button>

                        {/* Tombol WhatsApp */}
                        {(() => {
                            if (order.shipping_status === "cancelled") return null;
                            if (order.shipping_status === "delivered" && order.updated_at) {
                                const updatedTime = new Date(order.updated_at).getTime();
                                const currentTime = new Date().getTime();
                                if (currentTime - updatedTime > 1800000) return null;
                            }
                            return order.customer_phone ? (
                                <a
                                    href={`https://wa.me/${order.customer_phone
                                        .replace(/\D/g, "")
                                        .replace(/^0/, "62")}?text=${encodeURIComponent(
                                        `Halo kak ${order.customer_name}, saya dari toko ingin mengonfirmasi pesanan Anda dengan invoice #${order.invoice_number}...`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-teal-600 bg-teal-50 hover:bg-teal-600 hover:text-white transition-colors p-1.5 rounded-lg shadow-xs"
                                    title="Hubungi Pembeli via WA"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </a>
                            ) : null;
                        })()}

                        {/* Tombol Ubah Status */}
                        {order.shipping_status !== "delivered" && order.shipping_status !== "cancelled" && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenAction(order);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-brand-orange-tint hover:bg-brand-orange text-brand-orange hover:text-white transition-colors rounded-lg text-xs font-bold cursor-pointer shadow-xs"
                                title="Perbarui Status Pesanan"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Status</span>
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <td colSpan={8} className="py-4 px-6">
                        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm ml-6">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Daftar Lengkap Pesanan
                                </h5>
                                {order.delivery_method === "local_delivery" &&
                                    order.shipping_status === "shipped" && (
                                        <div className="flex flex-col items-end gap-1 text-right">
                                            <a
                                                href={`/tracker/${order.invoice_number}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1.5 bg-brand-orange-tint text-brand-orange border border-brand-orange/30 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-brand-orange hover:text-white transition-colors"
                                            >
                                                Lacak Pengiriman
                                            </a>
                                            {order.shipping_status === "shipped" && order.shipping_pin && (
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    PIN Pengiriman: <strong className="text-brand-orange tracking-widest">{order.shipping_pin}</strong>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                {order.delivery_method === "local_delivery" &&
                                    order.shipping_status === "processing" && (
                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 text-right">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowQRModal(true);
                                                }}
                                                className="inline-flex items-center gap-2 bg-brand-orange-tint text-brand-orange hover:bg-brand-orange hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm border border-brand-orange/30 cursor-pointer"
                                            >
                                                <QrCode className="w-4 h-4" />
                                                Diserahkan ke Kurir
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSelfDelivery}
                                                className="inline-flex items-center gap-2 bg-brand-orange text-white hover:bg-brand-orange-hover px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                                            >
                                                <Navigation className="w-4 h-4" />
                                                Saya Antar Sendiri
                                            </button>
                                        </div>
                                    )}
                            </div>
                            <OrderExpandedDetail items={order.items} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
