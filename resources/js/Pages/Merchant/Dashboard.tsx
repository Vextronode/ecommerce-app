import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import StatCards from "@/Components/Merchant/Dashboard/StatCards";
import OrderStatus from "@/Components/Merchant/Dashboard/OrderStatus";
import TopSelling from "@/Components/Merchant/Dashboard/TopSelling";
import SalesChart from "@/Components/Merchant/Dashboard/SalesChart";
import RecentOrders from "@/Components/Merchant/Dashboard/RecentOrders";

interface DashboardProps {
    merchantInfo: { name: string; store_name: string };
    stats: {
        sales: number;
        orders: number;
        customers: number;
        products: number;
    };
    chartData: any[];
    recentOrders: any[];
    topSelling: any[];
    orderStatus: {
        pending: number;
        processing: number;
        shipped: number;
        completed: number;
    };
}

export default function Dashboard({
    merchantInfo,
    stats,
    chartData,
    recentOrders,
    topSelling,
    orderStatus,
}: DashboardProps) {
    const [greeting, setGreeting] = useState("Selamat Datang");

    useEffect(() => {
        const hours = new Date().getHours();
        if (hours >= 4 && hours < 11) {
            setGreeting("Selamat Pagi");
        } else if (hours >= 11 && hours < 15) {
            setGreeting("Selamat Siang");
        } else if (hours >= 15 && hours < 18) {
            setGreeting("Selamat Sore");
        } else {
            setGreeting("Selamat Malam");
        }
    }, []);

    return (
        <MerchantLayout>
            <Head title={`Dashboard - ${merchantInfo.store_name}`} />

            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-xl md:text-2xl font-extrabold text-[#004F54] flex items-center gap-2">
                    {greeting}, {merchantInfo.name}
                </h1>
                <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium">
                    Toko{" "}
                    <span className="font-bold text-[#41B9C5]">
                        {merchantInfo.store_name}
                    </span>{" "}
                    siap beroperasi hari ini!
                </p>
            </div>

            <StatCards statsData={stats} />

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="lg:col-span-2">
                    <SalesChart chartData={chartData} />
                </div>
                <div className="space-y-4 md:space-y-6 flex flex-col">
                    <div className="flex-1 min-h-55">
                        <OrderStatus statusData={orderStatus} />
                    </div>
                    <div className="flex-1 min-h-70">
                        <TopSelling products={topSelling} />
                    </div>
                </div>
            </div>

            <RecentOrders orders={recentOrders} />
        </MerchantLayout>
    );
}
