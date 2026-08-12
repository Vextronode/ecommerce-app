import React from 'react';
import { Store, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import StoreAvatar from '@/Components/Global/StoreAvatar';

interface StoreProfileProps {
    store: {
        id: number;
        name: string;
        description: string;
        logo_path?: string;
        products_count?: number;
        reviews_avg_rating?: number;
        followers_count?: number;
        created_at: string;
        slug: string;
    };
}

export default function StoreProfileCard({ store }: StoreProfileProps) {
    // Format joined date — menggunakan hitungan hari agar konsisten dengan backend
    const getJoinedText = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays < 7) return 'Baru bergabung';
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} minggu yang lalu`;
        }
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} bulan yang lalu`;
        }
        const years = Math.floor(diffDays / 365);
        return `${years} tahun yang lalu`;
    };

    // Format number for display
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'JT';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'RB';
        return num.toString();
    };

    const ratingDisplay = store.reviews_avg_rating
        ? Number(store.reviews_avg_rating).toFixed(1)
        : '0.0';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 mb-8 flex flex-col md:flex-row gap-6 md:items-center">

            {/* Left Side: Store Info */}
            <div className="flex items-start gap-4 md:w-5/12 shrink-0">
                <div className="w-16 h-16 rounded-full border border-gray-100 overflow-hidden bg-gray-50 shrink-0">
                    <StoreAvatar 
                        logoPath={store.logo_path} 
                        storeName={store.name} 
                        className="w-full h-full"
                    />
                </div>
                <div className="flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
                    <p className="text-sm text-gray-500 mb-3">{store.description || "Toko Kelontong"}</p>
                    <Link
                        href={route('store.detail', store.slug)}
                        className="inline-flex items-center justify-center gap-1.5 border border-[#41B9C5] text-[#41B9C5] text-xs font-medium px-4 py-1.5 rounded bg-[#e0f7fa]/30 hover:bg-[#41B9C5] hover:text-white transition-colors w-fit"
                    >
                        <Store className="w-3.5 h-3.5" />
                        Kunjungin Toko
                    </Link>
                </div>
            </div>

            {/* Vertical Divider (Desktop only) */}
            <div className="hidden md:block w-px h-16 bg-gray-100 mx-2"></div>
            {/* Horizontal Divider (Mobile only) */}
            <div className="block md:hidden h-px w-full bg-gray-100 my-1"></div>

            {/* Right Side: Store Stats */}
            <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div className="flex items-center justify-between md:justify-start gap-2 md:gap-8">
                    <span className="text-gray-500">Penilaian Toko</span>
                    <span className="font-medium text-[#ED7218]">{ratingDisplay}</span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-2 md:gap-8">
                    <span className="text-gray-500">Total Produk</span>
                    <span className="font-medium text-[#ED7218]">{store.products_count || 0}</span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-2 md:gap-8">
                    <span className="text-gray-500">Pengikut</span>
                    <span className="font-medium text-[#ED7218]">{formatNumber(store.followers_count || 0)}</span>
                </div>
                <div className="flex items-center justify-between md:justify-start gap-2 md:gap-8">
                    <span className="text-gray-500">Bergabung</span>
                    <span className="font-medium text-[#ED7218]">{getJoinedText(store.created_at)}</span>
                </div>
            </div>

        </div>
    );
}
