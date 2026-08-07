import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import AdminStatCards from "@/Components/Admin/Dashboard/AdminStatCards";
import AdminSalesChart from "@/Components/Admin/Dashboard/AdminSalesChart";
import AdminMerchantRegistrations from "@/Components/Admin/Dashboard/AdminMerchantRegistrations";
import AdminRecentActivities from "@/Components/Admin/Dashboard/AdminRecentActivities";

interface Props {
    stats: {
        total_merchants: number | string;
        total_products: number | string;
        total_sold: number | string;
        top_product_name: string;
        top_category_name: string;
        merchants_trend: string;
        products_trend: string;
        sold_trend: string;
    };
    chartData: any[];
    registrations: any[];
    activities?: any[];
}

export default function AdminDashboard({ stats, chartData, registrations, activities }: Props) {
    const [greeting, setGreeting] = useState("Selamat Datang, Admin");

    useEffect(() => {
        const hours = new Date().getHours();
        if (hours >= 4 && hours < 11) {
            setGreeting("Selamat Pagi, Admin");
        } else if (hours >= 11 && hours < 15) {
            setGreeting("Selamat Siang, Admin");
        } else if (hours >= 15 && hours < 18) {
            setGreeting("Selamat Sore, Admin");
        } else {
            setGreeting("Selamat Malam, Admin");
        }
    }, []);

    return (
        <AdminLayout>
            <Head title="Admin Dashboard - CibendaMart" />

            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#004F54] tracking-tight">
                    {greeting}
                </h1>
                <p className="text-gray-500 mt-1 text-xs md:text-sm font-medium">
                    Overview of CibendaMart platform performance.
                </p>
            </div>

            {/* Metric Cards */}
            <AdminStatCards stats={stats} />

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 items-start">
                <div className="lg:col-span-2 space-y-5 md:space-y-6">
                    <div className="w-full">
                        <AdminSalesChart chartData={chartData} />
                    </div>
                    <div className="w-full">
                        <AdminMerchantRegistrations registrations={registrations} />
                    </div>
                </div>
                <div className="w-full">
                    <AdminRecentActivities activities={activities} />
                </div>
            </div>
        </AdminLayout>
    );
}
