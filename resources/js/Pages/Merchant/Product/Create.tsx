import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import { AlertCircle } from "lucide-react";
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
            onError: (errs) => {
                const firstError = Object.values(errs)[0];
                if (typeof firstError === "string") {
                    toast.error(firstError, { duration: 5000 });
                } else {
                    toast.error("Gagal menyimpan! Periksa kembali isian form Anda.");
                }
            },
        });
    };

    return (
        <MerchantLayout>
            <Head title="Tambah Produk" />

            <div id="tour-product-create-header" className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-brand-orange">
                        Tambah Produk
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        Tambahkan produk yang akan dijual disini
                    </p>
                </div>
            </div>

            <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                    <span className="font-bold">Pedoman Kepatuhan Produk:</span> Pastikan produk Anda tidak melanggar{" "}
                    <Link
                        href={route("legal.prohibited-products")}
                        target="_blank"
                        className="font-bold underline text-amber-950 hover:text-brand-orange"
                    >
                        Daftar Produk Terlarang & Dibatasi
                    </Link>
                    . Produk olahan pangan wajib memiliki izin edar (SPP-IRT/BPOM) dan dilarang mengklaim label Halal tanpa sertifikasi resmi BPJPH.
                </div>
            </div>

            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div id="tour-product-preview" className="lg:col-span-1">
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

                    <div id="tour-product-image-upload" className="lg:col-span-2">
                        <ImageUpload
                            onImageChange={handleImageChange}
                            previews={imagePreviews}
                            onRemoveImage={handleRemoveImage}
                            error={errors.images as any}
                        />
                    </div>
                </div>

                <div id="tour-product-form-details">
                    <ProductForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        categories={categories}
                    />
                </div>
            </form>
        </MerchantLayout>
    );
}
