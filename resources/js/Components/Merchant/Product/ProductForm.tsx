import React from "react";

interface Category {
    id: number;
    name: string;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    categories: Category[];
    jenisProduk: string;
    setJenisProduk: (val: string) => void;
    perGram: string;
    setPerGram: (val: string) => void;
    gramOptions: string[];
    isEdit?: boolean;
}

export default function ProductForm({
    data,
    setData,
    errors,
    categories,
    jenisProduk,
    setJenisProduk,
    perGram,
    setPerGram,
    gramOptions,
    isEdit = false,
}: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
                {isEdit ? "Edit Informasi Produk" : "Informasi Produk"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Produk
                    </label>
                    <input
                        type="text"
                        placeholder="Item name"
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
                        Produk Kategori
                    </label>
                    <select
                        value={data.category_id}
                        onChange={(e) => setData("category_id", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30 appearance-none"
                        required
                    >
                        <option value="" disabled>
                            Choose a categories
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jenis Produk
                    </label>
                    <input
                        type="text"
                        placeholder="Jenis name"
                        value={jenisProduk}
                        onChange={(e) => setJenisProduk(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Harga Produk (Rp)
                    </label>
                    <input
                        type="number"
                        placeholder="Harga per item/gram"
                        value={data.price}
                        onChange={(e) => setData("price", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30"
                        required
                    />
                    {errors.price && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.price}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jumlah Produk (Stok)
                    </label>
                    <input
                        type="number"
                        placeholder="Berapa jumlah"
                        value={data.stock}
                        onChange={(e) => setData("stock", e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30"
                        required
                    />
                    {errors.stock && (
                        <p className="text-red-500 text-xs mt-1">
                            {errors.stock}
                        </p>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Per gram:
                </label>
                <div className="flex gap-3">
                    {gramOptions.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => setPerGram(opt)}
                            className={`px-6 py-2 rounded-full border text-sm font-medium transition-colors ${
                                perGram === opt
                                    ? "border-[#41B9C5] bg-[#E0F7FA] text-[#41B9C5]"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Produk
                </label>
                <textarea
                    rows={5}
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#41B9C5]/50 outline-none text-sm transition-all bg-gray-50/30 resize-none"
                ></textarea>
            </div>
        </div>
    );
}
