import React from "react";
import toast from "react-hot-toast";
import { ChatMessageItem } from "@/types/chat";

let cachedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

const recentlyNotifiedMessageIds = new Set<number>();

export function initAudioUnlock(): void {
    if (typeof window === "undefined" || audioUnlocked) return;

    const unlock = () => {
        if (audioUnlocked) return;
        try {
            if (!cachedAudio) {
                cachedAudio = new Audio("/sounds/notification.mp3");
                cachedAudio.preload = "auto";
            }
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

export function playWebAudioChime(): void {
    try {
        if (typeof window === "undefined") return;
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
        playTone(587.33, now, 0.15);
        playTone(739.99, now + 0.12, 0.15);
        playTone(880.0, now + 0.24, 0.35);
    } catch {}
}

export function playNotificationSound(): void {
    try {
        if (typeof window === "undefined") return;

        if (!cachedAudio) {
            cachedAudio = new Audio("/sounds/notification.mp3");
            cachedAudio.preload = "auto";
            cachedAudio.volume = 0.85;
        }

        cachedAudio.currentTime = 0;
        const playPromise = cachedAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                playWebAudioChime();
            });
        }
    } catch {
        playWebAudioChime();
    }
}

export async function requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
        return false;
    }

    if (Notification.permission === "granted") {
        return true;
    }

    if (Notification.permission === "denied") {
        return false;
    }

    try {
        const result = await Notification.requestPermission();
        return result === "granted";
    } catch {
        return false;
    }
}

export function showDesktopNotification({
    title,
    body,
    icon,
    tag,
    onClick,
}: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
}): void {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const defaultIcon = window.location.pathname.startsWith("/pedagang")
        ? `${window.location.origin}/icons/icon-merchant-192.png`
        : `${window.location.origin}/icons/icon-192.png`;

    const iconUrl = icon || defaultIcon;
    const notifTag = tag || `${title}:${body}`;

    try {
        const notif = new Notification(title, {
            body,
            icon: iconUrl,
            badge: iconUrl,
            tag: notifTag,
        });

        notif.onclick = () => {
            window.focus();
            if (onClick) onClick();
            notif.close();
        };
    } catch {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.ready
                .then((registration) => {
                    registration.showNotification(title, {
                        body,
                        icon: iconUrl,
                        badge: iconUrl,
                        tag: notifTag,
                    });
                })
                .catch(() => {});
        }
    }
}

export function showInAppChatToast({
    title,
    body,
    avatar,
    onClick,
}: {
    title: string;
    body: string;
    avatar?: string | null;
    onClick?: () => void;
}): void {
    toast.custom(
        (t) =>
            React.createElement(
                "div",
                {
                    onClick: () => {
                        toast.dismiss(t.id);
                        if (onClick) onClick();
                    },
                    className: `${
                        t.visible ? "animate-enter" : "animate-leave"
                    } max-w-sm w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-3 cursor-pointer hover:bg-orange-50/50 transition border border-brand-orange/30 items-center gap-3`,
                },
                React.createElement(
                    "div",
                    { className: "relative shrink-0 w-11 h-11 rounded-full overflow-hidden bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20" },
                    avatar
                        ? React.createElement("img", {
                              src: avatar,
                              alt: title,
                              className: "w-full h-full object-cover",
                          })
                        : React.createElement(
                              "span",
                              { className: "text-brand-orange font-bold text-sm" },
                              title.charAt(0).toUpperCase()
                          )
                ),
                React.createElement(
                    "div",
                    { className: "flex-1 min-w-0" },
                    React.createElement(
                        "p",
                        { className: "text-xs font-bold text-gray-900 truncate" },
                        title
                    ),
                    React.createElement(
                        "p",
                        { className: "text-xs text-gray-600 truncate mt-0.5" },
                        body
                    )
                ),
                React.createElement(
                    "span",
                    { className: "text-[10px] text-brand-orange font-semibold shrink-0" },
                    "Balas"
                )
            ),
        { duration: 4500 }
    );
}

export function notifyIncomingChatMessage(
    message: ChatMessageItem,
    options: {
        currentUserId?: number;
        isViewingThisRoom?: boolean;
        isWindowFocused?: boolean;
        onOpenChat?: () => void;
    } = {}
): void {
    if (message.id && recentlyNotifiedMessageIds.has(message.id)) {
        return;
    }

    if (message.id) {
        recentlyNotifiedMessageIds.add(message.id);
        setTimeout(() => recentlyNotifiedMessageIds.delete(message.id), 10000);
    }

    playNotificationSound();

    const isWindowFocused =
        typeof options.isWindowFocused === "boolean"
            ? options.isWindowFocused
            : typeof document !== "undefined" && document.visibilityState === "visible" && document.hasFocus();

    if (options.isViewingThisRoom && isWindowFocused) {
        return;
    }

    const title = message.sender_name || (message.sender_type === "merchant" ? "Toko" : "Pelanggan");
    const snippet =
        message.message ||
        (message.media_type === "video" ? "[Mengirim Video]" : message.media_path ? "[Mengirim Foto]" : "Mengirim pesan");

    showDesktopNotification({
        title: `Pesan baru dari ${title}`,
        body: snippet,
        icon: message.sender_avatar || undefined,
        tag: `chat_msg_${message.id}`,
        onClick: options.onOpenChat,
    });

    if (!options.isViewingThisRoom) {
        showInAppChatToast({
            title,
            body: snippet,
            avatar: message.sender_avatar,
            onClick: options.onOpenChat,
        });
    }
}
