# Panduan Lengkap SEO & Pendaftaran Mesin Pencari — CibendaMart

Dokumen ini merupakan panduan teknis dan operasional untuk mengelola optimasi mesin pencari (SEO), verifikasi kepemilikan domain, dan pendaftaran sitemap platform CibendaMart ke Google dan mesin pencari lainnya.

---

## 1. Arsitektur SEO yang Terpasang di CibendaMart

Platform CibendaMart telah dilengkapi fondasi SEO modern berskala production:

| Komponen | Lokasi File | Fungsi & Peran |
|---|---|---|
| **Dynamic XML Sitemap** | `app/Http/Controllers/SitemapController.php` & `/sitemap.xml` | Menghasilkan daftar seluruh URL publik secara otomatis (beranda, semua produk aktif, toko pedagang, kategori, dan panduan mitra) lengkap dengan *lastmod*, *changefreq*, dan bobot prioritas. Di-cache di memory agar tidak membebani database. |
| **Robots Policy** | `public/robots.txt` | Mengizinkan perayapan halaman etalase publik dan memblokir perayapan halaman transaksi/privat (`/cart`, `/checkout`, `/pedagang`, `/cibenda-portal`). Mengarahkan Googlebot ke URL sitemap resmi. |
| **SEO & OpenGraph Head** | `resources/js/Components/Global/SEOHead.tsx` | Menyuntikkan meta description, canonical URL, OpenGraph (Facebook/WhatsApp preview), dan Twitter Cards pada setiap halaman publik. |
| **Schema.org JSON-LD** | Halaman Produk, Toko, dan Beranda | Format mikrodata standar Google untuk menampilkan *Rich Snippets* (harga produk, ketersediaan stok, nama UMKM, dan profil bisnis lokal). |

---

## 2. Langkah Pendaftaran ke Google Search Console (Pasca Production)

Lakukan tahapan ini setelah aplikasi sudah aktif di domain publik dengan HTTPS (contoh: `https://cimart.cibenda.desa.id`).

### Langkah 1: Buka Google Search Console
1. Kunjungi [Google Search Console](https://search.google.com/search-console).
2. Login menggunakan akun Google resmi (disarankan akun email pengelola website atau pemerintah desa).

### Langkah 2: Tambahkan Properti Domain
Pilih salah satu metode properti:
- **Pilihan A: Awalan URL (URL prefix) — Paling Mudah**
  - Masukkan URL lengkap: `https://cimart.cibenda.desa.id`
  - Klik **Lanjutkan**.
- **Pilihan B: Domain (Mencakup seluruh subdomain)**
  - Masukkan nama root domain: `cibenda.desa.id` (membutuhkan akses DNS hosting).

### Langkah 3: Verifikasi Kepemilikan Domain
Google akan meminta bukti bahwa Anda adalah pemilik web. Pilih salah satu cara berikut:
- **Cara 1 (Rekomendasi - File HTML):**
  1. Download file verifikasi HTML yang disediakan Google (contoh: `google1234567890abcdef.html`).
  2. Letakkan file tersebut di dalam folder `public/` pada server CibendaMart.
  3. Klik tombol **Verifikasi** di Google Search Console.
- **Cara 2 (DNS TXT Record):**
  1. Salin kode TXT yang diberikan Google.
  2. Buka panel DNS domain (Cloudflare/cPanel penyedia domain).
  3. Tambahkan DNS Record tipe `TXT` dengan nama `@` dan paste kode verifikasi dari Google.
  4. Klik **Verifikasi**.
- **Cara 3 (Meta Tag HTML):**
  1. Salin kode tag verifikasi (contoh: `<meta name="google-site-verification" content="KODE_ANDA" />`).
  2. Tambahkan environment variable di file `.env` server production:
     ```env
     GOOGLE_SITE_VERIFICATION=KODE_ANDA
     ```
  3. Jalankan `php artisan config:cache`, lalu klik **Verifikasi**.

### Langkah 4: Kirimkan (Submit) Sitemap XML
1. Setelah verifikasi berhasil, pilih properti web di dashboard Google Search Console.
2. Di bilah menu sebelah kiri, klik menu **Peta Situs (Sitemaps)**.
3. Pada kolom *Tambahkan peta situs baru*, ketik:
   ```text
   sitemap.xml
   ```
4. Klik tombol **Kirim (Submit)**.
5. Status awal akan bertuliskan *Diproses*. Dalam beberapa jam hingga 1 hari, status akan berubah menjadi **Berhasil (Success)** dengan jumlah URL yang berhasil ditemukan.

---

## 3. Pendaftaran ke Mesin Pencari Lainnya

### A. Bing Webmaster Tools (Bonus Instan)
1. Kunjungi [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Login dan pilih opsi **Import dari Google Search Console**.
3. Seluruh data verifikasi domain dan sitemap akan otomatis disinkronkan ke mesin pencari Bing dan Yahoo tanpa perlu verifikasi ulang.

### B. Google Business Profile (Google Maps)
Agar toko UMKM dan pasar desa Cibenda mudah ditemukan saat warga atau wisatawan mencari di Google Maps:
1. Daftarkan lokasi fisik kantor pengelola / sentra UMKM di [Google Business Profile](https://business.google.com).
2. Cantumkan tautan website `https://cimart.cibenda.desa.id`.
3. Tautkan kategori bisnis sebagai *Pasar / Toko Grosir / Pusat Oleh-Oleh Lokal*.

---

## 4. Pengujian & Validasi Fitur SEO

Sebelum mempublikasikan link ke masyarakat, lakukan pengujian berikut:

### 1. Uji Coba Pratinjau WhatsApp & Media Sosial
- Salin link salah satu produk (contoh: `https://cimart.cibenda.desa.id/product/sale-pisang-cibenda`).
- Tempelkan di ruang chat WhatsApp atau uji di [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).
- **Hasil yang Diharapkan:** Muncul kartu pratinjau berisi foto utama produk, nama produk, dan deskripsi singkat.

### 2. Uji Coba Google Rich Results (Schema.org)
- Kunjungi [Google Rich Results Test](https://search.google.com/test/rich-results).
- Masukkan URL halaman produk Anda.
- **Hasil yang Diharapkan:** Google mendeteksi elemen terstruktur `Product` (Harga IDR, Ketersediaan Stok, Nama Penjual).

---

## 5. Pemeliharaan Berkala

1. **Pembaruan Produk Otomatis:**
   - Setiap kali pedagang menambah produk baru atau mengubah harga, URL produk akan otomatis masuk ke dalam generator `/sitemap.xml`.
   - Googlebot akan membaca perubahan tersebut secara periodik sesuai frekuensi perayapan (*daily crawl*).
2. **Monitoring Kesehatan Indeks:**
   - Periksa menu **Cakupan Halaman (Pages)** di Google Search Console sebulan sekali untuk memastikan tidak ada halaman yang berstatus *Error 404* atau *Server Error 5xx*.
