import React, { useState } from "react";
import {
    Wallet,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Copy,
    Check,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { formatRupiah } from "@/utils/formatters";

interface WithdrawalItem {
    id: number;
    reference_no: string;
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder: string;
    status: string;
    notes: string | null;
    created_at: string;
}

interface WithdrawalHistoryTableProps {
    withdrawals: WithdrawalItem[];
}

export default function WithdrawalHistoryTable({
    withdrawals,
}: WithdrawalHistoryTableProps) {
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const ITEMS_PER_PAGE = 5;

    const handleCopyRef = (refNo: string) => {
        navigator.clipboard.writeText(refNo);
        setCopiedId(refNo);
        toast.success(`No Referensi ${refNo} tersalin!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const completedCount = withdrawals.filter((w) => w.status === "completed").length;
    const pendingCount = withdrawals.filter((w) => w.status === "pending").length;
    const failedCount = withdrawals.filter((w) => w.status === "failed").length;

    const filteredWithdrawals = withdrawals.filter((item) => {
        const matchesStatus =
            filterStatus === "all" || item.status === filterStatus;
        const matchesSearch =
            item.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.account_holder.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Reset pagination to page 1 whenever filter or search query changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filterStatus, searchQuery]);

    const totalItems = filteredWithdrawals.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);

    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
    const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (safePage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }
        if (safePage >= totalPages - 3) {
            return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages];
    };

    return (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-brand-orange/20 shadow-sm flex flex-col w-full max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 md:mb-6">
                <div>
                    <h3 className="text-base md:text-lg font-bold text-gray-800">
                        Riwayat Penarikan Saldo
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                        Daftar transaksi pencairan dana ke rekening bank toko
                    </p>
                </div>

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 bg-brand-orange-soft p-1.5 rounded-full border border-brand-orange/20 shrink-0 self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setFilterStatus("all")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            filterStatus === "all"
                                ? "bg-brand-orange text-white shadow-sm shadow-brand-orange/30"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Semua ({withdrawals.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus("completed")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            filterStatus === "completed"
                                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Tercairkan ({completedCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus("pending")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            filterStatus === "pending"
                                ? "bg-amber-500 text-white shadow-sm shadow-amber-500/30"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Diproses ({pendingCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterStatus("failed")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            filterStatus === "failed"
                                ? "bg-rose-500 text-white shadow-sm shadow-rose-500/30"
                                : "text-gray-500 hover:text-gray-800"
                        }`}
                    >
                        Gagal ({failedCount})
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {withdrawals.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-full focus-within:bg-white focus-within:border-brand-orange focus-within:ring-1 focus-within:ring-brand-orange transition-colors mb-4">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input 
                        aria-label="Cari transaksi"
                        type="text"
                        placeholder="Cari berdasarkan No Referensi / Bank / Nama..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-xs font-medium text-gray-800 placeholder:text-gray-400"
                    />
                </div>
            )}

            {/* Table Content */}
            <div className="overflow-x-auto no-scrollbar pb-2">
                <table className="w-full text-left border-collapse min-w-137.5">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                NO. REFERENSI / TANGGAL
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                BANK TUJUAN
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                NOMINAL
                            </th>
                            <th className="pb-3 text-[10px] md:text-xs font-extrabold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">
                                STATUS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginatedWithdrawals && paginatedWithdrawals.length > 0 ? (
                            paginatedWithdrawals.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-gray-50/50 transition-colors"
                                >
                                    <td className="py-3.5 border-b border-gray-50">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono font-bold text-xs text-gray-900">
                                                {item.reference_no}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyRef(item.reference_no)}
                                                className="text-gray-300 hover:text-brand-orange transition-colors cursor-pointer"
                                                title="Copy No Ref"
                                            >
                                                {copiedId === item.reference_no ? (
                                                    <Check className="w-3.5 h-3.5 text-brand-orange" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </td>
                                    <td className="py-3.5 border-b border-gray-50">
                                        <p className="font-bold text-xs text-brand-orange-dark uppercase">
                                            {item.bank_name}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                                            {item.account_number} ({item.account_holder})
                                        </p>
                                    </td>
                                    <td className="py-3.5 border-b border-gray-50 font-extrabold text-sm text-gray-900">
                                        {formatRupiah(item.amount)}
                                    </td>
                                    <td className="py-3.5 border-b border-gray-50 text-right">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                                                item.status === "completed"
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                                    : item.status === "pending"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200/50"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200/50"
                                            }`}
                                        >
                                            {item.status === "completed" ? (
                                                <>
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Tercairkan
                                                </>
                                            ) : item.status === "pending" ? (
                                                <>
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Diproses
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    Gagal
                                                </>
                                            )}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400 font-medium">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-brand-orange-tint rounded-full flex items-center justify-center mb-3">
                                            <Wallet className="w-6 h-6 text-brand-orange" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">Belum ada riwayat penarikan saldo.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer Pagination */}
            {totalItems > 0 && (
                <div className="pt-4 mt-2 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-medium">
                    <div>
                        Menampilkan <span className="font-bold text-brand-orange-dark">{startIndex + 1}</span> - <span className="font-bold text-brand-orange-dark">{endIndex}</span> dari <span className="font-bold text-brand-orange-dark">{totalItems}</span> transaksi
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                disabled={safePage === 1}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    safePage === 1
                                        ? "border-transparent text-gray-300 cursor-not-allowed"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                                aria-label="Halaman sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {getPageNumbers().map((item, idx) => {
                                if (item === '...') {
                                    return (
                                        <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-xs text-gray-400">
                                            ...
                                        </span>
                                    );
                                }
                                const pageNum = Number(item);
                                return (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            pageNum === safePage
                                                ? "bg-brand-orange text-white shadow-sm shadow-brand-orange/30"
                                                : "text-gray-600 hover:bg-brand-orange-soft hover:text-brand-orange-dark"
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                disabled={safePage === totalPages}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                    safePage === totalPages
                                        ? "border-transparent text-gray-300 cursor-not-allowed"
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                                }`}
                                aria-label="Halaman berikutnya"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
