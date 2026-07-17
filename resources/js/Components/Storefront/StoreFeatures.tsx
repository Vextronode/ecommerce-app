import React from "react";
import { PackageOpen, Truck, Lock, Store } from "lucide-react";

const features = [
    {
        id: 1,
        title: "Produk Lokal Asli",
        description: "Menyediakan produk segar dan berkualitas langsung dari tetangga serta UMKM Desa Cibenda.",
        icon: PackageOpen,
    },
    {
        id: 2,
        title: "Pengiriman Fleksibel",
        description: "Kirim lewat Kurir Desa, bayar di tempat (COD), atau ambil langsung ke toko mitra.",
        icon: Truck,
    },
    {
        id: 3,
        title: "Transaksi Aman",
        description: "Sistem belanja terpercaya yang aman, transparan, dan mudah digunakan oleh warga.",
        icon: Lock,
    },
    {
        id: 4,
        title: "Banyak Pilihan Toko",
        description: "Bebas jelajahi dan beli kebutuhan harian dari berbagai warung tetangga dalam satu aplikasi.",
        icon: Store,
    },
];

export default function StoreFeatures() {
    return (
        <section className="w-full py-16 mb-24">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12">
                {/* HEADER */}
                <div className="flex flex-col items-center justify-center mb-10 text-center">
                    <p className="text-gray-900 font-medium text-xs md:text-sm mb-2">
                        Keunggulan Kami
                    </p>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight">
                        Kenapa Belanja di Cibenda Mart?
                    </h2>
                </div>

                {/* GRID CARD */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-2">
                    {features.map((feature) => {
                        const IconComponent = feature.icon;

                        return (
                            <div
                                key={feature.id}
                                className="bg-[#f8f9fa] border border-gray-300 rounded-[1.5rem] p-6 flex items-start gap-4 hover:shadow-md transition-shadow duration-300"
                            >
                                {/* ICON */}
                                <div className="text-gray-800 shrink-0 mt-1 bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm">
                                    <IconComponent
                                        className="w-6 h-6 md:w-7 md:h-7"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* TEXT */}
                                <div>
                                    <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1.5 leading-snug">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-[11px] md:text-xs leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
