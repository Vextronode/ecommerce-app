import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { Bell, CreditCard, CheckCircle, Package, Truck, Award, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface NotificationSettingsProps {
    settings: Record<string, boolean>;
}

interface NotificationItem {
    key: "menunggu_pembayaran" | "menunggu_konfirmasi" | "pesanan_diproses" | "pesanan_dikirim" | "pesanan_selesai" | "pengingat";
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

export default function NotificationSettings({
    settings,
}: NotificationSettingsProps) {
    const [data, setData] = useState({
        menunggu_pembayaran: settings?.menunggu_pembayaran ?? true,
        menunggu_konfirmasi: settings?.menunggu_konfirmasi ?? true,
        pesanan_diproses: settings?.pesanan_diproses ?? true,
        pesanan_dikirim: settings?.pesanan_dikirim ?? true,
        pesanan_selesai: settings?.pesanan_selesai ?? true,
        pengingat: settings?.pengingat ?? true,
    });

    const notificationItems: NotificationItem[] = [
        {
            key: "menunggu_pembayaran",
            title: "Menunggu Pembayaran",
            description: "Pemberitahuan saat pesanan dibuat dan menunggu pembayaran Anda.",
            icon: CreditCard,
        },
        {
            key: "menunggu_konfirmasi",
            title: "Menunggu Konfirmasi Penjual",
            description: "Pemberitahuan saat penjual menerima dan memverifikasi pesanan Anda.",
            icon: CheckCircle,
        },
        {
            key: "pesanan_diproses",
            title: "Pesanan Diproses",
            description: "Pemberitahuan saat barang sedang disiapkan dan dikemas oleh toko.",
            icon: Package,
        },
        {
            key: "pesanan_dikirim",
            title: "Pesanan Dikirim / Kurir OTW",
            description: "Pemberitahuan saat kurir sedang mengantar pesanan ke alamat Anda.",
            icon: Truck,
        },
        {
            key: "pesanan_selesai",
            title: "Pesanan Selesai",
            description: "Pemberitahuan saat barang telah sampai dan siap untuk diberi penilaian.",
            icon: Award,
        },
        {
            key: "pengingat",
            title: "Pengingat & Promo Spesial",
            description: "Pengingat batas waktu bayar serta info diskon menarik dari UMKM Cibenda.",
            icon: Clock,
        },
    ];

    const handleToggle = (key: keyof typeof data) => {
        const newValue = !data[key];
        const updated = { ...data, [key]: newValue };
        setData(updated);

        router.put(
            route("profile.notifications.update"),
            updated,
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success("Preferensi notifikasi disimpan.");
                },
                onError: () => {
                    toast.error("Gagal menyimpan preferensi notifikasi.");
                },
            }
        );
    };

    return (
        <section>
            <div className="pb-4 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#ED7218]" />
                    <h3 className="text-base md:text-lg font-bold text-gray-900">
                        Pengaturan Notifikasi
                    </h3>
                </div>
                <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Pilih jenis pemberitahuan pesanan yang ingin Anda terima secara real-time.
                </p>
            </div>

            <div className="divide-y divide-slate-100">
                {notificationItems.map((item) => {
                    const Icon = item.icon;
                    const isChecked = data[item.key];

                    return (
                        <div
                            key={item.key}
                            className="py-3.5 flex items-center justify-between gap-4 transition hover:bg-slate-50/50 rounded-xl px-2.5"
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#ED7218] flex items-center justify-center shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs md:text-sm font-bold text-gray-900">
                                        {item.title}
                                    </h4>
                                    <p className="text-[11px] md:text-xs text-slate-500 mt-0.5 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            <button
                                aria-label={`Toggle ${item.title}`}
                                type="button"
                                role="switch"
                                aria-checked={isChecked}
                                onClick={() => handleToggle(item.key)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                    isChecked ? "bg-[#ED7218]" : "bg-slate-200"
                                }`}
                            >
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                        isChecked ? "translate-x-5" : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
