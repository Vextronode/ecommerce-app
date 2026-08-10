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
            toast.error("Nominal melebihi saldo yang tersedia.");
            return;
        }
        setData("amount", amount.toString());
    };

    const handleSelectAll = () => {
        if (availableBalance < 10000) {
            toast.error("Minimal penarikan adalah Rp 10.000");
            return;
        }
        setData("amount", Math.floor(availableBalance).toString());
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasBankAccount) {
            toast.error("Silakan lengkapi data rekening bank terlebih dahulu.");
            onRequestEditBank();
            return;
        }

        post(route("merchant.withdrawals.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Penarikan saldo berhasil diproses!");
                reset("amount");
            },
            onError: (errs) => {
                toast.error(errs.amount || "Gagal memproses penarikan saldo.");
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
