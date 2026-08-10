import React, { useState } from "react";
import { Store, CheckCircle2, Clock, ShieldAlert, Inbox } from "lucide-react";

interface MerchantApplication {
    id: number | string;
    name: string;
    owner_name: string;
    date: string;
    status: "approved" | "pending" | "need_review";
}

interface Props {
    registrations?: MerchantApplication[];
}

export default function AdminMerchantRegistrations({ registrations }: Props) {
    const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
    const items = registrations || [];

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm flex flex-col w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-5">
                <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                        Pendaftaran Pedagang
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Status pengajuan toko mitra terbaru
                    </p>
                </div>

                {/* Period Switcher */}
                <div className="flex bg-gray-100/80 p-1 rounded-xl border border-gray-200/60 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setPeriod("weekly")}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                            period === "weekly"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Weekly
                    </button>
                    <button
                        type="button"
                        onClick={() => setPeriod("monthly")}
                        className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                            period === "monthly"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            {/* Application List or Empty State */}
            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl bg-gray-50/50 border border-dashed border-gray-200">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-3 shadow-xs">
                        <Store className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">
                        Belum Ada Pengajuan Toko
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs leading-relaxed">
                        Pendaftaran mitra pedagang baru dari platform akan tercantum di sini secara otomatis.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.slice(0, 4).map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/60 hover:bg-[#F0FAFB] border border-gray-100/80 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-[#41B9C5]/30 flex items-center justify-center text-[#245D56] shadow-xs shrink-0">
                                    <Store className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                                        {item.name}
                                    </h4>
                                    <p className="text-[11px] text-gray-500">
                                        Pemilik: {item.owner_name} • {item.date}
                                    </p>
                                </div>
                            </div>

                            <div>
                                {item.status === "approved" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Disetujui
                                    </span>
                                ) : item.status === "pending" ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                        <ShieldAlert className="w-3 h-3" />
                                        Review
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
