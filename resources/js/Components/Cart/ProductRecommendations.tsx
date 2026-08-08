import React from "react";
import { Star, ShoppingCart, ChevronRight } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface Props {
    recommendations?: any[];
    products?: any[];
}

export default function ProductRecommendations({
    recommendations,
    products,
}: Props) {
    const items = recommendations || products || [];

    // Fungsi buat quick add dari rekomendasi
    const handleQuickAdd = (e: React.MouseEvent, productId: number | string) => {
        e.preventDefault();
        e.stopPropagation();

        router.post(
            "/cart",
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Produk berhasil ditambahkan ke keranjang!");
                },
                onError: () => {
                    toast.error("Gagal menambahkan produk ke keranjang.");
                },
            }
        );
    };

    if (items.length === 0) return null;

    return (
        <div className="mt-16 pt-12 border-t border-slate-200/60 relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Rekomendasi Produk
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {items.map((prod, idx) => {
                    const rawPrice =
                        typeof prod.price === "number"
                            ? prod.price
                            : !isNaN(Number(prod.price))
                            ? Number(prod.price)
                            : typeof prod.price === "string"
                            ? Number(prod.price.replace(/[^0-9]/g, "")) || 0
                            : 0;

                    const formattedPrice = `Rp. ${rawPrice.toLocaleString("id-ID")}`;
                    const rawRating =
                        prod.rating !== undefined && prod.rating !== null
                            ? Number(prod.rating)
                            : 0;
                    const ratingNum = isNaN(rawRating) ? 0 : rawRating;
                    const ratingDisplay = ratingNum.toFixed(1);

                    const soldCount = prod.sold ? Number(prod.sold) : 0;
                    const formatSold = (qty: number) => {
                        if (qty >= 10000) return `${Math.floor(qty / 1000)}rb+Terjual`;
                        if (qty >= 1000) return `${(qty / 1000).toFixed(1).replace(".0", "")}rb+Terjual`;
                        return `${qty} Terjual`;
                    };

                    const categoryName =
                        prod.category_name ||
                        (typeof prod.category === "object" && prod.category?.name
                            ? prod.category.name
                            : typeof prod.category === "string"
                            ? prod.category
                            : "Pilihan");

                    const image =
                        prod.img ||
                        prod.image ||
                        prod.image_path ||
                        "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&q=80&w=400";

                    const slug = prod.slug || String(prod.id);

                    return (
                        <Link
                            key={prod.id || idx}
                            href={route("product.detail", slug)}
                            className="bg-white rounded-2xl p-3 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-gray-200 transition-all duration-300 flex flex-col group/card cursor-pointer"
                        >
                            <div className="relative mb-2.5 aspect-square rounded-xl overflow-hidden bg-[#F8FAFC]">
                                <img
                                    src={image}
                                    alt={prod.name}
                                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                                />
                            </div>

                            <div className="flex flex-col flex-1">
                                <span className="text-[11px] font-medium text-gray-500 line-clamp-1 mb-0.5">
                                    {categoryName}
                                </span>
                                <h3
                                    className="font-bold text-gray-900 text-xs line-clamp-1 mb-1.5 group-hover/card:text-[#004F54] transition-colors"
                                    title={prod.name}
                                >
                                    {prod.name}
                                </h3>
                                <div className="flex items-center justify-between text-[11px] mb-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-[#FF7A00] fill-[#FF7A00]" />
                                        <span className="font-semibold text-gray-800">
                                            ({ratingDisplay})
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800">
                                        {formatSold(soldCount)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-auto pt-1">
                                    <p className="font-bold text-gray-900 text-xs sm:text-sm tracking-tight">
                                        {formattedPrice}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => handleQuickAdd(e, prod.id)}
                                        className="p-1 text-[#FF7A00] hover:text-[#E06900] hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
                                        title="Tambah ke Keranjang"
                                    >
                                        <ShoppingCart className="w-4 h-4 stroke-[1.8]" />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Chevron icon, hidden di mobile */}
            {items.length >= 6 && (
                <button className="absolute top-[60%] -right-5 -translate-y-1/2 w-10 h-10 bg-[#40E0D0] text-white rounded-full items-center justify-center shadow-lg hover:bg-[#35c9ba] transition z-10 hidden xl:flex">
                    <ChevronRight className="w-6 h-6" />
                </button>
            )}
        </div>
    );
}
