import React, { useEffect } from "react";
import VariantBuilder from "./VariantBuilder";
import SkuMatrix from "./SkuMatrix";

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
}

export default function ProductVariants({ data, setData }: Props) {
    useEffect(() => {
        const validVariants = (data.variants || []).filter(
            (v: any) => v.name.trim() !== "" && v.options.length > 0,
        );

        if (validVariants.length === 0) {
            if (data.skus && data.skus.length > 0) setData("skus", []);
            return;
        }

        const optionsArrays = validVariants.map((v: any) => v.options);

        // fungsi kartesian producy buat nyilangin array a dan b
        const getCombinations = (arrays: string[][]) => {
            if (arrays.length === 0) return [];
            return arrays.reduce(
                (acc, curr) =>
                    acc.flatMap((c) =>
                        curr.map((n) => [].concat(c as any, n as any)),
                    ),
                [[]] as string[][],
            );
        };

        const combinations = getCombinations(optionsArrays);

        // bentuk jadi format SkuType
        const newSkusTemplate = combinations.map((combo) => ({
            variant_name: combo.join(" - "),
            price: data.price || "",
            stock: 0,
        }));

        const existingSkus = data.skus || [];

        // gabungin SKU baru dengan nilai (harga/stok) dari SKU lama biar ngetiknya ga ilang
        const updatedSkus = newSkusTemplate.map((newSku) => {
            const existing = existingSkus.find(
                (e: any) => e.variant_name === newSku.variant_name,
            );
            return {
                variant_name: newSku.variant_name,
                price: existing ? existing.price : newSku.price,
                stock: existing ? existing.stock : newSku.stock,
            };
        });

        // Cek apakah ada perubahan kombinasi biar nggak infinite loop
        const oldNames = existingSkus.map((s: any) => s.variant_name).join("|");
        const newNames = updatedSkus.map((s: any) => s.variant_name).join("|");

        if (oldNames !== newNames) {
            // eslint-disable-next-line react-doctor/no-pass-data-to-parent
            setData("skus", updatedSkus);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.variants]);

    return (
        <div className="mb-8 border-b border-gray-100 pb-8 mt-8">
            <VariantBuilder data={data} setData={setData} />
            <SkuMatrix data={data} setData={setData} />
        </div>
    );
}
