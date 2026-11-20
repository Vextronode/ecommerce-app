# Sequence 07 - Penyelesaian Pesanan dan Kredit Saldo

| Field | Detail |
|---|---|
| Proses BW | 7. Penyelesaian Pesanan dan Ulasan |
| Aktor | Pembeli, Scheduler |
| Sumber | `routes/console.php` (jadwal `auto-complete-shipped-orders`), `app/Models/Order.php` (`canBuyerComplete`, `autoCompleteDelivery`, `creditStoreBalance`), `app/Http/Controllers/OrderHistoryController.php` (`complete`) |

```mermaid
sequenceDiagram
    actor P as Pembeli
    participant SCH as Scheduler
    participant APP as Laravel
    participant DB as DB
    participant Q as Queue Worker

    alt Konfirmasi oleh pembeli
        P->>APP: POST /history/{order}/complete
        APP->>DB: Kunci pesanan
        APP->>APP: canBuyerComplete
        Note right of APP: shipped, non-COD, paid, dan ambil sendiri atau kurir sudah tiba atau sudah 4 jam
        alt Memenuhi syarat
            APP->>DB: Status delivered
            APP->>DB: creditStoreBalance
            APP-->>P: Pesanan selesai
        else Tidak memenuhi syarat
            APP-->>P: Pesan galat
        end
    else Penyelesaian otomatis
        loop Setiap 15 menit
            SCH->>DB: Ambil pesanan shipped, local_delivery, non-COD, paid, updated_at lebih dari 4 jam
            loop Setiap pesanan, per 50
                SCH->>APP: autoCompleteDelivery
                APP->>DB: Kunci dan cek ulang syarat
                APP->>DB: Status delivered
                APP->>DB: creditStoreBalance
                APP->>Q: Notifikasi pesanan selesai
            end
        end
    end

    Note over APP,DB: creditStoreBalance di dalam transaksi
    APP->>DB: Lewati bila balance_credited_at terisi, COD, atau escrow belum dikredit
    APP->>DB: Kurangi pending_balance, tambah available_balance sebesar subtotal + ongkir
    APP->>DB: Isi balance_credited_at
```
