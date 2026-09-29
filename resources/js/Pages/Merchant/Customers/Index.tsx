import React from 'react';
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import CustomerStatsCard from '@/Components/Merchant/Customers/CustomerStatsCard';
import CustomerTable, { Customer } from '@/Components/Merchant/Customers/CustomerTable';

interface Metrics {
    total_customers: number;
    total_customers_growth: number;
    new_customers: number;
    new_customers_growth: number;
    chart_data?: number[];
}

interface CustomersIndexProps {
    metrics: Metrics;
    customers: {
        data: Customer[];
        from: number;
        to: number;
        total: number;
        links: any[];
    };
    filters: {
        status: string;
    };
}

export default function CustomersIndex({ metrics, customers, filters }: CustomersIndexProps) {
    return (
        <MerchantLayout>
            <Head title="Kelola Pelanggan - Cibenda Mart" />

            <div className="w-full">
                <div id="tour-customers-header" className="mb-6 md:mb-8">
                    <h1 className="text-xl md:text-2xl font-extrabold text-brand-orange">
                        Kelola Pelanggan
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs md:text-sm">
                        Pantau, kelola, dan analisis basis pelanggan toko Anda.
                    </p>
                </div>

                <div id="tour-customers-stats" className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8 max-w-2xl">
                    <CustomerStatsCard 
                        title="Total Pelanggan"
                        value={metrics.total_customers}
                        growth={metrics.total_customers_growth}
                        type="total"
                        chartData={metrics.chart_data}
                    />
                    <CustomerStatsCard 
                        title="Pelanggan Baru"
                        value={metrics.new_customers}
                        growth={metrics.new_customers_growth}
                        type="new"
                    />
                </div>

                <div id="tour-customers-table">
                    <CustomerTable 
                        customers={customers.data} 
                        currentStatus={filters.status}
                        pagination={customers}
                    />
                </div>
            </div>
        </MerchantLayout>
    );
}
