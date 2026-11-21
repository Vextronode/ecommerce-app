import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import MerchantLayout from "@/Layouts/MerchantLayout";
import { HelpCircle, Clock, ShieldCheck, CheckCircle2, Zap, Landmark, Info } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";
import WithdrawalStats from "@/Components/Merchant/Withdrawal/WithdrawalStats";
import BankAccountCard from "@/Components/Merchant/Withdrawal/BankAccountCard";
import WithdrawFormCard from "@/Components/Merchant/Withdrawal/WithdrawFormCard";
import WithdrawalHistoryTable from "@/Components/Merchant/Withdrawal/WithdrawalHistoryTable";
import { useInertiaNetworkLoading } from "@/Hooks/useInertiaNetworkLoading";

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
        total_cod?: number;
        total_digital?: number;
    };
    isWithdrawalEnabled?: boolean;
}

export default function Index({ store, withdrawals, stats, isWithdrawalEnabled = true }: Props) {
    const isNetworkLoading = useInertiaNetworkLoading();
    const [withdrawalAvailable, setWithdrawalAvailable] = useState<boolean>(isWithdrawalEnabled);

    useEffect(() => {
        if (typeof isWithdrawalEnabled !== "undefined") {
            setWithdrawalAvailable(isWithdrawalEnabled);
        }
    }, [isWithdrawalEnabled]);

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

    // Real-time synchronization of emergency withdrawal killswitch
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const settingsChannel = window.Echo.channel("platform-settings");

        const handleSettingsUpdated = (e: { settings?: Record<string, any>; changed_keys?: string[] }) => {
            const changedKeys = Array.isArray(e?.changed_keys) ? e.changed_keys : [];
            const keyChanged = changedKeys.length === 0 || changedKeys.includes("enable_withdrawal");

            if (keyChanged && e?.settings && typeof e.settings.enable_withdrawal !== "undefined") {
                const enabled = Boolean(e.settings.enable_withdrawal);
                setWithdrawalAvailable((prev) => {
                    if (prev !== enabled) {
                        if (!enabled) {
                            toast.error(
                                "Layanan penarikan saldo pedagang dinonaktifkan sementara oleh admin.",
                                { id: "wd-killswitch-toast", duration: 5000 }
                            );
                        } else {
                            toast.success(
                                "Layanan penarikan saldo pedagang telah aktif kembali.",
                                { id: "wd-killswitch-toast", duration: 4000 }
                            );
                        }
                    }
                    return enabled;
                });
            }
        };

        settingsChannel.listen(".PlatformSettingsUpdated", handleSettingsUpdated);
        settingsChannel.listen("PlatformSettingsUpdated", handleSettingsUpdated);

        return () => {
            window.Echo.leaveChannel("platform-settings");
        };
    }, []);

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

                <div id="tour-withdrawals-stats">
                    <WithdrawalStats
                        availableBalance={stats.available_balance}
                        pendingBalance={stats.pending_balance}
                        totalWithdrawn={stats.total_withdrawn}
                        totalEarnings={stats.total_earnings}
                        totalCod={stats.total_cod}
                        totalDigital={stats.total_digital}
                    />
                </div>

                {stats.total_earnings > 0 && (
                    <div className="mb-6 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/60 rounded-2xl p-4 md:p-5 border border-brand-orange/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-brand-orange-tint flex items-center justify-center shrink-0 mt-0.5">
                                <Info className="w-5 h-5 text-brand-orange" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    Informasi Saldo & Total Penjualan
                                </h4>
                                <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                                    Total Penjualan Anda tercatat sebesar <span className="font-bold text-gray-800">{formatRupiah(stats.total_earnings)}</span> (sinkron dengan Laporan & Analisis).
                                    {stats.total_cod && stats.total_cod > 0 ? (
                                        <>
                                            {" "}Sebesar <span className="font-bold text-brand-orange-dark">{formatRupiah(stats.total_cod)}</span> merupakan transaksi <strong className="font-semibold text-gray-800">COD (Bayar di Tempat)</strong> di mana uang tunai sudah langsung diterima oleh pedagang/kurir secara fisik dan tidak masuk ke saldo dompet digital platform.
                                        </>
                                    ) : null}
                                    {stats.pending_balance > 0 ? (
                                        <>
                                            {" "}Terdapat <span className="font-bold text-amber-700">{formatRupiah(stats.pending_balance)}</span> saldo pesanan online yang sedang tertahan aman (Escrow) dan akan otomatis masuk ke <strong>Saldo Siap Ditarik</strong> setelah pembeli menerima paket.
                                        </>
                                    ) : null}
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2 text-xs font-semibold text-brand-orange self-start md:self-center">
                            <span className="px-3 py-1.5 rounded-xl bg-white border border-brand-orange/30 shadow-2xs">
                                COD: Tunai di Tangan
                            </span>
                            <span className="px-3 py-1.5 rounded-xl bg-white border border-brand-orange/30 shadow-2xs">
                                Online: Dompet Digital
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 items-start">
                    <div className="space-y-4 md:space-y-6">
                        <div id="tour-withdrawals-form">
                            <WithdrawFormCard
                                availableBalance={stats.available_balance}
                                hasBankAccount={hasBankAccount}
                                onRequestEditBank={handleRequestEditBank}
                                isWithdrawalEnabled={withdrawalAvailable}
                            />
                        </div>

                        <div id="tour-withdrawals-bank">
                            <BankAccountCard store={store} />
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <div id="tour-withdrawals-history">
                            <WithdrawalHistoryTable withdrawals={withdrawals} isLoading={isNetworkLoading} />
                        </div>

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
