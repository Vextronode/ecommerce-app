import React from 'react';
import StarRating from '@/Components/Global/StarRating';

interface ReviewAdditionalRatingsProps {
    sellerRating: number;
    shippingRating: number;
    courierRating: number;
    onChangeSeller: (val: number) => void;
    onChangeShipping: (val: number) => void;
    onChangeCourier: (val: number) => void;
}

export default function ReviewAdditionalRatings({
    sellerRating,
    shippingRating,
    courierRating,
    onChangeSeller,
    onChangeShipping,
    onChangeCourier
}: ReviewAdditionalRatingsProps) {
    return (
        <div className="space-y-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-semibold text-gray-700">Pelayanan Penjual</label>
                <StarRating value={sellerRating} onChange={onChangeSeller} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-semibold text-gray-700">Kecepatan Jasa Kirim</label>
                <StarRating value={shippingRating} onChange={onChangeShipping} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-semibold text-gray-700">Pelayanan Kurir</label>
                <StarRating value={courierRating} onChange={onChangeCourier} />
            </div>
        </div>
    );
}
