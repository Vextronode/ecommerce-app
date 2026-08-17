import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { requestForToken, onMessageListener } from "../firebase";

export interface NotificationData {
    id: string;
    created_at: string;
    read_at: string | null;
    data?: {
        title?: string;
        message?: string;
        type?: "order" | "promo" | "security" | "payment" | string;
        action_url?: string;
    };
}

export type NotificationTab = "all" | "orders" | "promotions" | "security";

export interface NotificationGroup {
    label: string;
    items: NotificationData[];
}

export function useNotifications(user: any) {
    const [notifications, setNotifications] = useState<{
        all: NotificationData[];
        orders: NotificationData[];
        promotions: NotificationData[];
        security: NotificationData[];
    }>({
        all: [],
        orders: [],
        promotions: [],
        security: [],
    });

    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [activeNotifTab, setActiveNotifTab] = useState<NotificationTab>("all");
    const [isRinging, setIsRinging] = useState<boolean>(false);
    const [isClearing, setIsClearing] = useState<boolean>(false);

    const fetchNotifications = useCallback(() => {
        if (!user) return;

        axios
            .get("/api/notifications")
            .then((res) => {
                if (res.data) {
                    setNotifications({
                        all: res.data.all || [],
                        orders: res.data.orders || [],
                        promotions: res.data.promotions || [],
                        security: res.data.security || [],
                    });
                }
            })
            .catch(console.error);

        axios
            .get("/api/notifications/unread-count")
            .then((res) => setUnreadCount(res.data.count || 0))
            .catch(console.error);
    }, [user]);

    // Initial Fetch & FCM Token Registration
    useEffect(() => {
        if (!user) return;

        fetchNotifications();

        requestForToken()
            .then((token) => {
                if (token) {
                    axios
                        .post("/api/notifications/fcm-token", { fcm_token: token })
                        .catch((err) => console.error("❌ Failed to save FCM token:", err));
                }
            })
            .catch((err) => console.error("❌ requestForToken error:", err));
    }, [user, fetchNotifications]);

    // Push Message Listener & Visibility Change Sync
    useEffect(() => {
        if (!user) return;

        const unsubscribe = onMessageListener((payload: any) => {
            if (payload?.data) {
                if (document.hidden && Notification.permission === "granted") {
                    if ("serviceWorker" in navigator) {
                        navigator.serviceWorker.ready.then((registration) => {
                            registration.showNotification(payload.data.title || "Notifikasi Baru", {
                                body: payload.data.message,
                                icon: window.location.origin + "/favicon.png",
                            });
                        });
                    }
                } else {
                    setIsRinging(true);
                    setTimeout(() => setIsRinging(false), 3000);
                }
            }

            fetchNotifications();
        });

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchNotifications();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            unsubscribe();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user, fetchNotifications]);

    // Smart Date Grouping (Hari Ini, Kemarin, Terdahulu)
    const groupedNotifications = useMemo((): NotificationGroup[] => {
        const list = notifications[activeNotifTab] || [];

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayStr = today.toDateString();
        const yesterdayStr = yesterday.toDateString();

        const todayItems: NotificationData[] = [];
        const yesterdayItems: NotificationData[] = [];
        const olderItems: NotificationData[] = [];

        list.forEach((item) => {
            if (!item.created_at) {
                todayItems.push(item);
                return;
            }
            const itemDate = new Date(item.created_at).toDateString();
            if (itemDate === todayStr) {
                todayItems.push(item);
            } else if (itemDate === yesterdayStr) {
                yesterdayItems.push(item);
            } else {
                olderItems.push(item);
            }
        });

        const groups: NotificationGroup[] = [];
        if (todayItems.length > 0) groups.push({ label: "HARI INI", items: todayItems });
        if (yesterdayItems.length > 0) groups.push({ label: "KEMARIN", items: yesterdayItems });
        if (olderItems.length > 0) groups.push({ label: "TERDAHULU", items: olderItems });

        return groups;
    }, [notifications, activeNotifTab]);

    const markAllAsRead = async () => {
        try {
            await axios.post("/api/notifications/mark-all-read");
            setUnreadCount(0);
            setNotifications((prev) => {
                const updated = { ...prev };
                (Object.keys(updated) as (keyof typeof updated)[]).forEach((key) => {
                    updated[key] = updated[key].map((n) => ({
                        ...n,
                        read_at: new Date().toISOString(),
                    }));
                });
                return updated;
            });
        } catch (e) {
            console.error(e);
        }
    };

    const clearAll = async () => {
        try {
            setIsClearing(true);
            await axios.post("/api/notifications/clear-all");

            setTimeout(() => {
                setUnreadCount(0);
                setNotifications({ all: [], orders: [], promotions: [], security: [] });
                setIsClearing(false);
            }, 350);
        } catch (e) {
            console.error(e);
            setIsClearing(false);
        }
    };

    return {
        notifications,
        unreadCount,
        activeNotifTab,
        setActiveNotifTab,
        groupedNotifications,
        isRinging,
        isClearing,
        markAllAsRead,
        clearAll,
        refetch: fetchNotifications,
    };
}
