import React from "react";
import { Image as ImageIcon } from "lucide-react";
import ProductActions from "./ProductActions";

interface Props {
    products: any[];
    getStockIndicator: (stock: number) => any;
}

export default function ProductTable({ products, getStockIndicator }: Props) {
    return (
        <div className="bg-white rounded-3xl border border-[#41B9C5]/30 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-200">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                IMAGE
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                PRODUCT NAME
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                CATEGORY
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                PRICE
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                STOCK
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                STATUS
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase text-right">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.length > 0 ? (
                            products.map((product: any) => {
                                const stockUI = getStockIndicator(
                                    product.stock,
                                );
                                return (
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
                                                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${stockUI.dotColor}`}
                                                ></span>
                                                <span
                                                    className={`text-xs md:text-sm font-bold ${stockUI.badgeText}`}
                                                >
                                                    {product.stock}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <span
                                                className={`${stockUI.badgeBg} ${stockUI.badgeText} text-[10px] md:text-[11px] font-bold px-2 md:px-3 py-1 rounded-full`}
                                            >
                                                {stockUI.label}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6 text-right">
                                            <ProductActions product={product} />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="py-12 text-center text-gray-500 text-xs md:text-sm"
                                >
                                    Belum ada produk sesuai filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
