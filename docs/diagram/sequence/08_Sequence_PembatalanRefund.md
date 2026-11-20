# Sequence 08 - Pembatalan oleh Pedagang dan Refund

| Field | Detail |
|---|---|
| Proses BW | 8. Pembatalan dan Pengembalian Dana |
| Aktor | Pedagang, Midtrans |
| Sumber | `app/Http/Controllers/Merchant/OrderController.php` (`updateStatus`), `app/Services/MidtransService.php` (`cancelTransaction`, `refundTransaction`), `app/Models/Order.php` (`reversePendingBalance`, `restoreStock`) |

```mermaid
sequenceDiagram
    actor M as Pedagang
    participant APP as Laravel
    participant DB as DB
    participant MT as Midtrans
    participant RV as Reverb
    participant Q as Queue Worker

    M->>APP: PUT status cancelled
    APP->>DB: Mulai transaksi, kunci pesanan
    APP->>APP: Cek pesanan milik toko
    alt Sudah delivered atau cancelled
        APP-->>M: Status tidak dapat diubah
    else Non-COD paid dan sudah shipped
        APP-->>M: Tolak, ajukan pengembalian lewat admin
    else Dapat dibatalkan
        alt Non-COD sudah paid
            APP->>DB: Status cancelled, payment_status refunded
            APP->>DB: reversePendingBalance
            APP->>APP: Siapkan refund dengan ID transaksi induk
        else Non-COD belum dibayar
            APP->>DB: Status cancelled, payment_status failed
            APP->>DB: Cek pesanan lain yang masih aktif dalam checkout yang sama
            APP->>APP: Siapkan pembatalan transaksi bila tidak ada
        else COD
            APP->>DB: Status cancelled, payment_status failed
        end
        APP->>DB: restoreStock
        APP->>Q: Notifikasi pesanan dibatalkan
        APP->>RV: OrderStatusUpdated
        APP->>DB: Commit
    end

    opt Pembatalan transaksi disiapkan
        APP->>MT: Cancel transaksi induk
    end
    opt Refund disiapkan
        APP->>MT: Refund transaksi induk tanpa nominal
        alt Midtrans menjawab
            MT-->>APP: Hasil refund
            APP-->>M: Status berhasil diperbarui
        else Tidak ada jawaban
            APP->>DB: Tandai needs_reconciliation pada payment_payload
            APP-->>M: Dibatalkan, refund menunggu rekonsiliasi admin
        end
    end
```

Panggilan ke Midtrans dilakukan setelah transaksi database selesai. Notifikasi `refund` yang kemudian dikirim Midtrans diproses oleh Sequence 04.
