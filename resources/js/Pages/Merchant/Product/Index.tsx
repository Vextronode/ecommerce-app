import React from "react";
import { Head, Link } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import {
    Plus,
    Download,
    Grid,
    List,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Image as ImageIcon,
} from "lucide-react";

import ProductActions from "@/Components/Merchant/Product/ProductActions";

interface Props {
    products: any;
}

export default function Index({ products }: Props) {
    return (
        <MerchantLayout>
            <Head title="Products Management" />

            {/* Header */}
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
                    className="flex items-center gap-2 bg-[#41B9C5] hover:bg-[#359a9e] text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-[#41B9C5]/30 text-xs md:text-sm w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    Add Product
                </Link>
            </div>

            {/* Toolbar / Filters */}
            <div className="bg-white rounded-2xl border border-[#41B9C5]/30 p-3 md:p-4 mb-4 md:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
                <div className="flex flex-wrap gap-2 md:gap-4 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex justify-between items-center gap-4 px-3 py-2 border border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50">
                        All Categories
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="flex-1 sm:flex-none flex justify-between items-center gap-4 px-3 py-2 border border-gray-200 rounded-xl text-xs md:text-sm font-medium text-gray-500 hover:bg-gray-50">
                        All Status
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                </div>
                <div className="flex gap-2 self-end sm:self-auto w-full sm:w-auto justify-end">
                    <button className="p-2 md:p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Download className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-2 md:p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <Grid className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                    <button className="p-2 md:p-2.5 bg-[#E0F7FA] text-[#41B9C5] rounded-lg transition-colors">
                        <List className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-[#41B9C5]/30 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-200">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider w-16 md:w-20">
                                    IMAGE
                                </th>
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    PRODUCT NAME
                                </th>
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    CATEGORY
                                </th>
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    PRICE
                                </th>
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    STOCK
                                </th>
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    STATUS
                                </th>
                                <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.data.length > 0 ? (
                                products.data.map((product: any) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            {product.image_path ? (
                                                <img
                                                    src={product.image_path}
                                                    alt={product.name}
                                                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <span className="text-xs md:text-sm font-bold text-[#41B9C5] cursor-pointer hover:underline">
                                                {product.name}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 rounded-full">
                                                {product.category?.name ||
                                                    "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <span className="text-xs md:text-sm font-semibold text-[#41B9C5]">
                                                {new Intl.NumberFormat(
                                                    "id-ID",
                                                    {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        maximumFractionDigits: 0,
                                                    },
                                                ).format(product.price)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${product.stock > 0 ? "bg-[#41B9C5]" : "bg-red-500"}`}
                                                ></span>
                                                <span
                                                    className={`text-xs md:text-sm font-bold ${product.stock > 0 ? "text-[#41B9C5]" : "text-gray-400"}`}
                                                >
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            {product.is_active ? (
                                                <span className="bg-[#41B9C5] text-white text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-1 rounded-full">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="bg-gray-200 text-gray-600 text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-1 rounded-full">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6 text-right">
                                            <ProductActions product={product} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="py-12 text-center text-gray-500 text-xs md:text-sm"
                                    >
                                        Belum ada produk di toko Anda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer*/}
                <div className="px-4 md:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
                    <span className="text-[10px] md:text-xs font-medium text-gray-500">
                        Showing{" "}
                        <span className="text-[#41B9C5] font-bold">
                            {products.from || 0}
                        </span>{" "}
                        to{" "}
                        <span className="text-[#41B9C5] font-bold">
                            {products.to || 0}
                        </span>{" "}
                        of{" "}
                        <span className="text-[#41B9C5] font-bold">
                            {products.total}
                        </span>{" "}
                        results
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            className="p-1 text-gray-400 hover:text-[#41B9C5] disabled:opacity-50"
                            disabled={!products.prev_page_url}
                        >
                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <button className="w-6 h-6 md:w-7 md:h-7 rounded-md bg-white border border-[#41B9C5] text-[#41B9C5] text-[10px] md:text-xs font-bold flex items-center justify-center">
                            1
                        </button>
                        <button
                            className="p-1 text-gray-400 hover:text-[#41B9C5] disabled:opacity-50"
                            disabled={!products.next_page_url}
                        >
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </MerchantLayout>
    );
}
