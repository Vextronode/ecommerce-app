import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import { Plus } from "lucide-react";

import ProductPreview from "@/Components/Merchant/Product/ProductPreview";
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
        image: null as File | null,
    });

    const [jenisProduk, setJenisProduk] = useState("");
    const [perGram, setPerGram] = useState("100 gr");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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
        post(route("merchant.products.store"));
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
                />
            </form>
        </MerchantLayout>
    );
}
