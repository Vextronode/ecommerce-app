import React from "react";
import { Link } from "@inertiajs/react";
import { MapPin, Mail } from "lucide-react";
import { Whatsapp } from "@/Components/Icons/SocialIcons";

import logoWidyatama from "@/assets/images/logo-widyatama.webp";
import logoParigi from "@/assets/images/parigi_logo.png";
import logoPangandaran from "@/assets/images/lambang-pangandaran.webp";

export default function Footer() {
    return (
        <footer className="w-full bg-[#281B7A] text-white py-12 md:py-16 px-6 md:px-12 lg:px-20 font-sans">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 mb-12">
                    {/* Column 1: Brand & Logos */}
                    <div className="flex flex-col items-start w-full">
                        <div className="text-xl md:text-2xl font-bold mb-6 select-none tracking-tight">
                            CIBENDAMART
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                            <div className="w-20 h-14 md:w-28 md:h-16 bg-white rounded flex items-center justify-center p-2 shadow-sm">
                                <img src={logoWidyatama} alt="Logo Widyatama" className="max-w-full max-h-full object-contain scale-[1.3] md:scale-[1.4]" />
                            </div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded flex items-center justify-center p-2 shadow-sm">
                                <img src={logoParigi} alt="Logo Parigi" className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded flex items-center justify-center p-2 shadow-sm">
                                <img src={logoPangandaran} alt="Lambang Pangandaran" className="max-w-full max-h-full object-contain" />
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Informasi */}
                    <div>
                        <h4 className="text-[17px] font-medium mb-6 text-white/90">
                            Informasi
                        </h4>
                        <ul className="space-y-4">
                            <li className="text-[15px] text-white/80 hover:text-white transition cursor-pointer">
                                Tentang Kami
                            </li>
                            <li className="text-[15px] text-white/80 hover:text-white transition cursor-pointer">
                                Kebijakan Privasi
                            </li>
                            <li className="text-[15px] text-white/80 hover:text-white transition cursor-pointer">
                                Syarat & Ketentuan
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Bantuan & Panduan */}
                    <div>
                        <h4 className="text-[17px] font-medium mb-6 text-white/90">
                            Bantuan & Panduan
                        </h4>
                        <ul className="space-y-4">
                            <li className="text-[15px] text-white/80 hover:text-white transition cursor-pointer">
                                FAQ
                            </li>
                            <li className="text-[15px] text-white/80 hover:text-white transition cursor-pointer">
                                Cara Berbelanja
                            </li>
                            <li className="text-[15px] text-white/80 hover:text-white transition cursor-pointer">
                                Panduan Penjual
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Hubungi Kami */}
                    <div>
                        <h4 className="text-[17px] font-medium mb-6 text-white/90">
                            Hubungi Kami
                        </h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-[15px] text-white/80">
                                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                                <span>Jl. Raya Cibenda No. 123, Indonesia</span>
                            </li>
                            <li className="flex items-center gap-3 text-[15px] text-white/80">
                                <Mail className="w-5 h-5 shrink-0" />
                                <span>halo@cibendamart.id</span>
                            </li>
                            <li className="flex items-center gap-3 text-[15px] text-[#00AA5B] font-medium mt-2">
                                <Whatsapp size={22} className="shrink-0" />
                                <span>0812-3456-7890</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom line */}
                <div className="pt-8 flex flex-col items-center border-t border-white/10">
                    <p className="text-sm md:text-[15px] text-white/60">
                        © {new Date().getFullYear()} Cibenda Mart. Semua Hak Dilindungi.
                    </p>
                </div>
            </div>
        </footer>
    );
}
