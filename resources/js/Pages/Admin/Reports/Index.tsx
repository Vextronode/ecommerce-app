import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import ReportHeader from "@/Components/Admin/Reports/ReportHeader";
import ReportFilterModal from "@/Components/Admin/Reports/ReportFilterModal";
import BestSellingTable, {
    BestSellingProductItem,
} from "@/Components/Admin/Reports/BestSellingTable";
import {
    useReportFilters,
    ReportFilterState,
} from "@/Hooks/Admin/useReportFilters";

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface OptionItem {
    id: number;
    name: string;
    slug?: string;
}

interface Props {
    products: {
        data: BestSellingProductItem[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
        links: PaginationLink[];
    };
    stats: {
        total_revenue: number;
        formatted_revenue: string;
        compact_revenue: string;
        total_sales_qty: number;
        total_products: number;
    };
    stores: OptionItem[];
    categories: OptionItem[];
    filters: ReportFilterState;
}

export default function Index({
    products,
    stats,
    stores,
    categories,
    filters,
}: Props) {
    const {
        isFilterModalOpen,
        openFilterModal,
        closeFilterModal,
        draftPeriod,
        setDraftPeriod,
        draftStoreId,
        setDraftStoreId,
        draftCategoryId,
        setDraftCategoryId,
        draftSortBy,
        setDraftSortBy,
        draftPerPage,
        setDraftPerPage,
        draftStartDate,
        setDraftStartDate,
        draftEndDate,
        setDraftEndDate,
        activeFiltersCount,
        applyFilters,
        resetAllFilters,
        handleExport,
    } = useReportFilters(filters);

    return (
        <AdminLayout>
            <Head title="Laporan Produk Terlaris - Cibenda Mart" />

            <div className="space-y-6">
                {/* Header with Filter & Export Buttons */}
                <ReportHeader
                    activeFiltersCount={activeFiltersCount}
                    onOpenFilter={openFilterModal}
                    onExport={handleExport}
                />

                {/* Best Selling Table */}
                <BestSellingTable
                    products={products}
                    hasActiveFilters={activeFiltersCount > 0}
                    onResetFilter={resetAllFilters}
                />
            </div>

            {/* Filter Modal */}
            <ReportFilterModal
                isOpen={isFilterModalOpen}
                onClose={closeFilterModal}
                period={draftPeriod}
                setPeriod={setDraftPeriod}
                storeId={draftStoreId}
                setStoreId={setDraftStoreId}
                categoryId={draftCategoryId}
                setCategoryId={setDraftCategoryId}
                sortBy={draftSortBy}
                setSortBy={setDraftSortBy}
                perPage={draftPerPage}
                setPerPage={setDraftPerPage}
                startDate={draftStartDate}
                setStartDate={setDraftStartDate}
                endDate={draftEndDate}
                setEndDate={setDraftEndDate}
                stores={stores}
                categories={categories}
                onApply={applyFilters}
                onReset={resetAllFilters}
            />
        </AdminLayout>
    );
}
