import React from "react";

export default function AboutStory() {
    return (
        <section className="gsap-reveal-section py-16 md:py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="gsap-reveal-item max-w-3xl mb-12">
                    <span className="text-xs font-bold tracking-wider text-[#006591] uppercase">
                        Latar Belakang & Misi
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 mb-3">
                        Mengapa Cibenda Mart Didirikan?
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Desa Cibenda di Kecamatan Parigi memiliki potensi hasil laut dan komoditas olahan pesisir yang sangat kaya. Namun di balik kekayaan bahari tersebut, terdapat tantangan nyata yang dialami warga setiap hari.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    {/* Column 1 */}
                    <div className="gsap-reveal-item bg-[#FAFBFD] border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                        <div className="space-y-3">
                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-md">
                                Situasi Nyata Lapangan
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                Rantai Perantara Panjang & Pasar Musiman
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Tangkapan ikan segar seperti kakap merah, tenggiri, bawal, serta olahan tradisional seperti jambal roti khas Parigi sering kali hanya bergantung pada kedatangan wisatawan saat libur akhir pekan. Saat hari biasa atau cuaca tangkapan melimpah, harga di tingkat nelayan kerap anjlok karena minimnya akses langsung ke pembeli di luar kawasan wisata.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
                            Kondisi ini membuat perputaran ekonomi keluarga nelayan sangat fluktuatif sepanjang tahun.
                        </div>
                    </div>

                    {/* Column 2 */}
                    <div className="gsap-reveal-item bg-[#FAFBFD] border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
                        <div className="space-y-3">
                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-[#006591] bg-teal-50 border border-teal-200 rounded-md">
                                Langkah Nyata Cibenda Mart
                            </span>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                                Pasar Gotong Royong Berbasis Digital
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Platform ini memfasilitasi setiap pelaku usaha, nelayan, dan pengrajin olahan di Desa Cibenda untuk mengelola etalase toko digital mereka sendiri. Pembeli mendapatkan transparansi produk dan kepastian pengemasan pendingin (cold pack), sementara para penjual lokal menerima hasil penjualan secara utuh tanpa potongan sepihak.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 font-medium">
                            Inisiatif terpadu yang memadukan teknologi web praktis dengan kearifan lokal pesisir Pangandaran.
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
