import React from "react";
import { Head } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import OrderSummaryCard from "@/Components/Merchant/Orders/OrderSummaryCard";
import OrderTable from "@/Components/Merchant/Orders/OrderTable";

export default function OrderManagement({ orders, stats }: any) {
    return (
        <MerchantLayout>
            <Head title="Order Management - Cibenda Mart" />

            <div className="p-4 md:p-8 w-full bg-[#F5F8FA] min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#14433D] mb-1">
                        Order Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Manage and track your recent sales.
                    </p>
                </div>

                <OrderSummaryCard stats={stats} />

                <OrderTable orders={orders} />
            </div>
        </MerchantLayout>
    );
}
