import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import {
    Sliders,
    Coins,
    ToggleLeft,
    Save,
    AlertTriangle,
    CreditCard,
    MessageSquare,
    RefreshCw,
    Wallet,
    Truck,
    Percent,
    CheckCircle2,
    Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface SettingItem {
    id: number;
    key: string;
    value: any;
    type: string;
    group: string;
    label: string;
    description: string | null;
}

interface Props {
    settings: SettingItem[];
}

export default function SettingsIndex({ settings }: Props) {
    const [activeTab, setActiveTab] = useState<"finance" | "features">("finance");
    const [isSaving, setIsSaving] = useState(false);

    // Initial state map
    const [formData, setFormData] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        settings.forEach((s) => {
            initial[s.key] = s.value;
        });
        return initial;
    });

    const updateValue = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const payload = {
            settings: Object.entries(formData).map(([key, value]) => ({
                key,
                value,
            })),
        };

        router.put(route("admin.settings.update"), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSaving(false);
                toast.success("Pengaturan platform berhasil disimpan!");
            },
            onError: (errs) => {
                setIsSaving(false);
                const firstErr = Object.values(errs)[0];
                toast.error(typeof firstErr === "string" ? firstErr : "Gagal menyimpan pengaturan.");
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Platform - Admin Portal" />

            <div className="space-y-6">
                {/* Page Title & Save Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-brand-orange/20 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange-tint border border-brand-orange/30 flex items-center justify-center text-brand-orange">
                            <Sliders className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                                Pengaturan Platform
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                Kendali tarif pajak, biaya layanan, serta saklar fitur darurat (kill switch).
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md transition cursor-pointer ${
                            isSaving
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-brand-orange hover:bg-brand-orange-hover shadow-brand-orange/20 active:scale-[0.98]"
                        }`}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Menyimpan...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>Simpan Perubahan</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("finance")}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                            activeTab === "finance"
                                ? "bg-brand-orange text-white shadow-sm"
                                : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        <Coins className="w-4 h-4" />
                        <span>Pajak & Biaya Layanan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("features")}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition cursor-pointer ${
                            activeTab === "features"
                                ? "bg-brand-orange text-white shadow-sm"
                                : "bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200"
                        }`}
                    >
                        <ToggleLeft className="w-4 h-4" />
                        <span>Saklar Fitur (Kill Switches)</span>
                    </button>
                </div>

                {/* Tab 1: Finance (Pajak & Biaya Layanan) */}
                {activeTab === "finance" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pajak PPN Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange">
                                        <Percent className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">
                                            Pajak Pertambahan Nilai (PPN)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Status operasional pemungutan pajak platform.
                                        </p>
                                    </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_tax"])}
                                    onClick={() => updateValue("enable_tax", !formData["enable_tax"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_tax"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_tax"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-3">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Persentase Pajak (%)
                                </label>
                                <div className="relative rounded-2xl shadow-xs">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        disabled={!formData["enable_tax"]}
                                        value={formData["tax_percentage"] ?? 0}
                                        onChange={(e) => updateValue("tax_percentage", parseFloat(e.target.value) || 0)}
                                        className={`block w-full rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                                            formData["enable_tax"]
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                                                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                        }`}
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-500 font-bold text-sm">
                                        %
                                    </div>
                                </div>

                                {formData["enable_tax"] ? (
                                    <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
                                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                        <span>
                                            <strong>Peringatan Regulasi:</strong> Pajak atas barang adalah kewajiban pedagang berstatus PKP (sudah termasuk dalam harga produk). Jangan aktifkan penambahan pajak pada checkout pembeli tanpa dasar surat penunjukan DJP.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
                                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                                        <span>
                                            Sesuai Business Workflow Pajak, platform beroperasi di <strong>Mode 0</strong> (tanpa pungutan pajak ke pembeli) selama belum ada surat pengukuhan PKP atau penunjukan resmi DJP.
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Biaya Layanan Platform Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-gray-900">
                                            Biaya Layanan Platform (Admin Fee)
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            Biaya tetap (flat) per transaksi untuk kas operasional Pemerintah Desa Cibenda.
                                        </p>
                                    </div>
                                </div>

                                {/* Toggle Switch */}
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_service_fee"])}
                                    onClick={() => updateValue("enable_service_fee", !formData["enable_service_fee"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_service_fee"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_service_fee"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    Nominal Biaya Layanan (Rp)
                                </label>
                                <div className="relative rounded-2xl shadow-xs">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-bold text-sm">
                                        Rp
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="500"
                                        disabled={!formData["enable_service_fee"]}
                                        value={formData["service_fee_amount"] ?? 0}
                                        onChange={(e) => updateValue("service_fee_amount", parseInt(e.target.value, 10) || 0)}
                                        className={`block w-full rounded-2xl border pl-12 pr-4 py-3 text-sm font-semibold transition ${
                                            formData["enable_service_fee"]
                                                ? "border-gray-300 bg-white text-gray-900 focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
                                                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                        }`}
                                    />
                                </div>
                                <p className="text-xs text-gray-400">
                                    Biaya ini hanya dibebankan 1 kali per transaksi checkout (tidak berlipat jika order multi-toko).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab 2: Feature Flags / Kill Switches */}
                {activeTab === "features" && (
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
                        <div className="border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Saklar Fitur Platform (Kill Switches)
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Nonaktifkan fitur tertentu secara instan jika terjadi gangguan operasional atau masa pemeliharaan sistem.
                            </p>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {/* Killswitch 1: Pembayaran Online (Midtrans) */}
                            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 mt-1">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                                Pembayaran Online (Virtual Payment Gateway)
                                            </h3>
                                            {!formData["enable_online_payment"] && (
                                                <span className="text-[10px] bg-status-warning-tint text-status-warning-dark border border-status-warning/30 font-bold px-2 py-0.5 rounded-full">
                                                    Mode Darurat COD Only
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                                            Jika dimatikan, halaman checkout pembeli otomatis mengunci pilihan ke <strong>Hanya Bayar di Tempat (COD)</strong> dan menolak transaksi online. Sangat berguna saat mitra pedagang belum siap online atau akun payment gateway sedang diverifikasi.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_online_payment"])}
                                    onClick={() => updateValue("enable_online_payment", !formData["enable_online_payment"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_online_payment"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_online_payment"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Killswitch 2: Tawar Menawar Chat */}
                            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 mt-1">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            Fitur Tawar-Menawar Harga (Chat Negotiation)
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                                            Mengizinkan pembeli dan pedagang melakukan tawar-menawar harga produk langsung melalui ruang obrolan toko.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_negotiation"])}
                                    onClick={() => updateValue("enable_negotiation", !formData["enable_negotiation"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_negotiation"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_negotiation"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Killswitch 3: Sinkronisasi SIDUTama */}
                            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 mt-1">
                                        <RefreshCw className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            Sinkronisasi Background SIDUTama Desa
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                                            Menjalankan sinkronisasi berkala data Surat Keterangan Usaha (SKU) dan status permohonan pedagang dengan server Desa Cibenda.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_sid_sync"])}
                                    onClick={() => updateValue("enable_sid_sync", !formData["enable_sid_sync"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_sid_sync"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_sid_sync"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Killswitch 4: Pencairan Saldo Pedagang */}
                            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 mt-1">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            Pencairan Saldo Pedagang (Withdrawal)
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                                            Matikan sementara bila terdapat rekonsiliasi kas bank atau libur operasional perbankan agar pedagang tidak mengajukan penarikan dana terlebih dahulu.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_withdrawal"])}
                                    onClick={() => updateValue("enable_withdrawal", !formData["enable_withdrawal"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_withdrawal"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_withdrawal"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Killswitch 5: Pengiriman Kurir Lokal */}
                            <div className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange-tint border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 mt-1">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm sm:text-base">
                                            Pengiriman Kurir Lokal
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                                            Nonaktifkan jika cuaca ekstrem/badai di pesisir Pangandaran sehingga opsi pengiriman terkunci hanya pada Ambil Mandiri ke Toko (Pick-up).
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={Boolean(formData["enable_local_delivery"])}
                                    onClick={() => updateValue("enable_local_delivery", !formData["enable_local_delivery"])}
                                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                        formData["enable_local_delivery"] ? "bg-brand-orange" : "bg-gray-200"
                                    }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                            formData["enable_local_delivery"] ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
