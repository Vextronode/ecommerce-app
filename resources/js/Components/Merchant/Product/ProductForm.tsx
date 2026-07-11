import React from "react";
import ProductBasicInfo from "./ProductBasicInfo";
import ProductPreorder from "./ProductPreorder";
import ProductVariants from "./ProductVariants";

interface Category {
    id: number;
    name: string;
}

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
    categories: Category[];
    isEdit?: boolean;
}

export default function ProductForm({
    data,
    setData,
    errors,
    categories,
    isEdit = false,
}: Props) {
    return (
        <div className="bg-white rounded-3xl p-6 border border-[#41B9C5]/30 shadow-sm mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
                {isEdit ? "Edit Informasi Produk" : "Informasi Produk"}
            </h3>

            <ProductBasicInfo
                data={data}
                setData={setData}
                errors={errors}
                categories={categories}
            />
            <ProductPreorder data={data} setData={setData} />
            <ProductVariants data={data} setData={setData} />
        </div>
    );
}
