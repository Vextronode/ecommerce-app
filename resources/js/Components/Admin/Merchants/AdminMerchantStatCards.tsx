import React from "react";
import { Store, UserX, ShieldCheck, Clock } from "lucide-react";

interface Props {
    stats: {
        total_merchants: number;
        suspended_merchants: number;
        verified_merchants?: number;
        pending_merchants?: number;
    };
}

export default function AdminMerchantStatCards({ stats }: Props) {
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
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md">
                <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        TOTAL PEDAGANG
                    </span>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {stats.total_merchants.toLocaleString()}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#F0FAFB] border border-[#41B9C5]/30 flex items-center justify-center text-[#245D56] shadow-xs shrink-0">
                    <Store className="w-6 h-6" />
                </div>
            </div>

            {/* Toko Terverifikasi */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md">
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

            {/* Menunggu Review */}
            <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex items-center justify-between transition hover:shadow-md">
                <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        MENUNGGU REVIEW
                    </span>
                    <div className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                        {(stats.pending_merchants ?? 0).toLocaleString()}
                    </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-xs shrink-0">
                    <Clock className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
}
