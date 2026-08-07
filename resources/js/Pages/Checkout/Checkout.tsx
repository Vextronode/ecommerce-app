import React from "react";
import { Head } from "@inertiajs/react";

import StorefrontLayout from "@/Layouts/StorefrontLayout";
import CartSection from "@/Components/Checkout/CartSection";
import ShippingSection from "@/Components/Checkout/ShippingSection";
import DeliverySection from "@/Components/Checkout/DeliverySection";
import PaymentSection from "@/Components/Checkout/PaymentSection";
import OrderSummary from "@/Components/Checkout/OrderSummary";
import AddressPickerModal, {
    CheckoutAddress,
} from "@/Components/Checkout/AddressPickerModal";
import { useCheckoutForm } from "@/Hooks/Storefront/useCheckoutForm";

interface Props {
    initialCartItems: any[];
    addresses: CheckoutAddress[];
}

export default function Checkout({ initialCartItems, addresses }: Props) {
    const {
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
        handleShippingChange,
        handlePaymentSelect,
        handlePlaceOrder,
    } = useCheckoutForm({ initialCartItems, addresses });

    const selectedAddress = addresses.find(
        (address) => address.id === data.address_id,
    );

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
                            selectedAddress={selectedAddress}
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
                selectedAddressId={data.address_id}
                onClose={() => setIsAddressPickerOpen(false)}
                onSelect={applyAddress}
            />
        </StorefrontLayout>
    );
}
