import React, { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import {
    LayoutGrid,
    ChevronDown,
    ChevronRight,
    Layers,
    Fish,
    Leaf,
    Drumstick,
    Wheat,
    Flame,
    Shirt,
    Package,
} from "lucide-react";

interface CategoryItem {
    id?: number | string;
    name: string;
    slug: string;
}

interface NavCategoryMenuProps {
    categories?: CategoryItem[];
}

const defaultCategories: CategoryItem[] = [
    { id: 1, name: "Seafood", slug: "seafood" },
    { id: 2, name: "Sayuran", slug: "sayuran" },
    { id: 3, name: "Daging", slug: "daging" },
    { id: 4, name: "Sembako", slug: "sembako" },
    { id: 5, name: "Bumbu Dapur", slug: "bumbu-dapur" },
    { id: 6, name: "Pakaian", slug: "pakaian" },
    { id: 7, name: "Lainnya", slug: "lainnya" },
];

export const renderCategoryIcon = (slugOrName: string, size = 16, className = "") => {
    const s = slugOrName.toLowerCase();
    if (s.includes("seafood") || s.includes("ikan") || s.includes("laut")) {
        return <Fish size={size} className={className || "text-sky-600"} />;
    }
    if (s.includes("sayur")) {
        return <Leaf size={size} className={className || "text-emerald-600"} />;
    }
    if (s.includes("daging") || s.includes("ternak")) {
        return <Drumstick size={size} className={className || "text-rose-600"} />;
    }
    if (s.includes("sembako") || s.includes("pokok")) {
        return <Wheat size={size} className={className || "text-amber-600"} />;
    }
    if (s.includes("bumbu") || s.includes("rempah")) {
        return <Flame size={size} className={className || "text-orange-600"} />;
    }
    if (s.includes("pakaian") || s.includes("baju")) {
        return <Shirt size={size} className={className || "text-indigo-600"} />;
    }
    return <Package size={size} className={className || "text-slate-600"} />;
};

export const getCategorySubtext = (slugOrName: string) => {
    const s = slugOrName.toLowerCase();
    if (s.includes("seafood") || s.includes("ikan") || s.includes("laut")) return "Ikan & Hasil Laut";
    if (s.includes("sayur")) return "Segar Petani Desa";
    if (s.includes("daging") || s.includes("ternak")) return "Sapi, Unggas & Ternak";
    if (s.includes("sembako") || s.includes("pokok")) return "Beras & Pokok";
    if (s.includes("bumbu") || s.includes("rempah")) return "Rempah Dapur";
    if (s.includes("pakaian") || s.includes("baju")) return "Sandang & Busana";
    return "Komoditas Lainnya";
};

export default function NavCategoryMenu({ categories }: NavCategoryMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const categoriesList = categories && categories.length > 0 ? categories : defaultCategories;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative hidden md:block" ref={menuRef}>
            <button
                type="button"
                aria-label="Pilih Kategori"
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 border rounded-xl font-bold transition-all text-xs lg:text-sm select-none ${
                    isOpen
                        ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/20"
                        : "bg-[#F1F3F5] border-gray-200 text-gray-700 hover:bg-gray-200"
                }`}
            >
                <LayoutGrid size={17} className={isOpen ? "text-white" : "text-gray-700"} />
                <span>Kategori</span>
                <ChevronDown
                    size={15}
                    className={`transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : "text-gray-500"
                    }`}
                />
            </button>

            {/* Floating Popover Card with Glassmorphism */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-2 w-84 lg:w-92 bg-white/85 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-gray-200/60">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-brand-orange flex items-center justify-center font-bold text-xs">
                                <Layers size={15} />
                            </div>
                            <span className="font-extrabold text-sm text-gray-900">
                                Kategori Belanja
                            </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 bg-gray-100/80 px-2 py-0.5 rounded-full">
                            {categoriesList.length} Kategori
                        </span>
                    </div>

                    {/* Categories Grid (2 Columns, Clean Icons, No Emoji) */}
                    <div className="grid grid-cols-2 gap-2 pt-3 max-h-72 overflow-y-auto no-scrollbar">
                        {categoriesList.map((cat) => (
                            <Link
                                key={cat.id || cat.slug}
                                href={`/shop?category=${cat.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="group flex items-center gap-2.5 p-2 rounded-xl border border-transparent hover:border-brand-orange/30 hover:bg-white/90 hover:shadow-xs transition-all text-left"
                            >
                                <span className="w-8 h-8 rounded-lg bg-gray-100/80 group-hover:bg-orange-50 flex items-center justify-center shrink-0 border border-gray-200/50 shadow-2xs group-hover:scale-105 transition-all">
                                    {renderCategoryIcon(cat.slug || cat.name, 16)}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="text-xs font-bold text-gray-800 group-hover:text-brand-orange truncate">
                                        {cat.name}
                                    </div>
                                    <div className="text-[10px] text-gray-400 group-hover:text-gray-500 truncate">
                                        {getCategorySubtext(cat.slug || cat.name)}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Footer Link */}
                    <div className="mt-3 pt-3 border-t border-gray-200/60">
                        <Link
                            href="/shop"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2 px-3 bg-white/70 hover:bg-orange-50 text-brand-orange hover:text-brand-orange-hover rounded-xl text-xs font-bold flex items-center justify-between transition-colors border border-gray-100"
                        >
                            <span>Lihat Semua di Katalog Belanja</span>
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

