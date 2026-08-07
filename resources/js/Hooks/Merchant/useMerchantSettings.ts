import { useState, useRef } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

interface MerchantUser {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    profile_photo_path: string | null;
}

interface MerchantStore {
    id: number;
    name: string;
    username?: string | null;
    support_email: string | null;
    description: string | null;
    address: string | null;
}

interface UseMerchantSettingsOptions {
    merchantUser: MerchantUser;
    merchantStore: MerchantStore;
}

export function useMerchantSettings({
    merchantUser,
    merchantStore,
}: UseMerchantSettingsOptions) {
    const [activeTab, setActiveTab] = useState("Information");
    const photoInput = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(
        merchantUser.profile_photo_path,
    );

    const { data, setData, post, processing, errors, isDirty } = useForm({
        name: merchantUser.name || "",
        email: merchantUser.email || "",
        phone: merchantUser.phone || "",
        photo: null as File | null,
        store_name: merchantStore.name || "",
        username: merchantStore.username || "",
        support_email: merchantStore.support_email || "",
        store_description: merchantStore.description || "",
        store_address: merchantStore.address || "",
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("Ukuran foto maksimal 2MB.");
                return;
            }
            setData("photo", file);
            const reader = new FileReader();
            reader.onload = (ev) =>
                setPhotoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("merchant.settings.update"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Pengaturan profil dan toko berhasil disimpan!");
            },
            onError: () => {
                toast.error("Gagal menyimpan pengaturan. Periksa formulir.");
            },
        });
    };

    return {
        activeTab,
        setActiveTab,
        photoInput,
        photoPreview,
        data,
        setData,
        processing,
        errors,
        isDirty,
        handlePhotoChange,
        handleSubmit,
    };
}
