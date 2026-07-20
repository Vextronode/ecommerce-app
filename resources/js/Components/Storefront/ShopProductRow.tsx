import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "./ProductCard";

interface Product {
    id: number | string;
    name: string;
    slug: string;
    price: string | number;
    rating: number | string;
    sold: number;
    image?: string;
    image_path?: string;
}

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
                                        <ProductCard key={product.id} product={product} />
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
