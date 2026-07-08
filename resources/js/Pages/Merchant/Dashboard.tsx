import React from "react";
import { Head } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import StatCards from "@/Components/Merchant/Dashboard/StatsCards";
import OrderStatus from "@/Components/Merchant/Dashboard/OrderStatus";
import TopSelling from "@/Components/Merchant/Dashboard/TopSelling";
import SalesChart from "@/Components/Merchant/Dashboard/SalesChart";
import RecentOrders from "@/Components/Merchant/Dashboard/RecentOrders";

export default function Dashboard() {
    return (
        <MerchantLayout>
            <Head title="Dashboard Pedagang" />

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                    Selamat pagi, Penjual{" "}
                </h1>
                <p className="text-gray-500 mt-1 text-sm font-medium">
                    Produk apa yang akan kamu jual hari ini?
                </p>
            </div>

            <StatCards />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* chart */}
                <div className="lg:col-span-2">
                    <SalesChart />
                </div>

                <div className="space-y-6 flex flex-col">
                    <div className="flex-1 min-h-55">
                        <OrderStatus />
                    </div>
                    <div className="flex-1 min-h-70">
                        <TopSelling />
                    </div>
                </div>
            </div>
            {/*recent orders*/}
            <RecentOrders />
        </MerchantLayout>
    );
}
