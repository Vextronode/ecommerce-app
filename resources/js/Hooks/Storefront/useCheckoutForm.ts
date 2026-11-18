import { useState, useEffect, useRef, useMemo } from "react";
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

    const prevSettingsRef = useRef<PlatformSettings>(settings);
    useEffect(() => {
        prevSettingsRef.current = settings;
    }, [settings]);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    const [deliveryFee, setDeliveryFee] = useState(0);
    const [estimatedDeliveryFee, setEstimatedDeliveryFee] = useState<number | null>(null);
    const [isCalculatingFee, setIsCalculatingFee] = useState(false);
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

    const cartIdsKey = useMemo(() => cartItems.map((item) => item.id).sort().join(","), [cartItems]);

    useEffect(() => {
        let isMounted = true;

        const fetchFee = async () => {
            if (!settings.enable_local_delivery) {
                setDeliveryFee(0);
                setEstimatedDeliveryFee(null);
                setStoresBreakdown([]);
                return;
            }

            try {
                setIsCalculatingFee(true);
                let url = `/checkout/calculate-fee?delivery_method=local_delivery`;

                if (data.address_id) {
                    url += `&address_id=${data.address_id}`;
                }

                cartItems.forEach((item) => {
                    url += `&cart_ids[]=${item.id}`;
                });

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to calculate fee");
                }
                const result = await response.json();

                if (isMounted) {
                    if (result.delivery_fee !== undefined) {
                        setEstimatedDeliveryFee(result.delivery_fee);
                        if (data.delivery_method === "local_delivery") {
                            setDeliveryFee(result.delivery_fee);
                        } else {
                            setDeliveryFee(0);
                        }
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
            } finally {
                if (isMounted) {
                    setIsCalculatingFee(false);
                }
            }
        };

        if (data.delivery_method === "self_pickup") {
            setDeliveryFee(0);
        } else if (estimatedDeliveryFee !== null) {
            setDeliveryFee(estimatedDeliveryFee);
        }

        fetchFee();

        return () => {
            isMounted = false;
        };
    }, [data.delivery_method, data.address_id, cartIdsKey, settings.enable_local_delivery]);

    // Real-time synchronization of platform settings and emergency killswitches
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const channel = window.Echo.channel("platform-settings");

        const handleSettingsUpdated = (event: {
            settings?: Record<string, any>;
            changed_keys?: string[];
        }) => {
            const newSettings = event?.settings;
            if (!newSettings) return;

            const changedKeys = Array.isArray(event?.changed_keys) ? event.changed_keys : [];
            const prev = prevSettingsRef.current;

            setSettings((current) => ({
                enable_online_payment:
                    newSettings.enable_online_payment !== undefined
                        ? Boolean(newSettings.enable_online_payment)
                        : current.enable_online_payment,
                enable_tax:
                    newSettings.enable_tax !== undefined
                        ? Boolean(newSettings.enable_tax)
                        : current.enable_tax,
                tax_percentage:
                    newSettings.tax_percentage !== undefined
                        ? Number(newSettings.tax_percentage)
                        : current.tax_percentage,
                enable_service_fee:
                    newSettings.enable_service_fee !== undefined
                        ? Boolean(newSettings.enable_service_fee)
                        : current.enable_service_fee,
                service_fee_amount:
                    newSettings.service_fee_amount !== undefined
                        ? Number(newSettings.service_fee_amount)
                        : current.service_fee_amount,
                enable_local_delivery:
                    newSettings.enable_local_delivery !== undefined
                        ? Boolean(newSettings.enable_local_delivery)
                        : current.enable_local_delivery,
            }));

            // Handle online payment killswitch toggle: ONLY when value actually changed
            const onlinePaymentKeyChanged = changedKeys.length === 0 || changedKeys.includes("enable_online_payment");
            if (onlinePaymentKeyChanged && newSettings.enable_online_payment !== undefined) {
                const newOnlinePayment = Boolean(newSettings.enable_online_payment);
                if (prev.enable_online_payment !== newOnlinePayment) {
                    if (!newOnlinePayment) {
                        toast.error(
                            "Pembayaran online sedang dinonaktifkan oleh admin. Metode otomatis dialihkan ke COD.",
                            { id: "killswitch-online-payment-toast", duration: 5000 }
                        );
                        setData((d) => ({
                            ...d,
                            payment_method: "cod",
                            payment_channel: "cod",
                        }));
                    } else {
                        toast.success(
                            "Layanan pembayaran online telah diaktifkan kembali.",
                            { id: "killswitch-online-payment-toast", duration: 4000 }
                        );
                    }
                }
            }

            // Handle local delivery killswitch toggle: ONLY when value actually changed
            const localDeliveryKeyChanged = changedKeys.length === 0 || changedKeys.includes("enable_local_delivery");
            if (localDeliveryKeyChanged && newSettings.enable_local_delivery !== undefined) {
                const newLocalDelivery = Boolean(newSettings.enable_local_delivery);
                if (prev.enable_local_delivery !== newLocalDelivery) {
                    if (!newLocalDelivery) {
                        toast.error(
                            "Pengantaran kurir lokal dinonaktifkan sementara. Pengiriman dialihkan ke Ambil Sendiri.",
                            { id: "killswitch-local-delivery-toast", duration: 5000 }
                        );
                        setData((d) => ({
                            ...d,
                            delivery_method: "self_pickup",
                        }));
                    } else {
                        toast.success(
                            "Layanan kurir pengantaran lokal telah diaktifkan kembali.",
                            { id: "killswitch-local-delivery-toast", duration: 4000 }
                        );
                    }
                }
            }
        };

        channel.listen(".PlatformSettingsUpdated", handleSettingsUpdated);
        channel.listen("PlatformSettingsUpdated", handleSettingsUpdated);

        return () => {
            window.Echo.leaveChannel("platform-settings");
        };
    }, [setData]);

    const serviceFee = settings.enable_service_fee ? settings.service_fee_amount : 0;
    const taxAmount = settings.enable_tax
        ? Math.round((subtotal * settings.tax_percentage) / 100)
        : 0;
    const grandTotal = subtotal + deliveryFee + serviceFee + taxAmount;

    const handlePlaceOrder = () => {
        if (!data.address_id) {
            toast.error("Silakan pilih alamat pengiriman.");
            return;
        }

        if (data.delivery_method === "local_delivery" && !settings.enable_local_delivery) {
            toast.error("Layanan kurir toko sedang dinonaktifkan. Silakan pilih opsi Ambil Sendiri.", {
                id: "order-delivery-disabled-toast",
            });
            return;
        }

        if (data.payment_method !== "cod" && !settings.enable_online_payment) {
            toast.error("Pembayaran online sedang dinonaktifkan. Silakan gunakan metode COD.", {
                id: "order-payment-disabled-toast",
            });
            return;
        }

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
        estimatedDeliveryFee,
        isCalculatingFee,
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
