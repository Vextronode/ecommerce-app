import React from "react";
import { MessageCircleWarning } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    categories: Category[];
}

export default function ProductBasicInfo({
    data,
    setData,
    errors,
    categories,
}: Props) {
    // Ngecek apakah produk ini punya varian kombinasi (SKU)
    const hasVariants = data.skus && data.skus.length > 0;

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Produk
                    </label>
                    <input
                        type="text"
                        placeholder="Contoh: Ikan Kerapu Segar / Baju Pantai"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30"
                        required
                    />
                    {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.name}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kategori Produk
                    </label>
                    <select
                        value={data.category_id}
                        onChange={(e) => setData("category_id", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30 appearance-none"
                        required
                    >
                        <option value="" disabled>
                            Pilih Kategori
                        </option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                    {errors.category_id && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.category_id}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-8 border-b border-gray-100 pb-8">
                {hasVariants ? (
                    <div className="bg-[#E0F7FA] border border-[#41B9C5]/30 p-4 rounded-xl flex gap-3 items-start">
                        <span className="text-[#41B9C5] text-xl leading-none mt-2">
                            <MessageCircleWarning />
                        </span>
                        <div>
                            <p className="text-sm font-bold text-[#245D56] mb-1">
                                Harga dan Stok Mengikuti Varian
                            </p>
                            <p className="text-xs text-[#245D56]/80">
                                Karena Anda mengaktifkan Varian Produk, Harga
                                Dasar dan Total Stok akan dihitung secara
                                otomatis dari tabel Detail Harga & Stok di
                                bawah.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Harga Dasar (Rp)
                            </label>
                            <input
                                type="number"
                                placeholder="Harga dasar produk"
                                value={data.price}
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30"
                                required={!hasVariants} // Wajib isi kalau gak ada varian
                            />
                            {errors.price && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.price}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total Stok
                            </label>
                            <input
                                type="number"
                                placeholder="Jumlah stok tersedia"
                                value={data.stock}
                                onChange={(e) =>
                                    setData("stock", e.target.value)
                                }
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30"
                                required={!hasVariants} // Wajib isi kalau gak ada varian
                            />
                            {errors.stock && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.stock}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Lengkap Produk
                </label>
                <textarea
                    rows={5}
                    placeholder="Jelaskan detail produk, keunggulan, cara penyimpanan, dll..."
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30 resize-none"
                ></textarea>
                {errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                        {errors.description}
                    </p>
                )}
            </div>
        </>
    );
}
