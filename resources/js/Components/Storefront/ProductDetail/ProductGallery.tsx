import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ImageObj {
    src: string;
    alt: string;
    objectPosition?: string;
}

interface Props {
    images: ImageObj[];
    selectedImageIndex: number;
    onSelectImage: (index: number) => void;
}

export default function ProductGallery({
    images,
    selectedImageIndex,
    onSelectImage,
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const MAX_THUMBNAILS = 3;
    const remainingImages = images.length - MAX_THUMBNAILS;

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Gambar Utama */}
            <div className="w-full aspect-4/3 md:aspect-square bg-gray-50 rounded-4xl overflow-hidden border border-gray-100 shadow-sm relative group z-0">
                <img
                    src={images[selectedImageIndex].src}
                    alt={images[selectedImageIndex].alt}
                    style={{
                        objectPosition:
                            images[selectedImageIndex].objectPosition ||
                            "center",
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Thumbnails */}
            <div className="flex flex-row w-full gap-4">
                {images.slice(0, MAX_THUMBNAILS).map((image, index) => {
                    const isLastThumbnail = index === MAX_THUMBNAILS - 1;
                    const hasMore = remainingImages > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                if (isLastThumbnail && hasMore) {
                                    setIsModalOpen(true);
                                } else {
                                    onSelectImage(index);
                                }
                            }}
                            className={`relative flex-1 aspect-square rounded-xl overflow-hidden transition-colors duration-200 focus:outline-none ${
                                index === selectedImageIndex &&
                                !(isLastThumbnail && hasMore)
                                    ? "border-2 border-brand-cyan shadow-md p-0.5"
                                    : "border border-gray-200 hover:border-brand-cyan/50 hover:shadow-sm opacity-90 hover:opacity-100"
                            }`}
                        >
                            <img
                                src={image.src}
                                alt={`Thumbnail ${index + 1}`}
                                style={{
                                    objectPosition:
                                        image.objectPosition || "center",
                                }}
                                className="w-full h-full object-cover rounded-lg"
                            />

                            {isLastThumbnail && hasMore && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center rounded-lg transition-colors hover:bg-black/70">
                                    <span className="text-white font-extrabold text-xl md:text-2xl tracking-tight">
                                        +{remainingImages}
                                    </span>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* modal galeri */}
            {isModalOpen &&
                typeof document !== "undefined" &&
                createPortal(
                    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-10 transition-opacity">
                        <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] p-6 md:p-8 flex flex-col relative shadow-2xl overflow-hidden">
                            {/* MOdal Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">
                                    Semua Foto ({images.length})
                                </h3>
                                <button aria-label="Action"
                                    onClick={() => setIsModalOpen(false)}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Grid Fotro */}
                            <div className="overflow-y-auto pr-2 pb-4 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 custom-scrollbar">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            onSelectImage(idx);
                                            setIsModalOpen(false);
                                        }}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors group ${
                                            idx === selectedImageIndex
                                                ? "border-brand-cyan shadow-md p-1"
                                                : "border-transparent hover:border-gray-200"
                                        }`}
                                    >
                                        <img
                                            src={img.src}
                                            alt={`Galeri ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {idx === selectedImageIndex && (
                                            <div className="absolute top-3 right-3 bg-brand-cyan text-white text-[10px] font-extrabold px-2 py-1 rounded-full shadow-sm z-10">
                                                Aktif
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
