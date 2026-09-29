import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import StatCards from "@/Components/Merchant/Dashboard/StatCards";
import OrderStatus from "@/Components/Merchant/Dashboard/OrderStatus";
import TopSelling from "@/Components/Merchant/Dashboard/TopSelling";
import SalesChart from "@/Components/Merchant/Dashboard/SalesChart";
import RecentOrders from "@/Components/Merchant/Dashboard/RecentOrders";
import StoreAddressWarningBanner from "@/Components/Merchant/Dashboard/StoreAddressWarningBanner";

interface DashboardProps {
    merchantInfo: { name: string; store_name: string };
    stats: {
        sales: number;
        orders: number;
        customers: number;
        products: number;
    };
    chartData: any[];
    monthlyChartData?: any[];
    recentOrders: any[];
    topSelling: any[];
    orderStatus: {
        pending: number;
        processing: number;
        shipped: number;
        completed: number;
    };
    storeProfile?: {
        has_address: boolean;
        address: string | null;
        has_completed_tour: boolean;
    };
}

export default function Dashboard({
    merchantInfo,
    stats,
    chartData,
    monthlyChartData = [],
    recentOrders,
    topSelling,
    orderStatus,
    storeProfile,
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
            <div
                id="tour-merchant-header"
                className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-brand-orange flex items-center gap-2">
                        {greeting}, {merchantInfo.name || "Penjual"}
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium">
                        Produk apa yang akan kamu jual hari ini?
                    </p>
                </div>
            </div>

            {/* Peringatan Wajib Lengkapi Alamat Toko */}
            {storeProfile && !storeProfile.has_address && (
                <StoreAddressWarningBanner className="mb-6 md:mb-8" />
            )}

            <div id="tour-stat-cards">
                <StatCards statsData={stats} />
            </div>

            {/* Grid layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
                <div id="tour-sales-chart" className="lg:col-span-2">
                    <SalesChart chartData={chartData} monthlyChartData={monthlyChartData} />
                </div>
                <div className="space-y-4 md:space-y-6 flex flex-col">
                    <div id="tour-order-status" className="flex-1 min-h-55">
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
