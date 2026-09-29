import React from "react";
import { Link } from "@inertiajs/react";
import { AlertTriangle, MapPin, ArrowRight } from "lucide-react";

interface Props {
    className?: string;
}

export default function StoreAddressWarningBanner({ className = "" }: Props) {
    return (
        <div
            className={`p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-400/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
        >
            <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <MapPin className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                            Wajib Dilengkapi
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-gray-900">
                            Alamat Fisik Toko Belum Terisi
                        </h4>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 leading-relaxed max-w-2xl">
                        Untuk menjamin ketepatan titik penjemputan kurir desa dan perhitungan ongkos kirim pembeli, Anda wajib mengisi alamat toko sebelum dapat mengunggah produk.
                    </p>
                </div>
            </div>

            <Link
                href={route("merchant.settings.index")}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition hover:scale-102 active:scale-98 shrink-0 w-full sm:w-auto justify-center cursor-pointer"
            >
                <span>Lengkapi Sekarang</span>
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
