import React, { useState } from "react";
import { formatRupiah } from "@/utils/formatters";
import { Copy, Check, Info } from "lucide-react";
import toast from "react-hot-toast";

const formatVaNumber = (va: string) => {
    return va.replace(/(\d{4})/g, "$1 ").trim();
};

interface Props {
    channel: string;
    vaNumber?: string | null;
    billKey?: string | null;
    billerCode?: string | null;
    totalAmount: number;
}

const BANK_INFO: Record<string, { name: string; code: string; bgBadge: string; textBadge: string }> = {
    bca_va: { name: "BCA Virtual Account", code: "BCA", bgBadge: "bg-brand-indigo-merchant", textBadge: "text-white" },
    mandiri_bill: { name: "Mandiri Bill Payment", code: "MANDIRI", bgBadge: "bg-brand-blue-dark", textBadge: "text-white" },
    bni_va: { name: "BNI Virtual Account", code: "BNI", bgBadge: "bg-brand-teal", textBadge: "text-white" },
    bri_va: { name: "BRI Virtual Account (BRIVA)", code: "BRI", bgBadge: "bg-brand-blue", textBadge: "text-white" },
    permata_va: { name: "Permata Virtual Account", code: "PERMATA", bgBadge: "bg-brand-indigo-merchant", textBadge: "text-white" },
};

export default function VirtualAccountCard({
    channel,
    vaNumber,
    billKey,
    billerCode,
    totalAmount,
}: Props) {
    const [copiedVa, setCopiedVa] = useState(false);
    const [copiedBillKey, setCopiedBillKey] = useState(false);
    const [copiedAmount, setCopiedAmount] = useState(false);
    const [copiedBillerCode, setCopiedBillerCode] = useState(false);

    const bank = BANK_INFO[channel] || {
        name: "Virtual Account Bank",
        code: "VA",
        bgBadge: "bg-brand-indigo-merchant",
        textBadge: "text-white",
    };

    const isMandiri = channel === "mandiri_bill" || Boolean(billKey);

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${type} berhasil disalin!`);

        if (type === "Nomor VA") {
            setCopiedVa(true);
            setTimeout(() => setCopiedVa(false), 2000);
        } else if (type === "Nomor Tagihan") {
            setCopiedBillKey(true);
            setTimeout(() => setCopiedBillKey(false), 2000);
        } else if (type === "Kode Perusahaan") {
            setCopiedBillerCode(true);
            setTimeout(() => setCopiedBillerCode(false), 2000);
        } else if (type === "Total Pembayaran") {
            setCopiedAmount(true);
            setTimeout(() => setCopiedAmount(false), 2000);
        }
    };



    return (
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-9 border border-slate-100 shadow-xs space-y-5">
            {/* Top Bank Header */}
            <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-3.5">
                    <div className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm tracking-wider shadow-2xs ${bank.bgBadge} ${bank.textBadge}`}>
                        {bank.code}
                    </div>
                    <div>
                        <h4 className="font-bold text-base sm:text-lg text-gray-900 leading-tight">
                            {bank.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Verifikasi otomatis • Tanpa Bukti Transfer
                        </p>
                    </div>
                </div>

                {/* Status indicator badge */}
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Menunggu Transfer</span>
                </div>
            </div>

            {/* Mandiri Multipayment or Standard VA Box */}
            {isMandiri ? (
                <div className="space-y-3.5">
                    {/* Biller Code Box */}
                    <div className="rounded-2xl p-5 sm:p-6 border border-brand-blue/20 bg-brand-blue-soft flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                KODE PERUSAHAAN (BILLER CODE)
                            </span>
                            <p className="text-2xl sm:text-3xl font-mono font-black text-brand-blue-dark mt-1 tracking-wider">
                                {billerCode || "70012"}
                            </p>
                            <span className="text-xs text-slate-500">Midtrans / Cibenda Mart</span>
                        </div>
                        <button
                            onClick={() => copyToClipboard(billerCode || "70012", "Kode Perusahaan")}
                            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            {copiedBillerCode ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedBillerCode ? "Tersalin" : "Salin Kode"}</span>
                        </button>
                    </div>

                    <div className="rounded-2xl p-5 sm:p-6 border border-brand-blue/20 bg-brand-blue-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                NOMOR TAGIHAN (BILL KEY)
                            </span>
                            <p className="text-2xl sm:text-3xl font-mono font-black text-brand-blue-dark mt-1 tracking-wider">
                                {billKey || "-"}
                            </p>
                        </div>
                        <button
                            onClick={() => copyToClipboard(billKey || "", "Nomor Tagihan")}
                            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            {copiedBillKey ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedBillKey ? "Tersalin!" : "Salin Nomor"}</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl p-5 sm:p-6 border border-brand-blue/20 bg-brand-blue-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            NO. REKENING VIRTUAL ACCOUNT
                        </span>
                        <p className="text-2xl sm:text-3xl md:text-4xl font-mono font-black text-brand-blue-dark tracking-wider">
                            {vaNumber ? formatVaNumber(vaNumber) : "Menyiapkan Nomor VA..."}
                        </p>
                    </div>

                    {vaNumber && (
                        <button
                            onClick={() => copyToClipboard(vaNumber, "Nomor VA")}
                            className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-white bg-brand-blue hover:bg-brand-blue-hover px-5 py-3 rounded-xl shadow-xs transition active:scale-95 flex-shrink-0 cursor-pointer"
                        >
                            {copiedVa ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedVa ? "Tersalin!" : "Salin Nomor"}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Total Pembayaran */}
            <div className="rounded-2xl p-5 sm:p-6 border border-brand-orange/30 bg-brand-orange-soft flex items-center justify-between">
                <div>
                    <span className="text-xs sm:text-sm text-slate-500 font-medium">Total Pembayaran</span>
                    <p className="text-2xl sm:text-3xl font-black text-brand-orange mt-0.5 tracking-tight">
                        {formatRupiah(totalAmount)}
                    </p>
                </div>
                <button
                    onClick={() => copyToClipboard(totalAmount.toString(), "Total Pembayaran")}
                    className="flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-orange bg-white border border-brand-orange hover:bg-brand-orange-tint px-5 py-2.5 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                    {copiedAmount ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedAmount ? "Tersalin" : "Salin Jumlah"}</span>
                </button>
            </div>

            {/* Footer Notice */}
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-1">
                <Info className="w-4 h-4 flex-shrink-0 text-slate-400" />
                <span>Sistem mengecek mutasi secara otomatis dalam hitungan detik setelah transfer berhasil.</span>
            </div>
        </div>
    );
}
