import React, { useState, useEffect, useRef } from "react";
import { Link } from "@inertiajs/react";
import { Bell, X, Truck, Tag, ShieldAlert, CheckCircle, Clock } from "lucide-react";
import { useNotifications, NotificationTab } from "@/Hooks/useNotifications";

function formatRelativeTime(dateString?: string) {
    if (!dateString) return "Baru saja";
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Baru saja";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mnt lalu`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam lalu`;
        if (diffInSeconds < 172800) return "Kemarin";
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
        return "Baru saja";
    }
}

export default function NotificationBell({ user }: { user: any }) {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const {
        notifications,
        unreadCount,
        activeNotifTab,
        setActiveNotifTab,
        groupedNotifications,
        isRinging,
        isClearing,
        markAllAsRead,
        clearAll,
    } = useNotifications(user);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        if (isNotifOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isNotifOpen]);

    const tabs: { id: NotificationTab; label: string }[] = [
        { id: "all", label: "Semua" },
        { id: "orders", label: "Pesanan" },
        { id: "promotions", label: "Promo" },
        { id: "security", label: "Keamanan" },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <style>{`
                @keyframes bell-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-15deg); }
                    75% { transform: rotate(15deg); }
                }
                .bell-ringing {
                    animation: bell-wiggle 0.2s ease-in-out infinite;
                    color: #ED7218;
                }
                @keyframes swipe-out {
                    0% { transform: translateX(0); opacity: 1; }
                    100% { transform: translateX(-50px); opacity: 0; }
                }
                .swipe-out-animation {
                    animation: swipe-out 0.35s ease-in forwards;
                }
            `}</style>

            <button
                type="button"
                onClick={() => {
                    const nextState = !isNotifOpen;
                    setIsNotifOpen(nextState);
                    if (nextState && unreadCount > 0) {
                        markAllAsRead();
                    }
                }}
                aria-label="Notifikasi"
                className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 transition-colors relative flex items-center"
            >
                <Bell size={21} strokeWidth={2} className={isRinging ? "bell-ringing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Modal / Dropdown Container */}
            {isNotifOpen && (
                <>
                    {/* Mobile Backdrop for small screens */}
                    <div
                        className="fixed inset-0 bg-black/20 sm:hidden z-40"
                        onClick={() => setIsNotifOpen(false)}
                    />

                    <div className="fixed inset-x-3.5 top-16 sm:inset-auto sm:absolute sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[370px] bg-white/95 backdrop-blur-md max-h-[70vh] sm:max-h-[75vh] flex flex-col shadow-2xl rounded-2xl md:rounded-3xl animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden border border-slate-200/80">
                        {/* Header */}
                        <div className="flex justify-between items-center px-4 md:px-5 py-3.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-gray-900">Notifikasi</h2>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-[#ED7218]">
                                        {unreadCount} baru
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                                {notifications.all.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        className="text-xs text-red-500 hover:text-red-700 font-bold px-2.5 py-1 rounded-lg hover:bg-red-50 transition"
                                    >
                                        Bersihkan
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setIsNotifOpen(false)}
                                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                                >
                                    <X size={17} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="px-3.5 pt-2.5 pb-2 bg-slate-50/70 border-b border-slate-100">
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                                {tabs.map((tab) => {
                                    const count = notifications[tab.id]?.length || 0;
                                    const isActive = activeNotifTab === tab.id;

                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveNotifTab(tab.id)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                                                isActive
                                                    ? "bg-[#ED7218] text-white shadow-2xs shadow-orange-500/20"
                                                    : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            {count > 0 && (
                                                <span
                                                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                                        isActive
                                                            ? "bg-white/20 text-white"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notifications List Area */}
                        <div
                            className={`flex-1 overflow-y-auto px-3.5 py-3 no-scrollbar space-y-3.5 text-left ${
                                isClearing ? "swipe-out-animation" : ""
                            }`}
                        >
                            {groupedNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#ED7218] flex items-center justify-center mb-2.5">
                                        <Bell size={22} className="opacity-80" />
                                    </div>
                                    <p className="text-xs font-medium text-slate-500">
                                        Belum ada notifikasi di kategori ini.
                                    </p>
                                </div>
                            ) : (
                                groupedNotifications.map((group, gIndex) => (
                                    <div key={gIndex}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase">
                                                {group.label}
                                            </span>
                                            <div className="flex-1 h-px bg-slate-100" />
                                        </div>

                                        <div className="space-y-2">
                                            {group.items.map((item) => {
                                                const type = item.data?.type;
                                                const isUnread = !item.read_at;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`rounded-xl border p-3 flex gap-2.5 transition ${
                                                            isUnread
                                                                ? "bg-orange-50/25 border-orange-200/80"
                                                                : "bg-white border-slate-200/70"
                                                        }`}
                                                    >
                                                        <div className="shrink-0 pt-0.5">
                                                            <div
                                                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                                                    type === "order"
                                                                        ? "bg-orange-50 text-[#ED7218]"
                                                                        : type === "promo"
                                                                        ? "bg-rose-50 text-rose-600"
                                                                        : type === "security"
                                                                        ? "bg-blue-50 text-blue-600"
                                                                        : "bg-emerald-50 text-emerald-600"
                                                                }`}
                                                            >
                                                                {type === "order" && (
                                                                    <Truck size={14} strokeWidth={2.5} />
                                                                )}
                                                                {type === "promo" && (
                                                                    <Tag size={14} strokeWidth={2.5} />
                                                                )}
                                                                {type === "security" && (
                                                                    <ShieldAlert size={14} strokeWidth={2.5} />
                                                                )}
                                                                {!["order", "promo", "security"].includes(
                                                                    type || ""
                                                                ) && (
                                                                    <CheckCircle size={14} strokeWidth={2.5} />
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start gap-2 mb-0.5">
                                                                <h3 className="font-bold text-xs leading-tight text-gray-900 truncate">
                                                                    {item.data?.title || "Notifikasi"}
                                                                </h3>
                                                                <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-0.5">
                                                                    <Clock size={10} />
                                                                    {formatRelativeTime(item.created_at)}
                                                                </span>
                                                            </div>

                                                            <p className="text-[11px] leading-snug text-slate-600 mb-2">
                                                                {item.data?.message || ""}
                                                            </p>

                                                            {item.data?.action_url && (
                                                                <Link
                                                                    href={item.data.action_url}
                                                                    onClick={() => setIsNotifOpen(false)}
                                                                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#ED7218] text-white hover:bg-[#d66311] transition shadow-2xs shadow-orange-500/20 active:scale-95"
                                                                >
                                                                    Lihat Detail
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
