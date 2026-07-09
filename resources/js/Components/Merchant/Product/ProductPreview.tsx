import React from "react";
import { Link } from "@inertiajs/react";
import { Image as ImageIcon } from "lucide-react";

interface Props {
    data: any;
    imagePreview: string | null;
    perGram: string;
    gramOptions: string[];
    processing: boolean;
}

export default function ProductPreview({
    data,
    imagePreview,
    perGram,
    gramOptions,
    processing,
}: Props) {
    return (
        <div className="bg-white rounded-3xl p-5 border border-[#41B9C5]/30 shadow-sm flex flex-col items-center h-full">
            <div className="w-full aspect-video rounded-2xl bg-gray-100 mb-4 overflow-hidden flex items-center justify-center border border-gray-100">
                {imagePreview ? (
                    <img
                        src={imagePreview}
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
                    Rp.
                    {data.price
                        ? Number(data.price).toLocaleString("id-ID")
                        : "0"}{" "}
                    <span className="text-xs font-normal text-gray-500">
                        / Per gr
                    </span>
                </p>
            </div>

            <div className="w-full text-left mb-6 px-2">
                <p className="text-xs text-gray-500 mb-2">Per gram:</p>
                <div className="flex gap-2">
                    {gramOptions.map((opt) => (
                        <div
                            key={opt}
                            className={`px-3 py-1 rounded-full border text-[10px] font-semibold ${perGram === opt ? "border-[#41B9C5] text-[#41B9C5]" : "border-gray-300 text-gray-500"}`}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
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
