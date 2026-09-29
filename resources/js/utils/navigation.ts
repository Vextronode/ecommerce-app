import React from "react";

export interface NavLinkItem {
    name: string;
    href: string;
}

export const platformNavLinks: NavLinkItem[] = [
    { name: "Beranda", href: "/dashboard" },
    { name: "Semua Produk", href: "/shop" },
    { name: "Mitra Pedagang", href: "/dashboard#merchants" },
    { name: "Lacak Pesanan", href: "/history" },
    { name: "Tentang Kami", href: "/about" },
];

/**
 * Checks whether a navigation link matches the current URL.
 */
export const isLinkActive = (href: string, currentUrl: string): boolean => {
    if (href === "/dashboard") return currentUrl === "/" || currentUrl === "/dashboard";
    if (href.includes("#")) return false;
    return currentUrl.startsWith(href);
};

/**
 * Handles smooth scrolling for in-page anchor links (e.g. #merchants, #about)
 * when on the dashboard, otherwise allows default navigation.
 */
export const handleNavClick = (
    e: React.MouseEvent,
    href: string,
    currentUrl: string,
    onAfterClick?: () => void
): void => {
    if (href.includes("#")) {
        const [, hash] = href.split("#");
        const isCurrentDashboard =
            currentUrl === "/" ||
            currentUrl === "/dashboard" ||
            currentUrl.startsWith("/dashboard?");
        if (isCurrentDashboard) {
            e.preventDefault();
            const target = document.getElementById(hash);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                window.history.pushState(null, "", href);
            }
        }
    }
    if (onAfterClick) {
        onAfterClick();
    }
};
