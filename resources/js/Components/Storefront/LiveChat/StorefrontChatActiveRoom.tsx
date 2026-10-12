import React, { useRef, useEffect, useState } from "react";
import { BuyerChatRoomItem, ChatMessageItem, ProductAttachment } from "@/types/chat";
import ChatProductCard from "./ChatProductCard";
import {
    ChevronLeft,
    Store as StoreIcon,
    ExternalLink,
    X,
    ShoppingBag,
    Loader2,
    MessageSquare,
    Check,
    CheckCheck,
    Send,
    Paperclip,
    FileVideo,
    Maximize2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Props {
    room: BuyerChatRoomItem;
    messages: ChatMessageItem[];
    isLoading: boolean;
    isSending: boolean;
    inputMessage: string;
    pendingProduct: ProductAttachment | null;
    storeLiveStatus: { is_online: boolean; last_seen: string } | null;
    onBack: () => void;
    onClose: () => void;
    onInputChange: (val: string) => void;
    onSendMessage: (e?: React.FormEvent, mediaFile?: File | null, customText?: string) => void;
    onDismissPendingProduct: () => void;
}

export default function StorefrontChatActiveRoom({
    room,
    messages,
    isLoading,
    isSending,
    inputMessage,
    pendingProduct,
    storeLiveStatus,
    onBack,
    onClose,
    onInputChange,
    onSendMessage,
    onDismissPendingProduct,
}: Props) {
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<"image" | "video" | null>(null);
    const [activeLightboxMedia, setActiveLightboxMedia] = useState<string | null>(null);

    const isStoreOnline = storeLiveStatus ? storeLiveStatus.is_online : room.store?.is_online;
    const storeLastSeen = storeLiveStatus ? storeLiveStatus.last_seen : room.store?.last_seen;

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

    const handleQuickInquiry = (text: string) => {
        onSendMessage(undefined, selectedFile, text);
        handleDismissFile();
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="px-4 py-3.5 bg-brand-orange text-white flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                    <button
                        onClick={onBack}
                        className="p-1 -ml-1 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                        aria-label="Kembali ke daftar toko"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border border-white/40">
                            {room.store?.logo_path ? (
                                <img
                                    src={`/storage/${room.store.logo_path}`}
                                    alt={room.store.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <StoreIcon className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <span
                            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-brand-orange ${
                                isStoreOnline ? "bg-emerald-400 animate-pulse" : "bg-gray-300"
                            }`}
                        />
                    </div>

                    <div className="min-w-0">
                        <h3 className="text-xs font-bold truncate leading-tight">
                            {room.store?.name}
                        </h3>
                        <p className="text-[10px] text-white/85 flex items-center gap-1">
                            {isStoreOnline ? (
                                <span className="font-semibold text-emerald-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                                    Online
                                </span>
                            ) : (
                                <span>{storeLastSeen || "Tidak aktif"}</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {room.store?.slug && (
                        <a
                            href={`/store/${room.store.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition"
                            title="Kunjungi Toko"
                            aria-label="Kunjungi Toko"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
                        aria-label="Tutup Obrolan"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Shopee-style: Kamu Menanyakan Produk Ini */}
            {pendingProduct && (
                <div className="p-3 bg-orange-50/95 border-b border-orange-200/80 flex flex-col gap-2 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-brand-orange" />
                            Kamu menanyakan produk ini
                        </span>
                        <button
                            type="button"
                            onClick={onDismissPendingProduct}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer transition"
                            aria-label="Batal lampirkan produk"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-orange-100 shadow-xs">
                        <div className="w-11 h-11 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                            {pendingProduct.image_path ? (
                                <img
                                    src={pendingProduct.image_path}
                                    alt={pendingProduct.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <ShoppingBag className="w-5 h-5 m-auto text-brand-orange" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                                {pendingProduct.name}
                            </p>
                            <p className="text-xs font-bold text-brand-orange mt-0.5">
                                Rp {Number(pendingProduct.price).toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
                        <button
                            type="button"
                            onClick={() => handleQuickInquiry("Halo kak, apakah produk ini masih tersedia?")}
                            disabled={isSending}
                            className="px-2.5 py-1 text-[11px] bg-brand-orange text-white rounded-full font-semibold hover:bg-brand-orange-dark transition whitespace-nowrap cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            Tanya Stok
                        </button>
                        <button
                            type="button"
                            onClick={() => handleQuickInquiry("Bisa dikirim hari ini kak?")}
                            disabled={isSending}
                            className="px-2.5 py-1 text-[11px] bg-white text-gray-700 border border-gray-200 rounded-full font-medium hover:bg-gray-50 transition whitespace-nowrap cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            Bisa kirim hari ini?
                        </button>
                    </div>
                </div>
            )}

            {/* Chat Messages */}
            <div ref={messagesContainerRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mb-1 text-brand-orange" />
                        <p className="text-[11px]">Memuat percakapan...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-4">
                        <MessageSquare className="w-8 h-8 mb-2 text-gray-300" />
                        <p className="text-xs font-semibold text-gray-700">
                            Mulai percakapan dengan penjual
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                            Tanyakan ketersediaan produk, waktu pengiriman, atau kirim foto/video.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isBuyer = msg.sender_type === "user";

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${
                                    isBuyer ? "items-end" : "items-start"
                                }`}
                            >
                                {msg.product && <ChatProductCard product={msg.product} />}

                                <div
                                    className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed shadow-xs ${
                                        isBuyer
                                            ? "bg-brand-orange text-white rounded-br-xs"
                                            : "bg-white text-gray-800 border border-gray-200/70 rounded-bl-xs"
                                    }`}
                                >
                                    {msg.media_path && (
                                        <div className="mb-1.5 overflow-hidden rounded-xl">
                                            {msg.media_type === "video" ? (
                                                <video
                                                    src={msg.media_path}
                                                    controls
                                                    className="max-w-[240px] max-h-56 rounded-xl bg-black"
                                                />
                                            ) : (
                                                <div className="relative group cursor-pointer">
                                                    <img
                                                        src={msg.media_path}
                                                        alt="Lampiran chat"
                                                        className="max-w-[240px] max-h-56 object-cover rounded-xl transition group-hover:opacity-95"
                                                        onClick={() => setActiveLightboxMedia(msg.media_path || null)}
                                                    />
                                                    <span className="absolute bottom-1.5 right-1.5 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition">
                                                        <Maximize2 className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.message && (
                                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                                    )}

                                    <div
                                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                            isBuyer ? "text-orange-100" : "text-gray-400"
                                        }`}
                                    >
                                        <span>{msg.formatted_time}</span>
                                        {isBuyer && (
                                            <span>
                                                {msg.is_read ? (
                                                    <CheckCheck className="w-3 h-3 text-orange-200" />
                                                ) : (
                                                    <Check className="w-3 h-3 text-orange-200" />
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
                <div className="px-3.5 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-2 shrink-0 animate-in fade-in duration-150">
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
                className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5 shrink-0"
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
                    placeholder="Tulis pesan ke toko..."
                    value={inputMessage}
                    onChange={(e) => onInputChange(e.target.value)}
                    disabled={isSending}
                    className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:bg-white focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition disabled:opacity-50"
                />

                <button
                    type="submit"
                    disabled={(!inputMessage.trim() && !pendingProduct && !selectedFile) || isSending}
                    className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center hover:bg-brand-orange-dark transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer shadow-xs"
                    aria-label="Kirim Pesan"
                >
                    {isSending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Send className="w-3.5 h-3.5" />
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
        </div>
    );
}
