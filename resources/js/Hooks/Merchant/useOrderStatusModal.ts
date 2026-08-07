import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

interface UseOrderStatusModalOptions {
    isOpen: boolean;
    order: any;
    onClose: () => void;
}

export function useOrderStatusModal({
    isOpen,
    order,
    onClose,
}: UseOrderStatusModalOptions) {
    const { data, setData, put, processing, reset } = useForm({
        shipping_status: "pending",
    });

    useEffect(() => {
        if (order) {
            setData("shipping_status", order.shipping_status || "pending");
        }
    }, [order, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!order) return;

        put(route("merchant.orders.update-status", order.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Status pengiriman pesanan berhasil diperbarui!");
                onClose();
                reset();
            },
            onError: () => {
                toast.error("Gagal memperbarui status pesanan.");
            },
        });
    };

    return {
        data,
        setData,
        processing,
        handleSubmit,
    };
}
