import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Navbar from '@/Components/Global/Navbar';
import StarRating from '@/Components/Global/StarRating';
import ReviewImageUploader from '@/Components/History/ReviewImageUploader';
import ReviewAdditionalRatings from '@/Components/History/ReviewAdditionalRatings';
import InputError from '@/Components/InputError';

import { useProductReviewForm } from '@/Hooks/Storefront/useProductReviewForm';

interface Props {
    orderItem: {
        id: number;
        product_id: number;
        product_name: string;
        variant_name: string | null;
        quantity: number;
        price: string | number;
        image: string;
        store_name: string;
        existing_review?: {
            rating: number;
            comment: string | null;
            is_anonymous: boolean;
            seller_rating: number | null;
            shipping_rating: number | null;
            courier_rating: number | null;
            images: string[];
        } | null;
    }
}

export default function RatingForm({ orderItem }: Props) {
    const {
        data,
        setData,
        previewImages,
        setPreviewImages,
        processing,
        errors,
        handleSubmit,
    } = useProductReviewForm({
        orderItemId: orderItem.id,
        existingReview: orderItem.existing_review,
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title={`Nilai Produk - ${orderItem.product_name}`} />
            <Navbar />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-32">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">

                    {/* Product Info & Main Rating */}
                    <div className="w-full md:w-5/12 p-6 md:p-8 md:border-r border-b md:border-b-0 border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4 mb-8">
                            <img
                                src={orderItem.image}
                                alt={orderItem.product_name}
                                className="w-20 h-20 rounded-xl object-cover border border-gray-200 shadow-sm"
                            />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{orderItem.product_name}</h2>
                                <p className="text-sm text-gray-500 mt-1">Variasi: {orderItem.variant_name || "Default"}</p>
                            </div>
                        </div>

                        {/* Main Product Rating */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <label className="block text-sm font-bold text-gray-900 mb-3">Nilai Produk</label>
                            <StarRating
                                value={data.rating}
                                onChange={(val) => setData('rating', val)}
                                starClassName="w-7 h-7"
                            />
                            <InputError message={errors.rating} className="mt-2" />
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="w-full md:w-7/12 p-6 md:p-8 space-y-8">

                        {/* File Upload Component */}
                        <ReviewImageUploader
                            images={data.images}
                            onImagesChange={(files) => setData('images', files)}
                            previewImages={previewImages}
                            onPreviewImagesChange={setPreviewImages}
                            error={(errors.images || errors['images.0'] || errors['images.1'] || errors['images.2']) as string}
                        />

                        {/* Comment */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-3">Tulis ulasannya</label>
                            <textarea
                                value={data.comment}
                                onChange={(e) => setData('comment', e.target.value)}
                                rows={4}
                                className="w-full rounded-2xl border-gray-200 shadow-sm focus:border-[#245D56] focus:ring-[#245D56] bg-gray-50/50 p-4 transition-colors"
                                placeholder="Bagikan pengalamanmu menggunakan produk ini..."
                            ></textarea>
                            <InputError message={errors.comment} className="mt-2" />
                        </div>

                        {/* Anonymous Toggle */}
                        <div className="flex items-center">
                            <input
                                id="is_anonymous"
                                type="checkbox"
                                checked={data.is_anonymous}
                                onChange={(e) => setData('is_anonymous', e.target.checked)}
                                className="w-4 h-4 text-[#245D56] border-gray-300 rounded focus:ring-[#245D56] cursor-pointer"
                            />
                            <label htmlFor="is_anonymous" className="ml-2 text-sm text-gray-600 font-medium cursor-pointer">
                                Sembunyikan username pada penilaian
                            </label>
                        </div>

                        <div className="h-px bg-gray-100 w-full"></div>

                        {/* Additional Ratings Component */}
                        <ReviewAdditionalRatings
                            sellerRating={data.seller_rating}
                            shippingRating={data.shipping_rating}
                            courierRating={data.courier_rating}
                            onChangeSeller={(val) => setData('seller_rating', val)}
                            onChangeShipping={(val) => setData('shipping_rating', val)}
                            onChangeCourier={(val) => setData('courier_rating', val)}
                        />

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-end gap-3">
                            <Link
                                href={route('history.index', { status: 'rating' })}
                                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 bg-[#245D56] text-white font-bold rounded-xl hover:bg-[#1a4540] transition-colors disabled:opacity-50"
                            >
                                {processing ? 'MENGIRIM...' : 'KIRIM'}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
