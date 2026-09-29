import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    Bell,
    ShoppingBag,
    CreditCard,
    Truck,
    Star,
    AlertTriangle,
    Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

interface NotificationTabProps {
    initialSettings?: Record<string, boolean>;
}

export default function NotificationTab({
    initialSettings = {},
}: NotificationTabProps) {
    const [notifState, setNotifState] = useState({
        pesanan_baru: initialSettings?.pesanan_baru ?? true,
        pembayaran_berhasil: initialSettings?.pembayaran_berhasil ?? true,
        pengiriman_pesanan: initialSettings?.pengiriman_pesanan ?? true,
        ulasan_baru: initialSettings?.ulasan_baru ?? true,
        stok_menipis: initialSettings?.stok_menipis ?? true,
        penarikan_saldo: initialSettings?.penarikan_saldo ?? true,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleToggleNotification = (key: keyof typeof notifState) => {
        const nextValue = !notifState[key];
        const nextState = { ...notifState, [key]: nextValue };
        setNotifState(nextState);
        setIsSaving(true);

        router.put(
            route("merchant.settings.notifications.update"),
            nextState,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success("Preferensi notifikasi berhasil disimpan.");
                    setIsSaving(false);
                },
                onError: () => {
                    toast.error("Gagal menyimpan preferensi notifikasi.");
                    setNotifState(notifState);
                    setIsSaving(false);
                },
            }
        );
    };

    const notificationItems = [
        {
            key: "pesanan_baru" as const,
            title: "Pesanan Baru Masuk",
            description:
                "Pemberitahuan seketika saat pembeli membuat pesanan baru di toko Anda.",
            icon: ShoppingBag,
        },
        {
            key: "pembayaran_berhasil" as const,
            title: "Pembayaran Lunas & Terverifikasi",
            description:
                "Pemberitahuan saat transaksi pembayaran pesanan telah terverifikasi lunas oleh sistem.",
            icon: CreditCard,
        },
        {
            key: "pengiriman_pesanan" as const,
            title: "Penyerahan & Pengiriman Kurir",
            description:
                "Pengingat penyerahan paket pesanan ke Kurir Toko dan update status pengantaran.",
            icon: Truck,
        },
        {
            key: "ulasan_baru" as const,
            title: "Penilaian & Ulasan Produk",
            description:
                "Pemberitahuan saat pembeli memberikan rating bintang atau ulasan baru pada produk Anda.",
            icon: Star,
        },
        {
            key: "stok_menipis" as const,
            title: "Peringatan Stok Menipis",
            description:
                "Peringatan otomatis saat stok produk tersisa kritis (≤ 5 item) agar Anda dapat segera restok.",
            icon: AlertTriangle,
        },
        {
            key: "penarikan_saldo" as const,
            title: "Pencairan Saldo & Rekening",
            description:
                "Update status saat pengajuan penarikan dana toko diproses atau berhasil ditransfer ke rekening bank Anda.",
            icon: Wallet,
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint text-brand-orange flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">
                            Preferensi Notifikasi Toko
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Atur pemberitahuan real-time yang ingin Anda terima untuk operasional toko.
                        </p>
                    </div>
                </div>
                {isSaving && (
                    <span className="text-xs text-brand-orange font-bold animate-pulse">
                        Menyimpan...
                    </span>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {notificationItems.map((item) => {
                    const ItemIcon = item.icon;
                    const isChecked = notifState[item.key];

                    return (
                        <div
                            key={item.key}
                            className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-3.5 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-700 shrink-0 mt-0.5">
                                    <ItemIcon className="w-4 h-4 text-brand-orange" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug">
                                        {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                        handleToggleNotification(item.key)
                                    }
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                            </label>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
