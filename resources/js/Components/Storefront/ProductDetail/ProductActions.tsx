import { ShoppingCart } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { PageProps } from "@/types";

interface Props {
    productId: number | string;
    quantity: number;
    prepOption?: string;
    disabled?: boolean;
}

export default function ProductActions({
    productId,
    quantity,
    prepOption,
    disabled,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    const handleAddToCart = () => {
        if (disabled)
            return toast.error("Silakan lengkapi pilihan varian dulu!");

        if (!user) {
            toast.error("Silakan login terlebih dahulu untuk menambah produk ke keranjang!");
            router.visit(route("login"));
            return;
        }

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

        if (!user) {
            toast.error("Silakan login terlebih dahulu untuk membeli produk!");
            router.visit(route("login"));
            return;
        }

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
                className="bg-brand-orange text-white py-4 rounded-xl font-bold text-sm hover:bg-brand-orange-hover transition shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                Beli Sekarang
            </button>
            <button
                onClick={handleAddToCart}
                disabled={disabled}
                className="bg-white text-brand-blue py-4 rounded-xl font-bold text-sm border-2 border-brand-blue hover:bg-brand-blue-tint/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <ShoppingCart className="w-4 h-4 text-brand-blue" /> + Keranjang
            </button>
        </div>
    );
}
