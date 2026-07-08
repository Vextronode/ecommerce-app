import React from "react";
import { MoreHorizontal } from "lucide-react";

export default function TopSelling() {
    const products = [
        {
            name: "Udang Besar",
            category: "Seafood",
            sold: 248,
            price: "Rp 120k",
            status: "In Stock",
            statusColor: "text-[#41B9C5]",
            image: "https://placehold.co/100x100/e2e8f0/64748b?text=U",
        },
        {
            name: "Tuna",
            category: "Seafood",
            sold: 192,
            price: "Rp 85k",
            status: "In Stock",
            statusColor: "text-[#41B9C5]",
            image: "https://placehold.co/100x100/e2e8f0/64748b?text=T",
        },
        {
            name: "Alpukat",
            category: "Grocery",
            sold: 156,
            price: "Rp 45k",
            status: "Low Stock",
            statusColor: "text-red-500",
            image: "https://placehold.co/100x100/e2e8f0/64748b?text=A",
        },
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800">Top Selling</h3>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-5">
                {products.map((product, index) => (
                    <div
                        key={index}
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
                                    {product.category} • {product.sold} sold
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
        </div>
    );
}
