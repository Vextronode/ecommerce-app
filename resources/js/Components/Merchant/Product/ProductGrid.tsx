import React from "react";
import { Image as ImageIcon } from "lucide-react";
import ProductActions from "./ProductActions";

interface Props {
    products: any[];
    getStockIndicator: (stock: number) => any;
}

export default function ProductGrid({ products, getStockIndicator }: Props) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.length > 0 ? (
                products.map((product: any) => {
                    const stockUI = getStockIndicator(product.stock);
                    return (
                        <div
                            key={product.id}
                            className="bg-white border border-[#41B9C5]/20 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative"
                        >
                            <div className="absolute top-2 right-2">
                                <ProductActions product={product} />
                            </div>
                            <div className="mb-4 aspect-square rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                                {product.image_path ? (
                                    <img
                                        src={product.image_path}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                )}
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm md:text-base truncate mb-1">
                                {product.name}
                            </h3>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-1">
                                {product.category?.name || "Uncategorized"}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-bold text-[#41B9C5] text-sm md:text-base">
                                    {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        maximumFractionDigits: 0,
                                    }).format(product.price)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`w-2 h-2 rounded-full ${stockUI.dotColor}`}
                                    ></span>
                                    <span className="text-xs font-semibold text-gray-600">
                                        {product.stock} Stok
                                    </span>
                                </div>
                                <span
                                    className={`${stockUI.badgeBg} ${stockUI.badgeText} text-[10px] font-bold px-2 py-1 rounded-full`}
                                >
                                    {stockUI.label}
                                </span>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="col-span-full py-12 text-center text-gray-500 text-xs md:text-sm bg-white border border-[#41B9C5]/30 rounded-3xl">
                    Belum ada produk sesuai filter.
                </div>
            )}
        </div>
    );
}
