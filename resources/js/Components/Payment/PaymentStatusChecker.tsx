import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    orderId: number;
    initialStatus: string;
    onStatusChange: (status: string, redirectUrl?: string) => void;
}

export default function PaymentStatusChecker({
    orderId,
    initialStatus,
    onStatusChange,
}: Props) {
    const [status, setStatus] = useState<string>(initialStatus);
    const [isChecking, setIsChecking] = useState<boolean>(false);

    const checkPaymentStatus = async (isSilent = false) => {
        if (!orderId || status === "paid") return;

        if (!isSilent) setIsChecking(true);

        try {
            const res = await fetch(`/payment/${orderId}/check-status`, {
                headers: {
                    Accept: "application/json",
                },
            });

            if (res.ok) {
                const data = await res.json();
                const newStatus = data.payment_status;

                if (newStatus && newStatus !== status) {
                    setStatus(newStatus);
                    onStatusChange(newStatus, data.redirect_url);

                    if (newStatus === "paid") {
                        toast.success("Pembayaran berhasil diverifikasi!");
                    } else if (newStatus === "failed") {
                        toast.error("Pembayaran kedaluwarsa atau dibatalkan.");
                    }
                } else if (!isSilent) {
                    if (newStatus === "paid") {
                        onStatusChange("paid", data.redirect_url);
                        toast.success("Pembayaran terverifikasi!");
                    } else {
                        toast("Pembayaran belum terdeteksi. Silakan transfer terlebih dahulu.");
                    }
                }
            } else if (!isSilent) {
                toast.error("Gagal memeriksa status pembayaran.");
            }
        } catch (err) {
            if (!isSilent) {
                toast.error("Gagal memeriksa status, periksa koneksi internet.");
            }
        } finally {
            if (!isSilent) setIsChecking(false);
        }
    };

    // Auto-polling every 4 seconds while pending
    useEffect(() => {
        if (status === "paid" || status === "failed") return;

        const interval = setInterval(() => {
            checkPaymentStatus(true);
        }, 4000);

        return () => clearInterval(interval);
    }, [orderId, status]);

    if (status === "paid") {
        return (
            <div className="w-full bg-emerald-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h5 className="font-bold text-sm">Pembayaran Berhasil Diverifikasi!</h5>
                        <p className="text-xs text-emerald-100 mt-0.5">
                            Mengalihkan ke rincian pesanan...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-800 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                    <h5 className="font-bold text-sm">Pembayaran Dibatalkan / Kedaluwarsa</h5>
                    <p className="text-xs text-red-600 mt-0.5">
                        Transaksi ini sudah tidak berlaku. Silakan lakukan pemesanan ulang.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 border border-amber-200">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                </div>
                <div>
                    <h5 className="font-bold text-xs sm:text-sm text-gray-900">
                        Menunggu Pembayaran Transfer
                    </h5>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                        Sistem mengecek mutasi otomatis tiap beberapa detik
                    </p>
                </div>
            </div>

            <button
                onClick={() => checkPaymentStatus(false)}
                disabled={isChecking}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#245D56] hover:bg-[#1a4540] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
                <RefreshCw className={`w-4 h-4 ${isChecking ? "animate-spin" : ""}`} />
                <span>{isChecking ? "Memverifikasi..." : "Cek Status Pembayaran"}</span>
            </button>
        </div>
    );
}
