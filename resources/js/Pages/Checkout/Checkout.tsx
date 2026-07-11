import React, { useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";

import StorefrontLayout from "@/Layouts/StorefrontLayout";
import CartSection from "@/Components/Checkout/CartSection";
import ShippingSection from "@/Components/Checkout/ShippingSection";
import DeliverySection from "@/Components/Checkout/DeliverySection";
import PaymentSection from "@/Components/Checkout/PaymentSection";
import OrderSummary from "@/Components/Checkout/OrderSummary";

interface Props {
    initialCartItems: any[];
}

export default function Checkout({ initialCartItems }: Props) {
    const { auth } = usePage().props as any;
    const [cartItems] = useState(initialCartItems);

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.qty,
        0,
    );
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);

    // Inisialisasi Form Inertia
    const { data, setData, post, processing, errors } = useForm({
        cart_ids: cartItems.map((item) => item.id),
        name: auth?.user?.name || "",
        phone: "",
        address: "",
        delivery_method: "coastal",
        payment_method: "card",
    });

    const deliveryFee = data.delivery_method === "coastal" ? 25000 : 15000;
    const adminFee = 2000;
    const grandTotal = subtotal + deliveryFee + adminFee;

    const handlePlaceOrder = () => {
        post(route("checkout.store"), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Pesanan berhasil dibuat!");
            },
            onError: () => {
                toast.error(
                    "Gagal membuat pesanan, pastikan semua form terisi.",
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
                            setData={setData}
                            errors={errors}
                        />

                        <DeliverySection
                            selected={data.delivery_method}
                            onSelect={(val) => setData("delivery_method", val)}
                        />

                        <PaymentSection
                            selected={data.payment_method}
                            onSelect={(val) => setData("payment_method", val)}
                        />
                    </div>

                    <div className="lg:col-span-4">
                        <OrderSummary
                            subtotal={subtotal}
                            deliveryFee={deliveryFee}
                            totalItems={totalItems}
                            onPlaceOrder={handlePlaceOrder}
                            processing={processing}
                        />
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
