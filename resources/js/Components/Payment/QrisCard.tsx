import React, { useState } from "react";
import { formatRupiah, formatNumberId, formatNumberEn } from "@/utils/formatters";
import { QrCode, Download, ExternalLink, ShieldCheck, Smartphone, Check, Copy, Info } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    qrCodeUrl?: string | null;
    deeplinkUrl?: string | null;
    totalAmount: number;
    channel: string;
}

export default function QrisCard({
    qrCodeUrl,
    deeplinkUrl,
    totalAmount,
    channel,
}: Props) {
    const [copiedAmount, setCopiedAmount] = useState(false);

    const formatRupiah = (amount: number) => {
        return formatRupiah(amount);
    };

    const copyAmount = () => {
        navigator.clipboard.writeText(totalAmount.toString());
        setCopiedAmount(true);
        toast.success("Total tagihan berhasil disalin!");
        setTimeout(() => setCopiedAmount(false), 2000);
    };

    const downloadQr = () => {
        if (!qrCodeUrl) return;
        const a = document.createElement("a");
        a.href = qrCodeUrl;
        a.download = `QRIS-Payment-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success("Kode QR berhasil diunduh!");
    };

    return (
        <div className="w-full bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-xs space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl font-bold text-xs bg-[#281B7A] text-white tracking-wider shadow-2xs">
                        QRIS
                    </div>
                    <div>
                        <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                            QRIS / GoPay / E-Wallet
                        </h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Verifikasi otomatis • Scan & Bayar Instan
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Siap Di-scan</span>
                </div>
            </div>

            {/* QR Container */}
            <div
                className="rounded-2xl p-5 sm:p-6 border border-[#40E0D0]/40 flex flex-col items-center justify-center"
                style={{ backgroundColor: "rgba(64, 224, 208, 0.12)" }}
            >
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-200/80 flex flex-col items-center">
                    <div className="w-full pb-2 mb-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>QRIS</span>
                        <span className="text-[#F77F00] font-extrabold">STANDAR PEMBAYARAN NASIONAL</span>
                    </div>

                    {qrCodeUrl ? (
                        <img
                            src={qrCodeUrl}
                            alt="QRIS Code"
                            className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
                        />
                    ) : (
                        <div className="w-52 h-52 flex flex-col items-center justify-center text-slate-400 gap-2">
                            <QrCode className="w-12 h-12 stroke-[1.5] animate-pulse text-[#281B7A]" />
                            <span className="text-xs font-medium">Memuat QR Code...</span>
                        </div>
                    )}

                    <div className="w-full pt-2 mt-2 border-t border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-medium">
                            NMID: ID1020021118548 | Cibenda Mart
                        </p>
                    </div>
                </div>

                <p className="text-xs text-slate-600 font-medium text-center mt-4 max-w-sm">
                    Buka aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, BCA Mobile, dll), lalu scan kode QR di atas.
                </p>

                {/* Download & Deeplink buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-4 w-full">
                    {qrCodeUrl && (
                        <button
                            onClick={downloadQr}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-[#281B7A] text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
                        >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Kode QR</span>
                        </button>
                    )}

                    {deeplinkUrl && (
                        <a
                            href={deeplinkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#00AA13] hover:bg-[#008f10] text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95"
                        >
                            <Smartphone className="w-3.5 h-3.5" />
                            <span>Buka Aplikasi GoPay</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                        </a>
                    )}
                </div>
            </div>

            {/* Total Pembayaran */}
            <div
                className="rounded-2xl p-4 sm:p-5 border border-[#F77F00]/30 flex items-center justify-between"
                style={{ backgroundColor: "rgba(247, 127, 0, 0.14)" }}
            >
                <div>
                    <span className="text-xs text-slate-500 font-medium">Total Pembayaran</span>
                    <p className="text-xl sm:text-2xl font-black text-[#F77F00] mt-0.5 tracking-tight">
                        {formatRupiah(totalAmount)}
                    </p>
                </div>
                <button
                    onClick={copyAmount}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#F77F00] bg-white border border-[#F77F00] hover:bg-[#F77F00]/5 px-4 py-2.5 rounded-xl shadow-xs transition active:scale-95"
                >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAmount ? "Tersalin" : "Salin Jumlah"}</span>
                </button>
            </div>

            {/* Footer Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>Sistem mengecek mutasi secara otomatis dalam hitungan detik setelah transfer berhasil.</span>
            </div>
        </div>
    );
}
