import React from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

interface UseMerchantWithdrawalsOptions {
    availableBalance: number;
    hasBankAccount: boolean;
    onRequestEditBank: () => void;
}

const presetAmounts = [50000, 100000, 250000, 500000];

export function useMerchantWithdrawals({
    availableBalance,
    hasBankAccount,
    onRequestEditBank,
}: UseMerchantWithdrawalsOptions) {
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: "",
    });

    const handleSelectPreset = (amount: number) => {
        if (amount > availableBalance) {
            toast.error("Nominal melebihi saldo yang tersedia.", { id: 'withdrawal-toast' });
            return;
        }
        setData("amount", amount.toString());
    };

    const handleSelectAll = () => {
        if (availableBalance < 10000) {
            toast.error("Minimal penarikan adalah Rp 10.000", { id: 'withdrawal-toast' });
            return;
        }
        setData("amount", Math.floor(availableBalance).toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasBankAccount) {
            toast.error("Silakan lengkapi data rekening bank terlebih dahulu.", { id: 'withdrawal-toast' });
            onRequestEditBank();
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

    const currentNumericAmount = parseFloat(data.amount) || 0;
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
