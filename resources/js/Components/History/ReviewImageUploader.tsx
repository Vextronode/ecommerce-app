import React from 'react';
import { Camera, X } from 'lucide-react';
import InputError from '@/Components/InputError';

interface ReviewImageUploaderProps {
    images: File[];
    onImagesChange: (files: File[]) => void;
    previewImages: string[];
    onPreviewImagesChange: (previews: string[]) => void;
    error?: string;
}

export default function ReviewImageUploader({
    images,
    onImagesChange,
    previewImages,
    onPreviewImagesChange,
    error
}: ReviewImageUploaderProps) {
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            
            // Limit to max 3 files
            if (images.length + files.length > 3) {
                alert('Maksimal 3 file (foto/video).');
                return;
            }

            const newFiles = [...images, ...files];
            onImagesChange(newFiles);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            onPreviewImagesChange([...previewImages, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newFiles = [...images];
        newFiles.splice(index, 1);
        onImagesChange(newFiles);

        const newPreviews = [...previewImages];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        onPreviewImagesChange(newPreviews);
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">Tambahkan foto dan video (opsional)</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previewImages.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl border border-gray-200 overflow-hidden group shadow-sm">
                        {images[idx]?.type?.startsWith('video/') ? (
                            <video src={src} className="w-full h-full object-cover" />
                        ) : (
                            <img src={src} className="w-full h-full object-cover" />
                        )}
                        <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}

                {previewImages.length < 3 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700 hover:border-gray-400 bg-gray-50/50">
                        <Camera className="w-7 h-7 mb-2 text-gray-400" />
                        <span className="text-[11px] text-center px-2 font-medium">Video/Foto</span>
                        <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            accept="image/*,video/mp4,video/quicktime"
                            onChange={handleImageChange}
                        />
                    </label>
                )}
            </div>
            <InputError message={error} className="mt-2" />
        </div>
    );
}
