import React from "react";

interface Props {
    description: string;
}

export default function ProductDetailsCard({ description }: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col h-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                Product Details
            </h3>
            <div className="prose prose-sm md:prose-base text-slate-500 max-w-none">
                {description ? (
                    <p className="leading-relaxed whitespace-pre-wrap">
                        {description}
                    </p>
                ) : (
                    <p className="italic">
                        Penjual belum menambahkan deskripsi untuk produk ini.
                    </p>
                )}
            </div>
        </div>
    );
}
