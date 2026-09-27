import React from "react";
import { formatRupiah } from "@/utils/formatters";
import { Package } from "lucide-react";

const resolveImageUrl = (path?: string | null) => {
    if (!path) return null;
    if (path.startsWith("http") || path.startsWith("/")) return path;
    return `/storage/${path}`;
};

export default function OrderExpandedDetail({ items }: { items: any[] }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="space-y-2">
            {items.map((item: any) => {
                const imgPath = item.product?.image_path || item.product?.images?.[0]?.image_path;
                const imgUrl = resolveImageUrl(imgPath);

                return (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 p-2 rounded-xl bg-gray-50/80 border border-gray-100"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-white border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                                {imgUrl ? (
                                    <img
                                        src={imgUrl}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Package className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">
                                    {item.product_name}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    {item.quantity} {item.unit}{" "}
                                    {item.variant_name && `• ${item.variant_name}`}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs font-bold text-brand-orange shrink-0">
                            {formatRupiah(item.price * item.quantity)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
