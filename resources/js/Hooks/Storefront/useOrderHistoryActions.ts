import { useState } from "react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

export function useOrderHistoryActions() {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const navigateTab = (statusKey: string) => {
        router.get(
            route("history.index"),
            { status: statusKey },
            { preserveState: true },
        );
    };

    const handleCancelOrder = (orderId: number) => {
        router.post(
            route("history.cancel", orderId),
            {},
            {
                preserveState: true,
                onSuccess: (page) => {
                    const flash = page.props.flash as any;
                    if (flash?.error) {
                        toast.error(flash.error);
                    } else if (flash?.success) {
                        toast.success(flash.success);
                        setIsCancelModalOpen(false);
                    } else {
                        toast.success("Pesanan berhasil dibatalkan.");
                        setIsCancelModalOpen(false);
                    }
                },
                onError: () => {
                    toast.error("Gagal membatalkan pesanan.");
                },
            },
        );
    };

    const handleCompleteOrder = (orderId: number) => {
        router.post(
            route("history.complete", orderId),
            {},
            {
                preserveState: true,
                onSuccess: (page) => {
                    const flash = page.props.flash as any;
                    if (flash?.error) {
                        toast.error(flash.error);
                    } else if (flash?.success) {
                        toast.success(flash.success);
                        setIsCompleteModalOpen(false);
                    } else {
                        toast.success("Pesanan selesai! Terima kasih telah berbelanja.");
                        setIsCompleteModalOpen(false);
                    }
                },
                onError: () => {
                    toast.error("Gagal menyelesaikan pesanan.");
                },
            },
        );
    };

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Selesai":
                return "text-[#245D56] bg-[#245D56]/10 border-[#245D56]";
            case "Dibatalkan":
                return "text-red-600 bg-red-50 border-red-600";
            case "Belum Bayar":
                return "text-orange-500 bg-orange-50 border-orange-500";
            case "Dikemas":
            case "Dikirim":
                return "text-blue-500 bg-blue-50 border-blue-500";
            default:
                return "text-gray-600 bg-gray-50 border-gray-600";
        }
    };

    return {
        isCancelModalOpen,
        setIsCancelModalOpen,
        isCompleteModalOpen,
        setIsCompleteModalOpen,
        selectedOrderId,
        setSelectedOrderId,
        navigateTab,
        handleCancelOrder,
        handleCompleteOrder,
        getStatusColor,
    };
}
