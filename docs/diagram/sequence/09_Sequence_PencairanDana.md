# Sequence 09 - Pencairan Dana dan Rekonsiliasi

| Field | Detail |
|---|---|
| Proses BW | 9. Pencairan Saldo Pedagang |
| Aktor | Pedagang, Scheduler, Admin |
| Sumber | `app/Http/Controllers/Merchant/WithdrawalController.php` (`store`), `app/Jobs/ProcessWithdrawalPayout.php`, `app/Services/MidtransIrisService.php`, `app/Console/Commands/ReconcileWithdrawals.php`, `app/Console/Commands/AlertStuckWithdrawals.php`, `routes/console.php` |

```mermaid
sequenceDiagram
    actor M as Pedagang
    participant APP as Laravel
    participant DB as DB
    participant Q as Queue Worker
    participant IRIS as Midtrans IRIS
    participant SCH as Scheduler
    actor ADM as Admin

    M->>APP: POST /pedagang/withdrawals dengan nominal
    APP->>APP: Cek enable_withdrawal, rekening lengkap, nominal minimal Rp10.000
    APP->>DB: Mulai transaksi, kunci toko
    APP->>APP: Cek cooldown 30 menit perubahan rekening
    APP->>DB: Cek tidak ada pencairan pending atau processing
    APP->>DB: Kurangi available_balance, buat withdrawal pending
    APP->>DB: Commit
    APP->>Q: Kirim job ProcessWithdrawalPayout
    APP-->>M: Pengajuan diterima

    Q->>DB: Status processing, isi payout_sent_at
    Q->>IRIS: Buat payout
    alt Berhasil
        IRIS-->>Q: Payout diterima
        Q->>DB: Status completed
        Q-->>M: Notifikasi pencairan berhasil
    else Ditolak rate limit atau koneksi gagal sebelum terkirim
        Q->>DB: Kembali ke pending, kosongkan payout_sent_at
        Q->>Q: Ulangi hingga 3 kali dengan jeda 60, 180, 300 detik
        alt Rate limit setelah 3 kali
            Q->>DB: Status failed dengan needs_reconciliation, saldo tidak dikembalikan
        else Gagal lain yang pasti belum terkirim
            Q->>DB: Status failed, kembalikan available_balance
        end
    else Respons ambigu atau mungkin sudah terkirim
        Q->>DB: Tetap processing dengan payout_sent_at, menunggu rekonsiliasi
    end

    loop Setiap 15 menit
        SCH->>DB: Ambil pencairan processing atau failed dengan needs_reconciliation
        SCH->>IRIS: Cek status payout
        SCH->>DB: Perbarui status, kembalikan saldo bila payout gagal
        SCH->>DB: Ambil pencairan tersebut yang tertahan lebih dari 30 menit
        SCH-->>ADM: Peringatan pencairan tertahan
    end
```
