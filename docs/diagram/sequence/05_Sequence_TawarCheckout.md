# Sequence 05 - Tawar-Menawar sampai Keranjang

| Field | Detail |
|---|---|
| Proses BW | 5. Tawar-Menawar Harga |
| Aktor | Pembeli, Pedagang |
| Sumber | `app/Http/Controllers/Storefront/NegotiationController.php` (`store`, `acceptCounter`, `rejectCounter`, `checkout`), `app/Http/Controllers/Merchant/NegotiationController.php` (`accept`, `reject`, `counter`), `app/Events/NegotiationUpdatedEvent.php`, `app/Events/NewChatMessageEvent.php` |

```mermaid
sequenceDiagram
    actor P as Pembeli
    participant APP as Laravel
    participant DB as DB
    participant RV as Reverb
    actor M as Pedagang

    P->>APP: POST /chat/rooms/{room}/negotiate
    APP->>APP: Cek enable_negotiation, toko aktif, bukan toko sendiri
    APP->>APP: Cek harga di bawah harga asli dan minimal 30 persen, jumlah tidak melebihi stok
    APP->>DB: Cek tidak ada tawaran pending atau countered untuk produk yang sama
    APP->>DB: Simpan tawaran pending, expires_at 24 jam, dan pesan bertipe negotiation
    APP->>RV: NewChatMessageEvent
    RV-->>M: Tawaran baru di obrolan

    alt Pedagang menerima
        M->>APP: POST accept
        APP->>DB: Status accepted
    else Pedagang menolak
        M->>APP: POST reject
        APP->>DB: Status rejected
    else Pedagang menawar balik
        M->>APP: POST counter dengan harga minimal Rp100
        APP->>DB: Status countered, counter_price, expires_at 24 jam
        APP->>RV: NegotiationUpdatedEvent dan NewChatMessageEvent
        RV-->>P: Tawaran balik
        alt Pembeli menerima
            P->>APP: POST accept
            APP->>DB: Status accepted
        else Pembeli menolak
            P->>APP: POST reject
            APP->>DB: Status rejected
        end
    end
    APP->>RV: NegotiationUpdatedEvent dan NewChatMessageEvent

    P->>APP: POST /chat/negotiations/{id}/checkout
    APP->>DB: Kunci tawaran
    alt Tawaran accepted, belum kedaluwarsa, belum dibeli, toko aktif, stok cukup
        APP->>DB: Buat atau perbarui keranjang dengan negotiation_id dan jumlah tawaran
        APP-->>P: Lanjut ke checkout
    else Tawaran sudah kedaluwarsa
        APP->>DB: Status expired
        APP-->>P: Tolak
    end
```

Tawaran berubah menjadi `purchased` saat checkout berhasil (Sequence 03), dan harga item pesanan memakai harga hasil tawar.
