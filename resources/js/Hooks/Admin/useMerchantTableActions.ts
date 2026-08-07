import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";
import type { MerchantItem } from "@/Components/Admin/Merchants/AdminMerchantTable";

export function useMerchantTableActions() {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [selectedForEdit, setSelectedForEdit] = useState<MerchantItem | null>(null);
    const [selectedForDelete, setSelectedForDelete] = useState<MerchantItem | null>(null);

    const toggleDropdown = (id: number) => {
        setActiveDropdown((prev) => (prev === id ? null : id));
    };

    const handleQuickStatus = (id: number, newStatus: string) => {
        setActiveDropdown(null);
        router.patch(
            route("admin.merchants.status", id),
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status akun berhasil diubah menjadi ${newStatus}.`);
                },
            },
        );
    };

    const handleQuickVerification = (storeId: number | undefined, newSidStatus: string) => {
        if (!storeId) return;
        setActiveDropdown(null);
        router.patch(
            route("admin.merchants.verification", storeId),
            { sid_status: newSidStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status verifikasi toko berhasil diubah menjadi ${newSidStatus}.`);
                },
            },
        );
    };

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    return {
        activeDropdown,
        setActiveDropdown,
        toggleDropdown,
        selectedForEdit,
        setSelectedForEdit,
        selectedForDelete,
        setSelectedForDelete,
        handleQuickStatus,
        handleQuickVerification,
    };
}
