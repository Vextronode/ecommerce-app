import { useState, useEffect, useMemo } from "react";

export function useCartSelection(cartData: any[]) {
    const allItemIds = useMemo(
        () => cartData.flatMap((store) => store.items.map((i: any) => i.id)),
        [cartData],
    );

    const [selectedIds, setSelectedIds] = useState<number[]>(allItemIds);

    useEffect(() => {
        const allItemIdsSet = new Set(allItemIds);
        setSelectedIds((prev) => prev.filter((id) => allItemIdsSet.has(id)));
    }, [allItemIds]);

    const toggleItem = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const toggleStore = (storeId: number, itemIds: number[]) => {
        const selectedIdsSet = new Set(selectedIds);
        const isAllSelected = itemIds.every((id) => selectedIdsSet.has(id));
        if (isAllSelected) {
            const itemIdsSet = new Set(itemIds);
            setSelectedIds((prev) =>
                prev.filter((id) => !itemIdsSet.has(id)),
            );
        } else {
            const newSelections = itemIds.filter(
                (id) => !selectedIdsSet.has(id),
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
        const selectedIdsSet = new Set(selectedIds);
        return cartData.reduce((acc, store) => {
            store.items.forEach((item: any) => {
                if (selectedIdsSet.has(item.id)) {
                    acc.push(item);
                }
            });
            return acc;
        }, []);
    }, [cartData, selectedIds]);

    const subtotal = useMemo(() => {
        return selectedItemsData.reduce(
            (sum: number, item: any) => sum + item.price * item.qty,
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
