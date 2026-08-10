import React, { useState } from "react";
import { X, Filter, RotateCcw } from "lucide-react";
import { router } from "@inertiajs/react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentFilters: {
        search?: string;
        status?: string;
        sid_status?: string;
        subdistrict?: string;
    };
}

export default function MerchantFilterModal({
    isOpen,
    onClose,
    currentFilters,
}: Props) {
    const [status, setStatus] = useState(currentFilters.status || "");
    const [sidStatus, setSidStatus] = useState(currentFilters.sid_status || "");
    const [subdistrict, setSubdistrict] = useState(
        currentFilters.subdistrict || "",
    );

    if (!isOpen) return null;

    const handleApply = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route("admin.merchants.index"),
            {
                search: currentFilters.search || undefined,
                status: status || undefined,
                sid_status: sidStatus || undefined,
                subdistrict: subdistrict || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        onClose();
    };

    const handleReset = () => {
        setStatus("");
        setSidStatus("");
        setSubdistrict("");
        router.get(
            route("admin.merchants.index"),
            {
                search: currentFilters.search || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <button type="button" aria-label="Tutup modal"
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity w-full cursor-default"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 z-10 animate-in fade-in zoom-in-95 transition-opacity duration-200">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#F0FAFB] border border-[#41B9C5]/30 flex items-center justify-center text-[#245D56]">
                            <Filter className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900">
                            Filter Pedagang
                        </h3>
                    </div>
                    <button aria-label="Action"
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Filter Form */}
                <form onSubmit={handleApply} className="space-y-4 py-4">
                    {/* Status Akun */}
                    <div>
                        <label htmlFor="field_96" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Status Akun
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "Semua Status", value: "" },
                                { label: "Active", value: "active" },
                                { label: "Warning", value: "warning" },
                                { label: "Suspended", value: "suspended" },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setStatus(item.value)}
                                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${status === item.value
                                            ? "bg-[#41B9C5] text-white border-[#41B9C5] shadow-xs"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SID Status */}
                    <div>
                        <label htmlFor="field_123" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Status Verifikasi (SID)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: "Semua", value: "" },
                                { label: "Verified", value: "verified" },
                                { label: "Pending", value: "pending" },
                            ].map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => setSidStatus(item.value)}
                                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${sidStatus === item.value
                                            ? "bg-[#41B9C5] text-white border-[#41B9C5] shadow-xs"
                                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Wilayah / Kecamatan */}
                    <div>
                        <label htmlFor="field_149" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Wilayah / Kecamatan
                        </label>
                        <select id="field_149"
                            value={subdistrict}
                            onChange={(e) => setSubdistrict(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:bg-white focus:border-[#41B9C5] focus:ring-1 focus:ring-[#41B9C5] transition-colors"
                        >
                            <option value="">Semua Wilayah</option>
                            <option value="Cibenda">Cibenda</option>
                            <option value="Parigi">Parigi</option>
                            <option value="Cijulang">Cijulang</option>
                            <option value="Pangandaran">Pangandaran</option>
                            <option value="Sidamulih">Sidamulih</option>
                            <option value="Kalipucang">Kalipucang</option>
                            <option value="Padaherang">Padaherang</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#41B9C5] text-white hover:bg-[#38a3ae] shadow-md shadow-[#41B9C5]/20 transition-colors cursor-pointer"
                            >
                                Terapkan Filter
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
