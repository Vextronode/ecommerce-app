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
    const selectedIdsSet = new Set(selectedIds);
    const isAllStoreSelected = storeItemIds.every((id: number) =>
        selectedIdsSet.has(id),
    );

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
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

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
    const handleDecrement = (cartId: number, currentQty: number) => {
        if (currentQty <= 1) return;
        router.patch(
            `/cart/${cartId}`,
            { quantity: currentQty - 1 },
            { preserveScroll: true },
        );
    };

    // eslint-disable-next-line react-doctor/prefer-module-scope-pure-function
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
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 mb-3 md:mb-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <label className="flex items-center gap-2 md:gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isAllStoreSelected && storeItemIds.length > 0}
                        onChange={() => onToggleStore(store.id, storeItemIds)}
                        className="w-4 h-4 md:w-5 md:h-5 rounded accent-[#006591] border-slate-300"
                    />
                    <span className="font-bold text-gray-900 text-xs md:text-base">
                        {store.storeName}
                    </span>
                </label>
                <span className="text-xs md:text-sm font-medium text-slate-500">
                    {store.items.length} Items
                </span>
            </div>

            <div className="space-y-4 md:space-y-6">
                {store.items.map((item: any) => (
                    <div
                        key={item.id}
                        className="flex gap-2 md:gap-4 items-start"
                    >
                        {/* Checkbox item */}
                        <input aria-label="Tampilkan rincian lebih lanjut"
                            type="checkbox"
                            checked={selectedIdsSet.has(item.id)}
                            onChange={() => onToggleItem(item.id)}
                            className="w-4 h-4 md:w-5 md:h-5 rounded accent-[#006591] border-slate-300 mt-1.5 md:mt-2 cursor-pointer"
                        />
                        {/* image */}
                        <div className="relative shrink-0">
                            <img
                                src={item.img}
                                alt={item.name}
                                className="w-14 h-14 md:w-24 md:h-24 rounded-xl md:rounded-2xl object-cover bg-slate-100"
                            />
                            {item.stock && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] md:text-[10px] font-bold text-center py-0.5 md:py-1 rounded-b-xl md:rounded-b-2xl">
                                    Sisa {item.stock}
                                </div>
                            )}
                        </div>
                        {/* Info Produk */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-xs md:text-base leading-tight mb-1 line-clamp-2">
                                {item.name}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                {item.prepOption && (
                                    <span className="bg-brand-blue-tint text-brand-blue text-[10px] md:text-xs font-bold px-2 py-0.5 rounded border border-brand-blue-light/30">
                                        {item.prepOption}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-baseline gap-1 mt-1 md:mt-2">
                                <p className="font-bold text-brand-orange text-sm md:text-base">
                                    Rp{" "}
                                    {Number(item.price).toLocaleString("id-ID")}
                                </p>
                                <span className="text-[10px] md:text-xs font-medium text-slate-500">
                                    / {item.weight || "pcs"}
                                </span>
                            </div>
                        </div>{" "}
                        {/* Actions (Delete, Min, Plus) */}
                        <div aria-label="Pilih opsi yang tersedia" className="flex items-center gap-2 md:gap-4 shrink-0">
                            <button aria-label="Tampilkan rincian lebih lanjut"
                                onClick={() => handleDelete(item.id)}
                                className="text-slate-400 hover:text-red-500 transition"
                            >
                                <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>

                            <div aria-label="Pilih opsi yang tersedia" className="flex items-center justify-end gap-2 md:gap-3 bg-white border border-slate-200 rounded-full px-1.5 md:px-2 py-1 shadow-sm w-fit">
                                <button aria-label="Kurangi jumlah"
                                    onClick={() =>
                                        handleDecrement(item.id, item.qty)
                                    }
                                    className="text-slate-400 hover:text-gray-900 p-0.5 md:p-1"
                                >
                                    <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                </button>
                                <span className="text-xs md:text-sm font-bold w-4 text-center">
                                    {item.qty}
                                </span>
                                <button aria-label="Tambah jumlah"
                                    onClick={() =>
                                        handleIncrement(
                                            item.id,
                                            item.qty,
                                            item.stock,
                                        )
                                    }
                                    className="text-slate-400 hover:text-gray-900 p-0.5 md:p-1"
                                >
                                    <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
