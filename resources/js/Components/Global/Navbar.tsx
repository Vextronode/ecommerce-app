import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { ShoppingCart, User, Menu, X, Search, LayoutGrid } from "lucide-react";
import logoParigi from "@/assets/images/parigi_logo.png";
import { PageProps } from "@/types";
import NotificationBell from "./NotificationBell";

const categoryLinks = [
    { name: "Beranda", href: "/dashboard" },
    { name: "Sembako", href: "/shop?category=sembako" },
    { name: "Sayuran", href: "/shop?category=sayuran" },
    { name: "Buah", href: "/shop?category=buah" },
    { name: "Daging & Ikan", href: "/shop?category=daging-ikan" },
    { name: "Makanan Siap Saji", href: "/shop?category=makanan-siap-saji" },
    { name: "Promo Spesial", href: "/shop?promo=true" },
];

export default function Navbar() {
    const { auth, cart_count = 0, cart_preview } = usePage<PageProps>().props;
    const user = auth.user;
    const cartCount = typeof cart_count === "number" ? cart_count : 0;

    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    
    // Initialize search from URL
    const [searchQuery, setSearchQuery] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            return params.get('search') || "";
        }
        return "";
    });

    // Update search query when URL changes (e.g. client-side navigation)
    useEffect(() => {
        const handleLocationChange = () => {
            const params = new URLSearchParams(window.location.search);
            setSearchQuery(params.get('search') || "");
        };

        // Listen for Inertia navigation events
        document.addEventListener('inertia:navigate', handleLocationChange);
        
        return () => {
            document.removeEventListener('inertia:navigate', handleLocationChange);
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

    // Hide while actively scrolling, show when scrolling stops
    useEffect(() => {
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
            // Only hide if we've scrolled down a bit
            if (window.scrollY > 50) {
                setIsVisible(false);
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    setIsVisible(true);
                }, 300); // Reappears 300ms after scrolling stops
            } else {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out ${
                isVisible ? "translate-y-0" : "-translate-y-full"
            } bg-[#F8F9FA] shadow-sm`}
        >
            {/* Top Row */}
            <div className="w-full px-4 md:px-8 py-3 flex items-center justify-between gap-2 md:gap-6">
                
                {/* Left Group: Menu Button, Logo and Kategori */}
                <div className="flex items-center gap-2 md:gap-6">
                    {/* Mobile Menu Button */}
                    <button 
                        aria-label="Toggle mobile menu"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <Link href="/dashboard" className="shrink-0 flex items-center" aria-label="Home">
                        <img
                            src={logoParigi}
                            alt="CiMart Logo"
                            className="h-7 md:h-10 object-contain"
                        />
                    </Link>

                    {/* Kategori Button (Desktop) */}
                    <button 
                        aria-label="Pilih Kategori"
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#F1F3F5] border border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-200 transition-colors"
                    >
                        <LayoutGrid size={18} />
                        Kategori
                    </button>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 items-center mx-4 md:mx-8">
                    <form onSubmit={handleSearch} className="flex w-full rounded-lg overflow-hidden border border-gray-200 bg-white">
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

                {/* Right Actions */}
                <div className="flex items-center gap-1 md:gap-3">
                    {/* Notifications Icon (Click to open modal) */}
                    <NotificationBell user={user} />

                    {/* Cart Icon with Hover Preview */}
                    <div className="relative group">
                        <Link
                            href={route('cart')}
                            aria-label="Shopping Cart"
                            className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 transition-colors relative flex items-center"
                        >
                            <ShoppingCart size={22} strokeWidth={2} />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full leading-none border border-[#F8F9FA]">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart Hover Preview Popover */}
                        <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 pointer-events-none group-hover:pointer-events-auto">
                            <p className="text-xs font-semibold text-slate-400 mb-3">
                                Recently Added Products
                            </p>

                            {cart_preview && cart_preview.items.length > 0 ? (
                                <div className="space-y-3">
                                    <div className="divide-y divide-slate-100 max-h-75 overflow-y-auto no-scrollbar">
                                        {cart_preview.items.slice(0, 4).map((item) => (
                                            <div key={item.id} className="py-2.5 flex items-center gap-3 first:pt-0">
                                                <img
                                                    src={item.img}
                                                    alt={item.name}
                                                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                                                />
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h4 className="font-bold text-gray-900 text-xs md:text-sm truncate">
                                                        {item.name}
                                                    </h4>
                                                    {item.variant_name && (
                                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                            Variasi: {item.variant_name}
                                                        </p>
                                                    )}
                                                    <p className="text-[11px] text-slate-400">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <span className="font-bold text-[#ED7218] text-xs md:text-sm">
                                                        Rp {Number(item.price * item.quantity).toLocaleString("id-ID")}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {cart_preview.total_count > 4 && (
                                        <div className="py-2 px-3 bg-slate-50 rounded-xl text-center text-xs font-semibold text-slate-600 border border-slate-100">
                                            + {cart_preview.total_count - 4} Produk Lainnya di Keranjang
                                        </div>
                                    )}

                                    <Link
                                        href={route("cart")}
                                        className="block w-full py-2.5 bg-[#ED7218] text-white text-center font-bold rounded-xl hover:bg-[#d66311] transition shadow-md shadow-[#ED7218]/20 text-xs md:text-sm mt-3"
                                    >
                                        View My Shopping Cart
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-60" />
                                    <p className="text-xs font-medium text-slate-500">
                                        Keranjang kamu masih kosong
                                    </p>
                                    <Link
                                        href={route("shop")}
                                        className="inline-block mt-3 px-4 py-1.5 bg-[#ED7218] text-white text-xs font-bold rounded-lg hover:bg-[#d66311] transition"
                                    >
                                        Mulai Belanja
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:block w-px h-6 bg-gray-300 mx-1"></div>

                    {user ? (
                        <Link
                            href={route("profile.edit")}
                            aria-label="My Profile"
                            className="hidden md:flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-[#EAECEF] hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <span className="font-bold text-sm text-gray-800">
                                {user.name.split(" ")[0]}
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-[#344054] text-white">
                                {user.profile_photo_path ? (
                                    <img
                                        src={`/storage/${user.profile_photo_path}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={18} />
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link
                            href={route("login")}
                            aria-label="Login"
                            className="hidden md:flex items-center gap-2 pl-5 pr-1.5 py-1.5 bg-[#EAECEF] hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <span className="font-bold text-gray-800 text-sm">
                                Login
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#344054] text-white">
                                <User size={18} />
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            {/* Bottom Row - Category Links (Desktop) */}
            <div className="hidden md:block border-t border-gray-200">
                <div className="w-full px-4 md:px-8 py-2.5 flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {categoryLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-bold text-[#5F6A76] hover:text-gray-900 whitespace-nowrap transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>



            {/* Search Bar (Mobile, always visible) */}
            <div className="md:hidden w-full px-4 pb-3">
                <form onSubmit={handleSearch} className="flex w-full rounded-lg overflow-hidden border border-gray-300 bg-white">
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
                        className="px-4 py-2 text-white flex items-center justify-center"
                        style={{ backgroundColor: "#ED7218" }}
                    >
                        <Search size={18} />
                    </button>
                </form>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-b border-gray-200 shadow-lg absolute w-full left-0 top-full flex flex-col">
                    <div className="flex flex-col py-2">
                        {categoryLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        {user ? (
                            <Link
                                href={route("profile.edit")}
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-900 rounded-lg font-bold"
                            >
                                <User size={18} /> My Profile
                            </Link>
                        ) : (
                            <Link
                                href={route("login")}
                                className="flex items-center justify-center gap-2 w-full py-2.5 text-white rounded-lg font-bold"
                                style={{ backgroundColor: "#ED7218" }}
                            >
                                <User size={18} /> Login
                            </Link>
                        )}
                    </div>
                </div>
            )}


        </header>
    );
}
