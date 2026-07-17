import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import toast from "react-hot-toast";
import { Product } from "./ProductCarousel";

interface ShopProductRowProps {
    title: string;
    products: Product[];

}

export default function ShopProductRow({
    title,
    products = [],
}: ShopProductRowProps) {
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);

    // deteksi viewport buat nentuin jumlah produk per halaman
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerPage(2); // Mobile: 2 produk
            else if (window.innerWidth < 1024) setItemsPerPage(3); // Tablet: 3 produk
            else setItemsPerPage(5); // Desktop: 5 produk
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // chunking
    const pages = [];
    for (let i = 0; i < products.length; i += itemsPerPage) {
        pages.push(products.slice(i, i + itemsPerPage));
    }

    const totalPages = pages.length;

    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1);
        }
    }, [totalPages, currentPage]);

    const next = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const prev = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    if (products.length === 0) return null;

    return (
        <div className="w-full py-8 md:py-10">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                {/* HEADER - Left Aligned */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        {title}
                    </h2>
                </div>

                {/* CAROUSEL WRAPPER */}
                <div className="relative w-full pb-4">
                    {/* PREV BUTTON */}
                    <button
                        onClick={prev}
                        disabled={currentPage === 0}
                        className={`absolute top-1/2 -translate-y-1/2 -left-4 md:-left-6 bg-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-lg border border-gray-100 z-20 transition-all duration-300 ${currentPage === 0
                                ? "opacity-0 pointer-events-none"
                                : "opacity-100 hover:scale-110"
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                    </button>

                    {/* SLIDER */}
                    <div className="overflow-hidden pb-4">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${currentPage * 100}%)`,
                            }}
                        >
                            {pages.map((page, pageIndex) => (
                                <div
                                    key={pageIndex}
                                    className="min-w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 px-1"
                                >
                                    {page.map((product) => (
                                        <Link
                                            href={`/product/${product.slug}`}
                                            key={product.id}
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
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="object-contain w-3/4 h-3/4 group-hover/card:scale-105 transition-transform duration-500 ease-in-out drop-shadow-xl"
                                                    />
                                                </div>
                                            </div>

                                            {/* White card */}
                                            <div className="bg-white rounded-[1.5rem] p-4 md:p-5 flex flex-col mt-auto relative z-10 shadow-sm">
                                                {/* Product Info */}
                                                <h3 className="font-bold text-[#1F2937] text-sm md:text-base mb-4 line-clamp-2 leading-tight text-center min-h-[36px] md:min-h-[44px] flex items-center justify-center">
                                                    {product.name}
                                                </h3>

                                                <div className="flex items-center justify-between w-full text-[11px] md:text-xs text-gray-700 mb-2">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                                                        <span>
                                                            ({product.rating.toFixed(1)})
                                                        </span>
                                                    </div>
                                                    <span>
                                                        {product.sold} Terjual
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <p className="text-[#004F54] font-black text-base md:text-lg mb-4 text-left w-full">
                                                    {product.price}
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
                                                                    toast.success(
                                                                        "Produk berhasil ditambahkan ke keranjang!"
                                                                    );
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
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NEXT BUTTON */}
                    <button
                        onClick={next}
                        disabled={
                            currentPage === totalPages - 1 || totalPages === 0
                        }
                        className={`absolute top-1/2 -translate-y-1/2 -right-4 md:-right-6 bg-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-lg border border-gray-100 z-20 transition-all duration-300 ${currentPage === totalPages - 1 || totalPages === 0
                                ? "opacity-0 pointer-events-none"
                                : "opacity-100 hover:scale-110"
                            }`}
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                    </button>
                </div>
            </div>
        </div>
    );
}
