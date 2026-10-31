# Panduan Deployment Server Production — Cibenda Mart

Dokumen ini merupakan panduan teknis resmi untuk melakukan deployment platform Cibenda Mart pada server production menggunakan Docker Compose, Nginx Reverse Proxy, dan SSL/TLS Let's Encrypt.

---

## 1. Arsitektur Sistem & Alokasi Jaringan

Platform Cibenda Mart dibangun dengan arsitektur multi-container yang saling terisolasi dalam satu jaringan internal Docker bridge.

```text
                                [ INTERNET / PENGGUNA ]
                                          |
                                          | Port 80 (HTTP) -> Redirect ke 443
                                          | Port 443 (HTTPS & WSS)
                                          v
                         +---------------------------------+
                         |      NGINX REVERSE PROXY        |
                         |  (Host System / VPS Port 80/443)|
                         +---------------------------------+
                                    |             |
           Traffic Web (HTTP / API) |             | Traffic WebSocket (/app)
       proxy_pass http://127.0.0.1:8000           | proxy_pass http://127.0.0.1:8080
                                    v             v
       +-------------------------------+       +-------------------------------+
       |          app_cibenda          |       |        reverb_cibenda         |
       |  Laravel 11 + Inertia + React |       |     Laravel Reverb Server     |
       |      (Port Internal: 8000)    |       |      (Port Internal: 8080)    |
       +-------------------------------+       +-------------------------------+
                     |                                         |
                     |--------+                     +----------|
                     v        v                     v          v
       +-------------------------+             +-------------------------+
       |       db_cibenda        |             |      redis_cibenda      |
       |        MySQL 8.0        |             |      Redis Alpine       |
       |  (Port Host: 127.0.0.1:3307)          |  (Port Host: 127.0.0.1:6379)   |
       +-------------------------+             +-------------------------+
                     ^                                         ^
                     |                 queue_cibenda           |
                     +-----------------------------------------+
                                 Laravel Queue Worker
                               (Background FCM & Mail)
```

### Tabel Rincian Port

#### A. Port Publik (Firewall / Inbound VPS)
Port yang wajib dibuka pada firewall server (UFW / Security Group):

| Port | Protokol | Layanan | Fungsi & Keterangan |
|---|---|---|---|
| **80** | TCP | HTTP | Digunakan untuk validasi Certbot SSL dan redirect otomatis ke port 443 (HTTPS). |
| **443** | TCP | HTTPS / WSS | Pintu masuk utama seluruh lalu lintas web terenkripsi dan koneksi aman WebSocket. |
| **22** | TCP | SSH | Akses terminal jarak jauh untuk administrator server. |

#### B. Port Internal Loopback Host (`127.0.0.1`)
Port yang hanya diikat ke loopback lokal dan **tidak boleh** dibuka ke publik:

| Service Container | Port Host | Port Container | Fungsi |
|---|---|---|---|
| **`app_cibenda`** | `127.0.0.1:8000` | `8000` | Melayani request HTTP Laravel, API, dan halaman Inertia React. |
| **`reverb_cibenda`** | `127.0.0.1:8080` | `8080` | Melayani koneksi WebSocket realtime (chat, negosiasi harga, live GPS tracking). |
| **`db_cibenda`** | `127.0.0.1:3307` | `3306` | Database MySQL 8.0 (di-map ke 3307 untuk menghindari bentrok jika host memiliki MySQL lokal). |
| **`redis_cibenda`** | `127.0.0.1:6379` | `6379` | Cache in-memory, session store, dan antrean queue worker. |
| **`queue_cibenda`** | Tidak ada | Tidak ada | Worker background mandiri tanpa port terbuka (memproses notifikasi FCM dan email). |

---

## 2. Prasyarat Server

- **Sistem Operasi**: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS / Debian 12.
- **Spesifikasi Minimal**:
  - 2 vCPU
  - 2 GB RAM (disarankan 4 GB untuk kelancaran compile container)
  - 20 GB SSD Storage
- **Domain & DNS**:
  - A Record domain (misal `cimart.domainanda.com`) sudah diarahkan ke alamat IP Publik VPS.

---

## 3. Langkah-Langkah Deployment

### Langkah 1: Persiapan Sistem & Firewall
Update sistem operasi dan aktifkan firewall dasar:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw nginx certbot python3-certbot-nginx

# Konfigurasi Firewall UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

### Langkah 2: Instalasi Docker Engine & Docker Compose Plugin
Gunakan skrip instalasi resmi dari Docker:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```
*Catatan: Setelah menjalankan `usermod`, logout dari terminal lalu login kembali agar grup docker aktif.*

### Langkah 3: Unduh Repositori Project
Clone project ke direktori web `/var/www`:

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone https://github.com/Vextronode/ecommerce-app.git cibenda-mart
cd /var/www/cibenda-mart
```

### Langkah 4: Konfigurasi Environment Production (`.env.docker`)
Periksa dan sesuaikan file `.env.docker`:

```bash
nano .env.docker
```

Pastikan variabel-variabel kunci berikut disesuaikan:

```ini
APP_NAME="Cibenda Mart"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cimart.domainanda.com

# Database (Sesuai kredensial container db_cibenda)
DB_CONNECTION=mysql
DB_HOST=db_cibenda
DB_PORT=3306
DB_DATABASE=cibenda_mart
DB_USERNAME=cibenda_user
DB_PASSWORD=GantiDenganPasswordDatabaseAman
MYSQL_ROOT_PASSWORD=GantiDenganPasswordRootAman

# Redis
SESSION_DRIVER=redis
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis_cibenda
REDIS_PORT=6379

# Reverb WebSocket
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=584029
REVERB_APP_KEY=cimart_reverb_key_892147
REVERB_APP_SECRET=cimart_reverb_secret_389104
REVERB_HOST="cimart.domainanda.com"
REVERB_PORT=443
REVERB_SCHEME=https
REVERB_SERVER_HOST=reverb_cibenda
REVERB_SERVER_PORT=8080
REVERB_SERVER_SCHEME=http

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"

# Integrasi Eksternal (Midtrans, FCM, OAuth, Mail)
GOOGLE_REDIRECT_URI="https://cimart.domainanda.com/auth/google/callback"
```

### Langkah 5: Build dan Jalankan Container Docker
Jalankan proses build container:

```bash
docker compose up -d --build
```

Pastikan seluruh 5 container berstatus sehat (`Up` atau `healthy`):

```bash
docker compose ps
```

### Langkah 6: Konfigurasi Nginx Reverse Proxy
Buat file virtual host Nginx untuk menangani traffic HTTP biasa dan WebSocket upgrade:

```bash
sudo nano /etc/nginx/sites-available/cibenda-mart
```

Masukkan konfigurasi berikut (ganti `cimart.domainanda.com` dengan domain Anda):

```nginx
# Map untuk menangani HTTP Connection header pada WebSocket
map $http_upgrade $connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    listen [::]:80;
    server_name cimart.domainanda.com;

    client_max_body_size 30M;

    # 1. Reverse Proxy ke Laravel Web App (Port 8000)
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Reverse Proxy ke Laravel Reverb WebSocket (Port 8080)
    location /app {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_connect_timeout 60s;
    }
}
```

Aktifkan konfigurasi Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/cibenda-mart /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Langkah 7: Pasang Sertifikat SSL / TLS (Certbot)
Jalankan Certbot untuk memperoleh dan mengonfigurasi sertifikat SSL otomatis:

```bash
sudo certbot --nginx -d cimart.domainanda.com
```

Pilih opsi redirect HTTP ke HTTPS secara otomatis jika diminta.

---

## 4. Prosedur Operasional & Pemeliharaan

### Memantau Log Container
Untuk melihat log aktivitas aplikasi atau mendiagnosis error secara realtime:

```bash
# Log aplikasi web Laravel
docker compose logs -f app_cibenda

# Log server WebSocket Reverb
docker compose logs -f reverb_cibenda

# Log antrean background jobs
docker compose logs -f queue_cibenda
```

### Memperbarui Aplikasi (Update Kode Baru)
Saat ada commit baru di branch `main` atau `dev`:

```bash
cd /var/www/cibenda-mart
git pull origin main
docker compose up -d --build
```

### Menjalankan Perintah Artisan di Container
Jika perlu menjalankan migrasi database atau seeder secara manual:

```bash
# Menjalankan migrasi database
docker compose exec app_cibenda php artisan migrate --force

# Menjalankan database seeder
docker compose exec app_cibenda php artisan db:seed --force

# Membersihkan seluruh cache sistem
docker compose exec app_cibenda php artisan optimize:clear
```

### Backup Database MySQL
Untuk membuat backup database dari container MySQL:

```bash
docker compose exec db_cibenda mysqldump -u cibenda_user -p cibenda_mart > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## 5. Troubleshooting Masalah Umum

### 1. WebSocket Error: Connection Failed (Error 1006)
- Pastikan konfigurasi Nginx memiliki blok `location /app` dengan header `Upgrade` dan `Connection $connection_upgrade`.
- Pastikan di file `.env.docker`, nilai `REVERB_HOST` adalah domain publik Anda dan `REVERB_PORT=443` dengan `REVERB_SCHEME=https`.

### 2. Error Saat Build: Cannot find module rolldown-binding
- Masalah ini terjadi jika direktori `node_modules` dari komputer lokal ikut tersalin ke dalam container.
- Pastikan file `.dockerignore` ada di root project dan mengecualikan folder `node_modules`, `vendor`, `.git`, dan `.env`.

### 3. File Upload Gagal (Ukuran Melebihi Batas)
- Periksa konfigurasi `client_max_body_size` pada Nginx (default konfigurasi: `30M`).
- Pada `Dockerfile`, batas upload PHP sudah diatur ke `upload_max_filesize = 25M` dan `post_max_size = 30M`.

