import React, { useState } from "react";
import {
    Truck,
    Package,
    Clock,
    MoreVertical,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import OrderExpandedDetail from "./OrderExpandedDetail";

export default function OrderMobileCard({
    order,
    onOpenAction,
}: {
    order: any;
    onOpenAction: (order: any) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

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
            hour: "2-digit",
            minute: "2-digit",
        };
        return new Date(dateString).toLocaleDateString("id-ID", options);
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
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-4 bg-white hover:bg-gray-50 transition-colors group border-b border-gray-100 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="font-bold text-[#41B9C5] text-sm">
                        {order.invoice_number}
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        {formatDate(order.created_at)}
                    </p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpenAction(order);
                    }}
                    className="text-gray-400 hover:text-[#14433D] p-1"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#EAF7F7] text-[#245D56] font-bold flex items-center justify-center text-sm shrink-0 mt-1">
                    {order.customer_name
                        ? order.customer_name.charAt(0).toUpperCase()
                        : "?"}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-[#14433D] text-sm leading-tight">
                        {order.customer_name}
                    </p>

                    <div className="mt-1.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs font-bold text-gray-700 truncate">
                            {firstProduct?.product_name ||
                                "Produk tidak diketahui"}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-[11px] text-gray-500">
                                {firstProduct?.quantity} {firstProduct?.unit}{" "}
                                {firstProduct?.variant_name &&
                                    `• ${firstProduct.variant_name}`}
                            </p>

                            {otherProductsCount > 0 && (
                                <span className="text-[10px] font-bold text-[#41B9C5] flex items-center gap-0.5">
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

                        {/* Daftar produxk expandalbe */}
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

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${paymentStatus === "Paid" ? "bg-[#EAF7F7] text-[#245D56]" : "bg-orange-50 text-orange-500"}`}
                    >
                        {paymentStatus}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">
                        {shippingStatus === "Shipped" && (
                            <Truck className="w-3 h-3" />
                        )}
                        {shippingStatus === "Delivered" && (
                            <Package className="w-3 h-3" />
                        )}
                        {(shippingStatus === "Processing" ||
                            shippingStatus === "Pending") && (
                            <Clock className="w-3 h-3" />
                        )}
                        {shippingStatus}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-medium">
                        Total
                    </p>
                    <p className="text-sm font-bold text-[#14433D] leading-none mt-0.5">
                        {formatRupiah(order.total_amount)}
                    </p>
                </div>
            </div>
        </div>
    );
}
