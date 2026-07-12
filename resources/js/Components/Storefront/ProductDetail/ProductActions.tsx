import { ShoppingCart } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface Props {
    productId: number | string;
    quantity: number;
    prepOption?: string;
    disabled?: boolean;
}

export default function ProductActions({
    productId,
    quantity,
    prepOption, // <-- Tangkap prepOption
    disabled,
}: Props) {
    const handleAddToCart = () => {
        if (disabled)
            return toast.error("Silakan lengkapi pilihan varian dulu!");

        router.post(
            "/cart",
            {
                product_id: productId,
                quantity: quantity,
                preparation_option: prepOption,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Produk berhasil ditambahkan ke keranjang!");
                },
            },
        );
    };

    const handleBuyNow = () => {
        if (disabled)
            return toast.error("Silakan lengkapi pilihan varian dulu!");

        router.post("/cart", {
            product_id: productId,
            quantity: quantity,
            preparation_option: prepOption,
            checkout: true,
        });
    };

    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <button
                onClick={handleBuyNow}
                disabled={disabled}
                className="bg-[#245D56] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#1a443f] transition shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Buy Now
            </button>
            <button
                onClick={handleAddToCart}
                disabled={disabled}
                className="bg-white text-[#245D56] py-4 rounded-xl font-bold text-sm border-2 border-[#245D56] hover:bg-gray-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
        </div>
    );
}
