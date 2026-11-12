import React from "react";
import { Store, UserX, ShieldCheck, Clock } from "lucide-react";

interface Props {
    stats: {
        total_merchants: number;
        suspended_merchants: number;
        verified_merchants?: number;
        pending_merchants?: number;
    };
    activeTab?: string;
    onTabChange?: (tab: "merchants" | "applications") => void;
}

export default function AdminMerchantStatCards({
    stats,
    activeTab = "merchants",
    onTabChange,
}: Props) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Akun Suspend */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md">
                <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        AKUN SUSPEND
                    </span>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {stats.suspended_merchants.toLocaleString()}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#FFF1F2] border border-rose-100 flex items-center justify-center text-rose-500 shadow-xs shrink-0">
                    <UserX className="w-6 h-6" />
                </div>
            </div>

            {/* Total Pedagang */}
            <div
                onClick={() => onTabChange && onTabChange("merchants")}
                className={`bg-white rounded-3xl p-5 md:p-6 border shadow-sm flex items-center justify-between transition hover:shadow-md ${
                    onTabChange ? "cursor-pointer" : ""
                } ${
                    activeTab === "merchants"
                        ? "border-brand-orange/40 ring-1 ring-brand-orange/20"
                        : "border-gray-100"
                }`}
            >
                <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        TOTAL PEDAGANG
                    </span>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {stats.total_merchants.toLocaleString()}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-brand-orange/30 flex items-center justify-center text-brand-orange shadow-xs shrink-0">
                    <Store className="w-6 h-6" />
                </div>
            </div>

            {/* Toko Terverifikasi */}
            <div
                onClick={() => onTabChange && onTabChange("merchants")}
                className={`bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md ${
                    onTabChange ? "cursor-pointer" : ""
                }`}
            >
                <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        TERVERIFIKASI
                    </span>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {(stats.verified_merchants ?? 0).toLocaleString()}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                </div>
            </div>

            {/* Menunggu Review (Permohonan Masuk SID) */}
            <div
                onClick={() => onTabChange && onTabChange("applications")}
                className={`bg-white rounded-3xl p-5 md:p-6 border shadow-sm flex items-center justify-between transition hover:shadow-md ${
                    onTabChange ? "cursor-pointer" : ""
                } ${
                    activeTab === "applications"
                        ? "border-amber-400 ring-2 ring-amber-300/40 bg-amber-50/20"
                        : "border-gray-100 hover:border-amber-200"
                }`}
            >
                <div>
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                            MENUNGGU REVIEW
                        </span>
                        {(stats.pending_merchants ?? 0) > 0 && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        )}
                    </div>
                    <div className="text-2xl md:text-3xl font-extrabold text-amber-600 tracking-tight">
                        {(stats.pending_merchants ?? 0).toLocaleString()}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                    <Clock className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
