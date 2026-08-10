import React from 'react';
import { router } from '@inertiajs/react';

interface BestSellingProductsTableProps {
    products: any[];
}

export default function BestSellingProductsTable({ products }: BestSellingProductsTableProps) {
    return (
        <div className="bg-white p-6 rounded-[20px] border border-[#41B9C5]/20 shadow-sm col-span-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#14433D]">Best Selling Products</h3>
                <button 
                    onClick={() => router.visit(route('merchant.products.index'))}
                    className="text-xs font-bold text-[#41B9C5] hover:text-[#14433D] transition-colors"
                >
                    View All
                </button>
            </div>
            
            <div className="space-y-6">
                {products.map((product, index) => (
                    <div key={product.id || index}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-700 font-medium truncate max-w-[70%]">{product.name}</span>
                            <span className="text-sm font-bold text-[#14433D]">{product.sold} sold</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className="bg-[#41B9C5] h-2 rounded-full" 
                                style={{ width: `${product.progress}%` }}
                            ></div>
                        </div>
                    </div>
                ))}

                {products.length === 0 && (
                    <p className="text-sm text-center text-gray-400 py-8">Belum ada produk yang terjual.</p>
                )}
            </div>
        </div>
    );
}
