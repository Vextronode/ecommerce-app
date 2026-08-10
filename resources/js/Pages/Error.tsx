import React, { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import { Home, ShoppingBag, ArrowLeft, Search } from "lucide-react";
import logoParigi from "@/assets/images/parigi_logo.png";

interface Props {
    status: number;
}

export default function Error({ status }: Props) {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Parallax efek ringan buat angka 404
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;
            setMousePos({ x, y });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const title = {
        503: "Lagi Maintenance",
        500: "Server Bermasalah",
        404: "Halaman Ga Ketemu",
        403: "Akses Ditolak",
    }[status] || "Terjadi Kesalahan";

    const description = {
        503: "Tenang, kita lagi benerin sesuatu. Coba balik lagi sebentar lagi ya.",
        500: "Ada yang error di server kami. Tim teknis udah kita kabarin.",
        404: "Waduh, halaman yang kamu cari kayaknya udah pindah atau emang ga ada.",
        403: "Kamu ga punya izin buat akses halaman ini.",
    }[status] || "Sesuatu yang ga diharapkan terjadi. Coba lagi nanti ya.";

    return (
        <>
            <Head title={`${status} - ${title}`} />

            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center relative overflow-hidden px-4">
                {/* Background decorative blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Top-left teal blob */}
                    <div
                        className="absolute -top-32 -left-32 w-80 h-80 md:w-[500px] md:h-[500px] rounded-full opacity-[0.07]"
                        style={{
                            background: "radial-gradient(circle, #40E0D0 0%, transparent 70%)",
                        }}
                    />
                    {/* Bottom-right dark blob */}
                    <div
                        className="absolute -bottom-40 -right-40 w-96 h-96 md:w-[600px] md:h-[600px] rounded-full opacity-[0.05]"
                        style={{
                            background: "radial-gradient(circle, #215B63 0%, transparent 70%)",
                        }}
                    />
                    {/* Small floating shapes */}
                    <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-[#40E0D0]/20 rounded-full animate-pulse" />
                    <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-[#215B63]/15 rounded-full animate-pulse delay-700" />
                    <div className="absolute top-1/2 right-1/6 w-4 h-4 bg-[#FF7A00]/10 rounded-full animate-pulse delay-300" />
                </div>

                {/* Logo */}
                <Link
                    href="/dashboard"
                    className="absolute top-6 sm:top-8 left-1/2 -translate-x-1/2 z-20 hover:opacity-80 transition-opacity"
                >
                    <img
                        src={logoParigi}
                        alt="Cibenda Mart Logo"
                        className="h-10 sm:h-12 object-contain drop-shadow-md"
                    />
                </Link>

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
                    {/* Angka status code gede banget + parallax */}
                    <div
                        className="select-none mb-6 transition-transform duration-200 ease-out"
                        style={{
                            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
                        }}
                    >
                        <h1
                            className="text-[140px] sm:text-[180px] md:text-[220px] font-black leading-none tracking-tighter"
                            style={{
                                background: "linear-gradient(135deg, #215B63 0%, #40E0D0 50%, #389f9f 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            {status}
                        </h1>
                    </div>

                    {/* Judul & deskripsi */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
                        {title}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-500 mb-10 max-w-md leading-relaxed">
                        {description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        {/* Tombol utama */}
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#215B63] to-[#389f9f] hover:from-[#1a464d] hover:to-[#2d8282] text-white font-bold px-7 py-3.5 rounded-full shadow-lg shadow-[#215B63]/20 hover:shadow-xl hover:shadow-[#215B63]/30 hover:-translate-y-0.5 transition duration-300"
                        >
                            <Home className="w-5 h-5" />
                            Kembali ke Home
                        </Link>

                        {/* Tombol sekunder */}
                        <Link
                            href="/shop"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-700 font-bold px-7 py-3.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition duration-300"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Cari Produk
                        </Link>
                    </div>

                    {/* Back link */}
                    <button
                        onClick={() => window.history.back()}
                        className="mt-6 inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#215B63] transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        atau kembali ke halaman sebelumnya
                    </button>
                </div>

                {/* Footer branding mini */}
                <div className="absolute bottom-8 flex items-center gap-1 text-xs text-gray-300 select-none">
                    <span className="font-bold text-[#40E0D0]/60">CIBENDA</span>
                    <span className="font-bold text-gray-300">MART</span>
                </div>
            </div>
        </>
    );
}
