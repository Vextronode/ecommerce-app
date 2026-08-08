import React from 'react';
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import AnalyticsOverviewCard from '@/Components/Merchant/Analytics/AnalyticsOverviewCard';
import RevenueTrendChart from '@/Components/Merchant/Analytics/RevenueTrendChart';
import TopCategoriesChart from '@/Components/Merchant/Analytics/TopCategoriesChart';
import OrdersTrendChart from '@/Components/Merchant/Analytics/OrdersTrendChart';
import BestSellingProductsTable from '@/Components/Merchant/Analytics/BestSellingProductsTable';
import { Banknote, ShoppingBag, ArrowLeftRight, Receipt, Calendar } from 'lucide-react';

import { router } from '@inertiajs/react';

export default function AnalyticsIndex({
    metrics,
    years,
    revenueTrend,
    topCategories,
    ordersTrend,
    bestSellingProducts,
    period = '12m'
}: any) {
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            route('merchant.analytics.index'),
            { period: newPeriod },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <MerchantLayout>
            <Head title="Reports & Analytics - Cibenda Mart" />

            <div className="p-4 md:p-8 w-full bg-[#F5F8FA] min-h-screen">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#14433D] mb-1">
                            Analytics Overview
                        </h1>
                        <p className="text-sm text-gray-500">
                            Track your store's performance and growth metrics.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-sm bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm self-start md:self-auto">
                        <button 
                            onClick={() => handlePeriodChange('7d')}
                            className={`px-4 py-1.5 rounded-lg font-bold ${period === '7d' ? 'bg-[#41B9C5] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            7 Days
                        </button>
                        <button 
                            onClick={() => handlePeriodChange('30d')}
                            className={`px-4 py-1.5 rounded-lg font-bold ${period === '30d' ? 'bg-[#41B9C5] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            30 Days
                        </button>
                        <button 
                            onClick={() => handlePeriodChange('12m')}
                            className={`px-4 py-1.5 rounded-lg font-bold ${period === '12m' ? 'bg-[#41B9C5] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            12 Months
                        </button>
                        <button className="px-2 py-1.5 text-gray-400 hover:text-gray-600 border-l border-gray-100 ml-1 pl-3">
                            <Calendar className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <AnalyticsOverviewCard
                        title="Total Pendapatan"
                        value={metrics.total_revenue}
                        icon={Banknote}
                        growth={12.5}
                        isCurrency={true}
                    />
                    <AnalyticsOverviewCard
                        title="Total Orderan"
                        value={metrics.total_orders}
                        icon={ShoppingBag}
                        growth={8.2}
                    />
                    <AnalyticsOverviewCard
                        title="Rating Shop"
                        value={metrics.rating_shop}
                        icon={ArrowLeftRight}
                        growth={0.0}
                        isPositive={false}
                    />
                    <AnalyticsOverviewCard
                        title="Rata-rata Order"
                        value={metrics.average_order}
                        icon={Receipt}
                        growth={2.1}
                        isCurrency={true}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <RevenueTrendChart data={revenueTrend} years={years} />
                    <TopCategoriesChart data={topCategories} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    <BestSellingProductsTable products={bestSellingProducts} />
                    <OrdersTrendChart data={ordersTrend} />
                </div>
            </div>
        </MerchantLayout>
    );
}
