import React, { ReactNode } from "react";
import loginBg from "@/assets/images/admin-log.webp";

interface Props {
    children: ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthGlassLayout({ children, title, subtitle }: Props) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            {/* Background static */}
            <img
                src={loginBg}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
                fetchPriority="high"
            />

            <div className="relative z-10 bg-[#004F54]/60 backdrop-blur-md px-10 py-24 md:px-12 md:py-32 rounded-4xl w-full max-w-120 shadow-2xl border border-white/10 flex flex-col items-center">
                <div className="text-center mb-12 w-full">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {title}
                    </h2>
                    <p className="text-gray-200 text-xs md:text-sm font-light">
                        {subtitle}
                    </p>
                </div>

                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
