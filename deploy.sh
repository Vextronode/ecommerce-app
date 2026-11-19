#!/usr/bin/env bash
set -e

# Deployment and rebuild script for Cibenda Mart production containers

if [ ! -f .env.docker ]; then
    echo "Berkas .env.docker tidak ditemukan. Salin .env.docker.example ke .env.docker terlebih dahulu."
    exit 1
fi

docker compose up -d --build --remove-orphans

sleep 5

docker compose ps
