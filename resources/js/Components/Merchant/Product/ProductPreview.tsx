import React from "react";
import { Link } from "@inertiajs/react";
import { Image as ImageIcon, Clock } from "lucide-react";
import { formatRupiah } from "@/utils/formatters";

export interface VariantType {
    name: string;
    options: string[];
}

interface Props {
    data: any;
    imagePreviews: string[];
    variants: VariantType[];
    isPreorder: boolean;
    poDays: number | string;
    poHours: number | string;
    processing: boolean;
}

export default function ProductPreview({
    data,
    imagePreviews,
    variants,
    isPreorder,
    poDays,
    poHours,
    processing,
}: Props) {
    const mainImage = imagePreviews.length > 0 ? imagePreviews[0] : null;


    // nentuin harga yang nampil di preview
    const getDisplayPrice = () => {
        // Cek apakah ada data varian (skus) dari matrix
        if (data.skus && data.skus.length > 0) {
            // Ambil semua angka harga dari tabel varian
            const prices = data.skus.map((sku: any) => Number(sku.price) || 0);

            // Cari harga paling murah dan paling mahal
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // Kalau harganya sama semua, tampilin 1 harga
            if (minPrice === maxPrice) {
                return formatRupiah(minPrice);
            }

            // Kalau harganya beda-beda, tampilin range harga
            return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`;
        }

        // Kalau gaada varian, balik ke harga dasar
        return formatRupiah(data.price || 0);
    };

    return (
        <div className="bg-white rounded-3xl p-5 border border-[#41B9C5]/30 shadow-sm flex flex-col items-center h-full relative">
            {/* Badge PO */}
            {isPreorder && (
                <div className="absolute top-8 left-8 bg-orange-100 text-orange-600 text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm border border-orange-200">
                    <Clock className="w-3 h-3" />
                    PO: {poDays} Hari {poHours} Jam
                </div>
            )}

            {/* Foto Utama */}
            <div className="w-full aspect-video rounded-2xl bg-gray-100 mb-4 overflow-hidden flex items-center justify-center border border-gray-100 relative">
                {mainImage ? (
                    <img
                        src={mainImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
                {data.name || "Nama Produk"}
            </h3>

            <p className="text-xs text-gray-500 text-center mb-4 min-h-8 line-clamp-2 px-2">
                {data.description || "Deskripsi produk akan muncul di sini..."}
            </p>

            <div className="w-full text-left mb-4 px-2">
                <p className="text-sm font-extrabold text-gray-800">
                    {getDisplayPrice()}
                </p>
            </div>

            <div className="w-full text-left mb-6 px-2 space-y-3">
                {variants.length > 0 ? (
                    variants.map((variant, idx) => (
                        <div key={idx}>
                            <p className="text-xs font-bold text-gray-700 mb-2">
                                {variant.name}:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {variant.options.length > 0 ? (
                                    variant.options.map((opt, optIdx) => (
                                        <div
                                            key={optIdx}
                                            className="px-3 py-1 rounded-full border border-gray-300 text-gray-600 text-[10px] font-semibold bg-gray-50"
                                        >
                                            {opt}
                                        </div>
                                    ))
                                ) : (
                                    <span className="text-[10px] text-gray-400 italic">
                                        Belum ada pilihan
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-[10px] text-gray-400 italic text-center w-full">
                        Tidak ada varian (Harga Tunggal)
                    </p>
                )}
            </div>

            <div className="flex w-full gap-3 mt-auto">
                <Link
                    href={route("merchant.products.index")}
                    className="flex-1 py-2 rounded-full border border-gray-300 text-gray-600 text-sm font-bold text-center hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 py-2 rounded-full bg-[#41B9C5] hover:bg-[#359a9e] text-white text-sm font-bold text-center transition-colors disabled:opacity-70 shadow-md shadow-[#41B9C5]/30"
                >
                    {processing ? "Menyimpan..." : "Create Product"}
                </button>
            </div>
        </div>
    );
}
