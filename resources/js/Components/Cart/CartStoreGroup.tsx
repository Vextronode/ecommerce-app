import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface Props {
    store: any;
    selectedIds: number[];
    onToggleItem: (id: number) => void;
    onToggleStore: (storeId: number, itemIds: number[]) => void;
}

export default function CartStoreGroup({
    store,
    selectedIds,
    onToggleItem,
    onToggleStore,
}: Props) {
    const storeItemIds = store.items.map((item: any) => item.id);
    const isAllStoreSelected = storeItemIds.every((id: number) =>
        selectedIds.includes(id),
    );

    const handleIncrement = (
        cartId: number,
        currentQty: number,
        maxStock: number | null,
    ) => {
        if (maxStock && currentQty >= maxStock) {
            toast.error("Stok produk tidak mencukupi");
            return;
        }
        router.patch(
            `/cart/${cartId}`,
            { quantity: currentQty + 1 },
            {
                preserveScroll: true,
            },
        );
    };

    const handleDecrement = (cartId: number, currentQty: number) => {
        if (currentQty <= 1) return;
        router.patch(
            `/cart/${cartId}`,
            { quantity: currentQty - 1 },
            { preserveScroll: true },
        );
    };

    const handleDelete = (cartId: number) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-3">
                    <span className="text-sm font-medium text-gray-900">
                        Yakin ingin menghapus produk ini dari keranjang?
                    </span>
                    <div className="flex justify-end gap-2 mt-1">
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                router.delete(`/cart/${cartId}`, {
                                    preserveScroll: true,
                                    onSuccess: () =>
                                        toast.success("Produk dihapus"),
                                });
                            }}
                            className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            ),
            {
                duration: 5000,
            },
        );
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isAllStoreSelected && storeItemIds.length > 0}
                        onChange={() => onToggleStore(store.id, storeItemIds)}
                        className="w-5 h-5 rounded text-[#245D56] focus:ring-[#245D56] border-slate-300"
                    />
                    <span className="font-bold text-gray-900">
                        {store.storeName}
                    </span>
                </label>
                <span className="text-sm font-medium text-slate-500">
                    {store.items.length} Items
                </span>
            </div>

            <div className="space-y-6">
                {store.items.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex gap-3 md:gap-4 items-start"
                    >
                        {/* Checkbox item */}
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => onToggleItem(item.id)}
                            className="w-5 h-5 rounded text-[#245D56] focus:ring-[#245D56] border-slate-300 mt-2 cursor-pointer"
                        />

                        {/* image */}
                        <div className="relative shrink-0">
                            <img
                                src={item.img}
                                alt={item.name}
                                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover bg-slate-100"
                            />
                            {item.stock && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold text-center py-1 rounded-b-2xl">
                                    Sisa {item.stock}
                                </div>
                            )}
                        </div>

                        {/* Info Produk */}
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-sm md:text-base">
                                {item.name}
                            </h3>

                            <p className="text-xs text-slate-500 mt-0.5">
                                {item.weight}
                            </p>

                            <p className="font-bold text-[#245D56] text-sm md:text-base mt-2">
                                Rp {Number(item.price).toLocaleString("id-ID")}
                            </p>
                        </div>

                        {/* Actions (Delete, Min, Plus) */}
                        <div className="flex items-center gap-4 shrink-0">
                            <button
                                onClick={() => handleDelete(item.id)}
                                className="text-slate-400 hover:text-red-500 transition"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="flex items-center justify-end gap-3 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-sm w-fit">
                                <button
                                    onClick={() =>
                                        handleDecrement(item.id, item.qty)
                                    }
                                    className="text-slate-400 hover:text-gray-900 p-1"
                                >
                                    <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-bold w-4 text-center">
                                    {item.qty}
                                </span>
                                <button
                                    onClick={() =>
                                        handleIncrement(
                                            item.id,
                                            item.qty,
                                            item.stock,
                                        )
                                    }
                                    className="text-slate-400 hover:text-gray-900 p-1"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
