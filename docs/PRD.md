# Product Requirement Document - Cibenda Mart
### Platform E-Commerce UMKM Desa Cibenda

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |
| Dokumen Terkait | `data_dictionary/`, `business/business_workflow/bw_cimart.md`, `business/usecase/`, `diagram/sequence/`, `S&K/`, `findings/` |

## Riwayat Revisi

| Versi | Tanggal | Perubahan Utama |
|---|---|---|
| 1.0 | 20/11/2026 | Penyusunan awal berdasarkan kondisi aktual repositori |

## Ringkasan Eksekutif

Cibenda Mart (CiMart) adalah platform e-commerce hyperlocal milik Pemerintah Desa Cibenda, Kecamatan Parigi, Kabupaten Pangandaran, untuk UMKM dan komoditas lokal: hasil tani, kebun, laut, dan kuliner. Pedagang adalah warga desa yang memiliki Surat Keterangan Usaha dari Sistem Informasi Desa (SIDUTama). Pembeli berbelanja dari beberapa toko dalam satu checkout, membayar melalui Midtrans atau COD, dan dapat menawar harga melalui obrolan. Dana pembayaran online ditahan sebagai escrow sampai pesanan selesai. Pesanan diantar oleh kurir toko yang dilacak secara langsung dan diserahkan dengan PIN. Pedagang mencairkan saldo ke rekening melalui Midtrans IRIS. Pengelola mengatur biaya, saklar fitur, dan verifikasi pedagang dari panel admin.

## 1. Project Overview

### 1.1 Latar Belakang

Cibenda Mart dikembangkan sebagai inisiatif digitalisasi UMKM oleh Pemerintah Desa Cibenda, dengan fokus pada produk lokal terverifikasi dan ekonomi pesisir. Platform ini menghubungkan pelaku usaha dan komoditas unggulan kawasan Cibenda dengan pembeli melalui kanal daring. Hanya warga yang usahanya tercatat dan disahkan melalui SIDUTama yang dapat menjadi pedagang.

Sumber: `README.md`, `resources/js/Pages/Storefront/About.tsx`, `docs/sid-thirdparty.md`.

### 1.2 Tujuan Produk

1. Menyediakan etalase dan transaksi daring bagi UMKM Desa Cibenda yang terverifikasi.
2. Melindungi pembeli dan pedagang dengan dana tertahan (escrow) sampai pesanan selesai.
3. Mendukung pengantaran lokal oleh kurir toko dengan pelacakan langsung dan bukti serah terima.
4. Memastikan setiap pedagang terhubung dengan data usaha resmi di SIDUTama.
5. Memberi pengelola kendali atas biaya platform, fitur, dan pedagang tanpa perlu deploy ulang.

### 1.3 Target Pengguna

| Pengguna | Peran Sistem | Kebutuhan Utama |
|---|---|---|
| Pembeli (warga dan wisatawan) | `user` | Menemukan produk lokal, membeli, menawar, membayar, melacak pesanan |
| Pedagang (warga Desa Cibenda pemilik SKU) | `pedagang` | Mengelola toko, produk, pesanan, obrolan, dan pencairan saldo |
| Kurir Toko | Tanpa akun | Menerima serah terima, mengantar, dan menyelesaikan pesanan dengan PIN |
| Admin (Pengelola Pemerintah Desa) | `admin` | Memverifikasi pedagang, mengatur platform, memantau laporan |

## 2. Success Metrics

Indikator diukur dari data yang tercatat di sistem. Kolom **Dasar** menunjukkan asal target: komitmen yang sudah tertulis di dokumen platform, atau usulan yang perlu ditetapkan Pengelola.

### 2.1 Indikator dengan Target Evaluasi

| No | Indikator | Definisi | Sumber Data | Target Evaluasi | Dasar |
|---|---|---|---|---|---|
| 1 | Waktu respons pedagang | Pesanan berubah dari `pending` ke `processing` | Belum tercatat; tidak ada kolom waktu perubahan status | Maksimal 1x24 jam | Perjanjian Mitra Pasal 3 |
| 2 | Penurunan produk terlarang | Produk melanggar diturunkan sejak terdeteksi | Belum tercatat | Maksimal 1x24 jam | Daftar Produk Terlarang, Bagian 5 |
| 3 | Pencairan tertahan | Pencairan `processing` atau `failed` dengan `needs_reconciliation` yang berumur lebih dari 30 menit | `withdrawals` | 0 | Ambang peringatan `withdrawals:alert-stuck` |
| 4 | Keberhasilan pencairan | Persentase pencairan `completed` | `withdrawals` | Minimal 95% | Usulan |
| 5 | Penyelesaian pembayaran online | Persentase pesanan non-COD yang `paid` sebelum `payment_expiry_time` | `orders` | Minimal 80% | Usulan |
| 6 | Penyelesaian pesanan | Persentase pesanan `delivered` dari pesanan yang tidak dibatalkan sebelum dibayar | `orders` | Minimal 90% | Usulan |
| 7 | Tingkat pembatalan | Persentase pesanan `cancelled` | `orders` | Maksimal 10% | Usulan |
| 8 | Kepuasan pembeli | Rata-rata `rating` ulasan produk | `product_reviews` | Minimal 4,0 dari 5 | Usulan |
| 9 | Waktu proses permohonan pedagang | Selisih `requested_at` dan `decided_at` | `seller_applications` | Maksimal 3 hari | Usulan |

### 2.2 Indikator Pemantauan

Indikator berikut dipantau tanpa target karena belum ada dasar penetapannya.

| Indikator | Sumber Data |
|---|---|
| Jumlah toko `verified` dengan pemilik `active` atau `warning` | `stores`, `users` |
| Jumlah pembeli terdaftar dan pembeli yang bertransaksi | `users`, `orders` |
| Nilai transaksi (subtotal) per periode dan per kategori | `orders`, `order_items`, laporan admin |
| Jumlah tawaran dan persentase yang berakhir `purchased` | `chat_negotiations` |
| Proporsi metode pembayaran dan metode pengiriman | `orders` |

## 3. Product Scope

### 3.1 In Scope (Berjalan)

Rujukan ID mengacu pada `business/usecase/00_index.md`.

**Pengunjung dan Pembeli**
- Menjelajah etalase, produk, dan toko; membaca halaman informasi dan kebijakan (UC-01, UC-02).
- Mendaftar dengan email atau Google, menautkan akun Google, reset password, mengelola profil, alamat, preferensi notifikasi, dan menghapus akun (UC-03 sampai UC-08, UC-22).
- Mengikuti toko, keranjang, checkout multi-toko dengan pengiriman kurir lokal atau ambil sendiri (UC-09 sampai UC-11).
- Pembayaran Virtual Account (BCA, BNI, BRI, Permata, Mandiri Bill), QRIS, GoPay, dan COD; pengalihan ke COD (UC-12, UC-13).
- Riwayat pesanan, pembatalan, pelacakan kurir, konfirmasi selesai, dan ulasan (UC-14 sampai UC-18).
- Obrolan dengan toko termasuk foto dan video, serta tawar-menawar harga (UC-19, UC-20).
- Notifikasi dalam aplikasi dan push notification (UC-21).

**Pedagang**
- Pendaftaran melalui SIDUTama, penyiapan toko, dan tur panduan (UC-30 sampai UC-32).
- Pengelolaan produk dengan varian, SKU, foto, pra-pesan, dan penyaringan kata kunci produk terlarang (UC-33).
- Pengelolaan status pesanan dan QR serah terima tunggal maupun batch (UC-34, UC-35).
- Obrolan dan tanggapan tawaran (UC-36, UC-37).
- Analitik penjualan dan data pelanggan (UC-38, UC-39).
- Pengaturan toko dan akun, rekening bank, serta pencairan saldo (UC-40 sampai UC-42).
- Berbelanja di toko lain dengan fitur pembeli.

**Kurir Toko**
- Serah terima melalui QR bertanda tangan, pelacakan lokasi, penanda tiba, dan penyelesaian dengan PIN (UC-50 sampai UC-53).

**Admin dan Sistem**
- Login admin dengan prefix URL khusus, dashboard, pengelolaan permohonan SID dan pedagang, laporan produk terlaris dengan ekspor CSV, dan pengaturan platform (UC-60 sampai UC-66).
- Tugas otomatis: sinkronisasi SID, penyelesaian pesanan otomatis, rekonsiliasi dan peringatan pencairan, pembersihan notifikasi, serta pemrosesan notifikasi pembayaran (UC-70 sampai UC-75).

### 3.2 Roadmap

Hanya mencatat rencana yang sudah tertulis di dokumen repositori.

| Rencana | Status | Sumber |
|---|---|---|
| Alur pajak sesuai hukum: PPN biaya layanan, PPN barang untuk pedagang PKP, dan PPh 22 marketplace | Rancangan, belum diimplementasikan. Fitur pajak saat ini nonaktif | `S&K/01-Workflow-Pajak.md` |
| Verifikasi pembeli sebagai warga desa melalui SID | Belum dibutuhkan pada v1 | `sid-thirdparty.md` bagian 11 |
| Login dengan akun SID (SSO) | Belum dibutuhkan | `sid-thirdparty.md` bagian 11 |
| Integrasi dashboard desa | Dibahas terpisah | `sid-thirdparty.md` bagian 11 |

### 3.3 Out of Scope

| Tidak Disediakan | Sumber |
|---|---|
| Pengelola sebagai penjual produk; pengelola hanya mempertemukan pembeli dan pedagang | Syarat & Ketentuan, Pasal Kedudukan Pengelola |
| Saldo sebagai uang elektronik: isi ulang, transfer antarpengguna, atau belanja memakai saldo | Syarat & Ketentuan (`resources/js/constants/legal/terms.ts`) |
| Penjualan produk yang tercantum di Daftar Produk Terlarang | `S&K/03-Daftar-Produk-Terlarang-dan-Dibatasi.md`, `config/prohibited_items.php` |
| Pendaftaran pedagang langsung dari Cimart, pengajuan SKU, dan perubahan data usaha dari Cimart | `sid-thirdparty.md` bagian 11 |
| Webhook dari SID ke Cimart | `sid-thirdparty.md` bagian 11 |
| Akun untuk kurir | Kurir memakai akses QR bertanda tangan (`DeliveryTrackerController`) |

## 4. Tech Stack

| Layer | Teknologi | Sumber |
|---|---|---|
| Backend | Laravel 13 (`laravel/framework ^13.8`), PHP 8.4 pada Docker dan CI (`php ^8.3` di `composer.json`) | `composer.json`, `Dockerfile`, `.github/workflows/ci.yml` |
| Frontend | React 18, TypeScript 5, Inertia.js v2, Tailwind CSS v4, Vite 8 | `package.json` |
| Peta | Leaflet, tile OpenStreetMap, rute OSRM | `package.json`, `resources/js/Components/Delivery/` |
| Realtime | Laravel Reverb dengan Laravel Echo dan pusher-js | `composer.json`, `package.json` |
| Database | MySQL 8.0; SQLite in-memory untuk pengujian | `docker-compose.yml`, `phpunit.xml` |
| Cache, sesi, antrean | Redis (Docker) atau database (lokal) | `.env.docker.example`, `.env.example` |
| Grafik | Recharts | `package.json` |
| Deployment | Docker Compose: `app`, `reverb`, `queue`, `scheduler`, `db`, `redis`, di belakang Nginx dan Let's Encrypt | `docker-compose.yml`, `deploy.sh`, `DEPLOYMENT_GUIDE.md` |

## 5. Non-Functional Requirements

Mencatat kemampuan non-fungsional yang sudah diterapkan.

### 5.1 Keamanan

- Pembatasan akses berbasis peran (`role:user,pedagang`, `role:pedagang`, `role:admin`). Akun `suspended` atau `inactive` ditolak saat login dan dikeluarkan dari sesi.
- Prefix URL admin dapat dikonfigurasi; URL tebakan seperti `/admin*` mengembalikan 404 bila prefix diubah.
- Rate limiting per rute, termasuk limiter khusus untuk checkout, status pembayaran, pencairan, obrolan, lokasi kurir, aksi kurir, PIN, token FCM, dan ikuti toko.
- Notifikasi Midtrans diverifikasi dengan signature key dan kecocokan gross amount.
- Akses kurir memakai URL bertanda tangan (berlaku 24 jam) dan sesi serah terima 30 menit. Verifikasi PIN dikunci 5 menit setelah 5 percobaan salah.
- Penautan akun Google ke akun yang sudah ada mensyaratkan password dan nonce sekali pakai yang berlaku 10 menit.
- Kolom sensitif disembunyikan dari serialisasi model (password, NIK, data rekening, PIN, payload pembayaran).
- Penyaringan kata kunci produk terlarang pada data produk.

### 5.2 Integritas Transaksi

- Checkout, pembayaran, saldo, dan pencairan memakai transaksi database dengan penguncian baris.
- Penanda `escrow_credited_at`, `balance_credited_at`, dan `stock_restored_at` mencegah saldo atau stok diproses dua kali.
- Pencairan dicoba ulang hingga 3 kali, direkonsiliasi otomatis setiap 15 menit, dan diperingatkan ke admin bila tertahan lebih dari 30 menit.

### 5.3 Realtime dan Notifikasi

- Siaran WebSocket melalui Reverb untuk status pesanan, lokasi kurir, obrolan, tawaran, stok produk, pencairan, permohonan pedagang baru, dan pengaturan platform.
- Notifikasi disimpan di database dan dikirim sebagai push notification melalui Firebase Cloud Messaging lewat antrean.

### 5.4 Aplikasi Web Progresif

- Dua manifest PWA: "Cibenda Mart" untuk etalase dan "CiMart Pedagang" untuk dashboard pedagang, dengan service worker dan service worker FCM.

### 5.5 SEO

- Sitemap XML dinamis di `/sitemap.xml`. Panduan pendaftaran mesin pencari tercatat di `SEO_GUIDE.md`.

### 5.6 Pengujian dan CI

- 55 file test fitur dan 4 file test unit PHPUnit.
- GitHub Actions menjalankan Pint, test suite, serta pemeriksaan TypeScript dan build Vite pada push dan pull request.

## 6. External APIs

| Layanan | Fungsi | Sumber |
|---|---|---|
| Midtrans Core API | Charge VA, QRIS, GoPay; status, pembatalan, dan refund transaksi | `app/Services/MidtransService.php` |
| Midtrans IRIS | Payout pencairan saldo pedagang | `app/Services/MidtransIrisService.php` |
| SIDUTama API | Permohonan pedagang dan pelaporan keputusan | `app/Services/Sid/SidApiService.php`, `sid-thirdparty.md` |
| Google OAuth 2.0 | Login dan penautan akun | `app/Http/Controllers/Auth/SocialiteController.php` |
| Firebase Cloud Messaging | Push notification | `app/Broadcasting/FcmChannel.php`, `public/firebase-messaging-sw.js` |
| Resend (SMTP) | Pengiriman email pada konfigurasi Docker | `.env.docker.example` |
| OSRM (`router.project-osrm.org`) | Rute jalan pada peta pelacakan | `resources/js/Components/Delivery/Map/osrmRouting.ts` |
| OpenStreetMap | Tile peta | `resources/js/Components/Delivery/`, `resources/js/Hooks/useAddressMap.ts` |

## 7. Data Model

Struktur 28 tabel, nilai status, dan relasi tercatat di `data_dictionary/index.md` dan `data_dictionary/ERD_cimart.md`.

## 8. User Flow

| Dokumen | Isi |
|---|---|
| `business/business_workflow/bw_cimart.md` | 12 proses bisnis beserta diagram aktivitas |
| `business/usecase/` | Aktor dan 52 use case |
| `diagram/sequence/` | 9 diagram sequence untuk alur utama |

## 9. Kebijakan dan Legal

| Dokumen | Lokasi di Aplikasi | Dokumen Sumber |
|---|---|---|
| Syarat & Ketentuan | `/kebijakan/syarat-ketentuan` | `S&K/02-Syarat-dan-Ketentuan.md` |
| Daftar Produk Terlarang dan Dibatasi | `/kebijakan/produk-terlarang` | `S&K/03-Daftar-Produk-Terlarang-dan-Dibatasi.md` |
| Perjanjian Kemitraan Pedagang | `/kebijakan/perjanjian-mitra` | - |
| Kebijakan Pengembalian Dana dan Barang | `/kebijakan/refund` | - |

## 10. Isu Terbuka

Kelemahan pada aplikasi, repositori, dan kebijakan dicatat di `findings/README.md`, lengkap dengan tingkat keparahan dan status.

## 11. Penutup

Dokumen ini mencatat kebutuhan produk berdasarkan kondisi aktual repositori per 20 November 2026. Perubahan fitur, cakupan, atau target dicatat sebagai revisi baru pada tabel Riwayat Revisi.
