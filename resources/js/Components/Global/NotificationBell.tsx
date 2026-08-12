import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@inertiajs/react";
import { Bell, X, Truck, Tag, ShieldAlert, CheckCircle } from "lucide-react";
import axios from "axios";

export default function NotificationBell({ user }: { user: any }) {
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState<{all: any[], orders: any[], promotions: any[], security: any[], payments: any[]}>({
        all: [], orders: [], promotions: [], security: [], payments: []
    });
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeNotifTab, setActiveNotifTab] = useState("all");

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

    return (
        <div className="relative">
            <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                aria-label="Notifications"
                className="p-1.5 md:p-2 text-gray-600 hover:text-gray-900 transition-colors relative flex items-center"
            >
                <Bell size={22} strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full leading-none border border-[#F8F9FA]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>
            
            {/* Notifications Dropdown Container */}
            {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[340px] md:w-[400px] bg-slate-200/60 max-h-[60vh] md:max-h-[80vh] flex flex-col shadow-2xl rounded-3xl animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden border border-gray-300/50">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-5 pb-3">
                        <h2 className="text-xl font-bold text-[#ED7218]">Notifications</h2>
                        <button 
                            onClick={() => setIsNotifOpen(false)}
                            className="p-1.5 bg-gray-200/50 hover:bg-gray-300/60 rounded-full text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <X size={18} />
                        </button>
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
                    <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar space-y-5">
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
                                            <div key={item.id} className={`bg-white rounded-2xl shadow-sm border-l-[3px] p-4 flex gap-3 ${item.read_at ? 'border-transparent bg-gray-100' : 'border-[#ED7218]'}`}>
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
                                                        <h3 className={`font-semibold text-sm leading-tight ${item.read_at ? 'text-gray-600' : 'text-gray-800'}`}>{item.data?.title || 'Notification'}</h3>
                                                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">Baru saja</span>
                                                    </div>
                                                    <p className={`text-[12px] leading-snug mb-3 ${item.read_at ? 'text-gray-500' : 'text-gray-600'}`}>{item.data?.message || 'You have a new notification.'}</p>
                                                    
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
