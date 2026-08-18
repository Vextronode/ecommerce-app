import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import {
    Plus,
    Download,
    Grid,
    List,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import ProductTable from "@/Components/Merchant/Product/ProductTable";
import ProductGrid from "@/Components/Merchant/Product/ProductGrid";
import Pagination from "@/Components/Merchant/Pagination";

const STOCK_RULES = [
    {
        max: 0,
        ui: {
            dotColor: "bg-gray-400",
            badgeBg: "bg-gray-100",
            badgeText: "text-gray-500",
            label: "Habis",
        },
    },
    {
        max: 5,
        ui: {
            dotColor: "bg-red-500",
            badgeBg: "bg-red-100",
            badgeText: "text-red-600",
            label: "Kritis",
        },
    },
    {
        max: 10,
        ui: {
            dotColor: "bg-yellow-400",
            badgeBg: "bg-yellow-100",
            badgeText: "text-yellow-700",
            label: "Menipis",
        },
    },
];
const DEFAULT_STOCK_UI = {
    dotColor: "bg-[#41B9C5]",
    badgeBg: "bg-[#41B9C5]/10",
    badgeText: "text-[#41B9C5]",
    label: "Active",
};

export const getStockIndicator = (stock: number) => {
    const activeRule = STOCK_RULES.find((rule) => stock <= rule.max);
    return activeRule ? activeRule.ui : DEFAULT_STOCK_UI;
};

interface Props {
    products: any;
    categories: any[];
    filters: { category?: string; status?: string };
}

export default function Index({ products, categories, filters }: Props) {
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    // Real-Time Product List Sync for Merchant
    React.useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.channel("storefront-products");
        const handleUpdate = () => {
            router.reload({ only: ["products"] });
        };

        channel.listen(".ProductStockUpdated", handleUpdate);
        channel.listen("ProductStockUpdated", handleUpdate);

        return () => {
            window.Echo.leaveChannel("storefront-products");
        };
    }, []);

    const handleFilterChange = (key: string, value: string) => {
        router.get(
            route("merchant.products.index"),
            { ...filters, [key]: value },
            { preserveState: true, replace: true },
        );
    };

    return (
        <MerchantLayout>
            <Head title="Products Management" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-[#41B9C5]">
                        Products
                    </h1>
                    <p className="text-gray-500 mt-1 text-xs md:text-sm">
                        Atur katalog toko, produk dan harga.
                    </p>
                </div>
                <Link
                    href={route("merchant.products.create")}
                    className="flex items-center gap-2 bg-[#41B9C5] hover:bg-[#359a9e] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold transition shadow-md shadow-[#41B9C5]/30 text-xs md:text-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" /> Add Product
                </Link>
            </div>

            <div aria-label="Pilih opsi yang tersedia" className="bg-white rounded-2xl border border-[#41B9C5]/30 p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex flex-wrap gap-2 md:gap-4 w-full sm:w-auto">
                    <select aria-label="Tampilkan rincian lebih lanjut"
                        value={filters?.category || ""}
                        onChange={(e) =>
                            handleFilterChange("category", e.target.value)
                        }
                        className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none cursor-pointer appearance-none bg-white pr-8 bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[16px_12px]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        }}
                    >
                        <option value="">All Categories</option>
                        {categories?.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    <select aria-label="Tampilkan rincian lebih lanjut"
                        value={filters?.status || ""}
                        onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                        }
                        className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none cursor-pointer appearance-none bg-white pr-8 bg-no-repeat bg-position-[right_0.75rem_center] bg-size-[16px_12px]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        }}
                    >
                        <option value="">Semua Stok</option>
                        <option value="active">Active (Stok Aman)</option>
                        <option value="menipis">Menipis (6 - 10)</option>
                        <option value="kritis">Kritis (1 - 5)</option>
                        <option value="habis">Habis (0)</option>
                    </select>
                </div>

                <div aria-label="Pilih opsi yang tersedia" className="flex gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                    <button aria-label="Tampilkan rincian lebih lanjut"
                        onClick={() =>
                            toast.success("Fitur Export segera hadir!")
                        }
                        className="p-2 md:p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button aria-label="Pilih opsi yang tersedia"
                        onClick={() => setViewMode("grid")}
                        className={`p-2 md:p-2.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#E0F7FA] text-[#41B9C5]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                    >
                        <Grid className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button aria-label="Pilih opsi yang tersedia"
                        onClick={() => setViewMode("list")}
                        className={`p-2 md:p-2.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#E0F7FA] text-[#41B9C5]" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
                    >
                        <List className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {viewMode === "list" ? (
                <ProductTable
                    products={products.data}
                    getStockIndicator={getStockIndicator}
                />
            ) : (
                <ProductGrid
                    products={products.data}
                    getStockIndicator={getStockIndicator}
                />
            )}
            <Pagination data={products} />
        </MerchantLayout>
    );
}
