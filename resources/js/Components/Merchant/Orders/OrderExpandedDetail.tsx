import React from "react";
import { formatRupiah } from "@/utils/formatters";

export default function OrderExpandedDetail({ items }: { items: any[] }) {

    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-3">
            {items.map((item: any, i: number) => (
                <div
                    key={item.id}
                    className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 last:pb-0"
                >
                    <div>
                        <p className="text-sm font-bold text-[#14433D]">
                            {item.product_name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {item.quantity} {item.unit}{" "}
                            {item.variant_name && `• ${item.variant_name}`}
                        </p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">
                        {formatRupiah(item.price * item.quantity)}
                    </p>
                </div>
            ))}
        </div>
    );
}
