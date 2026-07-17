import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Category {
    id: number | string;
    name: string;
    image: string;
}

interface CategorySectionProps {
    categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(0);

    // deteksi viewport buat nentuin jumlah kategori per halaman
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) setItemsPerPage(2); // Mobile: 2 kategori
            else if (window.innerWidth < 1024) setItemsPerPage(3); // Tablet: 3 kategori
            else setItemsPerPage(4); // Desktop: 4 kategori
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // chunking
    const pages = [];
    for (let i = 0; i < categories.length; i += itemsPerPage) {
        pages.push(categories.slice(i, i + itemsPerPage));
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
        <section className="w-full py-12 md:py-16">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8">
                {/* HEADER */}
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <p className="text-gray-500 text-xs md:text-sm mb-1">
                        Temukan produk berdasarkan kategori
                    </p>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Popular Category
                    </h2>
                </div>

                {/* CAROUSEL WRAPPER */}
                <div className="relative w-full px-6 md:px-12 lg:px-16 pb-8">
                    {/* PREV BUTTON */}
                    <button
                        onClick={prev}
                        disabled={currentPage === 0}
                        className={`absolute top-1/2 -translate-y-1/2 -left-2 md:left-2 lg:left-0 bg-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-50 z-20 transition-all duration-300 ${currentPage === 0
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100 hover:scale-110"
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                    </button>

                    {/* SLIDER */}
                    <div className="overflow-hidden pb-8 pt-4">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${currentPage * 100}%)`,
                            }}
                        >
                            {pages.map((page, pageIndex) => (
                                <div
                                    key={pageIndex}
                                    className="min-w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 px-2"
                                >
                                    {page.map((category) => (
                                        <a
                                            key={category.id}
                                            href={`/category/${category.id}`}
                                            className="relative bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)] transition-all duration-300 w-full aspect-square flex flex-col items-center justify-center cursor-pointer group"
                                        >
                                            <div className="absolute inset-0 m-6 bg-[#f0eff5] rounded-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                                />
                                            </div>

                                            {/* Badge Label */}
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10/12 bg-[#40E0D0] text-white py-2 md:py-2.5 rounded-full text-center shadow-md shadow-[#40E0D0]/30 transition-transform duration-300 group-hover:-translate-y-1">
                                                <span className="font-bold text-sm md:text-base tracking-wide">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* NEXT BUTTON */}
                    <button
                        onClick={next}
                        disabled={currentPage === totalPages - 1 || totalPages === 0}
                        className={`absolute top-1/2 -translate-y-1/2 -right-2 md:right-2 lg:right-0 bg-white w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gray-50 z-20 transition-all duration-300 ${currentPage === totalPages - 1 || totalPages === 0
                            ? "opacity-0 pointer-events-none"
                            : "opacity-100 hover:scale-110"
                            }`}
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-800" />
                    </button>
                </div>
            </div>
        </section>
    );
}
