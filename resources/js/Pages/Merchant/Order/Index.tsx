import React, { useState, useEffect } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import OrderSummaryCard from "@/Components/Merchant/Orders/OrderSummaryCard";
import OrderTable from "@/Components/Merchant/Orders/OrderTable";
import UpdateStatusModal from "@/Components/Merchant/Orders/UpdateStatusModal";

export default function OrderManagement({ orders, stats }: any) {
    const { auth } = usePage().props as any;
    const storeId = auth?.user?.store?.id;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const handleOpenModal = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Real-Time WebSocket Listener for Store Orders
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const handleUpdate = () => {
            router.reload({ only: ["orders", "stats"] });
        };

        // private channel — auth required
        let storeChan: any = null;
        if (storeId) {
            storeChan = window.Echo.private(`store-orders.${storeId}`);
            storeChan.listen(".OrderStatusUpdated", handleUpdate);
            storeChan.listen("OrderStatusUpdated", handleUpdate);
        }

        return () => {
            if (storeId) {
                window.Echo.leave(`store-orders.${storeId}`);
            }
        };
    }, [storeId]);

    return (
        <MerchantLayout>
            <Head title="Kelola Pesanan - Cibenda Mart" />

            <div className="w-full">
                <div className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-extrabold text-brand-orange">
                        Kelola Pesanan
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs md:text-sm">
                        Kelola dan lacak pesanan toko Anda secara real-time.
                    </p>
                </div>

                <OrderSummaryCard stats={stats} />

                <OrderTable orders={orders} onOpenAction={handleOpenModal} />
            </div>

            <UpdateStatusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                order={selectedOrder}
            />
        </MerchantLayout>
    );
}
