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
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-[#ED7218] text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-semibold shadow-xs">
                        <Store className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{item.store_name}</span>
                    </div>
                </div>
                <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#281B7A] text-[#281B7A] text-xs font-medium">
                    Rating Produk
                </div>
            </div>

            {/* Product Details */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <img src={item.image} alt={item.product_name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-gray-100 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <h4 className="text-gray-900 font-medium text-sm sm:text-base truncate">{item.product_name}</h4>
                        <p className="text-xs text-gray-500 mt-1">Variasi: {item.variant_name || "Default"}</p>
                        <p className="text-xs text-gray-500 mt-0.5">x{item.quantity}</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <span className={`inline-block px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-xl transition-colors whitespace-nowrap text-center ${
                        item.rating 
                            ? "bg-white border border-[#ED7218] text-[#ED7218] hover:bg-orange-50" 
                            : "bg-[#ED7218] text-white border border-transparent hover:bg-[#d66311]"
                    }`}>
                        {item.rating ? "Perbarui" : "Nilai sekarang"}
                    </span>
                </div>
            </div>

            {/* Rating Stars Box */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1">
                <div className="bg-[#f3f4f6] rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-500">
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
