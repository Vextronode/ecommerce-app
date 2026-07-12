import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import toast from "react-hot-toast";

import ProductPreview, {
    VariantType,
} from "@/Components/Merchant/Product/ProductPreview";
import ImageUpload from "@/Components/Merchant/Product/ImageUpload";
import ProductForm from "@/Components/Merchant/Product/ProductForm";

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

    // nyimpe array object biar tau mana foto lama (punya ID) dan foto baru
    const [previewList, setPreviewList] = useState<
        { id?: number; url: string }[]
    >(
        (product.images || []).map((img: any) => ({
            id: img.id,
            url: img.image_path,
        })),
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData("images", [...data.images, ...files]);

            const newPreviews = files.map((file) => ({
                url: URL.createObjectURL(file),
            }));
            setPreviewList([...previewList, ...newPreviews]);
        }
    };

    const handleRemoveImage = (index: number) => {
        const item = previewList[index];

        if (item.id) {
            // kalau foto lama dihapus, catet ID nya buat dikirim ke server
            setData("deleted_images", [...data.deleted_images, item.id]);
        } else {
            // kalau foto baru dihapus, cari dan buang dari array File
            const newImagesOnly = previewList.filter((p) => !p.id);
            const fileIndex = newImagesOnly.findIndex(
                (p) => p.url === item.url,
            );

            if (fileIndex !== -1) {
                const newImages = [...data.images];
                newImages.splice(fileIndex, 1);
                setData("images", newImages);
            }
        }

        // hapus dari UI
        const newList = [...previewList];
        newList.splice(index, 1);
        setPreviewList(newList);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // validasi ukuran max 8MB
        const MAX_TOTAL_SIZE = 8 * 1024 * 1024;
        const MAX_SINGLE_SIZE = 2 * 1024 * 1024;
        let totalSize = 0;
        let hasOversizedFile = false;

        data.images.forEach((file) => {
            totalSize += file.size;
            if (file.size > MAX_SINGLE_SIZE) hasOversizedFile = true;
        });

        if (hasOversizedFile) {
            toast.error("Ada foto yang ukurannya lebih dari 2MB.", {
                position: "top-right",
            });
            return;
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            toast.error("Total ukuran foto baru melebihi 8MB.", {
                position: "top-right",
            });
            return;
        }

        post(route("merchant.products.update", product.slug), {
            preserveScroll: true,
            onSuccess: () => toast.success("Produk berhasil diupdate!"),
            onError: (err) => {
                console.error(err);
                toast.error("Gagal menyimpan! Periksa form Anda.", {
                    position: "top-right",
                });
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
