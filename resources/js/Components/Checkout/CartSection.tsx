import React from "react";
import { ShoppingCart } from "lucide-react";

interface CartItem {
    id: number;
    name: string;
    location?: string;
    price: number;
    qty: number;
    img: string;
    prepOption?: string;
    preparation_option?: string;
    sku?: { variant_name: string };
    weight?: string;
    unit?: string;
}

export default function CartSection({ items }: { items: CartItem[] }) {
    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-6 h-6 text-[#245D56]" />
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
            </div>

            <div className="space-y-6">
                {items.map((item) => {
                    const cleanLocation = item.location?.replace(
                        /\s*-\s*$/,
                        "",
                    );

                    const variantName =
                        item.prepOption ||
                        item.preparation_option ||
                        item.sku?.variant_name;

                    const unitName = item.weight || item.unit || "pcs";

                    return (
                        <div
                            key={item.id}
                            className="flex gap-4 items-center border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                        >
                            <img
                                src={item.img}
                                alt={item.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover bg-slate-100 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                                    {item.name}
                                </h3>
                                {cleanLocation && (
                                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                                        {cleanLocation}
                                    </p>
                                )}

                                {/* Badge Varian */}
                                {variantName && (
                                    <div className="mt-1.5">
                                        <span className="bg-[#EAF7F7] text-[#245D56] text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-[#245D56]/20">
                                            {variantName}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-[#245D56] text-sm md:text-base mb-1">
                                    Rp{" "}
                                    {Number(item.price).toLocaleString("id-ID")}
                                </p>
                                {/* Badge Qty */}
                                <div className="inline-flex items-center justify-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 mt-1">
                                    <span className="text-xs font-bold text-gray-700">
                                        Qty: {item.qty}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
