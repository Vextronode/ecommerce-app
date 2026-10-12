import { PropsWithChildren, useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import Navbar from "@/Components/Global/Navbar";
import Footer from "@/Components/Global/Footer";
import { Toaster } from "react-hot-toast";
import StorefrontChatWidget from "@/Components/Storefront/LiveChat/StorefrontChatWidget";
import DashboardPageSkeleton from "@/Components/Storefront/DashboardPageSkeleton";
import ShopPageSkeleton from "@/Components/Storefront/Shop/ShopPageSkeleton";
import ProductDetailPageSkeleton from "@/Components/Storefront/ProductDetail/ProductDetailPageSkeleton";
import StoreDetailPageSkeleton from "@/Components/Storefront/StoreDetail/StoreDetailPageSkeleton";
import OrderCardSkeleton from "@/Components/Global/Skeletons/OrderCardSkeleton";

export default function StorefrontLayout({ children }: PropsWithChildren) {
    const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

    useEffect(() => {
        const removeStartListener = router.on("start", (event: any) => {
            const targetUrl = event?.detail?.visit?.url;
            if (targetUrl && typeof window !== "undefined") {
                const targetPath = (
                    typeof targetUrl === "string"
                        ? new URL(targetUrl, window.location.origin).pathname
                        : targetUrl.pathname
                ).replace(/\/$/, "");

                const currentPath = window.location.pathname.replace(/\/$/, "");

                if (targetPath !== currentPath) {
                    setNavigatingTo(targetPath);
                }
            }
        });

        const removeFinishListener = router.on("finish", () => {
            setNavigatingTo(null);
        });

        const removeCancelListener = router.on("cancel", () => {
            setNavigatingTo(null);
        });

        const removeErrorListener = router.on("error", () => {
            setNavigatingTo(null);
        });

        return () => {
            removeStartListener();
            removeFinishListener();
            removeCancelListener();
            removeErrorListener();
        };
    }, []);

    const renderDestinationSkeleton = () => {
        if (!navigatingTo) return null;

        if (navigatingTo === "" || navigatingTo === "/dashboard") {
            return <DashboardPageSkeleton />;
        }
        if (navigatingTo.startsWith("/shop")) {
            return <ShopPageSkeleton />;
        }
        if (navigatingTo.startsWith("/product/")) {
            return <ProductDetailPageSkeleton />;
        }
        if (navigatingTo.startsWith("/store/")) {
            return <StoreDetailPageSkeleton />;
        }
        if (navigatingTo.startsWith("/history")) {
            return (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-32">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-64 shrink-0 bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
                        <div className="flex-1 space-y-4">
                            <OrderCardSkeleton />
                            <OrderCardSkeleton />
                            <OrderCardSkeleton />
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const destinationSkeleton = renderDestinationSkeleton();

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            <Toaster position="top-center" reverseOrder={false} />
            <Navbar />
            <main className="w-full">
                {destinationSkeleton ? destinationSkeleton : children}
            </main>
            <Footer />
            <StorefrontChatWidget />
        </div>
    );
}
