# Temuan - Checkout dan Pembayaran

## CHK-01 Refund pembatalan pedagang memakai ID transaksi induk tanpa nominal

| Field | Isi |
|---|---|
| Keparahan | High |
| Status | Terbuka |
| Lokasi | `app/Http/Controllers/Merchant/OrderController.php:236`, `:278`; `app/Services/MidtransService.php:314`; `app/Services/PaymentSyncService.php` (cabang `refund`/`partial_refund`) |
| Kondisi Aktual | Saat pedagang membatalkan pesanan non-COD yang sudah `paid`, pesanan lebih dulu ditandai `cancelled` dan `refunded`, dan saldo escrow toko ditarik di dalam transaksi database. Setelah itu sistem mengirim refund ke Midtrans memakai `parent_transaction_id` tanpa parameter `amount`. Satu checkout multi-toko dibayar dengan satu charge, sehingga `parent_transaction_id` mewakili gabungan pesanan semua toko. Bila Midtrans menolak atau tidak menjawab, sistem hanya menulis `needs_reconciliation` ke dalam JSON `payment_payload` dan ke log. Penanda ini tidak dibaca di panel admin. Callback dan sinkronisasi status menerapkan status `refund` maupun `partial_refund` ke semua pesanan dengan `parent_transaction_id` yang sama. |
| Dampak | Bergantung metode pembayaran. (1) Virtual Account (BCA, BNI, BRI, Permata, Mandiri Bill; metode awal di checkout): Midtrans tidak menyediakan refund melalui API untuk bank transfer, sehingga refund selalu gagal. Pesanan tercatat `refunded` padahal dana belum kembali ke pembeli, dan tidak ada tampilan di panel admin untuk menindaklanjutinya. (2) QRIS dan GoPay: tanpa `amount`, Midtrans mengembalikan seluruh nilai transaksi. Pembatalan oleh satu toko mengembalikan dana seluruh checkout, lalu notifikasi `refund` mengubah pesanan toko lain menjadi `refunded` dan `cancelled` serta menarik saldonya, termasuk yang sudah dikirim atau selesai. Bila nominal dikirim pun, cabang `partial_refund` tetap menandai semua pesanan dalam checkout sebagai `refunded` dan menarik saldonya. |
| Bukti | `refundTransaction($midtransOrderIdToRefund)` dipanggil dengan satu argumen; bila `$amount` bernilai `null`, parameter refund hanya berisi `refund_key` dan `reason`. Kegagalan ditangkap `catch (\Exception $e)` dan mengembalikan `null`. Pencarian `needs_reconciliation` di `app/Http/Controllers/Admin` dan `resources/js/Pages/Admin` hanya menemukan penggunaan untuk pencairan dana. |
| Referensi | Midtrans Refund API: "Amount to be refunded. By default whole transaction amount is refunded." dan refund hanya didukung untuk `credit_card`, `gopay`, `shopeepay`, `dana`, `ovo`, `QRIS`, `kredivo`, `akulaku` ([Refund Transactions](https://docs.midtrans.com/reference/refund-transaction)). Bank Transfer (Permata, Mandiri Bill, BNI, BCA, BRI) ditandai tidak dapat di-refund; GoPay dan QRIS mendukung refund penuh maupun sebagian ([What payment method that have refund feature?](https://docs.midtrans.com/docs/what-payment-method-that-have-refund-feature)). Midtrans mengirim dua notifikasi refund, tanpa dan dengan `bank_confirmed_at`. |
| Rekomendasi | (1) Untuk QRIS dan GoPay, kirim `amount` sebesar `total_amount` pesanan yang dibatalkan, dan terapkan notifikasi `partial_refund` hanya ke pesanan yang dibatalkan. (2) Untuk Virtual Account, sediakan alur refund manual oleh pengelola dan tampilkan pesanan yang menunggu refund di panel admin. (3) Tandai pesanan `refunded` setelah refund terkonfirmasi, bukan sebelum permintaan dikirim. |

## CHK-05 Pengalihan ke COD membatalkan transaksi gabungan tetapi hanya mengubah satu pesanan

| Field | Isi |
|---|---|
| Keparahan | High |
| Status | Terbuka (jalur notifikasi webhook: Perlu konfirmasi) |
| Lokasi | `app/Http/Controllers/PaymentController.php:110` (`switchToCod`); `app/Http/Controllers/PaymentController.php` (`show`, `checkStatus`); `app/Services/PaymentSyncService.php` (`syncByMidtransOrderId`, cabang `cancel`); `app/Http/Controllers/MidtransCallbackController.php` |
| Kondisi Aktual | `switchToCod` membatalkan transaksi Midtrans memakai `parent_transaction_id`, lalu mengubah `payment_method` dan `payment_channel` hanya pada satu pesanan. Pembatalan berlaku untuk seluruh transaksi gabungan, sehingga pesanan lain dari checkout yang sama tetap non-COD dengan transaksi yang sudah dibatalkan. Pesanan yang dialihkan tetap menyimpan `parent_transaction_id`. Sinkronisasi status (`syncByMidtransOrderId`) dan callback menerapkan status ke semua pesanan dengan `parent_transaction_id` yang sama, tanpa memeriksa `payment_method`. Status `cancel` mengubah pesanan yang belum dibayar menjadi `failed`, membatalkan yang masih `pending`, dan mengembalikan stok. Proses ini tidak berjalan di dalam transaksi database atau lock. |
| Dampak | (1) Checkout multi-toko, terkonfirmasi dari kode: halaman pembayaran pesanan lain yang masih non-COD meminta status ke Midtrans setiap 4 detik, menerima `cancel`, lalu membatalkan semua pesanan dengan `parent_transaction_id` yang sama, termasuk pesanan yang baru dialihkan ke COD. (2) Checkout satu toko: pesanan COD ikut dibatalkan bila Midtrans mengirim notifikasi webhook untuk pembatalan yang dipicu merchant; dokumentasi Midtrans tidak menyatakannya secara eksplisit. Pada kedua kasus, pesanan lain dari checkout yang sama kehilangan sarana pembayaran tanpa pemberitahuan. |
| Bukti | `$midtransService->cancelTransaction($midtransOrderId); $order->update(['payment_method' => 'cod', 'payment_channel' => 'cod']);` dan `Order::where('parent_transaction_id', $midtransOrderId)` di `syncByMidtransOrderId`. |
| Referensi | Cancel API: "Payment with `transaction_status:pending` can be voided with cancel method if the transaction has not expired or has not been completed." ([Cancel Transaction](https://docs.midtrans.com/reference/cancel-transaction)). Notifikasi dikirim "when the customer completes the payment process or when transaction status changes" ([HTTP(S) Notification / Webhooks](https://docs.midtrans.com/docs/https-notification-webhooks)); halaman tersebut tidak menyebut secara khusus pembatalan yang dipicu merchant. |
| Rekomendasi | Alihkan seluruh pesanan dalam satu checkout sekaligus, atau lepaskan pesanan yang dialihkan dari `parent_transaction_id`. Lewati pesanan COD saat menerapkan status dari gateway. Uji perilaku notifikasi pembatalan di sandbox Midtrans. |

## CHK-02 Perhitungan pajak tidak sesuai skema perpajakan mana pun

| Field | Isi |
|---|---|
| Keparahan | Medium |
| Status | Terbuka |
| Lokasi | `app/Http/Controllers/CheckoutController.php:334`; `app/Models/Order.php` (`merchantNetAmount`) |
| Kondisi Aktual | Bila `enable_tax` aktif, `tax_amount = subtotal x tax_percentage / 100` ditambahkan ke tagihan pembeli. Nominal ini tidak termasuk dalam saldo yang dikreditkan ke toko (`subtotal + shipping_cost`), sehingga tertahan di pengelola. Nilai awal `enable_tax` adalah nonaktif. |
| Dampak | Bila diaktifkan, platform memungut "pajak" atas nilai barang milik pedagang tanpa dasar sebagai PKP atau pemungut yang ditunjuk. Analisis lengkap tercatat di `../S&K/01-Workflow-Pajak.md`. |
| Bukti | `$taxAmount = $enableTax ? round(($subtotal * $taxPercentage) / 100, 2) : 0;` |
| Rekomendasi | Pertahankan `enable_tax` nonaktif sampai alur pada `../S&K/01-Workflow-Pajak.md` diimplementasikan. |

## CHK-03 Nilai default kolom pesanan berbeda dengan nilai yang diterima checkout

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `database/migrations/2026_07_09_160903_create_orders_table.php`; `app/Http/Controllers/CheckoutController.php:158-159` |
| Kondisi Aktual | Default `orders.delivery_method` adalah `Standard` dan default `orders.payment_method` adalah `COD`. Checkout hanya menerima `local_delivery`/`self_pickup` dan `va`/`qris`/`gopay`/`cod` (huruf kecil). |
| Dampak | Saat ini pesanan hanya dibuat melalui checkout, yang selalu mengisi kedua kolom, sehingga nilai default tidak terpakai. Nilai default baru berlaku bila pesanan dibuat lewat jalur lain (misalnya input langsung ke database atau fitur baru) tanpa mengisi kolom tersebut, dan nilainya tidak dikenali oleh pengecekan seperti `payment_method === 'cod'`. |
| Bukti | `$table->string('delivery_method')->default('Standard');` dan `$table->string('payment_method')->default('COD');` |
| Rekomendasi | Samakan default dengan nilai yang dipakai aplikasi. |

## CHK-04 Tipe kolom `payment_status` berbeda antara MySQL dan driver lain

| Field | Isi |
|---|---|
| Keparahan | Low |
| Status | Terbuka |
| Lokasi | `database/migrations/2026_07_22_210000_change_payment_status_column_type_in_orders_table.php`; `2026_10_12_120000_ensure_refunded_payment_status_is_supported.php` |
| Kondisi Aktual | `payment_status` dibuat sebagai ENUM, lalu diubah ke VARCHAR(50) melalui `ALTER TABLE ... MODIFY` yang dijalankan hanya bila driver adalah MySQL. Pada SQLite (dipakai test suite di CI) kolom tetap dibatasi pada empat nilai awal ENUM. |
| Dampak | Lingkungan test tidak identik dengan production. Nilai status baru di luar empat nilai awal akan lolos di MySQL tetapi gagal di SQLite. |
| Bukti | `DB::statement("ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'pending'")` |
| Rekomendasi | Gunakan perubahan kolom yang berlaku lintas driver, atau catat perbedaan ini pada panduan testing. |
