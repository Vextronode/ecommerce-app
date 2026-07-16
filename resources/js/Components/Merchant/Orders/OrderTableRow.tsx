import React, { useState } from "react";
import {
    Truck,
    Package,
    MoreVertical,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import OrderExpandedDetail from "./OrderExpandedDetail";

export default function OrderTableRow({
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
        };
        return new Date(dateString).toLocaleDateString("en-US", options);
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
                        {order.invoice_number}
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
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF7F7] text-[#245D56] text-xs font-bold border border-[#41B9C5]/10">
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
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenAction(order);
                        }}
                        className="text-gray-400 hover:text-[#41B9C5] transition-colors p-1 rounded"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-gray-50/50 border-b border-gray-100">
                    <td colSpan={8} className="py-4 px-6">
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm ml-12">
                            <h5 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                                Daftar Lengkap Pesanan
                            </h5>
                            <OrderExpandedDetail items={order.items} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
