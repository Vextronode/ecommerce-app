import React, { useEffect, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";

import StorefrontLayout from "@/Layouts/StorefrontLayout";
import CartSection from "@/Components/Checkout/CartSection";
import ShippingSection from "@/Components/Checkout/ShippingSection";
import DeliverySection from "@/Components/Checkout/DeliverySection";
import PaymentSection from "@/Components/Checkout/PaymentSection";
import OrderSummary from "@/Components/Checkout/OrderSummary";
import AddressPickerModal, {
    CheckoutAddress,
} from "@/Components/Checkout/AddressPickerModal";

interface Props {
    initialCartItems: any[];
    addresses: CheckoutAddress[];
}

export default function Checkout({ initialCartItems, addresses }: Props) {
    const { auth } = usePage().props as any;
    const [cartItems] = useState(initialCartItems);
    const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    // Inisialisasi Form Inertia dengan payment_method & payment_channel
    const { data, setData, post, processing, errors } = useForm({
        cart_ids: cartItems.map((item) => item.id),
        address_id: null as number | null,
        name: auth?.user?.name || "",
        phone: auth?.user?.phone || "",
        address: "",
        delivery_method: "coastal",
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

    const handleShippingChange = (
        field: "name" | "phone" | "address",
        value: string,
    ) => {
        setSelectedAddressId(null);
        setData({
            ...data,
            address_id: null,
            [field]: value,
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
    }, [addresses]);

    const deliveryFee = data.delivery_method === "coastal" ? 25000 : 15000;
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

    return (
        <StorefrontLayout>
            <Head title="Checkout - Cibenda Mart" />

            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <CartSection items={cartItems} />

                        <ShippingSection
                            data={data}
                            setData={handleShippingChange}
                            errors={errors}
                            selectedAddress={addresses.find(
                                (address) => address.id === selectedAddressId,
                            )}
                            onOpenAddressPicker={() =>
                                setIsAddressPickerOpen(true)
                            }
                        />

                        <DeliverySection
                            selected={data.delivery_method}
                            onSelect={(val) => setData("delivery_method", val)}
                        />

                        <PaymentSection
                            selectedMethod={data.payment_method}
                            selectedChannel={data.payment_channel}
                            onSelect={handlePaymentSelect}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <OrderSummary
                            subtotal={subtotal}
                            deliveryFee={deliveryFee}
                            adminFee={adminFee}
                            totalItems={totalItems}
                            onPlaceOrder={handlePlaceOrder}
                            processing={processing}
                        />
                    </div>
                </div>
            </div>

            <AddressPickerModal
                isOpen={isAddressPickerOpen}
                addresses={addresses}
                selectedAddressId={selectedAddressId}
                onClose={() => setIsAddressPickerOpen(false)}
                onSelect={applyAddress}
            />
        </StorefrontLayout>
    );
}
