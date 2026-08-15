import { useState, useEffect } from "react";
import { useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import type { CheckoutAddress } from "@/Components/Checkout/AddressPickerModal";

interface UseCheckoutFormOptions {
    initialCartItems: any[];
    addresses: CheckoutAddress[];
}

export function useCheckoutForm({ initialCartItems, addresses }: UseCheckoutFormOptions) {
    const { auth } = usePage().props as any;
    const [cartItems] = useState(initialCartItems);
    const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    const [deliveryFee, setDeliveryFee] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        cart_ids: cartItems.map((item) => item.id),
        address_id: null as number | null,
        name: auth?.user?.name || "",
        phone: auth?.user?.phone || "",
        address: "",
        delivery_method: "local_delivery",
        payment_method: "va" as "va" | "qris" | "gopay" | "cod",
        payment_channel: "bca_va",
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

    // eslint-disable-next-line react-doctor/no-fetch-in-effect, react-doctor/no-set-state-after-await-in-effect
    useEffect(() => {
        let isMounted = true;

        const fetchFee = async () => {
            try {
                let url = `/checkout/calculate-fee?delivery_method=${data.delivery_method}`;

                if (data.address_id) {
                    url += `&address_id=${data.address_id}`;
                }

                data.cart_ids.forEach(id => {
                    url += `&cart_ids[]=${id}`;
                });

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error("Failed to calculate fee");
                }
                const result = await response.json();

                // eslint-disable-next-line react-doctor/no-set-state-after-await-in-effect
                if (isMounted && result.delivery_fee !== undefined) {
                    setDeliveryFee(result.delivery_fee);
                }
            } catch (error) {
                console.error("Failed to fetch delivery fee", error);
            }
        };

        if (data.delivery_method === "self_pickup") {
            setDeliveryFee(0);
        } else {
            fetchFee();
        }

        return () => {
            isMounted = false;
        };
    }, [data.delivery_method, data.address_id, data.cart_ids]);

    const adminFee = data.payment_method === "cod" ? 0 : 2000;
    const grandTotal = subtotal + deliveryFee + adminFee;

    const handlePlaceOrder = () => {
        post(route("checkout.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Pesanan berhasil dibuat!");
            },
            onError: (errs) => {
                const firstError = Object.values(errs)[0];
                toast.error(
                    typeof firstError === "string"
                        ? firstError
                        : "Gagal membuat pesanan, pastikan semua form terisi.",
                );
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
        adminFee,
        grandTotal,
        isAddressPickerOpen,
        setIsAddressPickerOpen,
        applyAddress,
        handlePaymentSelect,
        handlePlaceOrder,
    };
}
