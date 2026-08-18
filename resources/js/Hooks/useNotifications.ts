import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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

// Global cached audio element & unlocked state
let cachedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

/**
 * Unlock browser audio autoplay policy on the first user interaction.
 */
function initAudioUnlock() {
    if (typeof window === "undefined" || audioUnlocked) return;

    const unlock = () => {
        if (audioUnlocked) return;
        try {
            if (!cachedAudio) {
                cachedAudio = new Audio("/sounds/notification.mp3");
                cachedAudio.preload = "auto";
            }
            // Prime audio with near-zero volume
            cachedAudio.volume = 0.001;
            const promise = cachedAudio.play();
            if (promise !== undefined) {
                promise
                    .then(() => {
                        cachedAudio?.pause();
                        if (cachedAudio) cachedAudio.currentTime = 0;
                        cachedAudio!.volume = 0.85;
                        audioUnlocked = true;
                    })
                    .catch(() => {});
            }
        } catch {}

        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
        window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
}

/**
 * Synthesize a clean 3-tone chime fallback using Web Audio API
 */
function playWebAudioChimeFallback() {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        if (ctx.state === "suspended") {
            ctx.resume();
        }

        const playTone = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        const now = ctx.currentTime;
        playTone(587.33, now, 0.15);       // D5
        playTone(739.99, now + 0.12, 0.15); // F#5
        playTone(880.00, now + 0.24, 0.35); // A5
    } catch {}
}

/**
 * Show native OS/browser notification banner (works both foreground & background)
 */
function showNativeNotification(title: string, message?: string, actionUrl?: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
        const notif = new Notification(title, {
            body: message || "",
            icon: window.location.origin + "/favicon.png",
            badge: window.location.origin + "/favicon.png",
        });

        notif.onclick = () => {
            window.focus();
            if (actionUrl) {
                window.location.href = actionUrl;
            }
            notif.close();
        };
    } catch {
        // Fallback for Android/PWA Service Worker context
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                registration.showNotification(title, {
                    body: message || "",
                    icon: window.location.origin + "/favicon.png",
                    badge: window.location.origin + "/favicon.png",
                    data: { action_url: actionUrl },
                });
            });
        }
    }
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

    const prevUnreadCountRef = useRef<number | null>(null);
    const isInitialMountRef = useRef<boolean>(true);

    // Helper to play notification sound with Web Audio fallback
    const playNotificationSound = useCallback(() => {
        try {
            if (!cachedAudio) {
                cachedAudio = new Audio("/sounds/notification.mp3");
                cachedAudio.preload = "auto";
                cachedAudio.volume = 0.85;
            }
            cachedAudio.currentTime = 0;
            const playPromise = cachedAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn("Audio play blocked, using chime fallback:", err);
                    playWebAudioChimeFallback();
                });
            }
        } catch {
            playWebAudioChimeFallback();
        }
    }, []);

    // Helper to trigger bell wobble animation
    const triggerBellAnimation = useCallback(() => {
        setIsRinging(true);
        setTimeout(() => setIsRinging(false), 3000);
    }, []);

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
            .then((res) => {
                const newCount = typeof res.data.count === "number" ? res.data.count : 0;
                
                // If count increases after initial load, play sound & trigger banner!
                if (!isInitialMountRef.current && prevUnreadCountRef.current !== null && newCount > prevUnreadCountRef.current) {
                    playNotificationSound();
                    triggerBellAnimation();

                    // Trigger banner for the latest incoming item
                    axios.get("/api/notifications").then((notifRes) => {
                        const latest = notifRes.data?.all?.[0];
                        if (latest?.data) {
                            showNativeNotification(
                                latest.data.title || "Notifikasi Baru",
                                latest.data.message,
                                latest.data.action_url
                            );
                        }
                    }).catch(() => {});
                }

                prevUnreadCountRef.current = newCount;
                isInitialMountRef.current = false;
                setUnreadCount(newCount);
            })
            .catch(console.error);
    }, [user, playNotificationSound, triggerBellAnimation]);

    // Initial Fetch, Audio Unlock, Polling Interval & FCM Token Registration
    useEffect(() => {
        if (!user) return;

        initAudioUnlock();
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

        // Poll every 10 seconds to catch status updates and payment verifications
        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 10000);

        return () => clearInterval(pollInterval);
    }, [user, fetchNotifications]);

    // Push Message Listener & Visibility Change Sync
    useEffect(() => {
        if (!user) return;

        const unsubscribe = onMessageListener((payload: any) => {
            if (payload?.data) {
                // 1. Play sound
                playNotificationSound();
                // 2. Animate bell
                triggerBellAnimation();
                // 3. ALWAYS show native OS push notification banner (even if web is open!)
                showNativeNotification(
                    payload.data.title || "Notifikasi Baru",
                    payload.data.message,
                    payload.data.action_url
                );
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
    }, [user, fetchNotifications, playNotificationSound, triggerBellAnimation]);

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
        if (todayItems.length > 0) groups.push({ label: "Hari Ini", items: todayItems });
        if (yesterdayItems.length > 0) groups.push({ label: "Kemarin", items: yesterdayItems });
        if (olderItems.length > 0) groups.push({ label: "Terdahulu", items: olderItems });

        return groups;
    }, [notifications, activeNotifTab]);

    // Action Handlers
    const markAsRead = async (id: string, actionUrl?: string) => {
        try {
            await axios.post(`/api/notifications/${id}/mark-as-read`);
            setNotifications((prev) => {
                const updateList = (list: NotificationData[]) =>
                    list.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
                return {
                    all: updateList(prev.all),
                    orders: updateList(prev.orders),
                    promotions: updateList(prev.promotions),
                    security: updateList(prev.security),
                };
            });
            setUnreadCount((prev) => Math.max(0, prev - 1));

            if (actionUrl) {
                window.location.href = actionUrl;
            }
        } catch (err) {
            console.error("❌ Failed to mark notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.post("/api/notifications/mark-all-read");
            setNotifications((prev) => {
                const markList = (list: NotificationData[]) =>
                    list.map((n) => ({ ...n, read_at: new Date().toISOString() }));
                return {
                    all: markList(prev.all),
                    orders: markList(prev.orders),
                    promotions: markList(prev.promotions),
                    security: markList(prev.security),
                };
            });
            setUnreadCount(0);
        } catch (err) {
            console.error("❌ Failed to mark all as read:", err);
        }
    };

    const clearAll = async () => {
        try {
            setIsClearing(true);
            await axios.post("/api/notifications/clear-all");
            setNotifications({
                all: [],
                orders: [],
                promotions: [],
                security: [],
            });
            setUnreadCount(0);
        } catch (err) {
            console.error("❌ Failed to clear notifications:", err);
        } finally {
            setIsClearing(false);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await axios.delete(`/api/notifications/${id}`);
            setNotifications((prev) => {
                const filterList = (list: NotificationData[]) => list.filter((n) => n.id !== id);
                return {
                    all: filterList(prev.all),
                    orders: filterList(prev.orders),
                    promotions: filterList(prev.promotions),
                    security: filterList(prev.security),
                };
            });
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("❌ Failed to delete notification:", err);
        }
    };

    return {
        notifications,
        groupedNotifications,
        unreadCount,
        activeNotifTab,
        setActiveNotifTab,
        isRinging,
        isClearing,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        deleteNotification,
        playNotificationSound,
    };
}
