import React from 'react';
import { Link, router } from '@inertiajs/react';
import { Star, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductCard({ product }: { product: any }) {
    // Pastikan field sesuai dengan format produk dari controller
    const name = product.name;
    const priceStr = typeof product.price === 'number' || !isNaN(Number(product.price))
        ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(product.price))
        : product.price;

    const rating = product.rating ? Number(product.rating) : 0.0;
    const sold = product.sold || 0;
    const image = product.image || product.image_path || "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?auto=format&fit=crop&q=80&w=400";

    return (
        <Link
            href={route('product.detail', product.slug)}
            className="bg-gradient-to-b from-[#e0f7fa] to-[#e8fbfb] p-2 rounded-[2rem] shadow-sm hover:shadow-md border border-cyan-50 transition duration-300 relative flex flex-col h-full cursor-pointer group/card overflow-hidden"
        >
            {/* Badge & image */}
            <div className="relative flex flex-col items-center justify-center pt-2 pb-4">
                {/* Badge */}
                <div className="absolute top-2 left-2 bg-white text-orange-500 px-3 py-1 rounded-md text-[10px] md:text-xs font-bold flex items-center gap-1 z-10 shadow-sm">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-orange-500 text-orange-500" />
                    Star Seller
                </div>

                {/* Image */}
                <div className="w-full aspect-square flex items-center justify-center mt-6">
                    <img
                        src={image}
                        alt={name}
                        className="object-contain w-3/4 h-3/4 group-hover/card:scale-105 transition-transform duration-500 ease-in-out drop-shadow-xl"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[1.5rem] p-4 md:p-5 flex flex-col mt-auto relative z-10 shadow-sm flex-1">
                {/* Product Info */}
                <h3 className="font-bold text-[#1F2937] text-sm md:text-base mb-4 line-clamp-2 leading-tight text-center min-h-[36px] md:min-h-[44px] flex items-center justify-center">
                    {name}
                </h3>

                <div className="flex items-center justify-between w-full text-[11px] md:text-xs text-gray-700 mb-2 mt-auto">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                        <span>({rating.toFixed(1)})</span>
                    </div>
                    <span>
                        {sold} Terjual
                    </span>
                </div>

                {/* Price */}
                <p className="text-[#004F54] font-black text-base md:text-lg mb-4 text-left w-full">
                    {priceStr}
                </p>

                {/* Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
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
                            }
                        );
                    }}
                    className="w-full bg-[#40E0D0] hover:bg-[#38c9ba] text-white py-2 md:py-2.5 rounded-full font-bold text-[11px] md:text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-[#40E0D0]/20"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                </button>
            </div>
        </Link>
    );
}
