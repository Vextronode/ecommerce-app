import React, { useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import MerchantLayout from "@/Layouts/MerchantLayout";
import { HelpCircle, Clock, ShieldCheck, CheckCircle2, Zap, Landmark } from "lucide-react";
import WithdrawalStats from "@/Components/Merchant/Withdrawal/WithdrawalStats";
import BankAccountCard from "@/Components/Merchant/Withdrawal/BankAccountCard";
import WithdrawFormCard from "@/Components/Merchant/Withdrawal/WithdrawFormCard";
import WithdrawalHistoryTable from "@/Components/Merchant/Withdrawal/WithdrawalHistoryTable";

interface StoreInfo {
    id: number;
    name: string;
    available_balance: number;
    pending_balance: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
}

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

interface Props {
    store: StoreInfo;
    withdrawals: WithdrawalItem[];
    stats: {
        available_balance: number;
        pending_balance: number;
        total_withdrawn: number;
        total_earnings: number;
    };
}

export default function Index({ store, withdrawals, stats }: Props) {
    const hasBankAccount = Boolean(
        store.bank_name && store.bank_account_number && store.bank_account_holder
    );

    const handleRequestEditBank = () => {
        const el = document.getElementById("bank-account-section");
        el?.scrollIntoView({ behavior: "smooth" });
    };

    // Real-Time WebSocket Listener for Payouts
    useEffect(() => {
        if (!store?.id || typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.private(`store.${store.id}`);

        const handleWithdrawalUpdated = (e: any) => {
            // Instantly refresh withdrawals table, store balance, and stats without full reload
            router.reload({
                only: ["withdrawals", "stats", "store"],
            });

            if (e?.withdrawal) {
                const wd = e.withdrawal;
                const formattedAmount = `Rp ${Number(wd.amount).toLocaleString("id-ID")}`;

                if (wd.status === "completed") {
                    toast.success(
                        `Penarikan dana ${formattedAmount} ke rekening ${wd.bank_name} berhasil dicairkan!`,
                        { id: `wd-status-${wd.id}`, duration: 6000 }
                    );
                } else if (wd.status === "failed") {
                    toast.error(
                        `Penarikan dana ${formattedAmount} gagal diproses. Saldo dikembalikan ke toko.`,
                        { id: `wd-status-${wd.id}`, duration: 6000 }
                    );
                }
            }
        };

        channel.listen(".WithdrawalUpdated", handleWithdrawalUpdated);
        channel.listen("WithdrawalUpdated", handleWithdrawalUpdated);

        return () => {
            window.Echo.leave(`store.${store.id}`);
        };
    }, [store?.id]);

    return (
        <MerchantLayout>
            <Head title="Penarikan Saldo Toko - Cibenda Mart" />

            <div className="w-full">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-extrabold text-brand-orange flex items-center gap-2">
                        Penarikan Saldo Toko
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium">
                        Kelola pencairan saldo toko secara langsung ke rekening bank via{" "}
                        <span className="font-bold text-brand-orange">Midtrans IRIS</span>
                    </p>
                </div>

                <WithdrawalStats
                    availableBalance={stats.available_balance}
                    pendingBalance={stats.pending_balance}
                    totalWithdrawn={stats.total_withdrawn}
                    totalEarnings={stats.total_earnings}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 items-start">
                    <div className="space-y-4 md:space-y-6">
                        <WithdrawFormCard
                            availableBalance={stats.available_balance}
                            hasBankAccount={hasBankAccount}
                            onRequestEditBank={handleRequestEditBank}
                        />

                        <BankAccountCard store={store} />
                    </div>

                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <WithdrawalHistoryTable withdrawals={withdrawals} />

                        <div className="bg-white rounded-2xl p-5 md:p-6 border border-brand-orange/20 shadow-sm space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-orange-tint rounded-xl flex items-center justify-center shrink-0">
                                    <HelpCircle className="w-5 h-5 text-brand-orange" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-gray-900">
                                        Panduan & Ketentuan Penarikan Saldo
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Informasi penting terkait sistem pencairan dana Midtrans IRIS
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-brand-orange-soft p-4 rounded-xl border border-brand-orange/20 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-extrabold text-brand-orange-dark">
                                        <Clock className="w-4 h-4 text-brand-orange" />
                                        Proses Instant 24/7
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                        Pencairan saldo diproses secara otomatis via Midtrans IRIS dan langsung masuk ke rekening bank kamu.
                                    </p>
                                </div>

                                <div className="bg-brand-orange-soft p-4 rounded-xl border border-brand-orange/20 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-extrabold text-brand-orange-dark">
                                        <ShieldCheck className="w-4 h-4 text-brand-orange" />
                                        Minimal Penarikan
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                        Minimal saldo yang dapat ditarik adalah Rp 10.000 per transaksi penarikan.
                                    </p>
                                </div>

                                <div className="bg-brand-orange-soft p-4 rounded-xl border border-brand-orange/20 space-y-1.5">
                                    <div className="flex items-center gap-2 text-xs font-extrabold text-brand-orange-dark">
                                        <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                                        Bebas Biaya Admin
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                        Platform Cibenda Mart menanggung seluruh biaya transfer antar bank untuk pedagang.
                                    </p>
                                </div>
                            </div>

                            {/* Extra Tips Row */}
                            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 font-medium">
                                <div className="flex items-start gap-2">
                                    <Zap className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-gray-900 font-bold">Verifikasi Rekening:</strong> Pastikan nama pemilik rekening sama dengan nama toko/akun untuk memperlancar pencairan.
                                    </span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Landmark className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                                    <span>
                                        <strong className="text-gray-900 font-bold">Laporan Real-time:</strong> Setiap penarikan dilengkapi dengan No. Referensi resmi dari Midtrans IRIS.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
