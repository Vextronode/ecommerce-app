import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Search } from "lucide-react";

interface NavSearchBarProps {
    variant?: "desktop" | "mobile";
    className?: string;
}

export default function NavSearchBar({ variant = "desktop", className = "" }: NavSearchBarProps) {
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            return params.get("search") || "";
        }
        return "";
    });

    useEffect(() => {
        const handleLocationChange = () => {
            const params = new URLSearchParams(window.location.search);
            setSearchQuery(params.get("search") || "");
        };

        document.addEventListener("inertia:navigate", handleLocationChange);
        return () => {
            document.removeEventListener("inertia:navigate", handleLocationChange);
        };
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get("/shop", { search: searchQuery });
        } else {
            router.get("/shop");
        }
    };

    if (variant === "mobile") {
        return (
            <div className={`w-full px-4 pb-3 ${className}`}>
                <form
                    onSubmit={handleSearch}
                    className="flex w-full rounded-lg overflow-hidden border border-gray-300 bg-white"
                >
                    <input
                        type="text"
                        aria-label="Search products"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 outline-none text-sm text-gray-700 bg-transparent focus:ring-0 border-none"
                    />
                    <button
                        type="submit"
                        aria-label="Execute search"
                        className="px-4 py-2 text-white flex items-center justify-center transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#ED7218" }}
                    >
                        <Search size={18} />
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={`hidden md:flex flex-1 items-center mx-4 md:mx-8 ${className}`}>
            <form
                onSubmit={handleSearch}
                className="flex w-full rounded-lg overflow-hidden border border-gray-200 bg-white"
            >
                <input
                    type="text"
                    aria-label="Search products"
                    placeholder="Search products"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2.5 outline-none text-sm text-gray-700 bg-transparent border-none focus:ring-0"
                />
                <button
                    type="submit"
                    aria-label="Execute search"
                    className="px-6 py-2 text-white flex items-center justify-center transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#ED7218" }}
                >
                    <Search size={20} />
                </button>
            </form>
        </div>
    );
}
