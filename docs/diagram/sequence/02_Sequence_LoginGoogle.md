# Sequence 02 - Login dan Penautan Akun Google

| Field | Detail |
|---|---|
| Proses BW | 12. Akun dan Autentikasi |
| Aktor | Pengguna (pembeli atau pedagang) |
| Sumber | `app/Http/Controllers/Auth/SocialiteController.php`, `routes/web.php` (rute `/auth/google/*`), `docs/PANDUAN_AKUN_DAN_AUTENTIKASI.md` |

```mermaid
sequenceDiagram
    actor U as Pengguna
    participant BR as Browser
    participant APP as Laravel
    participant G as Google OAuth
    participant DB as DB
    participant C as Cache

    U->>BR: Klik Masuk dengan Google
    BR->>APP: GET /auth/google/redirect
    APP-->>BR: Redirect ke Google
    BR->>G: Login dan izinkan akses
    G-->>BR: Redirect ke /auth/google/callback
    BR->>APP: GET /auth/google/callback
    APP->>G: Ambil profil pengguna
    G-->>APP: Email, status verifikasi email, google_id
    alt Email belum terverifikasi atau google_id milik email lain
        APP-->>BR: Kembali ke /login dengan pesan galat
    else Email terverifikasi
        APP->>DB: Cari user berdasarkan email
        alt User belum ada
            APP->>DB: Buat user role user dengan google_id
            APP-->>BR: Login, redirect ke dashboard
        else User admin, suspended, atau inactive
            APP-->>BR: Tolak dengan pesan galat
        else google_id sama
            APP-->>BR: Login sesuai peran
        else google_id kosong
            APP->>C: Simpan intent tautan dengan nonce, berlaku 10 menit
            APP-->>BR: Redirect ke halaman konfirmasi tautan
            U->>BR: Masukkan password akun
            BR->>APP: POST /auth/google/link-confirm dengan password dan nonce
            APP->>C: Ambil dan hapus intent
            alt Nonce dan password cocok
                APP->>DB: Isi google_id pada user
                APP-->>BR: Login sesuai peran
            else Tidak cocok atau kedaluwarsa
                APP-->>BR: Tolak dengan pesan galat
            end
        else google_id berbeda
            APP-->>BR: Tolak, akun sudah tertaut ke Google lain
        end
    end
```

Setelah login, sesi diregenerasi. Pedagang diarahkan ke halaman penyiapan toko bila password awal belum diganti, atau ke dashboard pedagang. Peran lain diarahkan ke dashboard pembeli.
