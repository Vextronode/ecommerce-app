import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Link } from "@inertiajs/react";

// tipe data produk
export interface Product {
    id: number | string;
    name: string;
    price: string;
    rating: number;
    sold: string;
    image: string;
}

interface ProductCarouselProps {
    title: string;
    products: Product[];
}

export default function ProductCarousel({
    title,
    products = [],
}: ProductCarouselProps) {
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);

    // deteksi viewport buat nentuin jumlah produk per halaman
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768)
                setItemsPerPage(2); // Mobile: 2 produk
            else if (window.innerWidth < 1024)
                setItemsPerPage(3); // Tablet: 3 produk
            else setItemsPerPage(5); // Desktop: 5 produk
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // chungking
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

    return (
        <div className="w-full px-4 md:px-8 lg:px-12 mb-16 md:mb-24">
            <div className="w-full max-w-400 mx-auto bg-linear-to-b from-[#F0FDFD] to-[#A3EFEF] rounded-[2.5rem] md:rounded-[3rem] py-10 md:py-14 shadow-sm flex flex-col relative">
                {/* header dinamis */}
                <div className="flex items-center justify-between mb-8 md:mb-10 px-6 md:px-12 lg:px-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">
                        {title}
                    </h2>
                    <button className="bg-white px-8 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-gray-50 transition">
                        View All
                    </button>
                </div>

                {/* carousel wrapper */}
                <div className="relative w-full px-6 md:px-12 lg:px-16">
                    <button
                        onClick={prev}
                        disabled={currentPage === 0}
                        className={`absolute top-1/2 -translate-y-1/2 -left-2 md:left-2 lg:left-6 bg-white w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-20 transition-all duration-300 ${currentPage === 0 ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}`}
                    >
                        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-gray-800" />
                    </button>

                    {/* Viewport Slider */}
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
                                    className="min-w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5"
                                >
                                    {page.map((product) => (
                                        <Link
                                            href={`/product/${product.id}`}
                                            key={product.id}
                                            className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-md transition duration-300 relative border border-gray-100 flex flex-col h-full cursor-pointer group/card"
                                        >
                                            {/* badge */}
                                            <div className="absolute top-4 left-4 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 z-10">
                                                <Star className="w-3 h-3 fill-orange-600 text-orange-600" />{" "}
                                                Star Seller
                                            </div>

                                            {/* image placeholder */}
                                            <div className="aspect-square bg-white rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-gray-50">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-300"
                                                />
                                            </div>

                                            {/* product info */}
                                            <h3 className="font-bold text-gray-900 text-sm md:text-base mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-500 mb-4 mt-auto">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="font-semibold text-gray-600">
                                                    ({product.rating.toFixed(1)}
                                                    )
                                                </span>
                                                <span className="mx-0.5">
                                                    •
                                                </span>
                                                <span>
                                                    {product.sold} Terjual
                                                </span>
                                            </div>

                                            {/* price */}
                                            <p className="text-[#245D56] font-black text-lg md:text-xl">
                                                {product.price}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={next}
                        disabled={
                            currentPage === totalPages - 1 || totalPages === 0
                        }
                        className={`absolute top-1/2 -translate-y-1/2 -right-2 md:right-2 lg:right-6 bg-white w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-20 transition-all duration-300 ${currentPage === totalPages - 1 || totalPages === 0 ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}`}
                    >
                        <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-gray-800" />
                    </button>
                </div>
            </div>
        </div>
    );
}
