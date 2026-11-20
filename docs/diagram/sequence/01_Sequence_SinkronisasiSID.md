# Sequence 01 - Sinkronisasi SID dan Pembuatan Akun Pedagang

| Field | Detail |
|---|---|
| Proses BW | 1. Pendaftaran Pedagang melalui SID |
| Aktor | Scheduler, Admin |
| Sumber | `routes/console.php`, `app/Jobs/SyncSidSellerApplicationsJob.php`, `app/Services/Sid/SidApiService.php`, `app/Http/Controllers/Admin/MerchantController.php` (`store`, `rejectApplication`), `app/Events/NewSellerApplicationEvent.php` |

```mermaid
sequenceDiagram
    participant SCH as Scheduler
    participant JOB as SyncSidSellerApplicationsJob
    participant SID as API SIDUTama
    participant DB as DB
    participant RV as Reverb
    actor ADM as Admin
    participant APP as Laravel

    loop Setiap 2 menit
        SCH->>JOB: Jalankan job
        JOB->>SID: Ambil permohonan pending, per halaman
        SID-->>JOB: Daftar permohonan
        JOB->>DB: Simpan atau perbarui seller_applications
        JOB->>RV: NewSellerApplicationEvent ke channel admin-notifications
        JOB->>DB: Cari permohonan lokal pending yang tidak ada di daftar
        loop Setiap permohonan tersebut
            JOB->>SID: Ambil detail permohonan
            alt Status di SID accepted atau rejected
                JOB->>DB: Salin status, decided_at, dan note
            else Permohonan dibatalkan warga
                JOB->>DB: Tandai cancelled dan hapus data pribadi
            end
        end
    end

    ADM->>APP: Buka formulir pedagang dari permohonan
    APP-->>ADM: Formulir terisi data SID
    alt Admin menyetujui
        ADM->>APP: Kirim nama toko, NIK, email, password awal, business_ref
        APP->>DB: Mulai transaksi
        APP->>SID: Laporkan status accepted
        alt SID menyatakan permohonan sudah dibatalkan
            SID-->>APP: Dibatalkan
            APP->>DB: Rollback, tandai permohonan cancelled dan hapus data pribadi
            APP-->>ADM: Akun tidak dapat dibuat
        else SID menerima
            SID-->>APP: Berhasil
            APP->>DB: Buat user role pedagang, status active, is_password_changed false
            APP->>DB: Buat toko dengan sid_status verified
            APP->>DB: Tandai permohonan accepted, isi store_id dan user_id
            APP->>DB: Commit
            APP-->>ADM: Pedagang berhasil dibuat
        end
    else Admin menolak
        ADM->>APP: Tolak permohonan dengan alasan 3 sampai 500 karakter
        APP->>SID: Laporkan status rejected beserta alasan
        APP->>DB: Tandai permohonan rejected
        APP-->>ADM: Permohonan ditolak
    end
```

Status `accepted` dilaporkan ke SID di dalam transaksi database, sebelum akun lokal dibuat. Bila pelaporan gagal, transaksi dibatalkan dan akun tidak dibuat.
