import React from "react";
import { Head, Link } from "@inertiajs/react";
import loginBg from "@/assets/images/admin-log.webp";

export default function SetupPasswordPopup() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
            <Head title="Setup Akun Pedagang" />

            <img
                src={loginBg}
                alt="Background"
                className="fixed inset-0 w-full h-full object-cover z-0"
                fetchPriority="high"
            />

            <div className="relative z-10 bg-[#7B9E9E]/80 md:bg-[#688E8E]/85 backdrop-blur-md px-10 py-16 md:px-12 md:py-20 rounded-4xl w-full max-w-125 min-h-150 border border-white/10 flex flex-col shadow-2xl">
                <div className="text-center mb-10">
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                        Login ke Akun
                    </h2>
                    <p className="text-white/80 text-xs md:text-sm font-light">
                        Untuk mendaftar sebagai Pedagang
                    </p>
                </div>

                <div className="w-full mb-4 px-2">
                    <label className="block text-white/70 text-xs font-medium">
                        Store name<span className="text-red-400">*</span>
                    </label>
                </div>

                <div className="grow"></div>

                <div className="flex justify-center w-full mt-auto">
                    <button className="w-full max-w-62.5 px-4 py-3.5 rounded-full bg-gray-500/70 text-white/60 font-medium shadow-inner cursor-not-allowed">
                        Masuk
                    </button>
                </div>
            </div>

            <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"></div>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#F8F9FA] rounded-3xl p-8 md:p-10 w-[85%] max-w-100 flex flex-col items-center text-center shadow-2xl shadow-black/40">
                <div className="w-20 h-20 bg-white border-[6px] border-[#41B9C5] rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg
                        className="w-10 h-10 text-[#41B9C5]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="5"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                </div>

                <h3 className="text-[17px] font-extrabold text-gray-900 mb-3 uppercase tracking-wide">
                    Anda Berhasil Masuk!
                </h3>

                <p className="text-gray-800 text-xs md:text-sm font-medium mb-8 px-4 leading-relaxed">
                    Tahap selanjutnya, untuk mengganti dengan password baru
                </p>

                <Link
                    href={route("merchant.store.setup")}
                    replace
                    className="w-full max-w-55 bg-[#41B9C5] hover:bg-[#359a9e] text-white font-bold py-3.5 px-6 rounded-full transition-all hover:scale-105 shadow-lg shadow-[#41B9C5]/40 text-sm tracking-wide flex justify-center"
                >
                    GANTI PASSWORD
                </Link>
            </div>
        </div>
    );
}
