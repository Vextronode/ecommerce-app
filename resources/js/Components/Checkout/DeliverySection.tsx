import React from "react";
import { Truck, ShieldCheck, Store, MapPin } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";
import type { StoreShippingBreakdown } from "@/Hooks/Storefront/useCheckoutForm";

interface Props {
    selected: string;
    onSelect: (val: string) => void;
    deliveryFee: number;
    storesBreakdown?: StoreShippingBreakdown[];
}

export default function DeliverySection({
    selected,
    onSelect,
    deliveryFee,
    storesBreakdown = [],
}: Props) {
    const isMultiStore = storesBreakdown.length > 1;

    return (
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Truck className="w-6 h-6 text-[#ED7218]" />
                    <h2 className="text-xl font-bold text-gray-900">Metode Pengiriman</h2>
                </div>
                {isMultiStore && (
                    <span className="text-xs font-semibold text-gray-500">
                        {storesBreakdown.length} Titik Pengiriman
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Local Delivery Option */}
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.click();
                    }}
                    onClick={() => onSelect("local_delivery")}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition ${
                        selected === "local_delivery"
                            ? "border-[#ED7218] bg-[#ED7218]/5"
                            : "border-slate-100 hover:border-slate-200"
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">
                                Kurir Toko (Lokal)
                            </span>
                            <span className="text-[10px] font-bold bg-[#ED7218]/10 text-[#ED7218] px-2 py-0.5 rounded-full">
                                DIANTAR
                            </span>
                        </div>
                        {selected === "local_delivery" && (
                            <ShieldCheck className="w-5 h-5 text-[#ED7218]" />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                        {isMultiStore
                            ? "Diantar langsung oleh masing-masing toko"
                            : "Diantar langsung oleh kurir toko"}
                    </p>
                    <p className="font-bold text-sm text-[#ED7218]">
                        {selected === "local_delivery"
                            ? formatRupiah(deliveryFee)
                            : "Dihitung otomatis"}
                    </p>
                </div>

                {/* Self Pickup Option */}
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.click();
                    }}
                    onClick={() => onSelect("self_pickup")}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition ${
                        selected === "self_pickup"
                            ? "border-[#ED7218] bg-[#ED7218]/5"
                            : "border-slate-100 hover:border-slate-200"
                    }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-gray-900">Ambil Sendiri</span>
                        {selected === "self_pickup" && (
                            <ShieldCheck className="w-5 h-5 text-[#ED7218]" />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                        {isMultiStore
                            ? "Ambil mandiri ke masing-masing lokasi toko"
                            : "Ambil langsung ke toko"}
                    </p>
                    <p className="font-bold text-sm text-[#ED7218]">Gratis (Rp 0)</p>
                </div>
            </div>

            {/* Per-Store Delivery Fee Breakdown (if multi-store and local delivery selected) */}
            {selected === "local_delivery" && isMultiStore && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-[#14433D]" />
                        <span>Rincian Ongkir Per Toko:</span>
                    </p>
                    <div className="divide-y divide-slate-200/60 text-xs">
                        {storesBreakdown.map((sb) => (
                            <div
                                key={sb.store_id}
                                className="py-2 flex items-center justify-between gap-3 text-slate-700"
                            >
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">
                                        {sb.store_name}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        {sb.distance_km !== null ? `Jarak ± ${sb.distance_km} km` : "Jarak standar"} • {sb.items_count} item
                                    </p>
                                </div>
                                <span className="font-bold text-gray-900 shrink-0">
                                    {formatRupiah(sb.delivery_fee)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
