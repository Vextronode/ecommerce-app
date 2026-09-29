import React from 'react';
import { router } from '@inertiajs/react';

interface BestSellingProductsTableProps {
    products: any[];
}

export default function BestSellingProductsTable({ products }: BestSellingProductsTableProps) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-brand-orange/20 shadow-sm col-span-1">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-900">Produk Terlaris</h3>
                <button 
                    onClick={() => router.visit(route('merchant.products.index'))}
                    className="text-xs font-bold text-brand-orange hover:text-brand-orange-dark transition-colors"
                >
                    Lihat Semua
                </button>
            </div>
            
            <div className="space-y-6">
                {products.map((product, index) => (
                    <div key={product.id || index}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-800 font-medium truncate max-w-[70%]">{product.name}</span>
                            <span className="text-sm font-bold text-gray-900">{product.sold} terjual</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                    index < 2 
                                        ? 'bg-brand-orange' 
                                        : 'bg-brand-orange/40'
                                }`} 
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
