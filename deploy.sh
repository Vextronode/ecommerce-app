#!/usr/bin/env bash
set -e

echo "Building"
# validasi config .env.docker
if [ ! -f .env.docker ]; then
    echo "Error: Berkas .env.docker tidak ditemukan!"
    echo "Salin .env.docker.example ke .env.docker dan lengkapi kredensial terlebih dahulu."
    exit 1
fi

# Build dan run semua multi container
echo "Building & starting Docker containers..."
docker compose up -d --build --remove-orphans

# init
echo "Menunggu inisialisasi container..."
sleep 5

# status
echo "Status Seluruh Container:"
docker compose ps

echo "Deployment selesai! Semua 6 container aktif."
echo "  - app_cibenda: Web HTTP & API"
echo "  - reverb_cibenda: WebSocket Reverb"
echo "  - queue_cibenda: Worker Background Queue"
echo "  - scheduler_cibenda: Task Scheduler (Sync SID otomatis tiap 2 menit)"
echo "  - db_cibenda: Database MySQL 8.0"
echo "  - redis_cibenda: Redis Cache & Session"
