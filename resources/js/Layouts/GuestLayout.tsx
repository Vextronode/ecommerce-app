import { PropsWithChildren } from "react";
import loginBg from "@/assets/images/log_bg.jpeg";

export default function Guest({ children }: PropsWithChildren) {
    return (
        // main wrapper
        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-gray-100">
            {/* bg image */}
            <img
                src={loginBg}
                alt="Pemandangan Pantai Pangandaran"
                className="absolute inset-0 w-full h-full object-cover z-0"
                fetchPriority="high"
            />

            {/* bg overlay */}
            <div className="absolute inset-0 bg-black/10 z-0"></div>

            {/* glass container */}
            <div className="relative z-10 w-full max-w-5xl bg-white/20 backdrop-blur-md border border-white/30 rounded-4xl shadow-2xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 transition duration-300">
                {children}
            </div>
        </div>
    );
}
