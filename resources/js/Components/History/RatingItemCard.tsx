import React from 'react';
import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import StarRating from '@/Components/Global/StarRating';

export type RatingItemType = {
    id: number;
    product_id: number;
    product_slug?: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: string | number;
    image: string;
    store_name: string;
    rating: number | null;
};

interface RatingItemCardProps {
    item: RatingItemType;
}

export default function RatingItemCard({ item }: RatingItemCardProps) {
    return (
        <Link 
            href={route('history.rating.create', { order_item: item.id })}
            className="block bg-white rounded-2xl shadow-sm border border-gray-50 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        >
            {/* Store Header */}
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-[#245D56] text-white p-1.5 rounded-md">
                        <Store className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-gray-900 text-sm">
                        {item.store_name}
                    </span>
                </div>
                <div className="px-3 py-1 rounded-full border border-[#41b9c5] text-[#41b9c5] text-xs font-medium">
                    Rating Produk
                </div>
            </div>

            {/* Product Details */}
            <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <img src={item.image} alt={item.product_name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                    <div>
                        <h4 className="text-gray-900 font-medium">{item.product_name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Variasi: {item.variant_name || "Default"}</p>
                        <p className="text-xs text-gray-500 mt-1">x{item.quantity}</p>
                    </div>
                </div>
                <div>
                    <span className={`inline-block px-6 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        item.rating 
                            ? "bg-white border border-[#245D56] text-[#245D56] hover:bg-gray-50" 
                            : "bg-[#245D56] text-white border border-transparent hover:bg-[#1a4540]"
                    }`}>
                        {item.rating ? "Perbarui" : "Nilai sekarang"}
                    </span>
                </div>
            </div>

            {/* Rating Stars Box */}
            <div className="px-6 pb-6 pt-2">
                <div className="bg-[#f3f4f6] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-sm font-medium text-gray-500">
                        {item.rating ? "Terimakasih atas penilaiannya" : "Nilai produk ini"}
                    </span>
                    <div className="flex gap-1.5">
                        <StarRating 
                            value={item.rating || 0} 
                            readOnly={true} 
                        />
                    </div>
                </div>
            </div>
        </Link>
    );
}
