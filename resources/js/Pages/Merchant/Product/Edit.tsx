import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import ProductPreview from "@/Components/Merchant/Product/ProductPreview";
import ImageUpload from "@/Components/Merchant/Product/ImageUpload";
import ProductForm from "@/Components/Merchant/Product/ProductForm";

export default function Edit({ product, categories }: any) {
    const { data, setData, post, processing, errors } = useForm({
        _method: "POST",
        name: product.name,
        category_id: product.category_id,
        price: product.price,
        stock: product.stock,
        description: product.description || "",
        image: null as File | null,
    });

    const [jenisProduk, setJenisProduk] = useState("");
    const [perGram, setPerGram] = useState("100 gr");
    const [imagePreview, setImagePreview] = useState<string | null>(
        product.image_path ? product.image_path : null,
    );
    const gramOptions = ["100 gr", "500 gr", "1 kg", "2 kg"];
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("merchant.products.update", product.slug));
    };

    return (
        <MerchantLayout>
            <Head title={`Edit ${product.name}`} />
            <form onSubmit={submit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="lg:col-span-1">
                        <ProductPreview
                            data={data}
                            imagePreview={imagePreview}
                            perGram={perGram}
                            gramOptions={gramOptions}
                            processing={processing}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <ImageUpload
                            onImageChange={handleImageChange}
                            error={errors.image}
                        />
                    </div>
                </div>

                <ProductForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    categories={categories}
                    jenisProduk={jenisProduk}
                    setJenisProduk={setJenisProduk}
                    perGram={perGram}
                    setPerGram={setPerGram}
                    gramOptions={gramOptions}
                    isEdit={true}
                />
            </form>
        </MerchantLayout>
    );
}
