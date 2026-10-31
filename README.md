# Cibenda Mart — E-Commerce Platform Pangandaran

Platform e-commerce hyperlocal berbasis desa/kawasan yang dirancang untuk memberdayakan UMKM, pedagang lokal, serta komoditas unggulan (hasil tani, kebun, laut, dan kuliner) di kawasan Cibenda, Kabupaten Pangandaran.

Dibangun dengan arsitektur monolitik modern menggunakan Laravel 11, Inertia.js, React 18 (TypeScript), Tailwind CSS v4, dan Laravel Reverb (WebSocket).

---

## Tech Stack

| Layer | Komponen / Teknologi |
|---|---|
| Backend | Laravel 11 (PHP 8.4) |
| Frontend | React 18 + TypeScript + Inertia.js v2 |
| Styling & UI | Tailwind CSS v4 + Lucide React Icons |
| Realtime / WebSocket | Laravel Reverb (Pusher Protocol) |
| Cache, Queue & Session | Redis Alpine (Predis) |
| Database | MySQL 8.0 |
| Payment Gateway | Midtrans Core API (Direct Charge / Snap) & Midtrans IRIS (Payouts) |
| Maps & Routing | Leaflet.js, OpenStreetMap, & OSRM (Open Source Routing Machine) |
| Notifikasi & Mail | Firebase Cloud Messaging (Web Push) & Resend SMTP |

---

## Alokasi Port Server

Arsitektur jaringan memisahkan port publik yang diakses pengguna dari port internal yang terisolasi di dalam container Docker:

### 1. Port Publik (Firewall / Inbound VPS)
Port yang wajib dibuka pada firewall server:

| Port | Protokol | Layanan | Keterangan |
|---|---|---|---|
| 80 | TCP | HTTP | Redirect otomatis ke HTTPS (port 443) |
| 443 | TCP | HTTPS / WSS | Pintu masuk utama Web App dan WebSocket terenkripsi SSL/TLS |
| 22 | TCP | SSH | Akses remote administration terminal |

### 2. Port Internal Docker (Loopback 127.0.0.1)
Port yang hanya diakses internal oleh Nginx Reverse Proxy dan tidak diekspos ke publik:

| Service Container | Port Host | Port Container | Fungsi |
|---|---|---|---|
| app_cibenda | 127.0.0.1:8000 | 8000 | Web App Laravel + Inertia/React |
| reverb_cibenda | 127.0.0.1:8080 | 8080 | Laravel Reverb WebSocket Server |
| db_cibenda | 127.0.0.1:3307 | 3306 | Database MySQL 8.0 |
| redis_cibenda | 127.0.0.1:6379 | 6379 | Cache in-memory, session store, & queue |
| queue_cibenda | - | - | Background queue worker (FCM & Mail) |

---

## Fitur Utama

- **Pembeli (Customer)**:
  - Eksplorasi katalog produk dan etalase toko mitra pedagang desa.
  - Tawar produk (fitur negosiasi harga interaktif) langsung dari etalase produk.
  - Live chat realtime dengan pedagang via WebSocket.
  - Keranjang belanja multi-item dan checkout terintegrasi peta alamat pengiriman.
  - Pelacakan pesanan dan live tracking kurir berbasis rute jalan nyata OSRM.
  - Pembayaran otomatis menggunakan Midtrans.
  - Sistem ulasan dan penilaian produk bintang 1 sampai 5.
- **Pedagang (Merchant Hub)**:
  - Onboarding toko terpandu dengan spotlight tour.
  - Manajemen produk, stok, variasi dinamis, dan multi-foto.
  - Penerimaan atau tawaran balik (counter-offer) pada pengajuan tawar produk.
  - Manajemen pesanan (konfirmasi, proses, serah terima kurir).
  - Dompet digital dan penarikan saldo penjualan (withdrawal).
  - Analisis penjualan dan metrik CRM pelanggan.
- **Kurir & Logistik**:
  - Pelacakan rute jalan nyata (OSRM) dan mode spektator.
  - Pengiriman pesanan serentak (batch delivery).
  - Konfirmasi serah terima pesanan menggunakan QR code / barcode.
- **Super Admin**:
  - Verifikasi pedagang dengan validasi NIK Sistem Informasi Desa (SID).
  - Leaderboard produk unggulan dan rekapitulasi omset per kategori.
  - Ekspor laporan penjualan langsung ke format CSV (UTF-8 BOM siap Excel).

---

## Deployment Server (Production)

Deployment production dijalankan menggunakan **Docker Compose** dengan reverse proxy **Nginx** dan sertifikat SSL **Let's Encrypt**.

### Panduan Lengkap
Instruksi mendalam step-by-step mencakup persiapan VPS, konfigurasi virtual host Nginx (HTTP + WebSocket upgrade), setup SSL Certbot, prosedur backup database, dan troubleshooting dapat dilihat pada:

Lihat panduan lengkap: **[Panduan Lengkap Deployment Server (docs/DEPLOYMENT_GUIDE.md)](docs/DEPLOYMENT_GUIDE.md)**

### Ringkasan Menjalankan Docker:
1. Salin dan sesuaikan konfigurasi environment:
   ```bash
   cp .env.docker.example .env.docker
   ```
2. Jalankan container:
   ```bash
   docker compose up -d --build
   ```
3. Cek status container:
   ```bash
   docker compose ps
   ```

---

## Menjalankan di Lokal (Development)

Untuk menjalankan project di lingkungan pengembangan lokal tanpa Docker:

### Prasyarat:
- PHP >= 8.2 & Composer
- Node.js >= 20.x & npm
- MySQL 8.0 & Redis

### Langkah Cepat:
1. Clone repositori dan install dependensi:
   ```bash
   composer install
   npm install --legacy-peer-deps
   ```
2. Siapkan file konfigurasi environment:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
3. Jalankan migrasi database dan buat storage link:
   ```bash
   php artisan migrate --seed
   php artisan storage:link
   ```
4. Jalankan layanan development:
   - Backend: `php artisan serve` (Port 8000)
   - Frontend: `npm run dev` (Port 5173)
   - WebSocket: `php artisan reverb:start` (Port 8080)
   - Queue: `php artisan queue:work`
