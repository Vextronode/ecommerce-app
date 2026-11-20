# Sequence 03 - Checkout dan Charge Midtrans

| Field | Detail |
|---|---|
| Proses BW | 3. Belanja dan Checkout |
| Aktor | Pembeli |
| Sumber | `app/Http/Controllers/CheckoutController.php` (`store`, `calculateShippingCost`), `app/Services/MidtransService.php` (`chargeCoreApi`), `app/Services/OrderNotificationService.php`, `app/Models/PlatformSetting.php` |

```mermaid
sequenceDiagram
    actor P as Pembeli
    participant BR as Browser
    participant APP as Laravel
    participant DB as DB
    participant MT as Midtrans Core API
    participant Q as Queue Worker

    P->>BR: Pilih alamat, pengiriman, dan pembayaran
    BR->>APP: POST /checkout
    APP->>APP: Validasi input dan saklar enable_online_payment serta enable_local_delivery
    APP->>DB: Mulai transaksi
    APP->>DB: Kunci produk urut id, lalu kunci keranjang
    loop Setiap toko dalam keranjang
        APP->>APP: Cek toko verified, pemilik aktif, bukan toko sendiri
        loop Setiap item
            APP->>APP: Cek produk aktif, varian valid, stok cukup, harga tawar
        end
        APP->>APP: Hitung ongkir, biaya layanan, pajak, total
        APP->>DB: Buat orders dan order_items, isi shipping_pin
        APP->>DB: Kurangi stok SKU dan produk, tandai tawaran purchased, hapus keranjang
    end
    APP->>DB: Commit

    alt Pembayaran non-COD
        APP->>MT: Charge sebesar total seluruh pesanan
        alt Charge berhasil
            MT-->>APP: order_id, nomor VA atau QR, batas waktu
            APP->>DB: Simpan parent_transaction_id dan data pembayaran ke setiap pesanan
            APP->>Q: Notifikasi pesanan dibuat
            APP-->>BR: Redirect ke halaman pembayaran
        else Charge gagal
            APP->>DB: Batalkan pesanan, status failed, kembalikan stok
            APP-->>BR: Redirect ke keranjang dengan pesan galat
        end
    else COD
        APP->>Q: Notifikasi pesanan dibuat
        APP-->>BR: Redirect ke halaman pesanan berhasil
    end
```

PIN serah terima dibuat saat pesanan dibuat dan dapat dibuat ulang saat pesanan dikirim bila masih kosong.
