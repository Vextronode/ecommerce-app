import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

export function useInertiaNetworkLoading() {
    const [isNetworkLoading, setIsNetworkLoading] = useState(false);

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
                    return;
                }
            }

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
