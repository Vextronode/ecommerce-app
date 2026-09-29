import { useState } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

export function useSetupStoreForm(initialStoreName: string = "") {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        store_name: initialStoreName,
        password: "",
        password_confirmation: "",
    });

    const [formWarning, setFormWarning] = useState<string | null>(null);

    const validate = (): boolean => {
        clearErrors();
        setFormWarning(null);

        let isValid = true;
        const newErrors: Record<string, string> = {};

        if (!data.store_name || data.store_name.trim().length === 0) {
            newErrors.store_name = "Nama toko / usaha wajib diisi.";
            isValid = false;
        } else if (data.store_name.trim().length < 3) {
            newErrors.store_name = "Nama toko / usaha minimal 3 karakter.";
            isValid = false;
        }

        if (!data.password) {
            newErrors.password = "Kata sandi baru wajib diisi.";
            isValid = false;
        } else if (data.password.length < 8) {
            newErrors.password = "Kata sandi baru minimal 8 karakter.";
            isValid = false;
        }

        if (!data.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi kata sandi wajib diisi.";
            isValid = false;
        } else if (data.password && data.password !== data.password_confirmation) {
            newErrors.password_confirmation = "Konfirmasi kata sandi tidak cocok.";
            isValid = false;
        }

        if (!isValid) {
            Object.entries(newErrors).forEach(([key, msg]) => {
                setError(key as any, msg);
            });
            const firstMsg =
                Object.values(newErrors)[0] ||
                "Mohon lengkapi semua kolom yang wajib diisi.";
            setFormWarning(firstMsg);
            toast.error(firstMsg);
        }

        return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        post(route("merchant.store.store"), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success("Toko dan password berhasil diatur!");
            },
            onError: (errs) => {
                const firstError =
                    Object.values(errs)[0] ||
                    "Gagal mengatur toko. Periksa formulir kembali.";
                setFormWarning(firstError);
                toast.error(firstError);
            },
        });
    };

    return {
        data,
        setData,
        processing,
        errors,
        formWarning,
        handleSubmit,
    };
}
