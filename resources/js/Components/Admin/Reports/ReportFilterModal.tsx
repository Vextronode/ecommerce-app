import React from "react";
import { X, Calendar, Store, Tag, ArrowUpDown, Layers, RotateCcw } from "lucide-react";

interface OptionItem {
    id: number;
    name: string;
    slug?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    period: string;
    setPeriod: (period: string) => void;
    storeId: number | null;
    setStoreId: (id: number | null) => void;
    categoryId: number | null;
    setCategoryId: (id: number | null) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
    perPage: number;
    setPerPage: (perPage: number) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
    stores: OptionItem[];
    categories: OptionItem[];
    onApply: () => void;
    onReset: () => void;
}

const periods = [
    { id: "all", label: "Semua Waktu" },
    { id: "today", label: "Hari Ini" },
    { id: "this_week", label: "Minggu Ini" },
    { id: "this_month", label: "Bulan Ini" },
    { id: "this_year", label: "Tahun Ini" },
    { id: "custom", label: "Rentang Kustom" },
];

const sortOptions = [
    { id: "sales", label: "Penjualan Terbanyak (Qty)" },
    { id: "revenue", label: "Pendapatan Tertinggi (Rp)" },
    { id: "name", label: "Nama Produk (A-Z)" },
];

const perPageOptions = [5, 10, 25, 50];

export default function ReportFilterModal({
    isOpen,
    onClose,
    period,
    setPeriod,
    storeId,
    setStoreId,
    categoryId,
    setCategoryId,
    sortBy,
    setSortBy,
    perPage,
    setPerPage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    stores,
    categories,
    onApply,
    onReset,
}: Props) {
    if (!isOpen) return null;



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <button type="button" aria-label="Tutup modal"
                className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity w-full cursor-default"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 transition-opacity duration-150">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E6F8F9] flex items-center justify-center text-[#004F54]">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">
                                Filter Laporan Penjualan
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium">
                                Sesuaikan periode, merchant, atau urutan data
                            </p>
                        </div>
                    </div>
                    <button aria-label="Action"
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body Form */}
                <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Periode Waktu */}
                    <div>
                        <label htmlFor="field_112" className="block text-xs font-bold text-gray-700 mb-2">
                            Periode Waktu
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {periods.map((p) => {
                                const isSelected = period === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setPeriod(p.id)}
                                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors text-center ${isSelected
                                                ? "bg-[#41B9C5] text-white border-[#41B9C5] shadow-xs"
                                                : "bg-gray-50/70 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300"
                                            }`}
                                    >
                                        {p.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Date Pickers */}
                        {period === "custom" && (
                            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-gray-100">
                                <div>
                                    <label htmlFor="field_138" className="block text-[11px] font-semibold text-gray-500 mb-1">
                                        Dari Tanggal
                                    </label>
                                    <input id="field_138"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#41B9C5] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="field_149" className="block text-[11px] font-semibold text-gray-500 mb-1">
                                        Sampai Tanggal
                                    </label>
                                    <input id="field_149"
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#41B9C5] focus:outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Filter Merchant / Toko */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Store className="w-3.5 h-3.5 text-gray-400" />
                            <label htmlFor="field_167" className="text-xs font-bold text-gray-700">
                                Filter Toko / Pedagang
                            </label>
                        </div>
                        <select id="field_167"
                            value={storeId || ""}
                            onChange={(e) => setStoreId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#41B9C5] focus:outline-none"
                        >
                            <option value="">Semua Toko Mitra</option>
                            {stores.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filter Kategori */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                            <label htmlFor="field_189" className="text-xs font-bold text-gray-700">
                                Kategori Produk
                            </label>
                        </div>
                        <select id="field_189"
                            value={categoryId || ""}
                            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#41B9C5] focus:outline-none"
                        >
                            <option value="">Semua Kategori</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Urutkan Berdasarkan & Per Page */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                                <label htmlFor="field_212" className="text-xs font-bold text-gray-700">
                                    Urutkan Data
                                </label>
                            </div>
                            <select id="field_212"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#41B9C5] focus:outline-none"
                            >
                                {sortOptions.map((so) => (
                                    <option key={so.id} value={so.id}>
                                        {so.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <Layers className="w-3.5 h-3.5 text-gray-400" />
                                <label htmlFor="field_232" className="text-xs font-bold text-gray-700">
                                    Jumlah Baris
                                </label>
                            </div>
                            <select id="field_232"
                                value={perPage}
                                onChange={(e) => setPerPage(Number(e.target.value))}
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:bg-white focus:border-[#41B9C5] focus:outline-none"
                            >
                                {perPageOptions.map((num) => (
                                    <option key={num} value={num}>
                                        {num} produk per halaman
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200/50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={onApply}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#41B9C5] hover:bg-[#38a3ae] text-white shadow-md shadow-[#41B9C5]/20 transition-colors cursor-pointer"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
