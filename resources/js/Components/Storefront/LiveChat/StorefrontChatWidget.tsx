import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import echoInstance from "@/echo";
import axios from "axios";
import toast from "react-hot-toast";
import { MessageSquare } from "lucide-react";
import { BuyerChatRoomItem, ChatMessageItem, ProductAttachment } from "@/types/chat";
import {
    initAudioUnlock,
    requestNotificationPermission,
    notifyIncomingChatMessage,
} from "@/utils/soundAndNotification";
import StorefrontChatRoomsList from "./StorefrontChatRoomsList";
import StorefrontChatActiveRoom from "./StorefrontChatActiveRoom";

export default function StorefrontChatWidget() {
    const { auth, unread_chats_count } = usePage().props as any;
    const user = auth?.user;

    const [isOpen, setIsOpen] = useState(false);
    const [rooms, setRooms] = useState<BuyerChatRoomItem[]>([]);
    const [activeRoom, setActiveRoom] = useState<BuyerChatRoomItem | null>(null);
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState<number>(unread_chats_count || 0);
    const [pendingProduct, setPendingProduct] = useState<ProductAttachment | null>(null);
    const [storeLiveStatus, setStoreLiveStatus] = useState<{ is_online: boolean; last_seen: string } | null>(null);

    useEffect(() => {
        setUnreadTotal(unread_chats_count || 0);
    }, [unread_chats_count]);

    useEffect(() => {
        initAudioUnlock();
        if (user) {
            requestNotificationPermission();
        }
    }, [user]);

    const fetchRooms = async () => {
        if (!user) return;
        setIsLoadingRooms(true);
        try {
            const res = await axios.get("/chat/rooms");
            setRooms(res.data.rooms || []);
            const total = (res.data.rooms || []).reduce(
                (sum: number, r: BuyerChatRoomItem) => sum + (r.unread_count || 0),
                0
            );
            setUnreadTotal(total);
        } catch (err) {
            console.error("Gagal memuat ruang chat:", err);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    useEffect(() => {
        if (isOpen && user) {
            fetchRooms();
        }
    }, [isOpen, user]);

    useEffect(() => {
        if (!activeRoom || !user) {
            setMessages([]);
            setStoreLiveStatus(null);
            return;
        }

        let isMounted = true;
        setIsLoadingMessages(true);

        axios
            .get(`/chat/rooms/${activeRoom.id}/messages`)
            .then((res) => {
                if (isMounted) {
                    setMessages(res.data.messages || []);
                    if (res.data.store_status) {
                        setStoreLiveStatus(res.data.store_status);
                    }
                    setRooms((prev) =>
                        prev.map((r) => (r.id === activeRoom.id ? { ...r, unread_count: 0 } : r))
                    );
                    if (typeof res.data.unread_total === "number") {
                        setUnreadTotal(res.data.unread_total);
                    } else {
                        setUnreadTotal((prev) => Math.max(0, prev - activeRoom.unread_count));
                    }
                }
            })
            .catch((err) => {
                console.error("Gagal memuat pesan:", err);
            })
            .finally(() => {
                if (isMounted) setIsLoadingMessages(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeRoom?.id, user]);

    useEffect(() => {
        if (!activeRoom?.id || typeof window === "undefined") return;

        const channel = echoInstance.private(`chat.room.${activeRoom.id}`);

        channel.listen(".NewChatMessage", (e: ChatMessageItem) => {
            setMessages((prev) => {
                if (prev.some((m) => Number(m.id) === Number(e.id))) return prev;
                return [...prev, e];
            });

            if (e.sender_type === "merchant") {
                notifyIncomingChatMessage(e, {
                    isViewingThisRoom: true,
                });

                axios
                    .post(`/chat/rooms/${activeRoom.id}/read`)
                    .then((res) => {
                        if (typeof res.data.unread_total === "number") {
                            setUnreadTotal(res.data.unread_total);
                        }
                    })
                    .catch(() => {});
            }

            setRooms((prev) =>
                prev.map((r) => {
                    if (r.id === activeRoom.id) {
                        return {
                            ...r,
                            last_message: {
                                message:
                                    e.message ||
                                    (e.media_type === "video" ? "[Video]" : e.media_path ? "[Foto]" : ""),
                                created_at: "Baru saja",
                                sender_type: e.sender_type,
                            },
                            last_message_at: e.created_at,
                            unread_count: 0,
                        };
                    }
                    return r;
                })
            );
        });

        return () => {
            channel.stopListening(".NewChatMessage");
        };
    }, [activeRoom?.id]);

    useEffect(() => {
        if (!user?.id || typeof window === "undefined") return;

        const userChannel = echoInstance.private(`user-chats.${user.id}`);

        userChannel.listen(".NewChatMessage", (e: ChatMessageItem) => {
            const isViewingThisRoom = isOpen && activeRoom?.id === e.chat_room_id;

            if (!isViewingThisRoom) {
                setUnreadTotal((prev) => prev + 1);

                notifyIncomingChatMessage(e, {
                    isViewingThisRoom: false,
                    onOpenChat: () => {
                        setIsOpen(true);
                        setRooms((currentRooms) => {
                            const found = currentRooms.find((r) => r.id === e.chat_room_id);
                            if (found) {
                                setActiveRoom(found);
                            } else {
                                fetchRooms().then(() => {
                                    setActiveRoom({
                                        id: e.chat_room_id,
                                        store: {
                                            id: 0,
                                            name: e.sender_name || "Toko",
                                            slug: "",
                                            logo_path: e.sender_avatar
                                                ? e.sender_avatar.replace("/storage/", "")
                                                : undefined,
                                            is_online: true,
                                            last_seen: "Aktif",
                                        },
                                        unread_count: 0,
                                    });
                                });
                            }
                            return currentRooms;
                        });
                    },
                });
            }

            setRooms((prev) => {
                const roomIdx = prev.findIndex((r) => r.id === e.chat_room_id);
                if (roomIdx >= 0) {
                    const target = {
                        ...prev[roomIdx],
                        last_message: {
                            message:
                                e.message ||
                                (e.media_type === "video" ? "[Video]" : e.media_path ? "[Foto]" : ""),
                            created_at: "Baru saja",
                            sender_type: e.sender_type,
                        },
                        last_message_at: e.created_at,
                        unread_count:
                            activeRoom?.id === e.chat_room_id ? 0 : prev[roomIdx].unread_count + 1,
                    };
                    const others = prev.filter((_, idx) => idx !== roomIdx);
                    return [target, ...others];
                }
                return prev;
            });
        });

        return () => {
            userChannel.stopListening(".NewChatMessage");
        };
    }, [user?.id, isOpen, activeRoom?.id]);

    useEffect(() => {
        const handleOpenChatEvent = async (event: any) => {
            const { storeId, product } = event.detail || {};

            if (!user) {
                toast.error("Silakan login terlebih dahulu untuk mengobrol dengan penjual!");
                router.visit(route("login"));
                return;
            }

            if (!storeId) return;

            setIsOpen(true);
            if (product) {
                setPendingProduct(product);
            }

            try {
                const res = await axios.post("/chat/room", {
                    store_id: storeId,
                    product_id: product?.id || null,
                });

                if (res.data.room) {
                    const roomData = res.data.room;
                    const matchedRoom: BuyerChatRoomItem = {
                        id: roomData.id,
                        store: roomData.store,
                        unread_count: 0,
                    };

                    setActiveRoom(matchedRoom);

                    setRooms((prev) => {
                        if (!prev.some((r) => r.id === matchedRoom.id)) {
                            return [matchedRoom, ...prev];
                        }
                        return prev;
                    });
                }
            } catch (err: any) {
                if (err.response?.data?.message) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error("Gagal memulai obrolan dengan toko.");
                }
            }
        };

        window.addEventListener("open-storefront-chat", handleOpenChatEvent);
        return () => {
            window.removeEventListener("open-storefront-chat", handleOpenChatEvent);
        };
    }, [user]);

    const handleSendMessage = async (
        e?: React.FormEvent,
        mediaFile?: File | null,
        customText?: string
    ) => {
        if (e) e.preventDefault();
        const text = (customText !== undefined ? customText : inputMessage).trim();
        if ((!text && !pendingProduct && !mediaFile) || !activeRoom || isSending) return;

        setIsSending(true);
        const attachedProductId = pendingProduct ? pendingProduct.id : null;
        const msgToSend =
            text ||
            (pendingProduct && !mediaFile
                ? `Halo, saya tertarik dengan produk ${pendingProduct.name}`
                : "");

        setInputMessage("");
        setPendingProduct(null);

        const formData = new FormData();
        if (msgToSend) formData.append("message", msgToSend);
        if (attachedProductId) formData.append("product_id", String(attachedProductId));
        if (mediaFile) formData.append("media", mediaFile);

        try {
            const res = await axios.post(`/chat/rooms/${activeRoom.id}/send`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.status === "success" && res.data.message) {
                const newMsg = res.data.message;
                setMessages((prev) => {
                    if (prev.some((m) => Number(m.id) === Number(newMsg.id))) return prev;
                    return [...prev, newMsg];
                });

                setRooms((prev) =>
                    prev.map((r) => {
                        if (r.id === activeRoom.id) {
                            return {
                                ...r,
                                last_message: {
                                    message: newMsg.message || (newMsg.media_type === "video" ? "[Video]" : "[Foto]"),
                                    created_at: "Baru saja",
                                    sender_type: "user",
                                },
                                last_message_at: newMsg.created_at,
                            };
                        }
                        return r;
                    })
                );
            }
        } catch (err) {
            console.error("Gagal mengirim pesan:", err);
            setInputMessage(text);
            toast.error("Gagal mengirim pesan. Silakan coba lagi.");
        } finally {
            setIsSending(false);
        }
    };

    const toggleOpen = () => {
        if (!user && !isOpen) {
            toast.error("Silakan login untuk membuka obrolan dengan penjual.");
            router.visit(route("login"));
            return;
        }
        setIsOpen((prev) => !prev);
    };

    return (
        <>
            <div
                className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ease-out ${
                    isOpen
                        ? "opacity-0 scale-75 pointer-events-none translate-y-4"
                        : "opacity-100 scale-100 translate-y-0"
                }`}
            >
                <button
                    onClick={toggleOpen}
                    aria-label="Buka Live Chat Toko"
                    className="relative flex items-center justify-center gap-2 bg-gradient-to-r from-brand-orange to-brand-orange-dark text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer group"
                >
                    <MessageSquare className="w-5 h-5 transition-transform group-hover:rotate-6" />
                    <span className="text-xs font-bold tracking-wide pr-1">Chat Penjual</span>

                    {unreadTotal > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] px-1.5 items-center justify-center rounded-full bg-red-500 text-[11px] font-extrabold text-white shadow-md ring-2 ring-white animate-pulse">
                            {unreadTotal > 99 ? "99+" : unreadTotal}
                        </span>
                    )}
                </button>
            </div>

            <div
                className={`fixed z-50 bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300 ease-out origin-bottom-right inset-0 md:inset-auto md:bottom-22 md:right-6 md:w-96 md:h-[550px] md:rounded-3xl ${
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                        : "opacity-0 scale-95 translate-y-6 pointer-events-none invisible"
                }`}
            >
                {activeRoom ? (
                    <StorefrontChatActiveRoom
                        room={activeRoom}
                        messages={messages}
                        isLoading={isLoadingMessages}
                        isSending={isSending}
                        inputMessage={inputMessage}
                        pendingProduct={pendingProduct}
                        storeLiveStatus={storeLiveStatus}
                        onBack={() => {
                            setActiveRoom(null);
                            fetchRooms();
                        }}
                        onClose={() => setIsOpen(false)}
                        onInputChange={setInputMessage}
                        onSendMessage={handleSendMessage}
                        onDismissPendingProduct={() => setPendingProduct(null)}
                    />
                ) : (
                    <StorefrontChatRoomsList
                        rooms={rooms}
                        searchQuery={searchQuery}
                        isLoading={isLoadingRooms}
                        onSearchChange={setSearchQuery}
                        onSelectRoom={setActiveRoom}
                        onClose={() => setIsOpen(false)}
                    />
                )}
            </div>
        </>
    );
}
