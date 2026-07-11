import React from "react";

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
    if (!images || images.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* gambar utama */}
            <div className="w-full aspect-4/3 md:aspect-square bg-gray-50 rounded-4xl overflow-hidden border border-gray-100 shadow-sm relative group">
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

            <div className="flex flex-row w-full gap-4">
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectImage(index)}
                        className={`flex-1 aspect-square rounded-xl overflow-hidden transition-all duration-200 focus:outline-none ${
                            index === selectedImageIndex
                                ? "border-2 border-[#0066CC] shadow-md"
                                : "border border-gray-200 hover:border-[#40E0D0] hover:shadow-sm opacity-80 hover:opacity-100"
                        }`}
                    >
                        <img
                            src={image.src}
                            alt={`Thumbnail ${index + 1}`}
                            style={{
                                objectPosition:
                                    image.objectPosition || "center",
                            }}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
