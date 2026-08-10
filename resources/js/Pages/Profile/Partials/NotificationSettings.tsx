import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";

interface NotificationSettingsProps {
    settings: Record<string, boolean>;
}

const ToggleSwitch = ({
    label,
    isChecked,
    onClick,
}: {
    label: string;
    isChecked: boolean;
    onClick: () => void;
}) => (
    <div className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <button
            aria-label={label}
            type="button"
            role="switch"
            aria-checked={isChecked}
            onClick={onClick}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isChecked ? "bg-[#245D56]" : "bg-slate-200"
            }`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isChecked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    </div>
);

export default function NotificationSettings({
    settings,
}: NotificationSettingsProps) {
    // default state kalo di database masih kosong
    const [data, setData] = useState({
        menunggu_pembayaran: settings?.menunggu_pembayaran ?? true,
        menunggu_konfirmasi: settings?.menunggu_konfirmasi ?? true,
        pesanan_diproses: settings?.pesanan_diproses ?? true,
        pesanan_dikirim: settings?.pesanan_dikirim ?? true,
        pesanan_selesai: settings?.pesanan_selesai ?? true,
        pengingat: settings?.pengingat ?? true,
    });

    // fungsi atuosave pas toggle diklik
    const handleToggle = (key: keyof typeof data) => {
        const newValue = !data[key];
        setData((prev) => ({ ...prev, [key]: newValue }));

        router.put(
            route("profile.notifications.update"),
            {
                ...data,
                [key]: newValue,
            },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 w-full">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                    Notifikasi
                </h2>
                <p className="text-sm text-slate-500">
                    Atur notifikasi yang ingin di terima disini
                </p>
            </div>

            {/* dropdown dummy buat notifikasi */}
            <div className="mb-6">
                <button className="flex items-center justify-between w-full max-w-50 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-gray-800 hover:bg-slate-50 transition">
                    Notifikasi Email
                    <div className="bg-slate-100 p-1 rounded-full text-slate-400">
                        <ChevronDown className="w-3 h-3" />
                    </div>
                </button>
            </div>

            {/* List Toggle Notifikasi */}
            <div className="flex flex-col">
                <ToggleSwitch
                    label="Menunggu Pembayaran"
                    isChecked={data.menunggu_pembayaran}
                    onClick={() => handleToggle("menunggu_pembayaran")}
                />
                <ToggleSwitch
                    label="Menunggu Konfirmasi"
                    isChecked={data.menunggu_konfirmasi}
                    onClick={() => handleToggle("menunggu_konfirmasi")}
                />
                <ToggleSwitch
                    label="Pesanan Di proses"
                    isChecked={data.pesanan_diproses}
                    onClick={() => handleToggle("pesanan_diproses")}
                />
                <ToggleSwitch
                    label="Pesanan Di kirim"
                    isChecked={data.pesanan_dikirim}
                    onClick={() => handleToggle("pesanan_dikirim")}
                />
                <ToggleSwitch
                    label="Pesanan Selesai"
                    isChecked={data.pesanan_selesai}
                    onClick={() => handleToggle("pesanan_selesai")}
                />
                <ToggleSwitch
                    label="Pengingat"
                    isChecked={data.pengingat}
                    onClick={() => handleToggle("pengingat")}
                />
            </div>
        </section>
    );
}
