import React from "react";
import { Link } from "@inertiajs/react";
import { Wallet, Package, Truck, Star, ChevronRight } from "lucide-react";

export interface OrderCounts {
    unpaid: number;
    processing: number;
    shipped: number;
    rating: number;
}

interface OrderStatusBarProps {
    counts?: OrderCounts;
    className?: string;
}

export default function OrderStatusBar({ counts, className = "" }: OrderStatusBarProps) {
    const orderTabs = [
        {
            id: "unpaid",
            label: "Belum Bayar",
            href: route("history.index", { status: "unpaid" }),
            icon: Wallet,
            count: counts?.unpaid || 0,
            iconColor: "text-amber-500",
            bgColor: "bg-amber-50",
        },
        {
            id: "processing",
            label: "Dikemas",
            href: route("history.index", { status: "processing" }),
            icon: Package,
            count: counts?.processing || 0,
            iconColor: "text-blue-500",
            bgColor: "bg-blue-50",
        },
        {
            id: "shipped",
            label: "Dikirim",
            href: route("history.index", { status: "shipped" }),
            icon: Truck,
            count: counts?.shipped || 0,
            iconColor: "text-indigo-500",
            bgColor: "bg-indigo-50",
        },
        {
            id: "rating",
            label: "Beri Penilaian",
            href: route("history.index", { status: "rating" }),
            icon: Star,
            count: counts?.rating || 0,
            iconColor: "text-orange-500",
            bgColor: "bg-orange-50",
        },
    ];

    return (
        <div className={`bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-sm p-4 md:p-6 ${className}`}>
            {/* Header: Title & View All */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#ED7218] rounded-full"></span>
                    <h3 className="font-bold text-gray-900 text-sm md:text-base tracking-tight">
                        Pesanan Saya
                    </h3>
                </div>
                <Link
                    href={route("history.index")}
                    className="group inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-[#ED7218] hover:text-[#c45a0e] transition-colors"
                >
                    <span>Lihat Riwayat Pesanan</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Status Item Grid */}
            <div className="grid grid-cols-4 gap-2 md:gap-4">
                {orderTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="flex flex-col items-center justify-center p-2 md:p-3 rounded-xl md:rounded-2xl hover:bg-slate-50 transition duration-150 group text-center"
                        >
                            <div className="relative mb-2">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${tab.bgColor} flex items-center justify-center transition-transform group-hover:scale-110 shadow-xs`}>
                                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${tab.iconColor}`} />
                                </div>
                                {tab.count > 0 && (
                                    <span className="absolute -top-1 -right-1.5 min-w-4.5 h-4.5 px-1 bg-[#ED7218] text-white text-[10px] md:text-xs font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in fade-in zoom-in">
                                        {tab.count > 99 ? "99+" : tab.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] md:text-xs font-medium text-gray-700 group-hover:text-gray-900 leading-tight">
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
