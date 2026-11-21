import React from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

interface UseMerchantWithdrawalsOptions {
    availableBalance: number;
    hasBankAccount: boolean;
    onRequestEditBank: () => void;
    isWithdrawalEnabled?: boolean;
}

const presetAmounts = [50000, 100000, 250000, 500000];

export function useMerchantWithdrawals({
    availableBalance,
    hasBankAccount,
    onRequestEditBank,
    isWithdrawalEnabled = true,
}: UseMerchantWithdrawalsOptions) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: "",
    });

    const handleSelectPreset = (amount: number) => {
        if (!isWithdrawalEnabled) return;
        if (amount > availableBalance) {
            toast.error("Nominal melebihi saldo yang tersedia.", { id: 'withdrawal-toast' });
            return;
        }
        setData("amount", amount.toString());
    };

    const handleSelectAll = () => {
        if (!isWithdrawalEnabled) return;
        if (availableBalance < 10000) {
            toast.error("Minimal penarikan adalah Rp 10.000", { id: 'withdrawal-toast' });
            return;
        }
        setData("amount", Math.floor(availableBalance).toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isWithdrawalEnabled) {
            toast.error("Layanan penarikan saldo sedang dinonaktifkan sementara oleh admin.", { id: 'withdrawal-toast' });
            return;
        }
        if (!hasBankAccount) {
            toast.error("Silakan lengkapi data rekening bank terlebih dahulu.", { id: 'withdrawal-toast' });
            onRequestEditBank();
            return;
        }

        const numericAmount = parseInt(data.amount, 10) || 0;
        if (!data.amount || numericAmount < 10000) {
            toast.error("Minimal penarikan saldo adalah Rp 10.000", { id: 'withdrawal-toast' });
            return;
        }
        if (numericAmount > availableBalance) {
            toast.error("Nominal penarikan melebihi saldo yang tersedia.", { id: 'withdrawal-toast' });
            return;
        }

        post(route("merchant.withdrawals.store"), {
            preserveScroll: true,
            onSuccess: (page) => {
                const flashErr = (page.props as any)?.flash?.error;
                if (flashErr) {
                    toast.error(flashErr, { id: 'withdrawal-toast', duration: 5000 });
                    return;
                }
                toast.success("Permintaan penarikan saldo berhasil diajukan!", { id: 'withdrawal-toast' });
                reset("amount");
            },
            onError: (errs) => {
                const msg = errs.amount || errs.error || (errs as any)?.message || "Gagal memproses penarikan saldo.";
                toast.error(msg, { id: 'withdrawal-toast', duration: 5000 });
            },
        });
    };

    const currentNumericAmount = parseInt(data.amount, 10) || 0;
    const remainingBalance = Math.max(0, availableBalance - currentNumericAmount);

    return {
        data,
        setData,
        errors,
        processing,
        presetAmounts,
        currentNumericAmount,
        remainingBalance,
        handleSelectPreset,
        handleSelectAll,
        handleSubmit,
    };
}
