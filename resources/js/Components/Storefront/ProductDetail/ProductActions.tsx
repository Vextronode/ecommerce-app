import { useState, useEffect } from "react";
import { ShoppingCart, Tag, Info } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import { PageProps } from "@/types";

interface Props {
    productId: number | string;
    quantity: number;
    prepOption?: string;
    disabled?: boolean;
    store?: any;
    product?: any;
    currentSku?: any;
}

export default function ProductActions({
    productId,
    quantity,
    prepOption,
    disabled,
    store,
    product,
    currentSku,
}: Props) {
    const { auth, platform_settings } = usePage<
        PageProps & { platform_settings?: { enable_negotiation?: boolean } }
    >().props;
    const user = auth?.user;
    const isOwnProduct = Boolean(
        user && store && (Number(store.user_id) === Number(user.id) || Number(store.userId) === Number(user.id))
    );

    const [isNegotiationEnabled, setIsNegotiationEnabled] = useState<boolean>(
        platform_settings?.enable_negotiation ?? true
    );

    useEffect(() => {
        if (typeof platform_settings?.enable_negotiation !== "undefined") {
            setIsNegotiationEnabled(Boolean(platform_settings.enable_negotiation));
        }
    }, [platform_settings?.enable_negotiation]);

    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.channel("platform-settings");
        const handleSettingsUpdated = (e: {
            settings?: Record<string, any>;
            changed_keys?: string[];
        }) => {
            if (e?.settings && typeof e.settings.enable_negotiation !== "undefined") {
                setIsNegotiationEnabled(Boolean(e.settings.enable_negotiation));
            }
        };

        channel.listen(".PlatformSettingsUpdated", handleSettingsUpdated);
        channel.listen("PlatformSettingsUpdated", handleSettingsUpdated);

        return () => {
            window.Echo.leaveChannel("platform-settings");
        };
    }, []);

    const handleAddToCart = () => {
        if (isOwnProduct) {
            return toast.error("Anda tidak dapat membeli produk dari toko Anda sendiri.");
        }

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
                onError: (errors: any) => {
                    const errorMsg =
                        errors.product_id ||
                        errors.quantity ||
                        errors.preparation_option ||
                        Object.values(errors)[0] ||
                        "Gagal menambahkan produk ke keranjang.";
                    toast.error(String(errorMsg));
                },
            },
        );
    };

    const handleBuyNow = () => {
        if (isOwnProduct) {
            return toast.error("Anda tidak dapat membeli produk dari toko Anda sendiri.");
        }

        if (disabled)
            return toast.error("Silakan lengkapi pilihan varian dulu!");

        if (!user) {
            toast.error("Silakan login terlebih dahulu untuk membeli produk!");
            router.visit(route("login"));
            return;
        }

        router.post(
            "/cart",
            {
                product_id: productId,
                quantity: quantity,
                preparation_option: prepOption,
                checkout: true,
            },
            {
                onError: (errors: any) => {
                    const errorMsg =
                        errors.product_id ||
                        errors.quantity ||
                        errors.preparation_option ||
                        Object.values(errors)[0] ||
                        "Gagal melanjutkan ke pembelian.";
                    toast.error(String(errorMsg));
                },
            },
        );
    };

    const handleNegotiate = () => {
        if (isOwnProduct) {
            return toast.error("Anda tidak dapat menawar produk dari toko Anda sendiri.");
        }

        if (!isNegotiationEnabled) {
            return toast.error("Fitur tawar-menawar harga sedang dinonaktifkan sementara oleh admin.");
        }

        if (disabled)
            return toast.error("Silakan lengkapi pilihan varian dulu!");

        if (!user) {
            toast.error("Silakan login terlebih dahulu untuk menawar produk ini!");
            router.visit(route("login"));
            return;
        }

        if (store?.id) {
            window.dispatchEvent(
                new CustomEvent("open-storefront-chat", {
                    detail: {
                        storeId: store.id,
                        product: product
                            ? {
                                  id: product.id,
                                  name: product.name,
                                  slug: product.slug,
                                  price: currentSku ? currentSku.price : product.price,
                                  image_path:
                                      product.image_path ||
                                      (product.images?.[0]?.image_path
                                          ? `/storage/${product.images[0].image_path}`
                                          : null),
                                  sku_id: currentSku?.id,
                                  variant_name: currentSku?.variant_name,
                                  stock: currentSku ? currentSku.stock : product.stock,
                              }
                            : null,
                        autoNegotiate: true,
                    },
                })
            );
        }
    };

    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            {isOwnProduct && (
                <div className="col-span-2 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 mb-1">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Ini adalah produk dari toko Anda sendiri. Pembelian dan penawaran dinonaktifkan.</span>
                </div>
            )}
            <button
                type="button"
                onClick={handleBuyNow}
                disabled={disabled || isOwnProduct}
                className="bg-brand-orange text-white py-3.5 rounded-xl font-bold text-sm hover:bg-brand-orange-hover transition shadow-md whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                Beli Sekarang
            </button>
            <button
                type="button"
                onClick={handleAddToCart}
                disabled={disabled || isOwnProduct}
                className="bg-white text-brand-blue py-3.5 rounded-xl font-bold text-sm border-2 border-brand-blue hover:bg-brand-blue-tint/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                <ShoppingCart className="w-4 h-4 text-brand-blue" /> + Keranjang
            </button>
            {store?.id && isNegotiationEnabled && (
                <button
                    type="button"
                    onClick={handleNegotiate}
                    disabled={disabled || isOwnProduct}
                    className="col-span-2 py-3 px-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 text-brand-orange border border-orange-200/90 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Tag className="w-4 h-4 text-brand-orange" />
                    Tawar Produk dengan Penjual
                </button>
            )}
        </div>
    );
}
