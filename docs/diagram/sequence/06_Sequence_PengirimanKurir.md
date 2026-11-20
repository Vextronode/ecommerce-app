# Sequence 06 - Serah Terima, Pelacakan, dan PIN Kurir

| Field | Detail |
|---|---|
| Proses BW | 6. Pemrosesan Pesanan dan Pengiriman |
| Aktor | Pedagang, Kurir Toko, Pembeli |
| Sumber | `app/Http/Controllers/Merchant/OrderController.php` (`index`, `generateBatchHandover`), `app/Http/Controllers/DeliveryTrackerController.php` (`handover`, `acceptHandover`, `show`, `updateLocation`, `markArrived`, `complete`), `app/Events/OrderStatusUpdated.php`, `app/Events/DriverLocationBroadcasted.php` |

```mermaid
sequenceDiagram
    actor M as Pedagang
    actor K as Kurir Toko
    participant APP as Laravel
    participant DB as DB
    participant C as Cache dan Sesi
    participant RV as Reverb
    actor P as Pembeli

    M->>APP: Buka daftar pesanan
    APP-->>M: QR berisi URL serah terima bertanda tangan, berlaku 24 jam
    K->>APP: Pindai QR, GET /tracker/{invoice}/handover
    APP->>C: Simpan sesi serah terima 30 menit
    APP-->>K: Halaman konfirmasi serah terima
    K->>APP: POST accept-handover
    APP->>APP: Cek sesi, pesanan non-COD sudah paid, stok cukup
    APP->>DB: Status shipped, buat PIN bila kosong
    APP->>C: Tandai perangkat sebagai kurir pesanan ini
    APP->>RV: OrderStatusUpdated
    APP-->>K: Redirect ke halaman pelacakan

    loop Selama pengantaran
        K->>APP: POST lokasi GPS
        APP->>C: Simpan lokasi terakhir
        APP->>RV: DriverLocationBroadcasted ke order-tracking
        RV-->>P: Posisi kurir di peta
    end

    K->>APP: POST arrive
    APP->>C: Simpan penanda tiba, 7 hari
    APP->>RV: OrderStatusUpdated
    APP-->>P: Notifikasi kurir telah tiba

    P->>K: Sebutkan PIN
    K->>APP: POST complete dengan PIN
    alt 5 percobaan salah dalam 5 menit
        APP-->>K: Ditolak sementara
    else PIN salah
        APP-->>K: PIN tidak cocok
    else PIN benar
        APP->>DB: Status delivered
        alt COD
            APP->>DB: payment_status paid
        else Non-COD
            APP->>DB: Pindahkan saldo ke available_balance
        end
        APP->>RV: OrderStatusUpdated
        APP-->>P: Notifikasi pesanan selesai
    end
```

Serah terima batch memakai alur yang sama dengan satu QR induk (`/tracker/batch/{batch_token}`) untuk beberapa pesanan `local_delivery` dari toko yang sama. PIN tetap diverifikasi per pesanan.
