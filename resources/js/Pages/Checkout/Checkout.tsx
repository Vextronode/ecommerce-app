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
import { useCheckoutForm, type PlatformSettings } from "@/Hooks/Storefront/useCheckoutForm";

interface Props {
    initialCartItems: any[];
    addresses: CheckoutAddress[];
    platformSettings?: PlatformSettings;
}

export default function Checkout({ initialCartItems, addresses, platformSettings }: Props) {
    const {
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
        serviceFee,
        taxAmount,
        taxPercentage,
        enableServiceFee,
        enableTax,
        enableOnlinePayment,
        enableLocalDelivery,
        isAddressPickerOpen,
        setIsAddressPickerOpen,
        applyAddress,
        handlePaymentSelect,
        handlePlaceOrder,
    } = useCheckoutForm({ initialCartItems, addresses, platformSettings });

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
                            errors={errors}
                            selectedAddress={selectedAddress}
                            onOpenAddressPicker={() =>
                                setIsAddressPickerOpen(true)
                            }
                        />

                        <DeliverySection
                            selected={data.delivery_method}
                            onSelect={(val) => {
                                if (val === "local_delivery" && !enableLocalDelivery) {
                                    return;
                                }
                                setData("delivery_method", val);
                            }}
                            deliveryFee={deliveryFee}
                            estimatedDeliveryFee={estimatedDeliveryFee}
                            isCalculatingFee={isCalculatingFee}
                            isLocalDeliveryEnabled={enableLocalDelivery}
                            storesBreakdown={storesBreakdown}
                        />

                        <PaymentSection
                            selectedMethod={data.payment_method}
                            selectedChannel={data.payment_channel}
                            onSelect={handlePaymentSelect}
                            isOnlinePaymentEnabled={enableOnlinePayment}
                        />
                    </div>

                    <div className="lg:col-span-4 self-start sticky top-32">
                        <OrderSummary
                            subtotal={subtotal}
                            deliveryFee={deliveryFee}
                            serviceFee={serviceFee}
                            taxAmount={taxAmount}
                            taxPercentage={taxPercentage}
                            enableServiceFee={enableServiceFee}
                            enableTax={enableTax}
                            totalItems={totalItems}
                            storesBreakdown={storesBreakdown}
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
