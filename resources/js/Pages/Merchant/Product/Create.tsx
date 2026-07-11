import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import toast from "react-hot-toast";

import ProductPreview, {
    VariantType,
} from "@/Components/Merchant/Product/ProductPreview";
import ImageUpload from "@/Components/Merchant/Product/ImageUpload";
import ProductForm from "@/Components/Merchant/Product/ProductForm";

interface Category {
    id: number;
    name: string;
}

interface Props {
    categories: Category[];
}

export default function Create({ categories }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        category_id: "",
        price: "",
        stock: "",
        description: "",
        images: [] as File[],
        variants: [] as VariantType[],
        skus: [],
        is_preorder: false,
        po_days: 0,
        po_hours: 0,
    });

    // state buat nyimpen URL preview gambar yang banyak
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // handler multiple image
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // gabungin file lama sama file baru
            setData("images", [...data.images, ...files]);

            // bikin URL preview buat masing" file baru
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setImagePreviews([...imagePreviews, ...newPreviews]);
        }
    };

    // handler buat delete image klo salah pilih
    const handleRemoveImage = (index: number) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData("images", newImages);

        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8 MB
        const MAX_SINGLE_SIZE = 2 * 1024 * 1024; // 2 MB

        let totalSize = 0;
        let hasOversizedFile = false;

        data.images.forEach((file) => {
            totalSize += file.size;
            if (file.size > MAX_SINGLE_SIZE) {
                hasOversizedFile = true;
            }
        });

        if (hasOversizedFile) {
            toast.error(
                "Ada foto yang ukurannya lebih dari 2MB. Silakan kompres dulu.",
                {
                    position: "top-right",
                },
            );
            return;
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error(
                "Total ukuran semua foto melebihi 8MB. Kurangi jumlah foto.",
                {
                    position: "top-right",
                },
            );
            return;
        }

        post(route("merchant.products.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Produk berhasil ditambahkan!");
            },
            onError: (errors) => {
                console.error("Validasi Backend Gagal:", errors);
                toast.error(
                    "Gagal menyimpan! Periksa kembali isian form Anda.",
                    {
                        position: "top-right",
                    },
                );
            },
        });
    };

    return (
        <MerchantLayout>
            <Head title="Add Product" />

            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#41B9C5]">
                        Add Product
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Tambahkan produk yang akan dijual disini
                    </p>
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-1">
                        <ProductPreview
                            data={data}
                            imagePreviews={imagePreviews}
                            variants={data.variants}
                            isPreorder={data.is_preorder}
                            poDays={data.po_days}
                            poHours={data.po_hours}
                            processing={processing}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <ImageUpload
                            onImageChange={handleImageChange}
                            previews={imagePreviews}
                            onRemoveImage={handleRemoveImage}
                            error={errors.images as any}
                        />
                    </div>
                </div>

                <ProductForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    categories={categories}
                />
            </form>
        </MerchantLayout>
    );
}
