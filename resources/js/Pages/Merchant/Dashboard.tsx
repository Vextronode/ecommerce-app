import React from "react";
import { Head } from "@inertiajs/react";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Dashboard Pedagang" />

            {/* Navbar Header */}
            <nav className="bg-[#004F54] text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    ></path>
                                </svg>
                            </div>
                            <span className="font-bold text-xl tracking-wide">
                                Merchant Panel
                            </span>
                        </div>

                        {/* Profil Singkat */}
                        <div>
                            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                                <div className="w-6 h-6 bg-[#41B9C5] rounded-full flex items-center justify-center text-xs font-bold">
                                    A
                                </div>
                                <span className="text-sm font-medium">
                                    Halo, Kang Asep!
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center min-h-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <svg
                            className="w-10 h-10 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-3">
                        Selamat Datang di Dashboard!
                    </h1>
                    <p className="text-gray-500 max-w-md mx-auto">
                        dashboard placeholder
                    </p>
                </div>
            </main>
        </div>
    );
}
