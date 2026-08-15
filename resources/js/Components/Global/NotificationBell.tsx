import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Bell, X, Truck, Tag, ShieldAlert, CheckCircle } from "lucide-react";
import axios from "axios";
import { requestForToken, onMessageListener } from "../../firebase";

export default function NotificationBell({ user }: { user: any }) {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<{all: any[], orders: any[], promotions: any[], security: any[], payments: any[]}>({
        all: [], orders: [], promotions: [], security: [], payments: []
    });
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeNotifTab, setActiveNotifTab] = useState("all");
    const [isRinging, setIsRinging] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const groupedNotifications = useMemo(() => {
        const list = notifications[activeNotifTab as keyof typeof notifications] || [];
        
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Use YYYY-MM-DD for matching
        const todayStr = today.toISOString().split('T')[0];
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const todayItems = list.filter((item: any) => item.created_at && item.created_at.startsWith(todayStr));
        const yesterdayItems = list.filter((item: any) => item.created_at && item.created_at.startsWith(yesterdayStr));
        const olderItems = list.filter((item: any) => item.created_at && !item.created_at.startsWith(todayStr) && !item.created_at.startsWith(yesterdayStr));
        
        const groups: { label: string, items: any[] }[] = [];
        if (todayItems.length > 0) groups.push({ label: "HARI INI", items: todayItems });
        if (yesterdayItems.length > 0) groups.push({ label: "KEMARIN", items: yesterdayItems });
        if (olderItems.length > 0) groups.push({ label: "TERDAHULU", items: olderItems });
        
        return groups;
    }, [notifications, activeNotifTab]);

    useEffect(() => {
        if (user) {
            axios.get('/api/notifications').then(res => setNotifications(res.data)).catch(console.error);
            axios.get('/api/notifications/unread-count').then(res => setUnreadCount(res.data.count)).catch(console.error);
            
            // Setup Firebase FCM Token
            requestForToken().then((token) => {
                if (token) {
                    axios.post('/api/notifications/fcm-token', { fcm_token: token })
                        .catch(err => console.error("❌ Failed to save FCM token to database", err));
                } else {
                    console.warn("⚠️ Token is null. Browser might have blocked permission or no token available.");
                }
            }).catch(err => console.error("❌ requestForToken crashed:", err));
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const unsubscribe = onMessageListener((payload: any) => {
                // Show in-app Toast Notification or Animation
                if (payload.data) {
                    // If the user is on another tab, show OS notification manually
                    if (document.hidden && Notification.permission === "granted") {
                        if ('serviceWorker' in navigator) {
                            navigator.serviceWorker.ready.then(registration => {
                                registration.showNotification(payload.data.title || "Notifikasi Baru", {
                                    body: payload.data.message,
                                    icon: window.location.origin + '/favicon.png' 
                                });
                            });
                        }
                    } else {
                        // If they are actively looking at the tab, just ring the bell!
                        setIsRinging(true);
                        setTimeout(() => setIsRinging(false), 3000); // Ring for 3 seconds
                    }
                }

                // Refresh notifications when a new one arrives
                axios.get('/api/notifications').then(res => setNotifications(res.data)).catch(console.error);
                setUnreadCount(prev => prev + 1);
            });
            
            // Background-to-Foreground Sync
            // If the user was on another tab, the Service Worker caught the push notification.
            // When they return to this tab, we must manually fetch the latest notifications.
            const handleVisibilityChange = () => {
                if (document.visibilityState === 'visible') {
                    axios.get('/api/notifications').then(res => setNotifications(res.data)).catch(console.error);
                    axios.get('/api/notifications/unread-count').then(res => setUnreadCount(res.data.count)).catch(console.error);
                }
            };
            document.addEventListener('visibilitychange', handleVisibilityChange);

            return () => {
                unsubscribe(); // Clean up listener on unmount
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
    }, [user]);

    const markAllAsRead = async () => {
        try {
            await axios.post('/api/notifications/mark-all-read');
            setUnreadCount(0);
            setNotifications(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                    updated[key as keyof typeof updated] = updated[key as keyof typeof updated].map(n => ({ ...n, read_at: new Date().toISOString() }));
                });
                return updated;
            });
        } catch (e) { console.error(e); }
    };

    const clearAll = async () => {
        try {
            setIsClearing(true);
            await axios.post('/api/notifications/clear-all');
            
            // Wait for swipe out animation before removing from state
            setTimeout(() => {
                setUnreadCount(0);
                setNotifications({ all: [], orders: [], promotions: [], security: [], payments: [] });
                setIsClearing(false);
            }, 350);
        } catch (e) { 
            console.error(e); 
            setIsClearing(false);
        }
    };

    return (
        <div className="relative">
            <style>{`
                @keyframes bell-wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-15deg); }
                    75% { transform: rotate(15deg); }
                }
                .bell-ringing {
                    animation: bell-wiggle 0.2s ease-in-out infinite;
                    color: #ea580c; /* Tailwind orange-600 */
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
                onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    if (!isNotifOpen && unreadCount > 0) {
                        markAllAsRead();
                    }
                }}
                aria-label="Notifications"
                className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 transition-colors relative flex items-center"
            >
                <Bell size={22} strokeWidth={2} className={isRinging ? "bell-ringing" : ""} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
            
            {/* Notifications Dropdown Container */}
            {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[340px] md:w-[400px] bg-slate-200/60 max-h-[60vh] md:max-h-[80vh] flex flex-col shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden border border-gray-300/50">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 pb-3">
                        <h2 className="text-xl font-bold text-[#ED7218]">Notifications</h2>
                        <div className="flex items-center gap-2">
                            {groupedNotifications.length > 0 && (
                                <button 
                                    onClick={clearAll}
                                    className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                                >
                                    Bersihkan
                                </button>
                            )}
                            <button 
                                onClick={() => setIsNotifOpen(false)}
                                className="p-1.5 bg-gray-200/50 hover:bg-gray-300/60 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-5 pb-4">
                        <div className="flex bg-gray-300/40 rounded-full p-1 shadow-sm overflow-x-auto no-scrollbar">
                            {['all', 'orders', 'promotions', 'security'].map((tab) => (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveNotifTab(tab)}
                                    className={`flex-1 py-2 px-3 text-sm font-bold rounded-full transition-all whitespace-nowrap ${activeNotifTab === tab ? 'bg-[#ED7218] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications List Area */}
                    <div className={`flex-1 overflow-y-auto px-5 pb-6 no-scrollbar space-y-5 ${isClearing ? 'swipe-out-animation' : ''}`}>
                        {groupedNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <Bell size={40} className="text-gray-300 mb-3" />
                                <p className="text-sm">Belum ada notifikasi.</p>
                            </div>
                        ) : (
                            groupedNotifications.map((group, gIndex) => (
                                <div key={gIndex}>
                                    <div className={`flex items-center gap-3 mb-3 ${gIndex > 0 ? 'mt-6' : ''}`}>
                                        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{group.label}</span>
                                        <div className="flex-1 h-px bg-gray-300/50"></div>
                                    </div>
                                    <div className="space-y-3">
                                        {group.items.map((item: any) => (
                                            <div key={item.id} className="bg-white rounded-2xl shadow-sm border-l-[3px] border-[#ED7218] p-4 flex gap-3">
                                                <div className="shrink-0">
                                                    <div className={`p-2 rounded-full ${item.data?.type === 'order' ? 'bg-indigo-100 text-indigo-700' : item.data?.type === 'promo' ? 'bg-red-100 text-red-500' : item.data?.type === 'security' ? 'bg-gray-200 text-gray-600' : 'bg-gray-200 text-gray-600'}`}>
                                                        {item.data?.type === 'order' && <Truck size={16} strokeWidth={2.5} />}
                                                        {item.data?.type === 'promo' && <Tag size={16} strokeWidth={2.5} />}
                                                        {item.data?.type === 'security' && <ShieldAlert size={16} strokeWidth={2.5} />}
                                                        {!['order', 'promo', 'security'].includes(item.data?.type) && <CheckCircle size={16} strokeWidth={2.5} />}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h3 className="font-semibold text-sm leading-tight text-gray-800">{item.data?.title || 'Notification'}</h3>
                                                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">Baru saja</span>
                                                    </div>
                                                    <p className="text-[12px] leading-snug mb-3 text-gray-600">{item.data?.message || 'You have a new notification.'}</p>
                                                    
                                                    {/* Optional Action Buttons/Links based on notification data */}
                                                    {item.data?.action_url && (
                                                        <Link href={item.data.action_url} className={`px-3 py-1.5 transition-colors text-[11px] font-semibold rounded-md w-fit ${item.data.type === 'promo' ? 'border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100' : 'bg-[#ED7218] text-white hover:bg-orange-600'}`}>
                                                            {item.data?.action_text || 'Lihat Detail'}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
