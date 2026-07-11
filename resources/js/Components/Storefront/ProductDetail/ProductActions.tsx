import { ShoppingCart } from "lucide-react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

interface Props {
    productId: number | string;
    quantity: number;
}

export default function ProductActions({ productId, quantity }: Props) {
    const handleAddToCart = () => {
        router.post(
            "/cart",
            {
                product_id: productId,
                quantity: quantity,
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
        router.post("/checkout", {
            product_id: productId,
            quantity: quantity,
        });
    };

    return (
        <div className="grid grid-cols-2 gap-4 mb-6">
            <button
                onClick={handleBuyNow}
                className="bg-[#245D56] text-white py-4 rounded-xl font-bold text-sm hover:bg-[#1a443f] transition shadow-md whitespace-nowrap"
            >
                Buy Now
            </button>
            <button
                onClick={handleAddToCart}
                className="bg-white text-[#245D56] py-4 rounded-xl font-bold text-sm border-2 border-[#245D56] hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
                <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
        </div>
    );
}
