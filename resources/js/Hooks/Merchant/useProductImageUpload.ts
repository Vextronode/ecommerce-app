import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { compressImage } from "@/utils/imageCompressor";

export interface PreviewItem {
    id?: number;
    url: string;
}

export function useProductImageUpload(
    initialImages: { id?: number; image_path: string }[] = [],
    onImagesChange?: (files: File[]) => void,
    onDeletedImagesChange?: (deletedIds: number[]) => void,
) {
    const [images, setImages] = useState<File[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]);
    const [previewList, setPreviewList] = useState<PreviewItem[]>(() =>
        initialImages.map((img) => ({
            id: img.id,
            url: img.image_path,
        })),
    );

    const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8 MB
    const MAX_SINGLE_SIZE = 2 * 1024 * 1024; // 2 MB

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawFiles = Array.from(e.target.files || []);
        if (rawFiles.length === 0) return;

        const needsCompression = rawFiles.some(
            (f) => f.size > MAX_SINGLE_SIZE || (f.type.startsWith("image/") && f.type !== "image/webp")
        );
        const toastId = needsCompression
            ? toast.loading("Mengoptimalkan foto produk...")
            : undefined;

        try {
            const processedFiles: File[] = [];
            for (const file of rawFiles) {
                if (file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml") {
                    // Kompresi WebP mempertahankan ketajaman 2048px dengan ukuran efisien
                    const optimized = await compressImage(file, 2048, 2048, 0.85);
                    processedFiles.push(optimized);
                } else {
                    processedFiles.push(file);
                }
            }

            if (toastId) toast.dismiss(toastId);

            let hasOversized = false;
            processedFiles.forEach((file) => {
                if (file.size > MAX_SINGLE_SIZE) hasOversized = true;
            });

            if (hasOversized) {
                toast.error("Ada foto yang ukurannya melebihi batas 2MB.");
                return;
            }

            const newImages = [...images, ...processedFiles];
            const newPreviews: PreviewItem[] = processedFiles.map((file) => ({
                // eslint-disable-next-line react-doctor/no-create-object-url-without-revoke
                url: URL.createObjectURL(file),
            }));

            setImages(newImages);
            setPreviewList((prev) => [...prev, ...newPreviews]);
            onImagesChange?.(newImages);
        } catch {
            if (toastId) toast.dismiss(toastId);
            toast.error("Gagal memproses gambar.");
        }
    };

    const handleRemoveImage = (index: number) => {
        const item = previewList[index];

        if (item.id) {
            // Existing image from server
            const newDeleted = [...deletedImages, item.id];
            setDeletedImages(newDeleted);
            onDeletedImagesChange?.(newDeleted);
        } else {
            // Newly uploaded blob image
            URL.revokeObjectURL(item.url);
            const newImagesOnly = previewList.filter((p) => !p.id);
            const fileIndex = newImagesOnly.findIndex((p) => p.url === item.url);

            if (fileIndex !== -1) {
                const newFiles = [...images];
                newFiles.splice(fileIndex, 1);
                setImages(newFiles);
                onImagesChange?.(newFiles);
            }
        }

        const newList = [...previewList];
        newList.splice(index, 1);
        setPreviewList(newList);
    };

    const validateImageSizes = (filesToValidate = images): boolean => {
        let totalSize = 0;
        let hasOversized = false;

        filesToValidate.forEach((file) => {
            totalSize += file.size;
            if (file.size > MAX_SINGLE_SIZE) hasOversized = true;
        });

        if (hasOversized) {
            toast.error("Ada foto yang ukurannya lebih dari 2MB.");
            return false;
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error("Total ukuran semua foto melebihi 8MB. Kurangi jumlah foto.");
            return false;
        }

        return true;
    };

    // Clean up created object URLs on unmount
    useEffect(() => {
        return () => {
            previewList.forEach((item) => {
                if (!item.id && item.url.startsWith("blob:")) {
                    URL.revokeObjectURL(item.url);
                }
            });
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        images,
        deletedImages,
        previewList,
        handleImageChange,
        handleRemoveImage,
        validateImageSizes,
    };
}
