import React from "react";
import ProductPricingStock from "./ProductPricingStock";

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
            {/* Baris 1: Nama Produk & Kategori */}
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

            {/* Komponen Harga, Stok, dan Satuan Jual */}
            <ProductPricingStock
                data={data}
                setData={setData}
                errors={errors}
                hasVariants={hasVariants}
            />

            {/*Deskripsi Produk */}
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
