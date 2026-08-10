import { useState, useCallback, useMemo } from "react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

export interface ReportFilterState {
    search: string;
    period: string;
    store_id: number | null;
    category_id: number | null;
    sort_by: string;
    per_page: number;
    start_date?: string;
    end_date?: string;
}

export function useReportFilters(initialFilters: ReportFilterState) {
    const [search, setSearch] = useState(initialFilters.search || "");
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Modal draft state
    const [draftPeriod, setDraftPeriod] = useState(initialFilters.period || "all");
    const [draftStoreId, setDraftStoreId] = useState<number | null>(initialFilters.store_id || null);
    const [draftCategoryId, setDraftCategoryId] = useState<number | null>(initialFilters.category_id || null);
    const [draftSortBy, setDraftSortBy] = useState(initialFilters.sort_by || "sales");
    const [draftPerPage, setDraftPerPage] = useState(initialFilters.per_page || 10);
    const [draftStartDate, setDraftStartDate] = useState(initialFilters.start_date || "");
    const [draftEndDate, setDraftEndDate] = useState(initialFilters.end_date || "");

    // Calculate how many non-default filters are active
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (initialFilters.period && initialFilters.period !== "all") count++;
        if (initialFilters.store_id) count++;
        if (initialFilters.category_id) count++;
        if (initialFilters.sort_by && initialFilters.sort_by !== "sales") count++;
        if (initialFilters.search && initialFilters.search.trim()) count++;
        return count;
    }, [initialFilters]);

    // Handle instant search execution
    const handleSearchSubmit = useCallback((query?: string) => {
        const q = query !== undefined ? query : search;
        const params: Record<string, any> = {
            search: q || undefined,
            period: initialFilters.period !== "all" ? initialFilters.period : undefined,
            store_id: initialFilters.store_id || undefined,
            category_id: initialFilters.category_id || undefined,
            sort_by: initialFilters.sort_by !== "sales" ? initialFilters.sort_by : undefined,
            per_page: initialFilters.per_page !== 10 ? initialFilters.per_page : undefined,
            start_date: initialFilters.start_date || undefined,
            end_date: initialFilters.end_date || undefined,
        };

        router.get(route("admin.reports.index"), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }, [search, initialFilters]);

    // Open filter modal and sync draft with current active filters
    const openFilterModal = useCallback(() => {
        setDraftPeriod(initialFilters.period || "all");
        setDraftStoreId(initialFilters.store_id || null);
        setDraftCategoryId(initialFilters.category_id || null);
        setDraftSortBy(initialFilters.sort_by || "sales");
        setDraftPerPage(initialFilters.per_page || 10);
        setDraftStartDate(initialFilters.start_date || "");
        setDraftEndDate(initialFilters.end_date || "");
        setIsFilterModalOpen(true);
    }, [initialFilters]);

    const closeFilterModal = useCallback(() => {
        setIsFilterModalOpen(false);
    }, []);

    // Apply filters from modal
    const applyFilters = useCallback(() => {
        const params: Record<string, any> = {
            search: search.trim() || undefined,
            period: draftPeriod !== "all" ? draftPeriod : undefined,
            store_id: draftStoreId || undefined,
            category_id: draftCategoryId || undefined,
            sort_by: draftSortBy !== "sales" ? draftSortBy : undefined,
            per_page: draftPerPage !== 10 ? draftPerPage : undefined,
            start_date: draftPeriod === "custom" ? (draftStartDate || undefined) : undefined,
            end_date: draftPeriod === "custom" ? (draftEndDate || undefined) : undefined,
        };

        router.get(route("admin.reports.index"), params, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsFilterModalOpen(false);
                toast.success("Filter laporan berhasil diterapkan.");
            },
        });
    }, [search, draftPeriod, draftStoreId, draftCategoryId, draftSortBy, draftPerPage, draftStartDate, draftEndDate]);

    // Reset all filters to default
    const resetAllFilters = useCallback(() => {
        setSearch("");
        setDraftPeriod("all");
        setDraftStoreId(null);
        setDraftCategoryId(null);
        setDraftSortBy("sales");
        setDraftPerPage(10);
        setDraftStartDate("");
        setDraftEndDate("");

        router.get(route("admin.reports.index"), {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsFilterModalOpen(false);
                toast.success("Filter telah direset.");
            },
        });
    }, []);

    // Export CSV with current filters
    const handleExport = useCallback(() => {
        const params = new URLSearchParams();
        if (initialFilters.search) params.append("search", initialFilters.search);
        if (initialFilters.period && initialFilters.period !== "all") params.append("period", initialFilters.period);
        if (initialFilters.store_id) params.append("store_id", String(initialFilters.store_id));
        if (initialFilters.category_id) params.append("category_id", String(initialFilters.category_id));
        if (initialFilters.sort_by) params.append("sort_by", initialFilters.sort_by);
        if (initialFilters.start_date) params.append("start_date", initialFilters.start_date);
        if (initialFilters.end_date) params.append("end_date", initialFilters.end_date);

        const url = `${route("admin.reports.export")}?${params.toString()}`;
        window.open(url, "_blank", "noopener,noreferrer");
        toast.success("Mengunduh laporan produk terlaris...");
    }, [initialFilters]);

    return {
        search,
        setSearch,
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
        handleSearchSubmit,
        applyFilters,
        resetAllFilters,
        handleExport,
    };
}
