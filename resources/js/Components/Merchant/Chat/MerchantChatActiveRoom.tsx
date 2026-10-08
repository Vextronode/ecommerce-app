import React, { useRef, useEffect, useState } from "react";
import { MerchantChatRoomItem, ChatMessageItem } from "@/types/chat";
import ChatProductCard from "@/Components/Storefront/LiveChat/ChatProductCard";
import {
    User,
    Check,
    CheckCheck,
    Send,
    Loader2,
    MessageSquare,
    ChevronLeft,
    Paperclip,
    FileVideo,
    X,
    Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    room: MerchantChatRoomItem;
    messages: ChatMessageItem[];
    isLoading: boolean;
    isSending: boolean;
    inputMessage: string;
    customerStatus: { is_online: boolean; last_seen: string };
    onBack: () => void;
    onInputChange: (val: string) => void;
    onSendMessage: (e?: React.FormEvent, mediaFile?: File | null) => void;
}

export default function MerchantChatActiveRoom({
    room,
    messages,
    isLoading,
    isSending,
    inputMessage,
    customerStatus,
    onBack,
    onInputChange,
    onSendMessage,
}: Props) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<"image" | "video" | null>(null);
    const [activeLightboxMedia, setActiveLightboxMedia] = useState<string | null>(null);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages.length]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [room.id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 20MB.");
            return;
        }

        const isVideo = file.type.startsWith("video/");
        setFileType(isVideo ? "video" : "image");
        setSelectedFile(file);
        setFilePreview(URL.createObjectURL(file));
    };

    const handleDismissFile = () => {
        if (filePreview) URL.revokeObjectURL(filePreview);
        setSelectedFile(null);
        setFilePreview(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        onSendMessage(e, selectedFile);
        handleDismissFile();
    };

    return (
        <section className="flex-1 min-w-0 min-h-0 h-full flex flex-col bg-white overflow-hidden relative">
            {/* Header */}
            <div className="h-16 px-4 md:px-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        onClick={onBack}
                        className="text-gray-400 hover:text-brand-orange hover:bg-orange-50 p-1.5 rounded-full transition cursor-pointer shrink-0"
                        aria-label="Kembali ke daftar pesan"
                        title="Keluar dari obrolan / kembali ke daftar"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center overflow-hidden border border-brand-orange/20">
                            {room.customer.profile_photo_path ? (
                                <img
                                    src={`/storage/${room.customer.profile_photo_path}`}
                                    alt={room.customer.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-brand-orange" />
                            )}
                        </div>
                        <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                                customerStatus.is_online
                                    ? "bg-emerald-500 animate-pulse"
                                    : "bg-gray-300"
                            }`}
                        />
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 truncate">
                            {room.customer.name}
                        </h2>
                        <p className="text-[11px] flex items-center gap-1.5 text-gray-500">
                            {customerStatus.is_online ? (
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Sedang Aktif
                                </span>
                            ) : (
                                <span>{customerStatus.last_seen}</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Body */}
            <div ref={messagesContainerRef} className="flex-1 min-h-0 p-4 md:p-6 overflow-y-auto space-y-3.5 bg-gray-50/40">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin mb-2 text-brand-orange" />
                        <p className="text-xs">Memuat riwayat percakapan...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-4">
                        <MessageSquare className="w-10 h-10 mb-2 text-gray-300" />
                        <p className="text-xs font-medium text-gray-600">
                            Mulai percakapan dengan {room.customer.name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1 max-w-xs">
                            Balas pertanyaan pembeli seputar ketersediaan produk, pengiriman, atau kirim foto/video.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMerchant = msg.sender_type === "merchant";

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${
                                    isMerchant ? "items-end" : "items-start"
                                }`}
                            >
                                {msg.product && <ChatProductCard product={msg.product} />}

                                <div
                                    className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                        isMerchant
                                            ? "bg-brand-orange text-white rounded-br-xs"
                                            : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                                    }`}
                                >
                                    {msg.media_path && (
                                        <div className="mb-2 overflow-hidden rounded-xl">
                                            {msg.media_type === "video" ? (
                                                <video
                                                    src={msg.media_path}
                                                    controls
                                                    className="max-w-[280px] max-h-60 rounded-xl bg-black"
                                                />
                                            ) : (
                                                <div className="relative group cursor-pointer">
                                                    <img
                                                        src={msg.media_path}
                                                        alt="Lampiran chat"
                                                        className="max-w-[280px] max-h-60 object-cover rounded-xl transition group-hover:opacity-95"
                                                        onClick={() => setActiveLightboxMedia(msg.media_path || null)}
                                                    />
                                                    <span className="absolute bottom-1.5 right-1.5 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition">
                                                        <Maximize2 className="w-3.5 h-3.5" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.message && (
                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    )}

                                    <div
                                        className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                            isMerchant ? "text-orange-100" : "text-gray-400"
                                        }`}
                                    >
                                        <span>{msg.formatted_time}</span>
                                        {isMerchant && (
                                            <span>
                                                {msg.is_read ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-orange-200" />
                                                ) : (
                                                    <Check className="w-3.5 h-3.5 text-orange-200" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Media Attachment Preview before sending */}
            {selectedFile && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center border border-gray-300">
                            {fileType === "video" ? (
                                <FileVideo className="w-5 h-5 text-gray-600" />
                            ) : (
                                <img
                                    src={filePreview || ""}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-gray-800 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap dikirim
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleDismissFile}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer transition"
                        aria-label="Batalkan lampiran"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input Bar */}
            <form
                onSubmit={handleSubmit}
                className="p-3 border-t border-gray-100 bg-white flex items-center gap-2"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSending}
                    className="p-2 text-gray-500 hover:text-brand-orange hover:bg-orange-50 rounded-full transition cursor-pointer shrink-0 disabled:opacity-40"
                    title="Kirim foto atau video"
                    aria-label="Lampirkan foto atau video"
                >
                    <Paperclip className="w-4 h-4" />
                </button>

                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ketik balasan pesan..."
                    value={inputMessage}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                    disabled={isSending}
                    className="flex-1 px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition disabled:opacity-50"
                />

                <button
                    type="submit"
                    disabled={(!inputMessage.trim() && !selectedFile) || isSending}
                    className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-brand-orange-dark transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 shadow-sm cursor-pointer"
                    aria-label="Kirim Pesan"
                >
                    {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </form>

            {/* Media Lightbox */}
            {activeLightboxMedia && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setActiveLightboxMedia(null)}
                >
                    <button
                        type="button"
                        onClick={() => setActiveLightboxMedia(null)}
                        className="absolute top-4 right-4 p-2 text-white/80 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition cursor-pointer"
                        aria-label="Tutup pratinjau"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <img
                        src={activeLightboxMedia}
                        alt="Pratinjau media"
                        className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </section>
    );
}
