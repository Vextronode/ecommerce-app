import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

/**
 * Hook to track real network connection status for Inertia visits and requests.
 * Fully driven by Inertia router lifecycle events (start -> finish).
 * No fake setTimeout or sleep delays; reflects genuine user connection speed.
 */
export function useInertiaNetworkLoading() {
    const [isNetworkLoading, setIsNetworkLoading] = useState(false);

    useEffect(() => {
        const removeStartListener = router.on("start", () => {
            setIsNetworkLoading(true);
        });

        const removeFinishListener = router.on("finish", () => {
            setIsNetworkLoading(false);
        });

        const removeCancelListener = router.on("cancel", () => {
            setIsNetworkLoading(false);
        });

        const removeErrorListener = router.on("error", () => {
            setIsNetworkLoading(false);
        });

        return () => {
            removeStartListener();
            removeFinishListener();
            removeCancelListener();
            removeErrorListener();
        };
    }, []);

    return isNetworkLoading;
}
