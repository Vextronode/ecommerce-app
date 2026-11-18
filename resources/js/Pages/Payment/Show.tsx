import React, { useState, useEffect, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

import CountdownTimer from "@/Components/Payment/CountdownTimer";
import VirtualAccountCard from "@/Components/Payment/VirtualAccountCard";
import QrisCard from "@/Components/Payment/QrisCard";
import PaymentInstructionsTabs from "@/Components/Payment/PaymentInstructionsTabs";
import OrderDetailsCard, { OrderData } from "@/Components/Payment/OrderDetailsCard";
import PaymentHelpCard from "@/Components/Payment/PaymentHelpCard";

interface PaymentInfo {
    method: string;
    channel: string;
    type?: string;
    va_number?: string | null;
    bill_key?: string | null;
    biller_code?: string | null;
    qr_code_url?: string | null;
    deeplink_url?: string | null;
    expiry_time?: string | null;
    is_expired?: boolean;
}

interface Props {
    order: OrderData;
    paymentInfo: PaymentInfo;
    isOnlinePaymentEnabled?: boolean;
}

export default function PaymentShow({ order, paymentInfo, isOnlinePaymentEnabled = true }: Props) {
    const [status, setStatus] = useState<string>(order?.payment_status || "pending");
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [onlinePaymentAvailable, setOnlinePaymentAvailable] = useState<boolean>(isOnlinePaymentEnabled);
    const [isSwitching, setIsSwitching] = useState<boolean>(false);
    const [isAlertExpanded, setIsAlertExpanded] = useState<boolean>(false);

    const handleSwitchToCod = () => {
        if (isSwitching) return;
        setIsSwitching(true);
        router.post(
            route("payment.switch-to-cod", { order: order.id }),
            {},
            {
                onSuccess: () => {
                    toast.success("Pesanan berhasil dialihkan ke COD!");
                },
                onError: (errs) => {
                    setIsSwitching(false);
                    const firstErr = Object.values(errs)[0];
                    toast.error(typeof firstErr === "string" ? firstErr : "Gagal mengalihkan pesanan ke COD.");
                },
            }
        );
    };

    // Real-time status verification
    const handleCheckStatus = useCallback(
        async (isSilent = false) => {
            if (!order?.id || status === "paid") return;

            if (!isSilent) setIsChecking(true);

            try {
                const res = await fetch(`/payment/${order.id}/check-status`, {
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    const newStatus = data.payment_status;

                    if (data.is_online_payment_enabled !== undefined) {
                        setOnlinePaymentAvailable(data.is_online_payment_enabled);
                    }

                    if (newStatus && newStatus !== status) {
                        setStatus(newStatus);

                        if (newStatus === "paid") {
                            toast.success("Pembayaran Berhasil Diverifikasi!");
                            setTimeout(() => {
                                router.visit(
                                    data.redirect_url || route("checkout.success", { order_id: order.id })
                                );
                            }, 600);
                        } else if (newStatus === "failed") {
                            toast.error("Pembayaran kedaluwarsa atau dibatalkan.");
                        }
                    } else if (!isSilent) {
                        if (newStatus === "paid") {
                            toast.success("Pembayaran terverifikasi! Mengalihkan...");
                            setTimeout(() => {
                                router.visit(
                                    data.redirect_url || route("checkout.success", { order_id: order.id })
                                );
                            }, 600);
                        } else {
                            toast("Pembayaran belum terdeteksi. Silakan selesaikan transfer Anda.");
                        }
                    }
                } else if (!isSilent) {
                    toast.error("Gagal memeriksa status pembayaran.");
                }
            } catch (err) {
                if (!isSilent) {
                    toast.error("Periksa koneksi internet Anda.");
                }
            } finally {
                if (!isSilent) setIsChecking(false);
            }
        },
        [order?.id, status]
    );

    // Auto-polling every 4 seconds
    useEffect(() => {
        if (status === "paid" || status === "failed") return;

        const interval = setInterval(() => {
            handleCheckStatus(true);
        }, 4000);

        return () => clearInterval(interval);
    }, [handleCheckStatus, status]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Head title={`Pembayaran ${order.invoice_number} - Cibenda Mart`} />

            <main className="flex-1 w-full py-8 md:py-12">
                <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                    {/* Navigation & Invoice */}
                    <div className="flex items-center justify-between text-xs sm:text-sm py-1">
                        <Link
                            href={route("history.index")}
                            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition gap-1.5 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Kembali ke Riwayat Pesanan</span>
                        </Link>
                        <div className="text-slate-500 font-medium text-xs sm:text-sm">
                            <span>Invoice: </span>
                            <span className="font-mono font-bold text-slate-700">
                                {order.invoice_number}
                            </span>
                        </div>
                    </div>

                    {/* Notice if Online Payment was turned off while buyer is on page */}
                    {!onlinePaymentAvailable && status === "pending" && (
                        <div className="sticky top-3 sm:top-4 z-50 bg-status-warning-tint/95 backdrop-blur-md border border-status-warning/40 rounded-2xl p-3 sm:p-4 text-status-warning-dark shadow-lg shadow-status-warning/10 transition-all">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-status-warning-dark shrink-0" />
                                    <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                                            Pembayaran Online Nonaktif
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setIsAlertExpanded(!isAlertExpanded)}
                                            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-status-warning-dark hover:underline cursor-pointer"
                                        >
                                            <span>{isAlertExpanded ? "Sembunyikan info" : "Lihat rincian"}</span>
                                            {isAlertExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={handleSwitchToCod}
                                        disabled={isSwitching}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-brand-orange hover:bg-brand-orange-hover active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                                    >
                                        {isSwitching ? "Mengalihkan..." : "Alihkan Pesanan ke COD"}
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible Accordion Content */}
                            {isAlertExpanded && (
                                <div className="mt-2.5 pt-2.5 border-t border-status-warning/20 text-[11px] sm:text-xs text-slate-700 leading-relaxed space-y-1.5">
                                    <p>
                                        Layanan transfer online sedang dalam pemeliharaan. Jika Anda sudah terlanjur melakukan transfer di m-banking, pembayaran Anda <strong>tetap akan terverifikasi secara otomatis</strong>.
                                    </p>
                                    <p>
                                        Namun jika <strong>belum sempat transfer</strong>, Anda dapat langsung mengalihkan pesanan ini ke metode <strong>Bayar di Tempat (COD)</strong> tanpa perlu transfer.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hero Countdown Timer Banner */}
                    <CountdownTimer
                        expiryTime={paymentInfo?.expiry_time}
                        onExpire={() => setStatus("failed")}
                    />

                    {/* Virtual Account or QRIS Card */}
                    {paymentInfo?.method === "va" && (
                        <VirtualAccountCard
                            channel={paymentInfo.channel}
                            vaNumber={paymentInfo.va_number}
                            billKey={paymentInfo.bill_key}
                            billerCode={paymentInfo.biller_code}
                            totalAmount={Number(order.total_amount)}
                        />
                    )}

                    {(paymentInfo?.method === "qris" || paymentInfo?.method === "gopay") && (
                        <QrisCard
                            qrCodeUrl={paymentInfo.qr_code_url}
                            deeplinkUrl={paymentInfo.deeplink_url}
                            totalAmount={Number(order.total_amount)}
                            channel={paymentInfo.channel}
                        />
                    )}

                    {/* Petunjuk Pembayaran */}
                    <PaymentInstructionsTabs
                        channel={paymentInfo?.channel}
                        vaNumber={paymentInfo?.va_number}
                        billerCode={paymentInfo?.biller_code}
                        billKey={paymentInfo?.bill_key}
                        totalAmount={Number(order.total_amount)}
                    />

                    {/* Rincian Pesanan & Action Buttons */}
                    <OrderDetailsCard
                        order={order}
                        expiryTime={paymentInfo?.expiry_time}
                        isChecking={isChecking}
                        onCheckStatus={() => handleCheckStatus(false)}
                    />

                    {/* Customer Support Footer Card */}
                    <PaymentHelpCard />
                </div>
            </main>
        </div>
    );
}
