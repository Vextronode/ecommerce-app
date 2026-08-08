# 🛒 Cibenda Mart — E-Commerce Platform Pangandaran

Platform e-commerce lokal berbasis desa/kawasan (*hyperlocal marketplace*) yang dirancang untuk memberdayakan pelaku UMKM, pedagang lokal, dan komoditas unggulan (seafood, hasil bumi, kuliner, dan kerajinan) di kawasan Cibenda, Kabupaten Pangandaran.

Dibangun dengan arsitektur monolitik modern menggunakan **Laravel 11**, **Inertia.js**, **React**, **TypeScript**, dan **Tailwind CSS**.

---

## ⚡ Tech Stack

| Layer | Teknologi |
|---|---|
| **Backend Framework** | [Laravel 11](https://laravel.com) (PHP 8.2+) |
| **Frontend Framework** | [React 18/19](https://react.dev) + [TypeScript](https://www.typescriptlang.org/) |
| **Adapter Layer** | [Inertia.js v1](https://inertiajs.com) (Server-driven Single Page Application) |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com), [Lucide React Icons](https://lucide.dev) |
| **Database** | MySQL / MariaDB |
| **Payment & Payout Gateway** | Midtrans Core API (Direct Charge) & Midtrans IRIS (Payouts) |
| **Mapping / Geolocation** | Leaflet.js / OpenStreetMap |

---

## 🚀 Fitur Utama

### 🛍️ 1. Storefront & Pembeli (Customer)
- **Katalog & Navigasi**: Eksplorasi produk berdasarkan kategori (*Seafood*, Sayuran, Sembako, dll.) dan pencarian real-time.
- **Profil Toko Mitra**: Halaman etalase khusus per pedagang lengkap dengan jam operasional, badge verifikasi SID, dan katalog toko.
- **Manajemen Keranjang & Checkout**: Penanganan *multi-item cart*, pemilihan alamat pengiriman interaktif berbasis peta, dan ringkasan biaya transparan.
- **Sistem Ulasan & Rating**: Pembeli yang sudah menyelesaikan transaksi dapat memberikan ulasan bintang beserta foto produk.

### 🏪 2. Portal Pedagang (Merchant Hub)
- **Onboarding Toko**: Form setup toko, kustomisasi slug/username toko, dan verifikasi status SID desa.
- **Katalog & Stok Produk**: Tambah/edit produk, upload multi-foto, pengelolaan stok, harga, dan variasi.
- **Kelola Pesanan**: Pemantauan pesanan masuk, konfirmasi proses, input resi pengiriman, hingga penyelesaian pesanan.
- **Dompet & Penarikan Saldo (Withdrawal)**: Rekapitulasi saldo penghasilan bersih dan form pengajuan penarikan dana ke rekening bank pedagang.

### 🛡️ 3. Panel Admin (Super Admin)
- **Verifikasi & Manajemen Merchant**: Pembuatan akun pedagang oleh admin, pemisahan identitas pemilik vs nama toko, serta peninjauan dokumen verifikasi SID.
- **Laporan Produk Unggulan Terlaris (Leaderboard)**:
  - Rekap produk terbaik per toko (1 produk unggulan/toko) dengan penjualan nyata (`total_sales > 0`).
  - Filter interaktif (Semua Waktu, Hari Ini, Minggu/Bulan/Tahun Ini, atau Rentang Kustom).
  - Medali peringkat vektor (Gold, Silver, Bronze) & metrik omset ringkas.
  - Ekspor laporan langsung ke format CSV (UTF-8 BOM siap Excel).

---

## 🛠️ Panduan Instalasi & Menjalankan Project

### Prasyarat:
- PHP >= 8.2 & Composer
- Node.js >= 18.x & npm / pnpm
- MySQL / MariaDB

### Langkah-langkah:

1. **Clone repositori dan masuk ke direktori project:**
   ```bash
   git clone https://github.com/username/e-commerce_platform_pangandaran.git
   cd e-commerce_platform_pangandaran
   ```

2. **Salin file environment & sesuaikan konfigurasi database:**
   ```bash
   cp .env.example .env
   ```
   *Buka file `.env` lalu sesuaikan kredensial `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, dan konfigurasi Midtrans jika ada.*

3. **Install dependensi PHP & Node.js:**
   ```bash
   composer install
   npm install
   ```

4. **Generate Application Key:**
   ```bash
   php artisan key:generate
   ```

5. **Jalankan migrasi database & seeder:**
   ```bash
   php artisan migrate --seed
   ```

6. **Buat symbolic link untuk media/storage:**
   ```bash
   php artisan storage:link
   ```

7. **Jalankan development server:**
   - Terminal 1 (Laravel backend):
     ```bash
     php artisan serve
     ```
   - Terminal 2 (Vite frontend):
     ```bash
     npm run dev
     ```

8. Akses aplikasi melalui browser di `http://localhost:8000`.

---

## 📁 Struktur Direktori Singkat

```text
├── app/
│   ├── Http/Controllers/
│   │   ├── Admin/          # Controller panel admin & laporan
│   │   ├── Merchant/       # Controller pedagang, produk & penarikan saldo
│   │   ├── Auth/           # Autentikasi multi-role
│   │   └── ...             # Shop, Cart, Checkout, Order, & Review controllers
│   └── Models/             # Eloquent Models (User, Store, Product, Order, dll.)
├── resources/
│   ├── js/
│   │   ├── Components/     # Komponen UI modular (Admin, Merchant, Storefront, Cart)
│   │   ├── Hooks/          # Custom React hooks (Storefront, Admin, Merchant)
│   │   ├── Layouts/        # Layout wrappers (AdminLayout, MerchantLayout, StorefrontLayout)
│   │   └── Pages/          # Halaman Inertia.js (Admin, Storefront, Auth, Profile)
│   └── css/                # Konfigurasi Tailwind & global styling
├── routes/
│   ├── web.php             # Route definitions & middleware grouping
│   └── auth.php            # Route autentikasi
└── database/
    ├── migrations/         # Skema database
    └── seeders/            # Data awal/dummy testing
```

---

## 🔒 Catatan Keamanan & Hak Akses
- Autentikasi multi-guard/role memisahkan akses **Super Admin**, **Merchant**, dan **Customer**.
- Proteksi brute-force dan pesan login tersanitasi untuk mencegah *user enumeration*.
- Validasi transaksi dan status pembayaran terproteksi dengan verifikasi status Midtrans webhook/callback.
