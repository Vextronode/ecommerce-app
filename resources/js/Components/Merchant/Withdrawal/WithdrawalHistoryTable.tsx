import React, { useState } from "react";
import {
    Wallet,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Copy,
    Check,
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


    const handleCopyRef = (refNo: string) => {
        navigator.clipboard.writeText(refNo);
        setCopiedId(refNo);
        toast.success(`No Referensi ${refNo} tersalin!`);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredWithdrawals = withdrawals.filter((item) => {
        const matchesStatus =
            filterStatus === "all" || item.status === filterStatus;
        const matchesSearch =
            item.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.bank_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.account_holder.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col w-full">
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
                <div className="flex items-center gap-1.5 bg-[#F0FAFB] p-1.5 rounded-full border border-[#41B9C5]/20 shrink-0 self-start sm:self-auto">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterStatus === "all"
                                ? "bg-[#41B9C5] text-white shadow-sm shadow-[#41B9C5]/30"
                                : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Semua ({withdrawals.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("completed")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterStatus === "completed"
                                ? "bg-[#41B9C5] text-white shadow-sm shadow-[#41B9C5]/30"
                                : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Tercairkan
                    </button>
                    <button
                        onClick={() => setFilterStatus("pending")}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${filterStatus === "pending"
                                ? "bg-[#41B9C5] text-white shadow-sm shadow-[#41B9C5]/30"
                                : "text-gray-500 hover:text-gray-800"
                            }`}
                    >
                        Diproses
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            {withdrawals.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-full focus-within:bg-white focus-within:border-[#41B9C5] focus-within:ring-1 focus-within:ring-[#41B9C5] transition-colors mb-4">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input aria-label="Input field"
                        type="text"
                        placeholder="Cari berdasarkan No Referensi / Bank / Nama..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 text-xs font-medium text-gray-800 placeholder:text-gray-400"
                    />
                </div>
            )}

            {/* Table Content */}
            <div className="overflow-x-auto pb-2 -mx-5 px-5 md:mx-0 md:px-0">
                <table className="w-full text-left border-collapse min-w-[550px]">
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
                        {filteredWithdrawals && filteredWithdrawals.length > 0 ? (
                            filteredWithdrawals.map((item, index) => (
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
                                                onClick={() => handleCopyRef(item.reference_no)}
                                                className="text-gray-300 hover:text-[#41B9C5] transition-colors"
                                                title="Copy No Ref"
                                            >
                                                {copiedId === item.reference_no ? (
                                                    <Check className="w-3.5 h-3.5 text-[#41B9C5]" />
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
                                        <p className="font-bold text-xs text-[#004F54] uppercase">
                                            {item.bank_name}
                                        </p>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                                            {item.account_number} ({item.account_holder})
                                        </p>
                                    </td>
                                    <td className="py-3.5 border-b border-gray-50 font-extrabold text-sm text-[#004F54]">
                                        {formatRupiah(item.amount)}
                                    </td>
                                    <td className="py-3.5 border-b border-gray-50 text-right">
                                        <span
                                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${item.status === "completed"
                                                    ? "bg-emerald-100 text-emerald-800"
                                                    : item.status === "pending"
                                                        ? "bg-amber-100 text-amber-800"
                                                        : "bg-red-100 text-red-800"
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
                                        <div className="w-12 h-12 bg-[#F0FAFB] rounded-full flex items-center justify-center mb-3">
                                            <Wallet className="w-6 h-6 text-[#41B9C5]" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">Belum ada riwayat penarikan saldo.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Table Footer Count */}
            {filteredWithdrawals.length > 0 && (
                <div className="pt-3 mt-1 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                    <span>Menampilkan {filteredWithdrawals.length} dari {withdrawals.length} transaksi penarikan</span>
                </div>
            )}
        </div>
    );
}
