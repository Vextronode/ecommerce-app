import { useState } from "react";
import { useForm } from "@inertiajs/react";
import toast from "react-hot-toast";

interface ExistingReview {
    rating: number;
    comment: string | null;
    is_anonymous: boolean;
    seller_rating: number | null;
    shipping_rating: number | null;
    courier_rating: number | null;
    images: string[];
}

interface UseProductReviewFormOptions {
    orderItemId: number;
    existingReview?: ExistingReview | null;
}

export function useProductReviewForm({
    orderItemId,
    existingReview,
}: UseProductReviewFormOptions) {
    const [previewImages, setPreviewImages] = useState<string[]>(
        existingReview?.images || [],
    );

    const { data, setData, post, processing, errors } = useForm({
        rating: existingReview?.rating || 5,
        comment: existingReview?.comment || "",
        is_anonymous: existingReview?.is_anonymous || false,
        seller_rating: existingReview?.seller_rating || 5,
        shipping_rating: existingReview?.shipping_rating || 5,
        courier_rating: existingReview?.courier_rating || 5,
        images: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("history.rating.store", orderItemId), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Ulasan produk berhasil dikirim!");
            },
            onError: () => {
                toast.error("Gagal mengirim ulasan. Silakan periksa kembali form.");
            },
        });
    };

    return {
        data,
        setData,
        previewImages,
        setPreviewImages,
        processing,
        errors,
        handleSubmit,
    };
}
