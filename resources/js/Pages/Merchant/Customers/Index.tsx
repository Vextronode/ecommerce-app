import React from 'react';
import { Head } from '@inertiajs/react';
import MerchantLayout from '@/Layouts/MerchantLayout';
import CustomerStatsCard from '@/Components/Merchant/Customers/CustomerStatsCard';
import CustomerTable, { Customer } from '@/Components/Merchant/Customers/CustomerTable';
import CustomerPagination from '@/Components/Merchant/Customers/CustomerPagination';

interface Metrics {
    total_customers: number;
    total_customers_growth: number;
    new_customers: number;
    new_customers_growth: number;
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
            <Head title="Customer Management" />
            
            <div className="p-4 md:p-8 w-full bg-[#F5F8FA] min-h-screen">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-[#14433D] mb-1">
                        Customer Management
                    </h1>
                    <p className="text-sm text-gray-500">
                        Track, manage, and analyze your customer base.
                    </p>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="max-w-[300px] w-full">
                        <CustomerStatsCard 
                            title="Total Customers"
                            value={metrics.total_customers}
                            growth={metrics.total_customers_growth}
                            type="total"
                        />
                    </div>
                    <div className="max-w-[300px] w-full">
                        <CustomerStatsCard 
                            title="New Customers"
                            value={metrics.new_customers}
                            growth={metrics.new_customers_growth}
                            type="new"
                        />
                    </div>
                </div>

                <div>
                    <CustomerTable 
                        customers={customers.data} 
                        currentStatus={filters.status}
                    />
                    {customers.total > 0 && (
                        <CustomerPagination 
                            from={customers.from}
                            to={customers.to}
                            total={customers.total}
                            links={customers.links}
                        />
                    )}
                </div>
            </div>
        </MerchantLayout>
    );
}
