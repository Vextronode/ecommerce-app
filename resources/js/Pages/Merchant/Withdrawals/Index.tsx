import React from "react";
import { Head } from "@inertiajs/react";
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

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const handleRequestEditBank = () => {
        // Edit bank fallback handler
    };

    return (
        <MerchantLayout>
            <Head title="Penarikan Saldo Toko - Cibenda Mart" />

            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                        Penarikan Saldo Toko
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium">
                        Kelola pencairan saldo toko secara langsung ke rekening bank via{" "}
                        <span className="font-bold text-[#41B9C5]">Midtrans IRIS</span>
                    </p>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAF7F7] border border-[#41B9C5]/40 rounded-full text-[#004F54] text-xs font-bold shrink-0 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Midtrans IRIS Sandbox Active
                </div>
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

                    <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#41B9C5]/30 shadow-sm space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#F0FAFB] rounded-full flex items-center justify-center shrink-0">
                                <HelpCircle className="w-5 h-5 text-[#41B9C5]" />
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
                            <div className="bg-[#F0FAFB] p-4 rounded-2xl border border-[#41B9C5]/20 space-y-1.5">
                                <div className="flex items-center gap-2 text-xs font-extrabold text-[#004F54]">
                                    <Clock className="w-4 h-4 text-[#41B9C5]" />
                                    Proses Instant 24/7
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                    Pencairan saldo diproses secara otomatis via Midtrans IRIS dan langsung masuk ke rekening bank kamu.
                                </p>
                            </div>

                            <div className="bg-[#F0FAFB] p-4 rounded-2xl border border-[#41B9C5]/20 space-y-1.5">
                                <div className="flex items-center gap-2 text-xs font-extrabold text-[#004F54]">
                                    <ShieldCheck className="w-4 h-4 text-[#41B9C5]" />
                                    Minimal Penarikan
                                </div>
                                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                                    Minimal saldo yang dapat ditarik adalah Rp 10.000 per transaksi penarikan.
                                </p>
                            </div>

                            <div className="bg-[#F0FAFB] p-4 rounded-2xl border border-[#41B9C5]/20 space-y-1.5">
                                <div className="flex items-center gap-2 text-xs font-extrabold text-[#004F54]">
                                    <CheckCircle2 className="w-4 h-4 text-[#41B9C5]" />
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
                                <Zap className="w-4 h-4 text-[#41B9C5] shrink-0 mt-0.5" />
                                <span>
                                    <strong className="text-gray-900 font-bold">Verifikasi Rekening:</strong> Pastikan nama pemilik rekening sama dengan nama toko/akun untuk memperlancar pencairan.
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <Landmark className="w-4 h-4 text-[#41B9C5] shrink-0 mt-0.5" />
                                <span>
                                    <strong className="text-gray-900 font-bold">Laporan Real-time:</strong> Setiap penarikan dilengkapi dengan No. Referensi resmi dari Midtrans IRIS.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
