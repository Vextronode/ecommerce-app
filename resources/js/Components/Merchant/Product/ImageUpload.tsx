import React from "react";
import { Upload } from "lucide-react";

interface Props {
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
}

export default function ImageUpload({ onImageChange, error }: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
                Add Foto Produk
            </h3>
            <div className="flex-1 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50/50 hover:bg-gray-50 transition-colors relative cursor-pointer group">
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6 text-gray-800" />
                </div>
                <span className="bg-[#41B9C5] text-white text-xs font-bold px-4 py-1.5 rounded-full mb-4">
                    Upload
                </span>
                <h4 className="text-sm font-bold text-gray-800 mb-1">
                    Drop your images here, or click to browse
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                    PNG, JPG and GIF files are allowed
                </p>
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>
        </div>
    );
}
