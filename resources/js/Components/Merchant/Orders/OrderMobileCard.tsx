import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    Truck,
    Package,
    Clock,
    ChevronDown,
    ChevronUp,
    QrCode,
    Navigation,
    X,
    MessageSquare,
    CheckSquare,
    Square,
    Eye,
    Edit3,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import OrderExpandedDetail from "./OrderExpandedDetail";
import Modal from "@/Components/Modal";
import { formatRupiah } from "@/utils/formatters";

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
};

const resolveImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `/storage/${path}`;
};

export default function OrderMobileCard({
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
    const firstProductImg = resolveImageUrl(
        firstProduct?.product?.image_path || firstProduct?.product?.images?.[0]?.image_path
    );

    const isPaid = order.payment_status === "paid";
    const paymentLabel = isPaid ? "Sudah Bayar" : "Menunggu Bayar";

    const shippingMap: Record<string, { label: string; badge: string; icon: any }> = {
        shipped: { label: "Dikirim", badge: "bg-blue-50 text-blue-700 border-blue-200", icon: Truck },
        delivered: { label: "Selesai", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
        processing: { label: "Diproses", badge: "bg-orange-50 text-brand-orange border-brand-orange/30", icon: Clock },
        pending: { label: "Menunggu", badge: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
        cancelled: { label: "Dibatalkan", badge: "bg-rose-50 text-rose-700 border-rose-200", icon: XCircle },
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
        <div
            className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white p-4 shadow-xs ${
                isSelected
                    ? "border-brand-orange ring-2 ring-brand-orange/20 bg-brand-orange-tint/20"
                    : "border-gray-200/80 hover:border-gray-300"
            }`}
        >
            {/* Header: Invoice & Status Badges */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                    {isBatchable && onToggleSelect && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(order.id);
                            }}
                            className="p-0.5 text-brand-orange hover:text-brand-orange-hover transition rounded shrink-0 cursor-pointer"
                            title="Pilih Pesanan"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-brand-orange" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                        </button>
                    )}
                    <div className="min-w-0">
                        <p className="font-mono font-bold text-xs sm:text-sm text-gray-900 truncate">
                            #{order.invoice_number}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${currentShipping.badge}`}
                    >
                        <ShippingIcon className="w-3 h-3" />
                        <span>{currentShipping.label}</span>
                    </span>
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isPaid
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                    >
                        {paymentLabel}
                    </span>
                </div>
            </div>

            {/* Customer Info & WA Quick Link */}
            <div className="flex items-center justify-between gap-2 py-2.5">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-xs shrink-0 border border-gray-200">
                        {order.user?.profile_photo_path ? (
                            <img
                                src={`/storage/${order.user.profile_photo_path}`}
                                alt={order.customer_name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            initial
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                            {order.customer_name}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                            {order.user?.email || order.customer_phone || "Pelanggan"}
                        </p>
                    </div>
                </div>

                {order.customer_phone && (
                    <a
                        href={`https://wa.me/${order.customer_phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                            `Halo kak ${order.customer_name}, saya dari toko ingin mengonfirmasi pesanan Anda dengan invoice #${order.invoice_number}...`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition shrink-0"
                        title="Chat Pembeli via WhatsApp"
                    >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat WA</span>
                    </a>
                )}
            </div>

            {/* Product Item Row */}
            <div className="p-2.5 bg-gray-50/70 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-white border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                        {firstProductImg ? (
                            <img
                                src={firstProductImg}
                                alt={firstProduct?.product_name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Package className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                            {firstProduct?.product_name || "Produk pesanan"}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            {firstProduct?.quantity} {firstProduct?.unit}{" "}
                            {firstProduct?.variant_name && `• ${firstProduct.variant_name}`}
                        </p>
                    </div>
                    {firstProduct?.price && (
                        <div className="text-right shrink-0">
                            <p className="text-xs font-semibold text-gray-700">
                                {formatRupiah(firstProduct.price * firstProduct.quantity)}
                            </p>
                        </div>
                    )}
                </div>

                {otherProductsCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-2 pt-2 border-t border-gray-200/60 w-full flex items-center justify-between text-[11px] font-bold text-brand-orange hover:text-brand-orange-hover cursor-pointer"
                    >
                        <span>{isExpanded ? "Tutup rincian item" : `+${otherProductsCount} produk lainnya`}</span>
                        {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                        )}
                    </button>
                )}
            </div>

            {/* Expandable all items */}
            {isExpanded && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        Rincian Semua Item
                    </p>
                    <OrderExpandedDetail items={order.items} />
                </div>
            )}

            {/* Delivery Action Buttons in Processing State */}
            {order.delivery_method === "local_delivery" && order.shipping_status === "processing" && (
                <div className="mt-3 p-3 bg-brand-orange-tint/40 rounded-xl border border-brand-orange/30 space-y-2">
                    <div className="text-[11px] font-bold text-brand-orange flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-orange" />
                        <span>Pilihan Pengiriman Pesanan:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowQRModal(true);
                            }}
                            className="flex items-center justify-center gap-1.5 bg-white text-brand-orange hover:bg-brand-orange-tint py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-xs border border-brand-orange/40 active:scale-95 cursor-pointer"
                        >
                            <QrCode className="w-3.5 h-3.5 text-brand-orange" />
                            <span className="truncate">Scan Kurir</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSelfDelivery}
                            className="flex items-center justify-center gap-1.5 bg-brand-orange text-white hover:bg-brand-orange-hover py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            <span className="truncate">Antar Sendiri</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Tracker Link: ONLY WHEN CURRENTLY SHIPPED (not when already delivered) */}
            {order.delivery_method === "local_delivery" && order.shipping_status === "shipped" && (
                <div className="mt-3 flex items-center justify-between bg-blue-50/70 p-2.5 rounded-xl border border-blue-200/60">
                    <div className="text-[11px] text-blue-900 font-medium truncate pr-2">
                        {order.shipping_pin ? (
                            <span>PIN Pengantaran: <strong className="text-brand-orange tracking-widest">{order.shipping_pin}</strong></span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Truck className="w-3.5 h-3.5 text-blue-600" />
                                Sedang diantar oleh kurir
                            </span>
                        )}
                    </div>
                    <a
                        href={`/tracker/${order.invoice_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 bg-brand-orange text-white hover:bg-brand-orange-hover px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs shrink-0"
                    >
                        <Navigation className="w-3 h-3" />
                        <span>Lacak Pengiriman</span>
                    </a>
                </div>
            )}

            {/* Card Footer: Total & Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 gap-2">
                <div>
                    <p className="text-[10px] text-gray-400 font-medium">Total Belanja</p>
                    <p className="text-sm sm:text-base font-extrabold text-brand-orange leading-tight">
                        {formatRupiah(order.total_amount)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                            isExpanded
                                ? "bg-gray-100 text-gray-800 border-gray-200"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                        title={isExpanded ? "Tutup Rincian" : "Lihat Rincian"}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "Tutup" : "Rincian"}</span>
                    </button>

                    {order.shipping_status !== "delivered" && order.shipping_status !== "cancelled" && (
                        <button
                            type="button"
                            onClick={() => onOpenAction(order)}
                            className="inline-flex items-center gap-1 bg-brand-orange hover:bg-brand-orange-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                            title="Perbarui Status Pesanan"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Ubah Status</span>
                        </button>
                    )}
                </div>
            </div>

            {/* QR Code Modal for Mobile Handover */}
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
                        <p className="text-xs sm:text-sm text-gray-500 mb-6">
                            Minta kurir untuk melakukan <strong>Scan QR Code</strong> ini menggunakan kamera HP mereka untuk konfirmasi pengantaran.
                        </p>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-center mb-4 shadow-sm">
                            <QRCodeSVG
                                value={order.handover_url}
                                size={220}
                                className="w-full h-auto max-w-[220px]"
                            />
                        </div>

                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Invoice: #{order.invoice_number}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
