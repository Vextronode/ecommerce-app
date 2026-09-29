import React, { useState } from "react";
import { 
    MessageCircle, 
    Mail, 
    MapPin, 
    Clock, 
    Send, 
    ChevronDown, 
    HelpCircle 
} from "lucide-react";
import toast from "react-hot-toast";

const faqs = [
    {
        q: "Bagaimana cara pengemasan produk laut agar tidak busuk di perjalanan?",
        a: "Produk basah dan ikan segar dikemas menggunakan kotak insulasi termal khusus (styrofoam/insulasi bersegel) yang diisi es gel beku. Ikan dibersihkan dan disiapkan langsung setelah nelayan bersandar.",
    },
    {
        q: "Berapa lama estimasi pengiriman pesanan?",
        a: "Untuk wilayah sekitar Kabupaten Pangandaran dan Ciamis, pengiriman dapat dilakukan pada hari yang sama (same-day). Untuk pengiriman olahan dan ikan beku ke luar kota (Bandung, Jakarta, dsb.), pengiriman menggunakan kurir kilat khusus rantai dingin dengan estimasi 1-2 hari kerja.",
    },
    {
        q: "Apa yang harus dilakukan jika barang yang sampai tidak sesuai atau rusak?",
        a: "Silakan foto produk dan label kemasan yang diterima, lalu kirimkan laporan kepada kami melalui kontak WhatsApp CS dalam waktu 1x24 jam setelah paket diterima untuk penanganan ganti kirim atau pengembalian dana.",
    },
    {
        q: "Bagaimana cara pedagang atau nelayan lokal mendaftar toko di Cibenda Mart?",
        a: "Warga Desa Cibenda dan sekitarnya dapat mendaftar langsung melalui menu 'Daftar Jadi Penjual' di website atau mendatangi kantor sekretariat desa untuk dibantu proses verifikasi dan pemotretan produk.",
    },
];

export default function AboutContactCS() {
    const [formData, setFormData] = useState({
        name: "",
        contact: "",
        category: "pesanan",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.contact.trim() || !formData.message.trim()) {
            toast.error("Mohon isi nama, kontak, dan pesan Anda.");
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Pesan Anda telah diterima. Admin CS kami akan segera menghubungi Anda.");
            setFormData({
                name: "",
                contact: "",
                category: "pesanan",
                message: "",
            });
        }, 600);
    };

    const waNumber = "6281234567890";
    const waText = encodeURIComponent("Halo Admin CS Cibenda Mart, saya ingin bertanya terkait pesanan/layanan...");
    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

    return (
        <section id="contact-cs" className="gsap-reveal-section py-16 md:py-20 bg-[#F4F9FA] border-t border-slate-200/80 scroll-mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="gsap-reveal-item max-w-3xl mb-12">
                    <span className="text-xs font-bold tracking-wider text-[#006591] uppercase">
                        Bantuan & Layanan Pelanggan
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 mb-3">
                        Kontak Layanan Pelanggan & Bantuan Admin
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Jika Anda memiliki kendala pesanan, ingin mengecek ketersediaan tangkapan laut hari ini, atau membutuhkan informasi kemitraan, tim admin kami siap melayani Anda.
                    </p>
                </div>

                {/* 3 Practical Contact Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* WhatsApp */}
                    <div className="gsap-reveal-item bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                WhatsApp Customer Service
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Jalur komunikasi tercepat untuk konfirmasi pesanan, foto kondisi barang, dan informasi langsung dari dermaga.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100">
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Kirim Pesan WhatsApp</span>
                            </a>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="gsap-reveal-item bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#006591] flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Surat Elektronik (Email)
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Untuk kebutuhan kerjasama pengadaan, penawaran resmi, atau korespondensi administratif lainnya.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100">
                            <a
                                href="mailto:halo@cibendamart.id"
                                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                                <Mail className="w-4 h-4" />
                                <span>halo@cibendamart.id</span>
                            </a>
                        </div>
                    </div>

                    {/* Alamat Fisik */}
                    <div className="gsap-reveal-item bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Kantor Pengelola Pasar Desa
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                Gedung Sentra Usaha Desa Cibenda, Jl. Raya Cibenda No. 123, Kec. Parigi, Kab. Pangandaran, Jawa Barat.
                            </p>
                        </div>
                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Jam Operasional: 08.00 – 20.00 WIB</span>
                        </div>
                    </div>
                </div>

                {/* Form & FAQ Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left: Contact Form */}
                    <div className="gsap-reveal-item lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            Formulir Bantuan Langsung
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mb-6">
                            Tuliskan rincian kebutuhan Anda. Tim kami akan menghubungi kontak Anda sesegera mungkin.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nama Anda"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#006591] focus:border-[#006591]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Nomor WhatsApp / Email
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="0812xxxx atau email@anda.com"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#006591] focus:border-[#006591]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Kategori Pesan
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#006591] focus:border-[#006591] bg-white"
                                >
                                    <option value="pesanan">Kendala Pesanan & Pengiriman</option>
                                    <option value="stok">Cek Ketersediaan Ikan Hari Ini</option>
                                    <option value="mitra">Pendaftaran Pedagang / Nelayan Baru</option>
                                    <option value="garansi">Klaim Garansi Kerusakan Produk</option>
                                    <option value="lainnya">Pertanyaan Umum Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Rincian Pesan
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Jelaskan pertanyaan atau kendala yang dialami..."
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#006591] focus:border-[#006591] resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-2.5 px-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>{isSubmitting ? "Mengirimkan Pesan..." : "Kirim Pesan ke Admin"}</span>
                            </button>
                        </form>
                    </div>

                    {/* Right: Clean FAQ Accordion */}
                    <div className="gsap-reveal-item lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs">
                        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <HelpCircle className="w-4 h-4 text-[#006591]" />
                            <h3 className="font-bold text-slate-900 text-base">
                                Pertanyaan yang Sering Diajukan
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div
                                        key={idx}
                                        className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/40"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                                            className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#006591] transition-colors cursor-pointer"
                                        >
                                            <span>{faq.q}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                                                    isOpen ? "rotate-180 text-[#006591]" : ""
                                                }`}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 bg-white">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
