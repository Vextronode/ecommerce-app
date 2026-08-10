import React from "react";
import { MoreHorizontal, PackageOpen } from "lucide-react";

interface Props {
    products: any[];
}

export default function TopSelling({ products }: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col h-full">
            <div aria-label="Pilih opsi yang tersedia" className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Top Selling</h3>
                <button aria-label="Tampilkan rincian lebih lanjut" className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                {products && products.length > 0 ? (
                    <div className="space-y-5">
                        {products.map((product, index) => (
                            <div
                                key={product.id || index}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-xl object-cover border border-gray-100"
                                    />
                                    <div>
                                        <h4 className="text-sm font-bold text-[#004F54]">
                                            {product.name}
                                        </h4>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                                            {product.category} • {product.sold}{" "}
                                            sold
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-800">
                                        {product.price}
                                    </p>
                                    <p
                                        className={`text-[11px] font-bold mt-0.5 ${product.statusColor}`}
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
                        <p className="text-sm font-medium text-center">
                            Belum ada data produk terlaris.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
