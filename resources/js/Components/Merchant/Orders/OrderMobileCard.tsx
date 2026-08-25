import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import {
    Truck,
    Package,
    Clock,
    MoreVertical,
    ChevronDown,
    ChevronUp,
    QrCode,
    Navigation,
    X,
    MessageSquare,
    CheckSquare,
    Square,
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

        const channel = window.Echo.channel(`order-tracking.${order.invoice_number}`);
        const handleScanned = () => {
            setShowQRModal(false);
            router.reload({ only: ["orders", "stats"] });
        };

        channel.listen(".OrderStatusUpdated", handleScanned);
        channel.listen("OrderStatusUpdated", handleScanned);

        return () => {
            window.Echo.leaveChannel(`order-tracking.${order.invoice_number}`);
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

    const paymentStatus =
        order.payment_status.charAt(0).toUpperCase() +
        order.payment_status.slice(1);
    const shippingStatus =
        order.shipping_status.charAt(0).toUpperCase() +
        order.shipping_status.slice(1);

    return (
        // eslint-disable-next-line react-doctor/no-static-element-interactions, react-doctor/click-events-have-key-events
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-4 transition-colors group border-b border-gray-100 cursor-pointer ${
                isSelected ? "bg-teal-50/50" : "bg-white hover:bg-gray-50"
            }`}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    {isBatchable && onToggleSelect && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleSelect(order.id);
                            }}
                            className="p-1 text-[#41B9C5] hover:text-[#14433D] transition rounded"
                            title="Pilih Pesanan"
                        >
                            {isSelected ? (
                                <CheckSquare className="w-5 h-5 text-[#41B9C5]" />
                            ) : (
                                <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
                            )}
                        </button>
                    )}
                    <div>
                        <h4 className="font-bold text-[#41B9C5] text-sm">
                            #{order.invoice_number}
                        </h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            {formatDate(order.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    {order.customer_phone && (
                        <a
                            href={`https://wa.me/${order.customer_phone.replace(/\D/g, "").replace(/^0/, "62")}?text=${encodeURIComponent(
                                `Halo kak ${order.customer_name}, saya dari toko ingin mengonfirmasi pesanan Anda dengan invoice #${order.invoice_number}...`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#41B9C5] bg-[#EAF7F7] hover:bg-[#41B9C5] hover:text-white transition-colors p-1.5 rounded-lg shadow-sm"
                            title="Chat Pembeli via WA"
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                    )}
                    {shippingStatus !== "Delivered" && shippingStatus !== "Cancelled" && (
                        <button
                            aria-label="Action"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenAction(order);
                            }}
                            className="text-gray-400 hover:text-[#14433D] bg-gray-50 hover:bg-[#EAF7F7] p-1.5 rounded-lg"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#EAF7F7] text-[#245D56] font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
                    {order.customer_name
                        ? order.customer_name.charAt(0).toUpperCase()
                        : "?"}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#14433D] text-sm leading-tight truncate">
                        {order.customer_name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                        {order.user?.email || order.customer_phone}
                    </p>

                    <div className="mt-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-700 truncate">
                            {firstProduct?.product_name || "Produk tidak diketahui"}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[11px] text-gray-500">
                                {firstProduct?.quantity} {firstProduct?.unit}{" "}
                                {firstProduct?.variant_name &&
                                    `• ${firstProduct.variant_name}`}
                            </p>

                            {otherProductsCount > 0 && (
                                <span className="text-[10px] font-bold text-[#41B9C5] bg-[#EAF7F7] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    {isExpanded
                                        ? "Tutup"
                                        : `+${otherProductsCount} lainnya`}
                                    {isExpanded ? (
                                        <ChevronUp className="w-3 h-3" />
                                    ) : (
                                        <ChevronDown className="w-3 h-3" />
                                    )}
                                </span>
                            )}
                        </div>

                        {/* Expandable items detail */}
                        {isExpanded && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <h5 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                    Semua Item
                                </h5>
                                <OrderExpandedDetail items={order.items} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delivery Action Buttons in Processing State */}
            {order.delivery_method === "local_delivery" && order.shipping_status === "processing" && (
                <div className="my-3 p-3 bg-brand-cyan-soft rounded-xl border border-brand-cyan/30 space-y-2">
                    <div className="text-[11px] font-bold text-brand-teal flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>Pilihan Pengiriman Pesanan:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowQRModal(true);
                            }}
                            className="flex items-center justify-center gap-1.5 bg-white text-brand-teal hover:bg-brand-cyan-tint py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-sm border border-brand-cyan/40 active:scale-95"
                        >
                            <QrCode className="w-3.5 h-3.5 text-brand-cyan" />
                            <span className="truncate">Scan Kurir</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSelfDelivery}
                            className="flex items-center justify-center gap-1.5 bg-brand-teal text-white hover:bg-brand-teal-hover py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
                        >
                            <Navigation className="w-3.5 h-3.5" />
                            <span className="truncate">Antar Sendiri</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Tracker Link Button when Shipped or Delivered */}
            {order.delivery_method === "local_delivery" && ["shipped", "delivered"].includes(order.shipping_status) && (
                <div className="my-2.5 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <div className="text-[11px] text-gray-500 font-medium truncate pr-2">
                        {order.shipping_status === "shipped" && order.shipping_pin ? (
                            <span>PIN: <strong className="text-brand-teal tracking-widest">{order.shipping_pin}</strong></span>
                        ) : (
                            <span>Kurir Toko</span>
                        )}
                    </div>
                    <a
                        href={`/tracker/${order.invoice_number}?role=driver`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-brand-cyan-tint text-brand-teal hover:bg-brand-cyan hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs shrink-0"
                    >
                        <Navigation className="w-3 h-3" />
                        <span>Lacak Pengiriman</span>
                    </a>
                </div>
            )}

            {/* Card Footer: Status Badges & Total */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex gap-1.5 flex-wrap">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            paymentStatus === "Paid"
                                ? "bg-brand-cyan-tint text-brand-teal"
                                : "bg-orange-50 text-orange-500"
                        }`}
                    >
                        {paymentStatus}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            shippingStatus === "Delivered"
                                ? "bg-brand-cyan-tint text-brand-teal"
                                : shippingStatus === "Cancelled"
                                ? "bg-red-50 text-red-600"
                                : "bg-blue-50 text-blue-600"
                        }`}
                    >
                        {shippingStatus === "Shipped" && <Truck className="w-3 h-3" />}
                        {shippingStatus === "Delivered" && <Package className="w-3 h-3" />}
                        {(shippingStatus === "Processing" || shippingStatus === "Pending") && (
                            <Clock className="w-3 h-3" />
                        )}
                        {shippingStatus}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium">Total</p>
                    <p className="text-sm font-bold text-brand-teal leading-none mt-0.5">
                        {formatRupiah(order.total_amount)}
                    </p>
                </div>
            </div>

            {/* QR Code Modal for Mobile */}
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

                        <div className="w-16 h-16 bg-[#EAF7F7] text-[#41B9C5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <QrCode className="w-8 h-8" />
                        </div>

                        <h3 className="text-xl font-extrabold text-[#14433D] mb-2">QR Serah Terima</h3>
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
