import React from "react";
import { Head, useForm } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import toast from "react-hot-toast";

import ProductPreview, {
    VariantType,
} from "@/Components/Merchant/Product/ProductPreview";
import ImageUpload from "@/Components/Merchant/Product/ImageUpload";
import ProductForm from "@/Components/Merchant/Product/ProductForm";
import { useProductImageUpload } from "@/Hooks/Merchant/useProductImageUpload";

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
        unit: "",
    });

    const {
        previewList,
        handleImageChange,
        handleRemoveImage,
        validateImageSizes,
    } = useProductImageUpload([], (newFiles) => setData("images", newFiles));

    const imagePreviews = previewList.map((p) => p.url);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateImageSizes(data.images)) return;

        post(route("merchant.products.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Produk berhasil ditambahkan!");
            },
            onError: () => {
                toast.error("Gagal menyimpan! Periksa kembali isian form Anda.");
            },
        });
    };

    return (
        <MerchantLayout>
            <Head title="Add Product" />

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
