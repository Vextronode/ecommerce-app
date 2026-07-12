import { Minus, Plus } from "lucide-react";

interface Props {
    quantity: number;
    availableStock: number;
    unit: string;
    onDecrease: () => void;
    onIncrease: () => void;
}

export default function QuantitySelector({
    quantity,
    availableStock,
    unit,
    onDecrease,
    onIncrease,
}: Props) {
    return (
        <div className="flex items-center gap-6 mb-8 pt-4">
            <span className="font-bold text-gray-900 text-sm tracking-wide">
                Atur Jumlah
            </span>
            <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                    onClick={onDecrease}
                    className="p-3 text-gray-500 hover:bg-gray-50 rounded-l-lg"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-14 text-center font-bold border-none focus:ring-0 p-0 text-base"
                />
                <button
                    onClick={onIncrease}
                    className="p-3 text-gray-500 hover:bg-gray-50 rounded-r-lg"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            <span className="text-sm text-gray-500 font-medium">
                Tersisa {availableStock} stok
            </span>
        </div>
    );
}
