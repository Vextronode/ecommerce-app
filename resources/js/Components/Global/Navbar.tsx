import React, { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { Menu, X } from "lucide-react";
import logoParigi from "@/assets/images/parigi_logo.png";
import { PageProps } from "@/types";
import { platformNavLinks, isLinkActive, handleNavClick } from "@/utils/navigation";
import NotificationBell from "./NotificationBell";
import NavCategoryMenu from "./Navbar/NavCategoryMenu";
import NavSearchBar from "./Navbar/NavSearchBar";
import NavCartPreview from "./Navbar/NavCartPreview";
import NavUserMenu from "./Navbar/NavUserMenu";
import NavMobileMenu from "./Navbar/NavMobileMenu";

export default function Navbar() {
    const { url, props } = usePage<PageProps>();
    const { auth, cart_count = 0, cart_preview, global_categories } = props;
    const user = auth.user;
    const cartCount = typeof cart_count === "number" ? cart_count : 0;

    const [isVisible, setIsVisible] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Hide while actively scrolling, show when scrolling stops
    useEffect(() => {
        let scrollTimeout: ReturnType<typeof setTimeout>;

        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsVisible(false);
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    setIsVisible(true);
                }, 300);
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

                    {/* Category Menu & Popover */}
                    <NavCategoryMenu categories={global_categories} />
                </div>

                {/* Search Bar (Desktop) */}
                <NavSearchBar variant="desktop" />

                {/* Right Actions */}
                <div className="flex items-center gap-1 md:gap-3">
                    <NotificationBell user={user} />
                    <NavCartPreview cartCount={cartCount} cartPreview={cart_preview} />
                    <div className="hidden md:block w-px h-6 bg-gray-300 mx-1"></div>
                    <NavUserMenu user={user} />
                </div>
            </div>

            {/* Bottom Row - Navigation Links (Desktop) */}
            <div className="hidden md:block border-t border-gray-200">
                <div className="w-full px-4 md:px-8 py-2.5 flex items-center gap-6 overflow-x-auto no-scrollbar">
                    {platformNavLinks.map((link) => {
                        const active = isLinkActive(link.href, url);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href, url)}
                                className={`text-sm font-bold whitespace-nowrap transition-colors ${
                                    active
                                        ? "text-brand-orange"
                                        : "text-[#5F6A76] hover:text-gray-900"
                                }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Search Bar (Mobile, always visible) */}
            <NavSearchBar variant="mobile" className="md:hidden" />

            {/* Mobile Menu Dropdown */}
            <NavMobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                user={user}
                currentUrl={url}
            />
        </header>
    );
}
