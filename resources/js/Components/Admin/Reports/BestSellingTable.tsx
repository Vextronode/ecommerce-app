import React from "react";
import { Link } from "@inertiajs/react";
import { Package, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import StoreAvatar from '@/Components/Global/StoreAvatar';
import RankBadge from "./RankBadge";

export interface BestSellingProductItem {
    id: number;
    rank: number;
    name: string;
    slug: string;
    image_path?: string | null;
    category_name: string;
    price: number;
    formatted_price: string;
    stock: number;
    unit: string;
    is_active: boolean;
    store: {
        id?: number;
        name: string;
        slug?: string;
        initials: string;
        logo_path?: string | null;
    };
    total_sales: number;
    total_revenue: number;
    formatted_revenue: string;
    compact_revenue: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
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
    hasActiveFilters: boolean;
    onResetFilter?: () => void;
}

export default function BestSellingTable({
    products,
    hasActiveFilters,
    onResetFilter,
}: Props) {
    const list = products.data || [];

    // Empty state when no products found or no sales yet
    if (list.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm my-auto">
                <div className="w-16 h-16 rounded-2xl bg-[#E6F8F9] border border-[#41B9C5]/30 flex items-center justify-center text-[#004F54] mx-auto mb-4">
                    <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">
                    Belum Ada Data Penjualan Produk
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mb-6 leading-relaxed">
                    {hasActiveFilters
                        ? "Tidak ada transaksi penjualan produk yang cocok dengan filter atau kata kunci pencarian yang dipilih."
                        : "Hanya produk unggulan toko dengan riwayat penjualan berhasil yang akan ditampilkan di halaman ini."}
                </p>
                {hasActiveFilters && onResetFilter && (
                    <button
                        type="button"
                        onClick={onResetFilter}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#41B9C5] text-white hover:bg-[#38a3ae] shadow-md shadow-[#41B9C5]/20 transition-all cursor-pointer"
                    >
                        Reset Filter Pencarian
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {/* Table Container */}
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50/50">
                            <th className="py-4 px-6 text-center w-20">RANK</th>
                            <th className="py-4 px-6">PRODUCT</th>
                            <th className="py-4 px-6">MERCHANT</th>
                            <th className="py-4 px-6 text-center">TOTAL SALES</th>
                            <th className="py-4 px-8 text-right">PENDAPATAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                        {list.map((item) => {
                            return (
                                <tr
                                    key={item.id}
                                    className="hover:bg-[#F9FCFC] transition-colors group"
                                >
                                    {/* RANK */}
                                    <td className="py-4 px-6 text-center align-middle">
                                        <RankBadge rank={item.rank} />
                                    </td>

                                    {/* PRODUCT */}
                                    <td className="py-4 px-6 align-middle">
                                        <div className="flex items-center gap-3.5">
                                            {item.image_path ? (
                                                <img
                                                    src={item.image_path}
                                                    alt={item.name}
                                                    className="w-11 h-11 rounded-xl object-cover border border-gray-100 shadow-2xs shrink-0 bg-gray-50"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200/70 flex items-center justify-center text-gray-400 shrink-0 shadow-2xs">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-[#004F54] transition-colors">
                                                    {item.name}
                                                </div>
                                                <div className="text-gray-400 text-[11px] font-medium truncate">
                                                    {item.category_name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* MERCHANT */}
                                    <td className="py-4 px-6 align-middle whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <StoreAvatar 
                                                logoPath={item.store.logo_path} 
                                                storeName={item.store.name} 
                                                className="w-7 h-7 rounded-full text-[10px]"
                                            />
                                            <span className="text-xs font-medium text-gray-700">
                                                {item.store.name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* TOTAL SALES */}
                                    <td className="py-4 px-6 text-center align-middle whitespace-nowrap">
                                        <span className="font-bold text-gray-800 text-sm">
                                            {item.total_sales.toLocaleString("id-ID")}
                                        </span>
                                    </td>

                                    {/* PENDAPATAN */}
                                    <td className="py-4 px-8 text-right align-middle whitespace-nowrap">
                                        <span
                                            className="font-bold text-[#00838F] text-sm"
                                            title={item.formatted_revenue}
                                        >
                                            {item.compact_revenue}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-white">
                <div className="text-xs text-gray-500 font-medium">
                    Showing{" "}
                    <span className="font-bold text-gray-800">
                        {products.from || 0}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-gray-800">
                        {products.to || 0}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-800">
                        {products.total.toLocaleString("id-ID")}
                    </span>{" "}
                    products
                </div>

                {/* Pagination Controls */}
                {products.last_page > 1 ? (
                    <div className="flex items-center gap-1.5">
                        {products.links.map((link, index) => {
                            const isPrev =
                                link.label.includes("Previous") ||
                                link.label.includes("&laquo;") ||
                                link.label.includes("‹");
                            const isNext =
                                link.label.includes("Next") ||
                                link.label.includes("&raquo;") ||
                                link.label.includes("›");

                            // Previous Arrow Button
                            if (isPrev) {
                                return link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                                        title="Halaman Sebelumnya"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </span>
                                );
                            }

                            // Next Arrow Button
                            if (isNext) {
                                return link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        preserveState
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-xs font-semibold shadow-2xs cursor-pointer"
                                        title="Halaman Selanjutnya"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-300 text-xs cursor-not-allowed"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </span>
                                );
                            }

                            // Ellipsis
                            if (link.label === "...") {
                                return (
                                    <span
                                        key={index}
                                        className="w-8 h-8 flex items-center justify-center text-gray-400 text-xs font-bold"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            // Numbered Page Button
                            return link.url ? (
                                <Link
                                    key={index}
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${link.active
                                            ? "bg-[#41B9C5] text-white shadow-xs font-extrabold"
                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-2xs"
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <span
                                    key={index}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-400 text-xs font-semibold"
                                >
                                    {link.label}
                                </span>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#41B9C5] text-white text-xs font-extrabold shadow-xs">
                            1
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
