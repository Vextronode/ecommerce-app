import React from "react";
import { PackageOpen } from "lucide-react";

interface Props {
    products: any[];
}

export default function TopSelling({ products }: Props) {
    return (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-orange/30 shadow-sm flex flex-col h-full max-w-full overflow-hidden">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h3 className="text-base sm:text-lg font-bold text-brand-orange">Produk Terlaris</h3>
            </div>

            <div className="flex-1 flex flex-col justify-start">
                {products && products.length > 0 ? (
                    <div className="space-y-4 sm:space-y-5">
                        {products.map((product, index) => (
                            <div
                                key={product.id || index}
                                className="flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-xs sm:text-sm font-bold text-brand-orange truncate">
                                            {product.name}
                                        </h4>
                                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5 truncate">
                                            {product.category} • {product.sold} terjual
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs sm:text-sm font-bold text-brand-orange">
                                        {product.price}
                                    </p>
                                    <p
                                        className={`text-[10px] sm:text-[11px] font-bold mt-0.5 ${product.statusColor}`}
                                    >
                                        {product.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2 h-full py-6">
                        <PackageOpen className="w-10 h-10 text-gray-300 mb-1" />
                        <p className="text-xs sm:text-sm font-medium text-center">
                            Belum ada data produk terlaris.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
