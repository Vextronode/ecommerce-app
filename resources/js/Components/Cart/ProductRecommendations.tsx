import React from "react";
import { Plus, Star, ChevronRight } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface Props {
    recommendations: any[];
}

export default function ProductRecommendations({ recommendations }: Props) {
    // Fungsi buat quick add dari rekomendasi
    const handleQuickAdd = (productId: number) => {
        router.post(
            "/cart",
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Produk berhasil ditambahkan!");
                },
            },
        );
    };

    if (recommendations.length === 0) return null;

    return (
        <div className="mt-16 pt-12 border-t border-slate-200/60 relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Rekomendasi Product
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recommendations.map((prod, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 hover:shadow-md transition group"
                    >
                        <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-slate-50">
                            <img
                                src={prod.img}
                                alt={prod.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            <button
                                onClick={() => handleQuickAdd(prod.id)}
                                className="absolute bottom-2 right-2 w-8 h-8 bg-white text-[#40E0D0] rounded-full flex items-center justify-center shadow-sm hover:bg-[#40E0D0] hover:text-white transition"
                                title="Tambah ke keranjang"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xs line-clamp-2 mb-1">
                            {prod.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-[10px] font-bold text-gray-700">
                                {prod.rating}
                            </span>
                            <span className="text-[10px] text-slate-400">
                                | {prod.sold}
                            </span>
                        </div>
                        <p className="font-bold text-[#40E0D0] text-sm">
                            Rp {Number(prod.price).toLocaleString("id-ID")}
                        </p>
                    </div>
                ))}
            </div>

            {/* chevron icon, hidden kalo di hp */}
            {recommendations.length >= 6 && (
                <button className="absolute top-[60%] -right-5 -translate-y-1/2 w-10 h-10 bg-[#40E0D0] text-white rounded-full items-center justify-center shadow-lg hover:bg-[#35c9ba] transition z-10 hidden xl:flex">
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
