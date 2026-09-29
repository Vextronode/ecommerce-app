import React from 'react';
import { Head, router } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import AnalyticsOverviewCard from '@/Components/Merchant/Analytics/AnalyticsOverviewCard';
import RevenueTrendChart from '@/Components/Merchant/Analytics/RevenueTrendChart';
import TopCategoriesChart from '@/Components/Merchant/Analytics/TopCategoriesChart';
import OrdersTrendChart from '@/Components/Merchant/Analytics/OrdersTrendChart';
import BestSellingProductsTable from '@/Components/Merchant/Analytics/BestSellingProductsTable';
import { Banknote, ShoppingBag, Star, Receipt, Calendar } from 'lucide-react';

interface Metrics {
    total_revenue: number;
    total_revenue_growth?: number;
    total_orders: number;
    total_orders_growth?: number;
    rating_shop: number;
    rating_shop_growth?: number;
    reviews_count?: number;
    average_order: number;
    average_order_growth?: number;
}

interface AnalyticsIndexProps {
    metrics: Metrics;
    years: number[];
    revenueTrend: any[];
    topCategories: any[];
    ordersTrend: any[];
    bestSellingProducts: any[];
    period?: string;
}

export default function AnalyticsIndex({
    metrics,
    years,
    revenueTrend,
    topCategories,
    ordersTrend,
    bestSellingProducts,
    period = '12m'
}: AnalyticsIndexProps) {
    const handlePeriodChange = (newPeriod: string) => {
        router.get(
            route('merchant.analytics.index'),
            { period: newPeriod },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <MerchantLayout>
            <Head title="Laporan & Analisis - Cibenda Mart" />

            <div className="w-full">
                <div id="tour-analytics-header" className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8 gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-extrabold text-brand-orange mb-1">
                            Ikhtisar Analisis
                        </h1>
                        <p className="text-gray-500 text-xs md:text-sm">
                            Pantau performa dan metrik pertumbuhan toko Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs md:text-sm bg-white rounded-2xl p-1.5 border border-brand-orange/20 shadow-sm self-start md:self-auto">
                        <button 
                            type="button"
                            onClick={() => handlePeriodChange('7d')}
                            className={`px-3.5 md:px-4 py-1.5 rounded-xl font-bold transition-all ${
                                period === '7d' 
                                    ? 'bg-brand-orange text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            7 Hari
                        </button>
                        <button 
                            type="button"
                            onClick={() => handlePeriodChange('30d')}
                            className={`px-3.5 md:px-4 py-1.5 rounded-xl font-bold transition-all ${
                                period === '30d' 
                                    ? 'bg-brand-orange text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            30 Hari
                        </button>
                        <button 
                            type="button"
                            onClick={() => handlePeriodChange('12m')}
                            className={`px-3.5 md:px-4 py-1.5 rounded-xl font-bold transition-all ${
                                period === '12m' 
                                    ? 'bg-brand-orange text-white shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                            }`}
                        >
                            12 Bulan
                        </button>
                        <button 
                            type="button"
                            aria-label="Filter Tanggal Kustom" 
                            className="px-2 py-1.5 text-gray-400 hover:text-brand-orange border-l border-gray-100 ml-1 pl-2.5 transition-colors"
                        >
                            <Calendar className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div id="tour-analytics-overview" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                    <AnalyticsOverviewCard
                        title="Total Pendapatan"
                        value={metrics.total_revenue}
                        icon={Banknote}
                        growth={metrics.total_revenue_growth}
                        isCurrency={true}
                        iconTheme="teal"
                    />
                    <AnalyticsOverviewCard
                        title="Total Orderan"
                        value={metrics.total_orders}
                        icon={ShoppingBag}
                        growth={metrics.total_orders_growth}
                        iconTheme="emerald"
                    />
                    <AnalyticsOverviewCard
                        title="Rating Toko"
                        value={metrics.rating_shop}
                        icon={Star}
                        growth={metrics.rating_shop_growth}
                        isRating={true}
                        reviewsCount={metrics.reviews_count}
                        iconTheme="orange"
                    />
                    <AnalyticsOverviewCard
                        title="Rata-rata Order"
                        value={metrics.average_order}
                        icon={Receipt}
                        growth={metrics.average_order_growth}
                        isCurrency={true}
                        iconTheme="orange"
                    />
                </div>

                <div id="tour-analytics-revenue-chart" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 md:mb-8">
                    <RevenueTrendChart data={revenueTrend} years={years} />
                    <TopCategoriesChart data={topCategories} />
                </div>

                <div id="tour-analytics-best-sellers" className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                    <BestSellingProductsTable products={bestSellingProducts} />
                    <OrdersTrendChart data={ordersTrend} />
                </div>
            </div>
        </MerchantLayout>
    );
}
