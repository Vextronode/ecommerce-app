import { useState } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

interface StoreBankData {
    id: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_holder: string;
}

interface UseMerchantBankAccountOptions {
    store: StoreBankData;
}

export function useMerchantBankAccount({ store }: UseMerchantBankAccountOptions) {
    const [isEditing, setIsEditing] = useState(
        !store.bank_name || !store.bank_account_number || !store.bank_account_holder,
    );

    const { data, setData, put, processing, errors } = useForm({
        bank_name: store.bank_name || "bca",
        bank_account_number: store.bank_account_number || "",
        bank_account_holder: store.bank_account_holder || "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("merchant.withdrawals.update-bank"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Informasi rekening bank berhasil diperbarui!");
                setIsEditing(false);
            },
            onError: () => {
                toast.error("Gagal menyimpan rekening bank. Periksa inputan kamu.");
            },
        });
    };

    return {
        isEditing,
        setIsEditing,
        data,
        setData,
        processing,
        errors,
        handleSubmit,
    };
}
