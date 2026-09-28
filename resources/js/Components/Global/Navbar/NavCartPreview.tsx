import React from "react";
import { Link } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";
import { CartPreviewItem } from "@/types";

interface CartPreviewData {
    items: CartPreviewItem[];
    total_count: number;
}

interface NavCartPreviewProps {
    cartCount?: number;
    cartPreview?: CartPreviewData | null;
}

export default function NavCartPreview({ cartCount = 0, cartPreview }: NavCartPreviewProps) {
    const count = typeof cartCount === "number" ? cartCount : 0;

    return (
        <div className="relative group">
            <Link
                href={route("cart")}
                aria-label="Shopping Cart"
                className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 transition-colors relative flex items-center"
            >
                <ShoppingCart size={22} strokeWidth={2} />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full leading-none border border-[#F8F9FA]">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </Link>

            {/* Cart Hover Preview Popover */}
            <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 pointer-events-none group-hover:pointer-events-auto">
                <p className="text-xs font-semibold text-slate-400 mb-3">
                    Recently Added Products
                </p>

                {cartPreview && cartPreview.items && cartPreview.items.length > 0 ? (
                    <div className="space-y-3">
                        <div className="divide-y divide-slate-100 max-h-75 overflow-y-auto no-scrollbar">
                            {cartPreview.items.slice(0, 4).map((item) => (
                                <div key={item.id} className="py-2.5 flex items-center gap-3 first:pt-0">
                                    <img
                                        src={item.img}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                                    />
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h4 className="font-bold text-gray-900 text-xs md:text-sm truncate">
                                            {item.name}
                                        </h4>
                                        {item.variant_name && (
                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                Variasi: {item.variant_name}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-slate-400">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="font-bold text-brand-orange text-xs md:text-sm">
                                            Rp {Number(item.price * item.quantity).toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {cartPreview.total_count > 4 && (
                            <div className="py-2 px-3 bg-slate-50 rounded-xl text-center text-xs font-semibold text-slate-600 border border-slate-100">
                                + {cartPreview.total_count - 4} Produk Lainnya di Keranjang
                            </div>
                        )}

                        <Link
                            href={route("cart")}
                            className="block w-full py-2.5 bg-brand-orange text-white text-center font-bold rounded-xl hover:bg-brand-orange-hover transition shadow-md shadow-brand-orange/20 text-xs md:text-sm mt-3"
                        >
                            View My Shopping Cart
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-60" />
                        <p className="text-xs font-medium text-slate-500">
                            Keranjang kamu masih kosong
                        </p>
                        <Link
                            href={route("shop")}
                            className="inline-block mt-3 px-4 py-1.5 bg-brand-orange text-white text-xs font-bold rounded-lg hover:bg-brand-orange-hover transition"
                        >
                            Mulai Belanja
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
