import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import logoParigi from "@/assets/images/parigi_logo.png";
import { PageProps } from "@/types";

const navLinks = [
    { name: "Home", href: "/dashboard" },
    { name: "Shop", href: "/shop" },
    { name: "Order", href: "/checkout" },
    { name: "History", href: "/history" },
];

export default function Navbar() {
    const { auth, cart_count = 0 } = usePage<PageProps>().props;
    const user = auth.user;
    const { url } = usePage();
    const cartCount = typeof cart_count === "number" ? cart_count : 0;

    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // scroll effect
    useEffect(() => {
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
            setIsVisible(false);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                setIsVisible(true);
            }, 250);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            clearTimeout(scrollTimeout);
        };
    }, []);

    return (
        <div
            className={`fixed top-4 md:top-6 w-full flex justify-center z-50 px-4 md:px-8 transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "translate-y-[-150%]"
                }`}
        >
            <nav className="w-full max-w-300 bg-linear-to-r from-[#389f9f]/80 via-[#74bcbc]/60 to-[#f0f4f8]/90 backdrop-blur-xl shadow-md rounded-3xl md:rounded-full px-4 py-2 md:px-6 md:py-3 flex flex-col md:flex-row items-center justify-between border border-white/40">
                {/* header row on mobile */}
                <div aria-label="Pilih opsi yang tersedia" className="flex items-center justify-between w-full md:w-auto">
                    {/* hamburger menu */}
                    <button aria-label="Tampilkan rincian lebih lanjut"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-white bg-black/10 rounded-lg hover:bg-black/20 transition"
                    >
                        {isMobileMenuOpen ? (
                            <X size={24} />
                        ) : (
                            <Menu size={24} />
                        )}
                    </button>

                    {/* logo */}
                    <Link
                        href="/dashboard"
                        className="flex items-center mx-auto md:mx-0"
                    >
                        <img
                            src={logoParigi}
                            alt="Parigi Mart Logo"
                            className="h-10 md:h-12 object-contain drop-shadow-md"
                        />
                    </Link>

                    {/* cart icon mobile */}
                    {user && (
                        <Link
                            href={route('cart')}
                            className="md:hidden p-2 text-white bg-black/10 rounded-lg hover:bg-black/20 transition relative"
                        >
                            <ShoppingCart size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full shadow-sm border border-white leading-none">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>
                    )}
                </div>

                {/* desktop navlinks */}
                <div className="hidden md:flex items-center justify-between gap-2 bg-white/40 backdrop-blur-md rounded-full p-2 px-6 xl:px-8 shadow-inner border border-white/50">
                    {navLinks.map((link) => {
                        const isActive =
                            url.startsWith(link.href) && link.href !== "#";
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`py-2 rounded-full font-bold shadow-sm text-sm text-center px-4 transition ${isActive
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-[#4A5568] hover:text-gray-900 hover:bg-white/40"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* desktop profile */}
                <div className="hidden md:flex items-center gap-3">
                    {user && (
                        <Link
                            href={route('cart')}
                            className="relative w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition shadow-sm border border-gray-100 group"
                            title="Keranjang Belanja"
                        >
                            <ShoppingCart
                                className="w-5 h-5 text-gray-800 group-hover:text-[#004F54] transition-colors"
                                strokeWidth={2}
                            />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-white text-[11px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full shadow-md border-2 border-white leading-none">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <Link
                            href={route("profile.edit")}
                            className="flex items-center gap-3 bg-white/90 hover:bg-white pl-5 pr-2 py-1.5 rounded-full transition shadow-sm border border-gray-100"
                        >
                            <span className="font-bold text-sm text-gray-800 lowercase">
                                {user.name.split(" ")[0]}
                            </span>

                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden shadow-inner bg-[#344054] text-white">
                                {user.profile_photo_path ? (
                                    <img
                                        src={`/storage/${user.profile_photo_path}`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link
                            href={route("login")}
                            className="flex items-center gap-3 bg-white/90 hover:bg-white pl-5 pr-1.5 py-1.5 rounded-full transition shadow-sm border border-gray-100"
                        >
                            <span className="font-bold text-gray-800 text-sm">
                                Login
                            </span>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#344054] text-white">
                                <User className="w-4 h-4" />
                            </div>
                        </Link>
                    )}
                </div>

                {/* mobile dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden w-full flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
                        {navLinks.map((link) => {
                            const isActive =
                                url.startsWith(link.href) && link.href !== "#";
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`py-3 rounded-xl font-bold text-sm px-4 transition ${isActive
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-white hover:bg-white/20"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                        {/* profile link mobile */}
                        {user ? (
                            <Link
                                href={route("profile.edit")}
                                className="py-3 mt-2 rounded-xl font-bold text-sm px-4 bg-white text-gray-900 flex items-center justify-center gap-2 shadow-sm"
                            >
                                <User size={18} /> My Profile
                            </Link>
                        ) : (
                            <Link
                                href={route("login")}
                                className="py-3 mt-2 rounded-xl font-bold text-sm px-4 bg-gray-900 text-white flex items-center justify-center gap-2 shadow-sm"
                            >
                                <User size={18} /> Login
                            </Link>
                        )}
                    </div>
                )}
            </nav>
        </div>
    );
}
