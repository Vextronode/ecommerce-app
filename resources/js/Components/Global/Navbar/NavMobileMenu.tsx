import React from "react";
import { Link } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { User } from "@/types";
import { platformNavLinks, isLinkActive, handleNavClick } from "@/utils/navigation";

interface NavMobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    currentUrl: string;
}

export default function NavMobileMenu({
    isOpen,
    onClose,
    user,
    currentUrl,
}: NavMobileMenuProps) {
    if (!isOpen) return null;

    return (
        <div className="md:hidden bg-white border-t border-b border-gray-200 shadow-lg absolute w-full left-0 top-full flex flex-col">
            <div className="flex flex-col py-2">
                {platformNavLinks.map((link) => {
                    const active = isLinkActive(link.href, currentUrl);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={(e) => handleNavClick(e, link.href, currentUrl, onClose)}
                            className={`px-6 py-3 text-sm font-semibold transition-colors ${
                                active
                                    ? "text-brand-orange bg-orange-50/60 font-bold"
                                    : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {link.name}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t border-gray-100">
                {user ? (
                    <Link
                        href={route("profile.edit")}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-900 rounded-lg font-bold"
                    >
                        <UserIcon size={18} /> My Profile
                    </Link>
                ) : (
                    <Link
                        href={route("login")}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-white rounded-lg font-bold"
                        style={{ backgroundColor: "#ED7218" }}
                    >
                        <UserIcon size={18} /> Login
                    </Link>
                )}
            </div>
        </div>
    );
}

