import React, { useState } from "react";
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
}: {
    order: any;
    onOpenAction: (order: any) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    const handleSelfDelivery = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.put(
            route("merchant.orders.update-status", order.id),
            { shipping_status: "shipped" },
            {
                onSuccess: () => {
                    window.open(`/tracker/${order.invoice_number}?role=driver`, "_blank");
                },
            }
        );
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
            className="p-4 bg-white hover:bg-gray-50 transition-colors group border-b border-gray-100 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-[#41B9C5] text-sm">
                        #{order.invoice_number}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(order.created_at)}
                    </p>
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
                <div className="my-3 p-3 bg-[#F0FAFB] rounded-xl border border-[#41B9C5]/30 space-y-2">
                    <div className="text-[11px] font-bold text-[#14433D] flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#41B9C5]" />
                        <span>Pilihan Pengiriman Pesanan:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowQRModal(true);
                            }}
                            className="flex items-center justify-center gap-1.5 bg-white text-[#14433D] hover:bg-[#EAF7F7] py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-sm border border-[#41B9C5]/40 active:scale-95"
                        >
                            <QrCode className="w-3.5 h-3.5 text-[#41B9C5]" />
                            <span className="truncate">Scan Kurir</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSelfDelivery}
                            className="flex items-center justify-center gap-1.5 bg-[#14433D] text-white hover:bg-[#1f635a] py-2 px-2.5 rounded-lg text-xs font-bold transition shadow-sm active:scale-95"
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
                            <span>PIN: <strong className="text-[#14433D] tracking-widest">{order.shipping_pin}</strong></span>
                        ) : (
                            <span>Kurir Toko</span>
                        )}
                    </div>
                    <a
                        href={`/tracker/${order.invoice_number}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 bg-[#EAF7F7] text-[#14433D] hover:bg-[#41B9C5] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs shrink-0"
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
                                ? "bg-[#EAF7F7] text-[#245D56]"
                                : "bg-orange-50 text-orange-500"
                        }`}
                    >
                        {paymentStatus}
                    </span>
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            shippingStatus === "Delivered"
                                ? "bg-[#EAF7F7] text-[#245D56]"
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
                    <p className="text-sm font-bold text-[#14433D] leading-none mt-0.5">
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
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
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
