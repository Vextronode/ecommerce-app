import React from 'react';
import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';

export type OrderItemType = {
    id: number;
    product_id: number;
    product_slug?: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: string | number;
    image: string;
};

export type OrderType = {
    id: number;
    invoice_number: string;
    store_name: string;
    status: string;
    total_amount: string | number;
    items: OrderItemType[];
};

interface OrderItemCardProps {
    order: OrderType;
}

export default function OrderItemCard({ order }: OrderItemCardProps) {
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Selesai":
                return "text-[#281B7A] border-gray-300 bg-white";
            case "Dibatalkan":
                return "text-[#281B7A] border-gray-300 bg-white";
            case "Belum Bayar":
                return "text-[#ED7218] border-[#ED7218]/40 bg-[#ED7218]/5";
            case "Dikemas":
            case "Dikirim":
                return "text-[#281B7A] border-[#281B7A]/40 bg-[#281B7A]/5";
            default:
                return "text-gray-600 border-gray-300 bg-white";
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <Link
                href={route("history.show", order.id)}
                className="block cursor-pointer"
            >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-[#ED7218] text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-xs">
                        <Store className="w-3.5 h-3.5" />
                        <span>{order.store_name}</span>
                    </div>
                </div>
                <div
                    className={`px-3 py-1 rounded-lg border text-xs font-medium ${getStatusColor(
                        order.status
                    )}`}
                >
                    {order.status}
                </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4">
                {order.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-start gap-4 mb-4 last:mb-0"
                    >
                        <img
                            src={item.image}
                            alt={item.product_name}
                            className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-gray-900 font-medium truncate">
                                {item.product_name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Variasi:{" "}
                                {item.variant_name ||
                                    "Default"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                x{item.quantity}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[#281B7A] text-base">
                                Rp
                                {Number(
                                    item.price
                                ).toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            </Link>

            {/* Card Footer */}
            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <span className="text-sm text-gray-600 font-medium">
                        Total Pesanan:{" "}
                    </span>
                    <span className="text-lg font-bold text-[#281B7A]">
                        Rp
                        {Number(
                            order.total_amount
                        ).toLocaleString("id-ID")}
                    </span>
                </div>
                <div className="flex gap-3">
                    {order.status === "Selesai" && (
                        <>
                            <button className="px-4 py-2 bg-[#281B7A]/5 border border-[#281B7A]/20 text-[#281B7A] text-sm font-medium rounded-xl hover:bg-[#281B7A]/10 transition-colors">
                                Tampilkan Rincian Pengembalian
                            </button>
                            <Link
                                href={route("product.detail", order.items[0]?.product_slug || order.items[0]?.product_id)}
                                className="px-6 py-2 bg-[#ED7218] text-white text-sm font-semibold rounded-xl hover:bg-[#d66311] transition-colors shadow-xs"
                            >
                                Beli Lagi
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
