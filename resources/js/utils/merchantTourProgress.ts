import { MerchantTourTabKey } from "@/types/tour";

export interface NextTourDestination {
    tabKey: MerchantTourTabKey;
    label: string;
    routeName: string;
    url: string;
}

export const NEXT_TOUR_MAP: Partial<Record<MerchantTourTabKey, NextTourDestination>> = {
    dashboard: {
        tabKey: "products_index",
        label: "Kelola Produk",
        routeName: "merchant.products.index",
        url: "/pedagang/products",
    },
    products_index: {
        tabKey: "orders",
        label: "Kelola Pesanan",
        routeName: "merchant.orders.index",
        url: "/pedagang/orders",
    },
    orders: {
        tabKey: "customers",
        label: "Data Pelanggan",
        routeName: "merchant.customers.index",
        url: "/pedagang/customers",
    },
    customers: {
        tabKey: "analytics",
        label: "Laporan & Analisis",
        routeName: "merchant.analytics.index",
        url: "/pedagang/analytics",
    },
    analytics: {
        tabKey: "withdrawals",
        label: "Penarikan Dana",
        routeName: "merchant.withdrawals.index",
        url: "/pedagang/withdrawals",
    },
};

const STORAGE_KEY = "cibenda_merchant_viewed_tour_tabs";

export const getMerchantViewedTabs = (): string[] => {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const markMerchantTabAsViewed = (tabKey: string): void => {
    if (typeof window === "undefined") return;
    try {
        const current = getMerchantViewedTabs();
        if (!current.includes(tabKey)) {
            current.push(tabKey);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        }
    } catch (e) {
        console.error("Gagal menyimpan progress tour:", e);
    }
};

export const hasViewedMerchantTab = (tabKey: string): boolean => {
    return getMerchantViewedTabs().includes(tabKey);
};

export const markTourFullyCompleted = (): void => {
    if (typeof window === "undefined") return;
    try {
        const allTabs: MerchantTourTabKey[] = [
            "dashboard",
            "products_index",
            "products_create",
            "products_edit",
            "orders",
            "customers",
            "analytics",
            "withdrawals",
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allTabs));
    } catch (e) {
        console.error("Gagal menyimpan status selesai tour:", e);
    }
};

export const resetMerchantTourProgress = (): void => {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem("cibenda_merchant_force_tour_tab");
    } catch (e) {
        console.error("Gagal mereset progress tour:", e);
    }
};

const FORCE_TOUR_KEY = "cibenda_merchant_force_tour_tab";

export const requestTourOnNextPage = (tabKey: string): void => {
    if (typeof window === "undefined") return;
    try {
        sessionStorage.setItem(FORCE_TOUR_KEY, tabKey);
    } catch (e) {
        console.error("Gagal request tour:", e);
    }
};

export const consumeRequestedTour = (tabKey: string): boolean => {
    if (typeof window === "undefined") return false;
    try {
        const requested = sessionStorage.getItem(FORCE_TOUR_KEY);
        if (requested === tabKey) {
            sessionStorage.removeItem(FORCE_TOUR_KEY);
            return true;
        }
    } catch {
        return false;
    }
    return false;
};
