import { useState, useEffect, useMemo } from "react";

export function useCartSelection(cartData: any[]) {
    const allItemIds = useMemo(
        () => cartData.flatMap((store) => store.items.map((i: any) => i.id)),
        [cartData],
    );

    const [selectedIds, setSelectedIds] = useState<number[]>(allItemIds);

    useEffect(() => {
        setSelectedIds((prev) => prev.filter((id) => allItemIds.includes(id)));
    }, [allItemIds]);

    const toggleItem = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleStore = (storeId: number, itemIds: number[]) => {
        const isAllSelected = itemIds.every((id) => selectedIds.includes(id));
        if (isAllSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !itemIds.includes(id)),
            );
        } else {
            const newSelections = itemIds.filter(
                (id) => !selectedIds.includes(id),
            );
            setSelectedIds((prev) => [...prev, ...newSelections]);
        }
    };

    const toggleAll = () => {
        if (selectedIds.length === allItemIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(allItemIds);
        }
    };

    const isAllSelected = selectedIds.length === allItemIds.length && allItemIds.length > 0;

    const selectedItemsData = useMemo(() => {
        return cartData
            .flatMap((store) => store.items)
            .filter((item: any) => selectedIds.includes(item.id));
    }, [cartData, selectedIds]);

    const subtotal = useMemo(() => {
        return selectedItemsData.reduce(
            (sum, item) => sum + item.price * item.qty,
            0,
        );
    }, [selectedItemsData]);

    return {
        allItemIds,
        selectedIds,
        isAllSelected,
        toggleItem,
        toggleStore,
        toggleAll,
        selectedItemsData,
        subtotal,
    };
}
