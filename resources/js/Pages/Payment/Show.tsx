import React, { useState, useEffect, useCallback } from "react";
import { Head, Link, router } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import { ArrowLeft } from "lucide-react";
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
}

export default function PaymentShow({ order, paymentInfo }: Props) {
    const [status, setStatus] = useState<string>(order?.payment_status || "pending");
    const [isChecking, setIsChecking] = useState<boolean>(false);

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
        <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans">
            <Head title={`Pembayaran ${order.invoice_number} - Cibenda Mart`} />
            <Navbar />

            <main className="flex-1 w-full pt-28 pb-24">
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
