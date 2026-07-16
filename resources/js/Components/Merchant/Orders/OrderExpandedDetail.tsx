import React from "react";

export default function OrderExpandedDetail({ items }: { items: any[] }) {
    const formatRupiah = (angka: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        })
            .format(angka)
            .replace("Rp", "Rp.");
    };

    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-3">
            {items.map((item: any, i: number) => (
                <div
                    key={i}
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
