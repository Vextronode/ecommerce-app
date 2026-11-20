# Use Case - Cibenda Mart

| Field | Detail |
|---|---|
| Versi | 1.0 |
| Tanggal | 20 November 2026 |
| Status | Aktif |
| Pemilik Dokumen | Project Manager |
| Dokumen Terkait | `../business_workflow/bw_cimart.md`, `../../diagram/sequence/00_index.md` |

Use case dicatat dari rute dan middleware peran di `routes/web.php` dan `routes/auth.php`, serta tugas terjadwal di `routes/console.php`.

## 1. Dokumen

| Dokumen | Isi |
|---|---|
| `uc_overview.md` | Seluruh aktor terhadap kelompok fitur |
| `uc_pembeli.md` | Pengunjung, Pembeli, dan Kurir Toko |
| `uc_pedagang.md` | Pedagang |
| `uc_admin.md` | Admin, Operator Server, dan sistem otomatis |

## 2. Aktor

| Aktor | Jenis | Keterangan |
|---|---|---|
| Pengunjung | Manusia | Belum login. Dapat menjelajah etalase dan membaca halaman informasi |
| Pembeli | Manusia | Akun `role = user` |
| Pedagang | Manusia | Akun `role = pedagang`. Juga dapat berbelanja di toko lain |
| Kurir Toko | Manusia | Tidak memiliki akun. Akses melalui QR serah terima bertanda tangan |
| Admin | Manusia | Akun `role = admin`, masuk melalui prefix URL khusus |
| Operator Server | Manusia | Menjalankan perintah artisan di server |
| SIDUTama | Sistem eksternal | Sumber permohonan pedagang |
| Midtrans | Sistem eksternal | Pembayaran (Core API) dan pencairan (IRIS) |
| Google | Sistem eksternal | Login OAuth |
| Scheduler | Sistem internal | Tugas berkala di container `scheduler_cibenda` |

## 3. Daftar Use Case

| ID | Use Case | Aktor | Sumber |
|---|---|---|---|
| UC-01 | Menjelajah etalase, produk, dan toko | Pengunjung, Pembeli, Pedagang | `/dashboard`, `/shop`, `/product/{slug}`, `/store/{slug}` |
| UC-02 | Membaca halaman informasi dan kebijakan | Pengunjung, Pembeli, Pedagang | `/about`, `/mitra`, `/kebijakan/*` |
| UC-03 | Mendaftar akun dengan email | Pengunjung | `/register` |
| UC-04 | Masuk dengan Google dan menautkan akun | Pengunjung, Google | `/auth/google/*` |
| UC-05 | Masuk, keluar, dan reset password | Pengunjung, Pembeli, Pedagang | `/login`, `/logout`, `/forgot-password`, `/reset-password` |
| UC-06 | Mengelola profil dan akun | Pembeli, Pedagang | `/profile` |
| UC-07 | Mengelola alamat | Pembeli, Pedagang | `/profile/address` |
| UC-08 | Mengatur preferensi notifikasi | Pembeli, Pedagang | `/profile/notifications` |
| UC-09 | Mengikuti toko | Pembeli, Pedagang | `/store/{store}/follow` |
| UC-10 | Mengelola keranjang | Pembeli, Pedagang | `/cart` |
| UC-11 | Checkout | Pembeli, Pedagang, Midtrans | `/checkout` |
| UC-12 | Membayar pesanan | Pembeli, Pedagang, Midtrans | `/payment/{order}` |
| UC-13 | Mengalihkan pembayaran ke COD | Pembeli, Pedagang, Midtrans | `/payment/{order}/switch-to-cod` |
| UC-14 | Melihat riwayat dan detail pesanan | Pembeli, Pedagang | `/history` |
| UC-15 | Membatalkan pesanan | Pembeli, Pedagang | `/history/{order}/cancel` |
| UC-16 | Melacak pengiriman | Pembeli, Pedagang | `/tracker/{invoice}` |
| UC-17 | Mengonfirmasi pesanan selesai | Pembeli, Pedagang | `/history/{order}/complete` |
| UC-18 | Memberi ulasan | Pembeli, Pedagang | `/history/rating` |
| UC-19 | Mengobrol dengan toko | Pembeli, Pedagang | `/chat` |
| UC-20 | Mengajukan dan menanggapi tawaran | Pembeli, Pedagang | `/chat/rooms/{room}/negotiate`, `/chat/negotiations/*` |
| UC-21 | Mengelola notifikasi | Pembeli, Pedagang, Admin | `/api/notifications` |
| UC-22 | Menghapus akun sendiri | Pembeli | `DELETE /profile` |
| UC-30 | Masuk sebagai pedagang | Pedagang | `/pedagang/login` |
| UC-31 | Menyiapkan toko dan mengganti password awal | Pedagang | `/pedagang/setup-store` |
| UC-32 | Mengikuti tur panduan dashboard | Pedagang | `/pedagang/tour/*` |
| UC-33 | Mengelola produk | Pedagang | `/pedagang/products` |
| UC-34 | Mengelola status pesanan | Pedagang | `/pedagang/merchant/orders/{id}/status` |
| UC-35 | Membuat QR serah terima batch | Pedagang | `/pedagang/orders/batch-handover` |
| UC-36 | Mengobrol dengan pembeli | Pedagang | `/pedagang/chat` |
| UC-37 | Menanggapi tawaran pembeli | Pedagang | `/pedagang/chat/negotiations/*` |
| UC-38 | Melihat analitik penjualan | Pedagang | `/pedagang/analytics` |
| UC-39 | Melihat data pelanggan | Pedagang | `/pedagang/customers` |
| UC-40 | Mengelola pengaturan toko dan akun | Pedagang | `/pedagang/settings` |
| UC-41 | Mengelola rekening bank | Pedagang | `/pedagang/withdrawals/bank` |
| UC-42 | Mengajukan pencairan saldo | Pedagang, Midtrans | `/pedagang/withdrawals` |
| UC-50 | Menerima serah terima pesanan | Kurir Toko | `/tracker/{invoice}/handover`, `/tracker/batch/{token}/handover` |
| UC-51 | Mengirim lokasi pengantaran | Kurir Toko | `/tracker/.../location` |
| UC-52 | Menandai tiba di lokasi | Kurir Toko | `/tracker/{invoice}/arrive` |
| UC-53 | Memverifikasi PIN dan menyelesaikan pesanan | Kurir Toko | `/tracker/{invoice}/complete`, `/tracker/batch/{token}/{invoice}/complete` |
| UC-60 | Masuk sebagai admin | Admin | `/{adminPrefix}/login` |
| UC-61 | Melihat dashboard admin | Admin | `/{adminPrefix}/dashboard` |
| UC-62 | Mengelola permohonan pedagang dari SID | Admin, SIDUTama | `/{adminPrefix}/pedagang` |
| UC-63 | Mengelola pedagang | Admin | `/{adminPrefix}/pedagang/{id}` |
| UC-64 | Melihat dan mengekspor laporan | Admin | `/{adminPrefix}/laporan` |
| UC-65 | Mengelola pengaturan platform | Admin | `/{adminPrefix}/pengaturan` |
| UC-66 | Membuat akun admin pertama | Operator Server | `php artisan admin:init` |
| UC-70 | Sinkronisasi permohonan SID | Scheduler, SIDUTama | Jadwal setiap 2 menit |
| UC-71 | Menyelesaikan pesanan otomatis | Scheduler | Jadwal setiap 15 menit |
| UC-72 | Merekonsiliasi pencairan | Scheduler, Midtrans | Jadwal setiap 15 menit |
| UC-73 | Memperingatkan pencairan tertahan | Scheduler | Jadwal setiap 15 menit |
| UC-74 | Menghapus notifikasi lama | Scheduler | Jadwal harian |
| UC-75 | Memproses notifikasi pembayaran | Midtrans | `/api/midtrans/callback` |

UC-09 sampai UC-21 berlaku juga untuk Pedagang karena rute pembeli memakai middleware `role:user,pedagang`. Pedagang tidak dapat membeli, menawar, atau mengulas produk tokonya sendiri.
