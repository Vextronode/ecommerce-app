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

export default function Edit({ product, categories }: any) {
    const { data, setData, post, processing, errors } = useForm({
        _method: "POST",
        name: product.name || "",
        category_id: product.category_id || "",
        price: product.price || "",
        stock: product.stock || "",
        description: product.description || "",
        images: [] as File[],
        deleted_images: [] as number[],
        variants: (product.variants || []).map((v: any) => ({
            name: v.name,
            options: v.options.map((opt: any) => opt.name),
        })),
        skus: product.skus || [],
        is_preorder: product.is_preorder || false,
        po_days: product.po_days || 0,
        po_hours: product.po_hours || 0,
        unit: product.unit || "",
    });

    const {
        previewList,
        handleImageChange,
        handleRemoveImage,
        validateImageSizes,
    } = useProductImageUpload(
        product.images || [],
        (newFiles) => setData("images", newFiles),
        (newDeleted) => setData("deleted_images", newDeleted),
    );

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateImageSizes(data.images)) return;

        post(route("merchant.products.update", product.slug), {
            preserveScroll: true,
            onSuccess: () => toast.success("Produk berhasil diupdate!"),
            onError: () => {
                toast.error("Gagal menyimpan! Periksa form Anda.");
            },
        });
    };

    return (
        <MerchantLayout>
            <Head title={`Edit ${product.name}`} />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#41B9C5]">
                        Edit Product
                    </h1>
                </div>
            </div>
            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-1">
                        <ProductPreview
                            data={data}
                            imagePreviews={previewList.map((p) => p.url)}
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
                            previews={previewList.map((p) => p.url)}
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
                    isEdit={true}
                />
            </form>
        </MerchantLayout>
    );
}
