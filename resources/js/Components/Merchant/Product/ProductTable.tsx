import React from "react";
import { Link } from "@inertiajs/react";
import { formatRupiah } from "@/utils/formatters";
import { Image as ImageIcon, Edit } from "lucide-react";
import ProductActions from "./ProductActions";

interface Props {
    products: any[];
    getStockIndicator: (stock: number) => any;
}

export default function ProductTable({ products, getStockIndicator }: Props) {
    return (
        <div className="bg-white rounded-3xl border border-brand-orange/30 shadow-sm overflow-hidden w-full max-w-full">
            {/* Desktop Table View (>= 768px) */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-200">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                GAMBAR
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                NAMA PRODUK
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                KATEGORI
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                HARGA
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                STOK
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase">
                                STATUS
                            </th>
                            <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold text-gray-500 uppercase text-right">
                                AKSI
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
                                            <Link
                                                href={route("merchant.products.edit", product.slug)}
                                                className="text-xs md:text-sm font-bold text-brand-orange cursor-pointer hover:underline"
                                            >
                                                {product.name}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] md:text-xs font-semibold px-2 md:px-3 py-1 rounded-full">
                                                {product.category?.name ||
                                                    "Umum"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 md:py-4 md:px-6">
                                            <span className="text-xs md:text-sm font-bold text-brand-orange">
                                                {formatRupiah(product.price)}
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

            {/* Mobile Card List View (< 768px) */}
            <div className="block md:hidden p-3 sm:p-4 space-y-3 bg-gray-50/60">
                {products.length > 0 ? (
                    products.map((product: any) => {
                        const stockUI = getStockIndicator(product.stock);
                        return (
                            <div
                                key={product.id}
                                className="bg-white rounded-2xl border border-gray-200/80 p-3.5 shadow-xs hover:border-brand-orange/40 transition-all flex flex-col gap-3"
                            >
                                {/* Top: Image, Name, Category, Stock Status Badge */}
                                <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                                        {product.image_path ? (
                                            <img
                                                src={product.image_path}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-gray-400" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-md truncate max-w-30">
                                                {product.category?.name || "Umum"}
                                            </span>
                                            <span
                                                className={`${stockUI.badgeBg} ${stockUI.badgeText} text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${stockUI.dotColor}`} />
                                                {stockUI.label}
                                            </span>
                                        </div>

                                        <Link
                                            href={route("merchant.products.edit", product.slug)}
                                            className="font-bold text-sm text-gray-900 line-clamp-1 hover:text-brand-orange transition-colors"
                                        >
                                            {product.name}
                                        </Link>

                                        <p className="text-sm font-extrabold text-brand-orange mt-1">
                                            {formatRupiah(product.price)}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom: Stock count & Quick Actions */}
                                <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] text-gray-400 font-medium">Sisa Stok:</span>
                                        <span className={`text-xs font-bold ${stockUI.badgeText}`}>
                                            {product.stock} {product.unit || "pcs"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={route("merchant.products.edit", product.slug)}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-orange-tint text-brand-orange hover:bg-brand-orange hover:text-white transition-colors border border-brand-orange/30 shadow-xs cursor-pointer active:scale-95"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            <span>Ubah</span>
                                        </Link>
                                        <ProductActions product={product} />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-12 text-center text-gray-500 text-xs bg-white rounded-2xl border border-gray-100">
                        Belum ada produk sesuai filter.
                    </div>
                )}
            </div>
        </div>
    );
}
