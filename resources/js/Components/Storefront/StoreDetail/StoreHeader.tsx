import React, { useState } from 'react';
import { Share2, Star, Check, UserCheck, UserPlus } from 'lucide-react';
import StoreAvatar from '@/Components/Global/StoreAvatar';
import toast from 'react-hot-toast';

interface Props {
    store: any;
    isFollowing: boolean;
    onFollow: () => void;
    isLoadingFollow?: boolean;
}

export default function StoreHeader({ store, isFollowing, onFollow, isLoadingFollow }: Props) {
    const [isCopied, setIsCopied] = useState(false);
    const defaultCover = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop";

    const handleShare = async () => {
        const shareData = {
            title: `${store.name} - CibendaMart`,
            text: `Yuk belanja berbagai produk terbaik di toko ${store.name} di CibendaMart!`,
            url: window.location.href,
        };

        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                copyLinkToClipboard();
            }
        } else {
            copyLinkToClipboard();
        }
    };

    const copyLinkToClipboard = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href)
                .then(() => {
                    setIsCopied(true);
                    toast.success("Link toko berhasil disalin ke clipboard!");
                    setTimeout(() => setIsCopied(false), 2500);
                })
                .catch(() => {
                    toast.error("Gagal menyalin link toko.");
                });
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url(${defaultCover})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />

            {/* Avatar */}
            <div className="relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-50 shrink-0">
                <StoreAvatar
                    logoPath={store.logo_path}
                    storeName={store.name}
                    className="w-full h-full text-3xl"
                />
            </div>

            {/* Store Info */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center md:items-center justify-between w-full">
                <div className="text-center md:text-left space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{store.name}</h1>
                    <p className="text-gray-500 text-sm md:text-base">
                        {store.address || "Kab. Pangandaran"}
                    </p>
                    <div className="flex items-center gap-3 pt-2 justify-center md:justify-start">
                        <button
                            onClick={onFollow}
                            disabled={isLoadingFollow}
                            className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                                isFollowing
                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                                    : "bg-[#F77F00] text-white hover:bg-[#D95C00]"
                            }`}
                        >
                            {isFollowing ? (
                                <>
                                    <UserCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Mengikuti</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>Ikuti Toko</span>
                                </>
                            )}
                        </button>
                        <button 
                            onClick={handleShare}
                            title="Bagikan link toko ini"
                            aria-label="Bagikan toko"
                            className="p-2.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center"
                        >
                            {isCopied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Rating & Sold Stats */}
                <div className="mt-6 md:mt-0 flex items-center justify-center md:justify-end">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                            <span className="font-bold text-lg text-gray-900">{store.average_rating || "0.0"}</span>
                            <span className="text-gray-900 font-bold text-lg">({store.total_sold > 1000 ? (store.total_sold / 1000).toFixed(1) + 'rb' : store.total_sold || 0} terjual)</span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Rating & Penjualan</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
