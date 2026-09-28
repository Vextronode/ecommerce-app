import React from "react";
import { Link } from "@inertiajs/react";
import { User as UserIcon } from "lucide-react";
import { User } from "@/types";

interface NavUserMenuProps {
    user: User | null;
}

export default function NavUserMenu({ user }: NavUserMenuProps) {
    if (user) {
        return (
            <Link
                href={route("profile.edit")}
                aria-label="My Profile"
                className="hidden md:flex items-center gap-2 pl-4 pr-1.5 py-1.5 bg-[#EAECEF] hover:bg-gray-200 rounded-full transition-colors"
            >
                <span className="font-bold text-sm text-gray-800">
                    {user.name ? user.name.split(" ")[0] : "User"}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-[#344054] text-white">
                    {user.profile_photo_path ? (
                        <img
                            src={`/storage/${user.profile_photo_path}`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserIcon size={18} />
                    )}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={route("login")}
            aria-label="Login"
            className="hidden md:flex items-center gap-2 pl-5 pr-1.5 py-1.5 bg-[#EAECEF] hover:bg-gray-200 rounded-full transition-colors"
        >
            <span className="font-bold text-gray-800 text-sm">Login</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#344054] text-white">
                <UserIcon size={18} />
            </div>
        </Link>
    );
}

