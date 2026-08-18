import React, { useEffect } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import { Store, Star } from "lucide-react";
import RatingItemCard, { RatingItemType } from "@/Components/History/RatingItemCard";
import OrderItemCard, { OrderType } from "@/Components/History/OrderItemCard";
import { useOrderHistoryActions } from "@/Hooks/Storefront/useOrderHistoryActions";

const tabs = [
    { key: "all", label: "Semua" },
    { key: "unpaid", label: "Belum Bayar" },
    { key: "processing", label: "Dikemas" },
    { key: "shipped", label: "Dikirim" },
    { key: "delivered", label: "Selesai" },
    { key: "cancelled", label: "Dibatalkan" },
    { key: "rating", label: "Beri Penilaian" },
];

export default function Index({
    orders,
    ratingItems,
    currentStatus,
}: {
    orders?: OrderType[];
    ratingItems?: RatingItemType[];
    currentStatus: string;
}) {
    const { auth } = usePage().props as any;
    const userId = auth?.user?.id;
    const { navigateTab } = useOrderHistoryActions();

    // Real-Time WebSocket Order Status Synchronization for Buyer's History Tab
    useEffect(() => {
        if (typeof window === "undefined" || !window.Echo) return;

        const handleUpdate = () => {
            router.reload({ only: ["orders", "ratingItems"] });
        };

        const globalChan = window.Echo.channel("global-orders");
        globalChan.listen(".OrderStatusUpdated", handleUpdate);
        globalChan.listen("OrderStatusUpdated", handleUpdate);

        let userChan: any = null;
        if (userId) {
            userChan = window.Echo.channel(`user-orders.${userId}`);
            userChan.listen(".OrderStatusUpdated", handleUpdate);
            userChan.listen("OrderStatusUpdated", handleUpdate);
        }

        return () => {
            window.Echo.leaveChannel("global-orders");
            if (userId) {
                window.Echo.leaveChannel(`user-orders.${userId}`);
            }
        };
    }, [userId]);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <Head title="Riwayat Pesanan" />
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-32">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Riwayat Pesanan
                            </h2>
                            <div className="flex flex-col space-y-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => navigateTab(tab.key)}
                                        className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            currentStatus === tab.key
                                                ? "bg-[#ED7218] text-white shadow-xs font-semibold"
                                                : "text-gray-700 bg-gray-50/80 hover:bg-gray-100 border border-gray-200/60"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-6">
                        
                        {/* If status is rating, show Rating Items */}
                        {currentStatus === "rating" && ratingItems && (
                            <>
                                {ratingItems.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                        <div className="text-gray-400 mb-4">
                                            <Star className="w-16 h-16 mx-auto opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Belum ada produk untuk dinilai
                                        </h3>
                                        <p className="text-gray-500 mt-1">
                                            Pesanan yang sudah selesai akan muncul di sini.
                                        </p>
                                    </div>
                                ) : (
                                    ratingItems.map((item) => (
                                        <RatingItemCard key={item.id} item={item} />
                                    ))
                                )}
                            </>
                        )}

                        {/* If status is NOT rating, show regular Orders */}
                        {currentStatus !== "rating" && orders && (
                            <>
                                {orders.length === 0 ? (
                                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                                        <div className="text-gray-400 mb-4">
                                            <Store className="w-16 h-16 mx-auto opacity-50" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Belum ada pesanan
                                        </h3>
                                        <p className="text-gray-500 mt-1">
                                            Anda belum memiliki pesanan dengan status ini.
                                        </p>
                                        <Link
                                            href={route("shop")}
                                            className="inline-block mt-6 px-6 py-2.5 bg-[#ED7218] text-white rounded-xl font-medium hover:bg-[#d66311] transition-colors shadow-xs"
                                        >
                                            Mulai Belanja
                                        </Link>
                                    </div>
                                ) : (
                                    orders.map((order) => (
                                        <OrderItemCard key={order.id} order={order} />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
