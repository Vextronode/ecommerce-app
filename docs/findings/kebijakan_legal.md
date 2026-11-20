# Temuan - Kebijakan dan Kepatuhan Hukum

## LEG-01 Halaman Kebijakan Privasi tidak tersedia

| Field | Isi |
|---|---|
| Keparahan | High |
| Status | Terbuka |
| Lokasi | `routes/web.php:64-67`; `resources/js/Pages/Legal/` |
| Kondisi Aktual | Halaman kebijakan yang tersedia adalah Perjanjian Mitra, Kebijakan Refund, Syarat & Ketentuan, dan Produk Terlarang. Tidak ada halaman Kebijakan Privasi. Syarat & Ketentuan di aplikasi (Pasal Pelindungan Data Pribadi) hanya menyatakan kepatuhan pada UU 27/2022 tanpa rujukan ke kebijakan yang merinci pemrosesan data. Aplikasi memproses NIK, alamat dan koordinat, lokasi kurir secara langsung, isi dan media obrolan, data rekening, serta akun Google. |
| Dampak | UU 27/2022 tentang Pelindungan Data Pribadi mewajibkan informasi pemrosesan data disampaikan kepada subjek data. Dokumen `docs/S&K/02-Syarat-dan-Ketentuan.md` merujuk Kebijakan Privasi yang belum ada. |
| Bukti | Pencarian kata "privasi" dan "privacy" di `resources/js`, `app`, dan `routes` tidak menemukan hasil. |
| Rekomendasi | Susun dan terbitkan Kebijakan Privasi, lalu tautkan dari halaman pendaftaran dan footer. |

## LEG-02 Janji pembatalan otomatis 1x24 jam tidak diterapkan sistem

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `resources/js/Pages/Legal/RefundPolicy.tsx:81`; `resources/js/Pages/Legal/MerchantAgreement.tsx:112`; `routes/console.php` |
| Kondisi Aktual | Kebijakan Refund menyebut pesanan "dibatalkan otomatis" bila pedagang tidak merespons lebih dari 1x24 jam, dan Perjanjian Mitra menyebut sistem berhak membatalkan secara otomatis. Scheduler tidak memiliki tugas pembatalan seperti itu. |
| Dampak | Pembeli menunggu pembatalan yang tidak pernah terjadi, sementara dana tertahan di escrow. Halaman kebijakan menjanjikan perlindungan yang tidak tersedia. |
| Bukti | Jadwal di `routes/console.php`: hapus notifikasi lama, selesaikan pesanan otomatis, rekonsiliasi pencairan, peringatan pencairan, sinkronisasi SID. |
| Rekomendasi | Terapkan pembatalan otomatis, atau ubah kalimat kebijakan menjadi "Pengelola berhak membatalkan". |

## LEG-03 Kebijakan Refund merujuk mekanisme klaim yang tidak tersedia di aplikasi

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `resources/js/Pages/Legal/RefundPolicy.tsx` (Bagian 3) |
| Kondisi Aktual | Kebijakan mensyaratkan foto atau video bukti dan menyatakan "Klaim tanpa kelengkapan bukti dokumentasi fisik dapat ditolak oleh sistem". Aplikasi tidak memiliki fitur pengajuan klaim, keluhan, atau refund oleh pembeli. |
| Dampak | Pembeli tidak memiliki saluran di aplikasi untuk menggunakan hak yang dijanjikan kebijakan. |
| Bukti | Tidak ada rute klaim atau refund untuk peran `user` di `routes/web.php`. |
| Rekomendasi | Sediakan saluran pengajuan, atau cantumkan saluran di luar aplikasi beserta kontaknya di kebijakan. |

## LEG-04 Keputusan mediasi dinyatakan mengikat kedua pihak

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `resources/js/Pages/Legal/RefundPolicy.tsx` (Bagian 5) |
| Kondisi Aktual | Kebijakan menyatakan keputusan Pengelola sebagai mediator "bersifat mengikat bagi kedua belah pihak". Syarat & Ketentuan di aplikasi (`resources/js/constants/legal/terms.ts:248`) menyatakan keputusan mediasi tidak menghapus hak menempuh BPSK atau Pengadilan Negeri. |
| Dampak | Klausul yang membatasi upaya hukum konsumen berisiko dinilai sebagai klausula baku terlarang menurut UU 8/1999 Pasal 18, dan bertentangan dengan Syarat & Ketentuan platform sendiri. |
| Bukti | Kalimat "Keputusan yang diambil oleh pihak Pengelola Pemerintah Desa Cibenda bersifat mengikat bagi kedua belah pihak." |
| Rekomendasi | Selaraskan dengan ketentuan penyelesaian sengketa pada Syarat & Ketentuan. |

## LEG-05 Perjanjian Mitra menyebut pajak dipotong otomatis dan saldo sebagai dompet

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `resources/js/Pages/Legal/MerchantAgreement.tsx` (Pasal 4) |
| Kondisi Aktual | Pasal 4 menyatakan "Besaran pajak dan biaya layanan ... dipotong/ditambahkan secara otomatis" dan menyebut "saldo dompet pedagang". Syarat & Ketentuan di aplikasi menyatakan pengelola bukan penerbit uang elektronik (`resources/js/constants/legal/terms.ts:56`) dan hanya memungut pajak bila diwajibkan atau ditunjuk resmi oleh DJP (`resources/js/constants/legal/terms.ts:197`). |
| Dampak | Istilah "dompet" mendekati definisi uang elektronik yang memerlukan izin Bank Indonesia. Pernyataan pemotongan pajak otomatis tidak memiliki dasar (lihat CHK-02). |
| Bukti | Teks Pasal 4 pada halaman `/kebijakan/perjanjian-mitra`. |
| Rekomendasi | Selaraskan istilah dan ketentuan pajak dengan Syarat & Ketentuan. |
