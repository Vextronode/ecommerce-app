import React from "react";
import { Link, router } from "@inertiajs/react";
import { Star, ShoppingCart, Store } from "lucide-react";
import toast from "react-hot-toast";

export interface ProductCardData {
    id: number | string;
    name: string;
    slug?: string;
    store?: { id?: number; name?: string; slug?: string } | string;
    store_name?: string;
    category?: { id?: number; name?: string; slug?: string } | string;
    category_name?: string;
    price: number | string;
    rating?: number | string;
    sold?: number | string;
    image?: string;
    image_path?: string;
}

export default function ProductCard({ product }: { product: any }) {
    const name = product.name || "Produk Cibenda";
    const slug = product.slug || String(product.id);

    // Resolve store name
    const storeName =
        product.store_name ||
        (typeof product.store === "object" && product.store?.name
            ? product.store.name
            : typeof product.store === "string"
            ? product.store
            : null);

    // Resolve category name
    const categoryName =
        product.category_name ||
        (typeof product.category === "object" && product.category?.name
            ? product.category.name
            : typeof product.category === "string"
            ? product.category
            : "Produk");

    // Format price: e.g. Rp. 150.000
    const rawPrice =
        typeof product.price === "number"
            ? product.price
            : !isNaN(Number(product.price))
            ? Number(product.price)
            : typeof product.price === "string"
            ? Number(product.price.replace(/[^0-9]/g, "")) || 0
            : 0;

    const formattedPrice = `Rp. ${rawPrice.toLocaleString("id-ID")}`;

    // Format rating (e.g. 5.0, 4.8, 0.0)
    const rawRating =
        product.rating !== undefined && product.rating !== null
            ? Number(product.rating)
            : 0;
    const ratingNum = isNaN(rawRating) ? 0 : rawRating;
    const ratingDisplay = ratingNum.toFixed(1);

    // Format sold count (e.g. 10rb+Terjual, 12 Terjual)
    const soldCount = product.sold ? Number(product.sold) : 0;
    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const formatSold = (qty: number) => {
        if (qty >= 10000) {
            return `${Math.floor(qty / 1000)}rb+Terjual`;
        }
        if (qty >= 1000) {
            return `${(qty / 1000).toFixed(1).replace(".0", "")}rb+Terjual`;
        }
        return `${qty} Terjual`;
    };
    const soldDisplay = formatSold(soldCount);

    // Image with clean fallback
    const image =
        product.image ||
        product.image_path ||
        "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400";

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        router.post(
            "/cart",
            {
                product_id: product.id,
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

    return (
        <Link
            href={route("product.detail", slug)}
            className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.06),0_2px_6px_-1px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.12),0_4px_12px_-2px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-gray-200 transition duration-300 flex flex-col h-full overflow-hidden p-3 sm:p-3.5 group/card cursor-pointer"
        >
            {/* Product Image Area */}
            <div className="w-full aspect-square rounded-xl bg-[#F8FAFC] overflow-hidden flex items-center justify-center relative mb-3">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                />
            </div>

            {/* Product Meta Info */}
            <div className="flex flex-col flex-1">
                {/* Category */}
                <span className="text-xs sm:text-sm font-medium text-gray-500 line-clamp-1 mb-1">
                    {categoryName}
                </span>

                {/* Product Title */}
                <h3
                    className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 leading-snug mb-1 group-hover/card:text-[#004F54] transition-colors"
                    title={name}
                >
                    {name}
                </h3>

                {/* Store Name */}
                {storeName && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <Store className="w-3.5 h-3.5 text-[#215B63] shrink-0" />
                        <span className="truncate font-medium hover:text-[#215B63] transition-colors">
                            {storeName}
                        </span>
                    </div>
                )}

                {/* Rating & Sold Row */}
                <div className="flex items-center justify-between text-xs sm:text-sm mb-3">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FF7A00] fill-[#FF7A00]" />
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                            ({ratingDisplay})
                        </span>
                    </div>

                    {/* Total Sold */}
                    <span className="font-medium text-gray-800 text-xs sm:text-sm">
                        {soldDisplay}
                    </span>
                </div>

                {/* Price & Add to Cart Action Row */}
                <div className="flex items-center justify-between mt-auto pt-1">
                    {/* Price */}
                    <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                        {formattedPrice}
                    </span>

                    {/* Shopping Cart Button */}
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="p-1 text-[#FF7A00] hover:text-[#E06900] hover:scale-110 active:scale-95 transition cursor-pointer flex items-center justify-center shrink-0"
                        title="Tambah ke Keranjang"
                    >
                        <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
