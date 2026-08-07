import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

export function useSetupStoreForm(initialStoreName: string = "") {
    const { data, setData, post, processing, errors, reset } = useForm({
        store_name: initialStoreName,
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("merchant.store.store"), {
            onSuccess: () => {
                toast.success("Toko dan password berhasil diatur!");
            },
            onError: () => {
                reset("password", "password_confirmation");
                toast.error("Gagal mengatur toko. Periksa formulir.");
            },
        });
    };

    return {
        data,
        setData,
        processing,
        errors,
        handleSubmit,
    };
}
