import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import type { CheckoutAddress } from "@/Components/Checkout/AddressPickerModal";

export interface StoreShippingBreakdown {
    store_id: number;
    store_name: string;
    store_address: string;
    distance_km: number | null;
    delivery_fee: number;
    items_count: number;
}

export interface PlatformSettings {
    enable_online_payment: boolean;
    enable_tax: boolean;
    tax_percentage: number;
    enable_service_fee: boolean;
    service_fee_amount: number;
    enable_local_delivery: boolean;
}

interface UseCheckoutFormOptions {
    initialCartItems: any[];
    addresses: CheckoutAddress[];
    platformSettings?: PlatformSettings;
}

export function useCheckoutForm({
    initialCartItems,
    addresses,
    platformSettings,
}: UseCheckoutFormOptions) {
    const { auth } = usePage().props as any;
    const [cartItems] = useState(initialCartItems);
    const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const [settings, setSettings] = useState<PlatformSettings>({
        enable_online_payment: platformSettings?.enable_online_payment ?? true,
        enable_tax: platformSettings?.enable_tax ?? false,
        tax_percentage: platformSettings?.tax_percentage ?? 0,
        enable_service_fee: platformSettings?.enable_service_fee ?? false,
        service_fee_amount: platformSettings?.service_fee_amount ?? 0,
        enable_local_delivery: platformSettings?.enable_local_delivery ?? true,
    });

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    const [deliveryFee, setDeliveryFee] = useState(0);
    const [storesBreakdown, setStoresBreakdown] = useState<StoreShippingBreakdown[]>([]);

    const initialMethod = !settings.enable_online_payment ? "cod" : "va";
    const initialChannel = !settings.enable_online_payment ? "cod" : "bca_va";
    const initialDeliveryMethod = !settings.enable_local_delivery ? "self_pickup" : "local_delivery";

    const { data, setData, post, processing, errors } = useForm({
        cart_ids: cartItems.map((item) => item.id),
        address_id: null as number | null,
        name: auth?.user?.name || "",
        phone: auth?.user?.phone || "",
        address: "",
        delivery_method: initialDeliveryMethod,
        payment_method: initialMethod as "va" | "qris" | "gopay" | "cod",
        payment_channel: initialChannel,
    });

    const applyAddress = (address: CheckoutAddress) => {
        setSelectedAddressId(address.id);
        setData({
            ...data,
            address_id: address.id,
            name: address.recipient_name,
            phone: address.phone,
            address: address.full_address,
        });
    };

    const handlePaymentSelect = (
        method: "va" | "qris" | "gopay" | "cod",
        channel: string,
    ) => {
        if (!settings.enable_online_payment && method !== "cod") {
            toast.error("Pembayaran online sedang nonaktif. Hanya metode COD yang tersedia.");
            return;
        }

        setData((prev) => ({
            ...prev,
            payment_method: method,
            payment_channel: channel,
        }));
    };

    useEffect(() => {
        if (selectedAddressId || addresses.length === 0) return;

        const primaryAddress =
            addresses.find((address) => Boolean(address.is_primary)) ||
            addresses[0];

        applyAddress(primaryAddress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [addresses]);

    useEffect(() => {
        let isMounted = true;

        const fetchFee = async () => {
            try {
                let url = `/checkout/calculate-fee?delivery_method=${data.delivery_method}`;

                if (data.address_id) {
                    url += `&address_id=${data.address_id}`;
                }

                data.cart_ids.forEach((id) => {
                    url += `&cart_ids[]=${id}`;
                });

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to calculate fee");
                }
                const result = await response.json();

                if (isMounted) {
                    if (result.delivery_fee !== undefined) {
                        setDeliveryFee(result.delivery_fee);
                    }
                    if (result.stores_breakdown) {
                        setStoresBreakdown(result.stores_breakdown);
                    }
                    if (result.enable_online_payment !== undefined) {
                        setSettings((prev) => ({
                            ...prev,
                            enable_online_payment: result.enable_online_payment,
                            enable_service_fee: result.enable_service_fee ?? prev.enable_service_fee,
                            service_fee_amount: result.service_fee ?? prev.service_fee_amount,
                            enable_tax: result.enable_tax ?? prev.enable_tax,
                            tax_percentage: result.tax_percentage ?? prev.tax_percentage,
                            enable_local_delivery: result.enable_local_delivery ?? prev.enable_local_delivery,
                        }));

                        if (!result.enable_online_payment && data.payment_method !== "cod") {
                            setData((prev) => ({
                                ...prev,
                                payment_method: "cod",
                                payment_channel: "cod",
                            }));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch fee", error);
            }
        };

        if (data.delivery_method === "self_pickup") {
            setDeliveryFee(0);
            setStoresBreakdown([]);
        } else {
            fetchFee();
        }

        return () => {
            isMounted = false;
        };
    }, [data.delivery_method, data.address_id, data.cart_ids]);

    const serviceFee = settings.enable_service_fee ? settings.service_fee_amount : 0;
    const taxAmount = settings.enable_tax
        ? Math.round((subtotal * settings.tax_percentage) / 100)
        : 0;
    const grandTotal = subtotal + deliveryFee + serviceFee + taxAmount;

    const handlePlaceOrder = () => {
        post(route("checkout.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Pesanan berhasil dibuat!");
            },
            onError: (errs) => {
                const firstKey = Object.keys(errs)[0];
                if (firstKey) {
                    toast.error(errs[firstKey]);
                }
            },
        });
    };

    return {
        cartItems,
        subtotal,
        totalItems,
        data,
        setData,
        processing,
        errors,
        deliveryFee,
        storesBreakdown,
        adminFee: serviceFee,
        serviceFee,
        taxAmount,
        taxPercentage: settings.tax_percentage,
        enableServiceFee: settings.enable_service_fee,
        enableTax: settings.enable_tax,
        enableOnlinePayment: settings.enable_online_payment,
        enableLocalDelivery: settings.enable_local_delivery,
        grandTotal,
        isAddressPickerOpen,
        setIsAddressPickerOpen,
        applyAddress,
        handlePaymentSelect,
        handlePlaceOrder,
    };
}
