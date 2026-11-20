# Temuan - Pesanan dan Pengiriman

## ORD-01 Pesanan COD dengan ambil sendiri tidak memiliki jalur ke `delivered`

| Field | Isi |
|---|---|
| Keparahan | High |
| Status | Selesai |
| Lokasi | `app/Models/Order.php:381` (`canBuyerComplete`); `app/Http/Controllers/Merchant/OrderController.php:174`; `app/Http/Controllers/DeliveryTrackerController.php:30`; `resources/js/Components/Merchant/Orders/UpdateStatusModal.tsx` |
| Kondisi Aktual | Ada tiga jalur menuju `delivered`: PIN dari kurir, konfirmasi pembeli, dan penyelesaian otomatis. Tidak satu pun berlaku untuk pesanan COD dengan `self_pickup`. Pelacakan dan PIN hanya untuk `local_delivery`. Pembeli tidak dapat mengonfirmasi pesanan COD. Penyelesaian otomatis hanya untuk `local_delivery` non-COD. Validasi status pedagang hanya menerima `pending`, `processing`, `shipped`, dan `cancelled`. |
| Dampak | Pesanan tertahan di `shipped` dengan `payment_status` `pending`. Pembeli tidak dapat memberi ulasan, dan pesanan tidak tercatat sebagai selesai di laporan maupun analitik. Pesan galat di kode menyebut "konfirmasi pembayaran dari penjual", tetapi fitur itu tidak ditemukan. |
| Bukti | `canBuyerComplete()` mengembalikan `false` bila `payment_method === 'cod'`. `DeliveryTrackerController::show` menolak pesanan selain `local_delivery`, dan serah terima batch hanya memuat pesanan `local_delivery` (`app/Http/Controllers/Merchant/OrderController.php`, `generateBatchHandover`). Checkout di backend maupun antarmuka (`resources/js/Hooks/Storefront/useCheckoutForm.ts`) tidak melarang kombinasi COD dan ambil sendiri. Bila `enable_online_payment` dan `enable_local_delivery` sama-sama nonaktif, kombinasi ini menjadi satu-satunya pilihan. |
| Rekomendasi | Pastikan apakah kombinasi COD dan ambil sendiri memang dapat dipilih di checkout. Bila dapat, sediakan jalur penyelesaian, misalnya konfirmasi pembayaran oleh pedagang. |
| Keputusan | Diselesaikan 20 November 2026: Diizinkan pedagang menandai status `delivered` khusus untuk pesanan ambil sendiri (`self_pickup`). Bila pesanan berupa COD, sistem otomatis mengubah `payment_status` menjadi `paid`. Bila non-COD, saldo escrow toko otomatis dilepas ke `available_balance`. Pengiriman kurir lokal tetap terlindungi dan hanya dapat diselesaikan melalui PIN kurir/pembeli. |

## ORD-02 Penanda kedatangan kurir hanya tersimpan di cache

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Selesai |
| Lokasi | `app/Models/Order.php:357` (`markAsArrived`), `:369` (`isArrived`) |
| Kondisi Aktual | Penanda "kurir tiba" disimpan di cache dengan kunci `order_arrived_{id}` selama 7 hari. Kode juga memeriksa kolom `arrived_at`, tetapi kolom itu tidak ada di migrasi mana pun. |
| Dampak | Penanda hilang bila cache dibersihkan (misalnya `php artisan optimize:clear` yang tercantum di panduan deployment) atau Redis dimulai ulang (lihat INF-06). Pembeli baru dapat mengonfirmasi pesanan setelah 4 jam. |
| Bukti | `Schema::hasColumn('orders', 'arrived_at')` selalu bernilai `false` pada skema saat ini. |
| Rekomendasi | Simpan waktu kedatangan di kolom database, atau hapus rujukan ke `arrived_at`. |
| Keputusan | Diselesaikan 20 November 2026: Ditambahkan migrasi kolom timestamp `arrived_at` (nullable) pada tabel `orders`. Metode `markAsArrived` menyimpan timestamp ke database serta cache Redis, dan `isArrived` memprioritaskan pengecekan kolom database sehingga penanda kedatangan kurir persisten dan tidak hilang saat cache dibersihkan. |

## ORD-03 Batas 4 jam penyelesaian otomatis dihitung dari `updated_at`

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Selesai |
| Lokasi | `routes/console.php` (jadwal `auto-complete-shipped-orders`); `app/Models/Order.php:399` |
| Kondisi Aktual | Penyelesaian otomatis dan konfirmasi pembeli memakai `updated_at` sebagai titik awal 4 jam, bukan waktu pesanan berubah menjadi `shipped`. |
| Dampak | Setiap pembaruan baris pesanan, termasuk yang tidak berkaitan dengan pengiriman, mengulang hitungan 4 jam. |
| Bukti | `->where('updated_at', '<=', now()->subHours(4))` |
| Rekomendasi | Pastikan apakah perilaku ini disengaja. Bila tidak, simpan waktu pengiriman di kolom tersendiri. |
| Keputusan | Diselesaikan 20 November 2026: Ditambahkan migrasi kolom timestamp `shipped_at` (nullable) pada tabel `orders` yang diisi secara otomatis via model lifecycle hook saat pesanan berpindah ke status `shipped`. Perhitungan ambang batas 4 jam pada `Order::canBuyerComplete()` serta scheduler `auto-complete-shipped-orders` di `routes/console.php` kini dihitung berbasis `shipped_at` (dengan fallback `updated_at` untuk data lawas), sehingga pembaruan data pesanan lain tidak lagi mengulang durasi 4 jam. |
