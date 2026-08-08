import React from "react";
import { Upload, X } from "lucide-react";

interface Props {
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    previews: string[];
    onRemoveImage: (index: number) => void;
    error?: string;
}

export default function ImageUpload({
    onImageChange,
    previews,
    onRemoveImage,
    error,
}: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between items-center">
                <span>Foto Produk</span>
                <span className="text-xs font-normal text-gray-500">
                    {previews.length} foto terpilih
                </span>
            </h3>

            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative group min-h-50">
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6 text-gray-800" />
                </div>
                <span className="bg-[#41B9C5] text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                    Upload Foto
                </span>
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                    Klik atau drop foto di sini
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                    Format yang diizinkan: JPG, PNG, dan WEBP (Maks 2MB/foto)
                </p>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            {/* thumbnail preview area */}
            {previews.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {previews.map((src, idx) => (
                        <div
                            key={idx}
                            className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0 group"
                        >
                            <img
                                src={src}
                                alt={`preview-${idx}`}
                                className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-[#41B9C5] text-white text-[8px] font-bold text-center py-0.5">
                                    COVER
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => onRemoveImage(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
