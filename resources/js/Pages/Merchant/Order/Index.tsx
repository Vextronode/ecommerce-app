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
        if (!storeId || typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.private(`store.${storeId}`);

        channel.listen(".OrderStatusUpdated", () => {
            // Instantly refresh orders and stats without full page reload
            router.reload({ only: ["orders", "stats"] });
        });

        return () => {
            window.Echo.leaveChannel(`private-store.${storeId}`);
        };
    }, [storeId]);

    return (
        <MerchantLayout>
            <Head title="Order Management - Cibenda Mart" />

            <div className="p-4 md:p-8 w-full bg-[#F5F8FA] min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#14433D] mb-1">
                        Order Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage and track your recent sales in real time.
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
