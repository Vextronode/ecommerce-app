import React, { useState, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import MerchantLayout from "@/Layouts/MerchantLayout";
import echoInstance from "@/echo";
import axios from "axios";
import { MerchantChatRoomItem, ChatMessageItem } from "@/types/chat";
import { notifyIncomingChatMessage } from "@/utils/soundAndNotification";
import MerchantChatSidebar from "@/Components/Merchant/Chat/MerchantChatSidebar";
import MerchantChatActiveRoom from "@/Components/Merchant/Chat/MerchantChatActiveRoom";
import MerchantChatEmptyState from "@/Components/Merchant/Chat/MerchantChatEmptyState";

interface Props {
    initialRooms: MerchantChatRoomItem[];
    initialRoomId?: number | null;
}

export default function MerchantChatIndex({ initialRooms, initialRoomId }: Props) {
    const { merchant_store } = usePage().props as any;
    const [rooms, setRooms] = useState<MerchantChatRoomItem[]>(initialRooms || []);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(() => {
        if (initialRoomId) return initialRoomId;
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            return null;
        }
        return initialRooms && initialRooms.length > 0 ? initialRooms[0].id : null;
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [messages, setMessages] = useState<ChatMessageItem[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [customerStatus, setCustomerStatus] = useState<{ is_online: boolean; last_seen: string }>({
        is_online: false,
        last_seen: "Tidak aktif",
    });

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

    useEffect(() => {
        if (!selectedRoomId) {
            setMessages([]);
            return;
        }

        let isMounted = true;
        setIsLoadingMessages(true);

        axios
            .get(`/pedagang/chat/${selectedRoomId}/messages`)
            .then((res) => {
                if (isMounted) {
                    setMessages(res.data.messages || []);
                    if (res.data.customer_status) {
                        setCustomerStatus(res.data.customer_status);
                    }
                    setRooms((prev) => {
                        const nextRooms = prev.map((r) =>
                            r.id === selectedRoomId ? { ...r, unread_count: 0 } : r
                        );
                        const total = nextRooms.reduce(
                            (sum, r) => sum + (r.unread_count || 0),
                            0
                        );
                        window.dispatchEvent(
                            new CustomEvent("update-unread-chat-count", {
                                detail:
                                    typeof res.data.unread_total === "number"
                                        ? res.data.unread_total
                                        : total,
                            })
                        );
                        return nextRooms;
                    });
                }
            })
            .catch((err) => {
                console.error("Gagal memuat pesan chat:", err);
            })
            .finally(() => {
                if (isMounted) setIsLoadingMessages(false);
            });

        return () => {
            isMounted = false;
        };
    }, [selectedRoomId]);

    useEffect(() => {
        if (!selectedRoomId || typeof window === "undefined") return;

        const channel = echoInstance.private(`chat.room.${selectedRoomId}`);

        channel.listen(".NewChatMessage", (e: ChatMessageItem) => {
            setMessages((prev) => {
                if (prev.some((m) => Number(m.id) === Number(e.id))) return prev;
                return [...prev, e];
            });

            if (e.sender_type === "user") {
                notifyIncomingChatMessage(e, {
                    isViewingThisRoom: true,
                });

                axios
                    .post(`/pedagang/chat/${selectedRoomId}/read`)
                    .then((res) => {
                        if (typeof res.data.unread_total === "number") {
                            window.dispatchEvent(
                                new CustomEvent("update-unread-chat-count", {
                                    detail: res.data.unread_total,
                                })
                            );
                        }
                    })
                    .catch(() => {});
            }

            setRooms((prev) =>
                prev.map((r) => {
                    if (r.id === selectedRoomId) {
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
    }, [selectedRoomId]);

    useEffect(() => {
        if (!merchant_store?.id || typeof window === "undefined") return;

        const storeChannel = echoInstance.private(`store-chats.${merchant_store.id}`);

        storeChannel.listen(".NewChatMessage", (e: ChatMessageItem) => {
            setRooms((prev) => {
                const roomIndex = prev.findIndex((r) => r.id === e.chat_room_id);
                if (roomIndex >= 0) {
                    const isCurrent = e.chat_room_id === selectedRoomId;

                    if (!isCurrent) {
                        notifyIncomingChatMessage(e, {
                            isViewingThisRoom: false,
                            onOpenChat: () => {
                                setSelectedRoomId(e.chat_room_id);
                            },
                        });
                    }

                    const updatedRoom = {
                        ...prev[roomIndex],
                        last_message: {
                            message:
                                e.message ||
                                (e.media_type === "video" ? "[Video]" : e.media_path ? "[Foto]" : ""),
                            created_at: "Baru saja",
                            sender_type: e.sender_type,
                        },
                        last_message_at: e.created_at,
                        unread_count: isCurrent ? 0 : prev[roomIndex].unread_count + 1,
                    };
                    const remaining = prev.filter((_, idx) => idx !== roomIndex);
                    const nextRooms = [updatedRoom, ...remaining];
                    const total = nextRooms.reduce(
                        (sum, r) => sum + (r.unread_count || 0),
                        0
                    );
                    window.dispatchEvent(
                        new CustomEvent("update-unread-chat-count", {
                            detail: total,
                        })
                    );
                    return nextRooms;
                }
                return prev;
            });
        });

        return () => {
            storeChannel.stopListening(".NewChatMessage");
        };
    }, [merchant_store?.id, selectedRoomId]);

    const handleSendMessage = async (e?: React.FormEvent, mediaFile?: File | null) => {
        if (e) e.preventDefault();
        const text = inputMessage.trim();
        if ((!text && !mediaFile) || !selectedRoomId || isSending) return;

        setIsSending(true);
        setInputMessage("");

        const formData = new FormData();
        if (text) formData.append("message", text);
        if (mediaFile) formData.append("media", mediaFile);

        try {
            const res = await axios.post(`/pedagang/chat/${selectedRoomId}/send`, formData, {
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
                        if (r.id === selectedRoomId) {
                            return {
                                ...r,
                                last_message: {
                                    message: newMsg.message || (newMsg.media_type === "video" ? "[Video]" : "[Foto]"),
                                    created_at: "Baru saja",
                                    sender_type: "merchant",
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
        } finally {
            setIsSending(false);
        }
    };

    return (
        <MerchantLayout>
            <Head title="Chat Pelanggan - Pedagang Cibenda" />

            <div className="flex flex-col h-[calc(100dvh-8rem)] md:h-[calc(100vh-11.5rem)] min-h-[460px] bg-white rounded-2xl md:rounded-3xl border border-brand-orange/30 overflow-hidden shadow-sm">
                <div className="flex flex-1 h-full overflow-hidden">
                    <MerchantChatSidebar
                        rooms={rooms}
                        selectedRoomId={selectedRoomId}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSelectRoom={setSelectedRoomId}
                    />

                    {selectedRoom ? (
                        <MerchantChatActiveRoom
                            room={selectedRoom}
                            messages={messages}
                            isLoading={isLoadingMessages}
                            isSending={isSending}
                            inputMessage={inputMessage}
                            customerStatus={customerStatus}
                            onBack={() => setSelectedRoomId(null)}
                            onInputChange={setInputMessage}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        <MerchantChatEmptyState />
                    )}
                </div>
            </div>
        </MerchantLayout>
    );
}
