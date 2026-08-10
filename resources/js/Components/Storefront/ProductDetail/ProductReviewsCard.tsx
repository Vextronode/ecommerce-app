import React from "react";
import { Star } from "lucide-react";

interface Review {
    id: number;
    user?: {
        name: string;
    };
    rating: number;
    comment: string | null;
    is_anonymous: boolean;
    created_at: string;
    images?: string[];
}

interface Props {
    reviews?: Review[];
    reviewsCount?: number;
    averageRating?: number | string;
}

const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};

const formatName = (review: Review) => {
    if (review.is_anonymous || !review.user?.name) {
        return "Pengguna Anonim";
    }
    // Format to "Budi W."
    const parts = review.user.name.split(' ');
    if (parts.length > 1) {
        return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return review.user.name;
};

const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    return `${Math.floor(diffDays / 30)} bulan yang lalu`;
};

export default function ProductReviewsCard({ reviews = [], reviewsCount = 0, averageRating = 0 }: Props) {
    const formattedRating = Number(averageRating).toFixed(1);

    return (
        <div className="rounded-[1.75rem] border border-slate-100 bg-white p-6 md:p-8 shadow-sm">
            {/* header */}
            <div className="flex items-start justify-between gap-4 mb-8 pb-8 border-b border-slate-100">
                <div className="space-y-1.5">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
                        Customer Reviews
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* rating */}
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>
                        <span className="font-bold text-gray-950 text-base">
                            {formattedRating}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                            ({reviewsCount} reviews)
                        </span>
                    </div>
                </div>
                <a
                    href="#"
                    className="text-sm font-bold text-[#0066CC] hover:text-[#1a443f] transition whitespace-nowrap"
                >
                    See all
                </a>
            </div>

            {/* reviewer list */}
            {reviews.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                    Belum ada ulasan untuk produk ini.
                </div>
            ) : (
                <div className="space-y-8">
                    {reviews.map((review) => {
                        const displayName = formatName(review);
                        const initials = review.is_anonymous ? "A" : (review.user?.name ? getInitials(review.user.name) : "U");

                        return (
                            <div key={review.id} className="pt-2">
                                <div className="flex items-start justify-between gap-4 mb-5">
                                    {/* user info */}
                                    <div className="flex gap-4">
                                        {/* avatar */}
                                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg border border-blue-200">
                                            {initials}
                                        </div>
                                        {/* name & date */}
                                        <div className="flex flex-col">
                                            <h4 className="font-bold text-gray-950 text-base">
                                                {displayName}
                                            </h4>
                                            <span className="text-xs text-slate-500 mt-1">
                                                {getRelativeTime(review.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    {/* review star rating */}
                                    <div className="flex gap-0.5 pt-1.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`}
                                                strokeWidth={1.5}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* review text */}
                                <p className="text-sm text-slate-600 leading-relaxed mb-3">
                                    {review.comment || "Tidak ada komentar"}
                                </p>

                                {/* review images */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {review.images.map((img, idx) => (
                                            <div key={review.id} className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border border-gray-200">
                                                {img.match(/\.(mp4|mov)$/i) ? (
                                                    <video src={img} className="w-full h-full object-cover" controls />
                                                ) : (
                                                    <img src={img} alt={`Review ${idx}`} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
