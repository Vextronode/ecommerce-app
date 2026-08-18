import React from "react";
import { ShoppingCart, Store } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

interface CartItem {
    id: number;
    product_id: number;
    name: string;
    store_id?: number;
    store_name?: string;
    store_address?: string;
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
    // Group items by Store
    const itemsByStore = items.reduce((acc: { [key: string]: CartItem[] }, item) => {
        const storeKey = item.store_name || "Cibenda Mart";
        if (!acc[storeKey]) {
            acc[storeKey] = [];
        }
        acc[storeKey].push(item);
        return acc;
    }, {});

    const storeNames = Object.keys(itemsByStore);

    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-[#245D56]" />
                    <h2 className="text-xl font-bold text-gray-900">Rincian Barang</h2>
                </div>
                {storeNames.length > 1 && (
                    <span className="text-xs font-bold text-[#14433D] bg-[#EAF7F7] px-3 py-1 rounded-full border border-[#41B9C5]/30">
                        {storeNames.length} Toko Berbeda
                    </span>
                )}
            </div>

            <div className="space-y-6 divide-y divide-slate-100">
                {storeNames.map((storeName, storeIdx) => {
                    const storeItems = itemsByStore[storeName];
                    const storeAddress = storeItems[0]?.store_address;

                    return (
                        <div key={storeName} className={storeIdx > 0 ? "pt-6" : ""}>
                            {/* Store Header */}
                            <div className="flex items-center gap-2 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <div className="w-7 h-7 rounded-lg bg-teal-100 text-[#14433D] flex items-center justify-center shrink-0">
                                    <Store className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-sm truncate">
                                        {storeName}
                                    </p>
                                    {storeAddress && (
                                        <p className="text-[11px] text-gray-500 truncate">
                                            {storeAddress}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Store Items List */}
                            <div className="space-y-4 pl-1">
                                {storeItems.map((item) => {
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
                                                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 text-sm md:text-base truncate">
                                                    {item.name}
                                                </h3>

                                                {variantName && (
                                                    <span className="inline-block mt-1 text-[11px] font-semibold bg-[#EAF7F7] text-[#245D56] px-2 py-0.5 rounded-md">
                                                        Varian: {variantName}
                                                    </span>
                                                )}

                                                <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                                    <span>
                                                        {item.qty} {unitName}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="font-bold text-gray-900">
                                                        {formatRupiah(item.price)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <p className="font-extrabold text-sm md:text-base text-[#14433D]">
                                                    {formatRupiah(item.price * item.qty)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
