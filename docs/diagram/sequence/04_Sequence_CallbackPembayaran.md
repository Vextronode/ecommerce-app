# Sequence 04 - Notifikasi Midtrans dan Kredit Escrow

| Field | Detail |
|---|---|
| Proses BW | 4. Pembayaran dan Escrow |
| Aktor | Pembeli, Midtrans |
| Sumber | `app/Http/Controllers/MidtransCallbackController.php`, `app/Http/Controllers/PaymentController.php` (`show`, `checkStatus`), `app/Services/PaymentSyncService.php` (`applyPaymentStatus`, `syncByMidtransOrderId`), `resources/js/Pages/Payment/Show.tsx` |

```mermaid
sequenceDiagram
    actor P as Pembeli
    participant BR as Browser
    participant MT as Midtrans
    participant APP as Laravel
    participant PS as PaymentSyncService
    participant DB as DB
    participant Q as Queue Worker

    P->>MT: Bayar via VA, QRIS, atau GoPay
    par Notifikasi dari Midtrans
        MT->>APP: POST /api/midtrans/callback
        APP->>APP: Verifikasi signature key
        APP->>DB: Ambil pesanan dengan invoice atau parent_transaction_id sama
        APP->>APP: Cocokkan gross amount dengan total pesanan
        loop Setiap pesanan
            APP->>PS: applyPaymentStatus
        end
        APP-->>MT: 200 OK
    and Polling dari halaman pembayaran
        loop Setiap 4 detik selama belum paid atau failed
            BR->>APP: GET /payment/{order}/check-status
            APP->>MT: Ambil status transaksi, di-cache 3 detik
            MT-->>APP: transaction_status
            APP->>PS: applyPaymentStatus untuk setiap pesanan
            APP-->>BR: Status terbaru
        end
    end

    Note over PS,DB: Di dalam transaksi dengan lock baris pesanan
    alt settlement atau capture dengan fraud accept
        PS->>DB: payment_status paid, isi escrow_credited_at
        PS->>DB: Tambah pending_balance toko sebesar subtotal + ongkir
        PS->>Q: Notifikasi pembayaran diterima
    else expire, cancel, atau deny
        PS->>DB: payment_status failed, pesanan pending menjadi cancelled
        PS->>DB: Kembalikan stok
        PS->>Q: Notifikasi pesanan dibatalkan
    else refund atau partial_refund
        PS->>DB: payment_status refunded, cancelled bila refund penuh
        PS->>DB: Tarik pending_balance atau available_balance
        PS->>DB: Kembalikan stok bila refund penuh dan belum delivered
    end
```

Notifikasi yang sama dapat diterima lebih dari sekali. Penanda `escrow_credited_at` mencegah saldo dikreditkan dua kali.
