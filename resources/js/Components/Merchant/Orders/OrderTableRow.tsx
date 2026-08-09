import React, { useState } from "react";
import { router } from '@inertiajs/react';
import {
    Truck,
    Package,
    MoreVertical,
    Clock,
    ChevronDown,
    ChevronUp,
    QrCode,
    X,
    Navigation,
} from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import OrderExpandedDetail from "./OrderExpandedDetail";
import Modal from "@/Components/Modal";

export default function OrderTableRow({
    order,
    onOpenAction,
}: {
    order: any;
    onOpenAction: (order: any) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(angka)
            .replace("Rp", "Rp.");
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = {
            month: "short",
            day: "numeric",
            year: "numeric",
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const handleSelfDelivery = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.put(
            route('merchant.orders.update-status', order.id),
            { shipping_status: 'shipped' },
            {
                onSuccess: () => {
                    window.open(`/tracker/${order.invoice_number}`, '_blank');
                },
            }
        );
    };

    const totalItems =
        order.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
        ) || 0;
    const firstProduct = order.items?.[0];
    const otherProductsCount = (order.items?.length || 0) - 1;

    const paymentStatus =
        order.payment_status.charAt(0).toUpperCase() +
        order.payment_status.slice(1);
    const shippingStatus =
        order.shipping_status.charAt(0).toUpperCase() +
        order.shipping_status.slice(1);
    const initial = order.customer_name
        ? order.customer_name.charAt(0).toUpperCase()
        : "?";

    return (
        <>
            <tr
                onClick={() => setIsExpanded(!isExpanded)}
                className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer ${isExpanded ? "bg-gray-50/50" : ""}`}
            >
                <td className="py-4 px-6">
                    <span className="font-bold text-[#41B9C5] text-sm">
                        #{order.invoice_number}
                    </span>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF7F7] text-[#245D56] font-bold flex items-center justify-center text-xs shrink-0">
                            {initial}
                        </div>
                        <div>
                            <p className="font-bold text-[#14433D] text-sm leading-tight">
                                {order.customer_name}
                            </p>
                            <p className="text-xs text-gray-400">
                                {order.user?.email || order.customer_phone}
                            </p>
                        </div>
                    </div>
                </td>

                <td className="py-4 px-6">
                    <div className="flex flex-col max-w-45">
                        <span
                            className="text-sm font-bold text-[#14433D] truncate"
                            title={firstProduct?.product_name}
                        >
                            {firstProduct?.product_name ||
                                "Produk tidak diketahui"}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-gray-500 font-medium">
                                {firstProduct?.quantity} {firstProduct?.unit}{" "}
                                {firstProduct?.variant_name &&
                                    `• ${firstProduct.variant_name}`}
                            </span>

                            {otherProductsCount > 0 && (
                                <span className="text-[11px] font-bold text-[#41B9C5] bg-[#EAF7F7] px-1.5 py-0.5 rounded flex items-center gap-0.5">
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

                <td className="py-4 px-6">
                    <p className="text-sm text-gray-600 w-20">
                        {formatDate(order.created_at).replace(" ", "\n")}
                    </p>
                </td>
                <td className="py-4 px-6">
                    <p className="text-sm font-bold text-[#14433D]">
                        {formatRupiah(order.total_amount)}
                    </p>
                </td>
                <td className="py-4 px-6">
                    <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${paymentStatus === "Paid" ? "bg-[#EAF7F7] text-[#245D56]" : "bg-orange-50 text-orange-500"}`}
                    >
                        <div
                            className={`w-1.5 h-1.5 rounded-full ${paymentStatus === "Paid" ? "bg-[#41B9C5]" : "bg-orange-400"}`}
                        ></div>
                        {paymentStatus}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                        shippingStatus === "Delivered" ? "bg-[#EAF7F7] text-[#245D56] border-[#41B9C5]/20" :
                        shippingStatus === "Cancelled" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-blue-50 text-blue-600 border-blue-200"
                    }`}>
                        {shippingStatus === "Shipped" && (
                            <Truck className="w-3.5 h-3.5" />
                        )}
                        {shippingStatus === "Delivered" && (
                            <Package className="w-3.5 h-3.5" />
                        )}
                        {(shippingStatus === "Processing" ||
                            shippingStatus === "Pending") && (
                            <Clock className="w-3.5 h-3.5" />
                        )}
                        {shippingStatus}
                    </div>
                </td>
                <td className="py-4 px-6 text-center">
                    {shippingStatus !== "Delivered" && shippingStatus !== "Cancelled" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenAction(order);
                            }}
                            className="text-gray-400 hover:text-[#41B9C5] transition-colors p-1 rounded"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    )}
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <td colSpan={8} className="py-4 px-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm ml-12">
                            <div className="flex justify-between items-start mb-3">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Daftar Lengkap Pesanan
                                </h5>
                                {order.delivery_method === 'local_delivery' && ['shipped', 'delivered'].includes(order.shipping_status) && (
                                    <div className="flex flex-col items-end gap-1 text-right">
                                        <a href={`/tracker/${order.invoice_number}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 bg-[#EAF7F7] text-[#14433D] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#41B9C5] hover:text-white transition-colors">
                                            Tracker Pengiriman
                                        </a>
                                        {order.shipping_status === 'shipped' && order.shipping_pin && (
                                            <span className="text-[10px] text-gray-400 font-medium">
                                                Informasikan ke Kurir untuk input PIN
                                            </span>
                                        )}
                                    </div>
                                )}
                                {order.delivery_method === 'local_delivery' && order.shipping_status === 'processing' && (
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 text-right">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowQRModal(true);
                                            }}
                                            className="inline-flex items-center gap-2 bg-[#EAF7F7] text-[#14433D] hover:bg-[#41B9C5] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border border-[#41B9C5]/30"
                                        >
                                            <QrCode className="w-4 h-4" />
                                            Diserahkan ke Kurir
                                        </button>
                                        <button 
                                            onClick={handleSelfDelivery}
                                            className="inline-flex items-center gap-2 bg-[#14433D] text-white hover:bg-[#1f635a] px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
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

            {/* QR Code Modal */}
            {order.handover_url && (
                <Modal show={showQRModal} onClose={() => setShowQRModal(false)} maxWidth="sm">
                    <div className="p-6 relative text-center">
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="w-16 h-16 bg-[#EAF7F7] text-[#41B9C5] rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <QrCode className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-[#14433D] mb-2">QR Serah Terima</h3>
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
        </>
    );
}
