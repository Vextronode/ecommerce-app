# =====================================================================
# Dockerfile - Cibenda Mart
# Stack: Laravel 11 + Inertia + React + Vite (PHP 8.4 + Node 24)
# =====================================================================

# Base image PHP 8.4 CLI sesuai versi yang lu pakai di lokal
FROM php:8.4-cli

# Install dependencies sistem yang dibutuhkan PHP & Node.js
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpng-dev libonig-dev libxml2-dev \
    libzip-dev \
    nodejs npm \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install ekstensi PHP yang dibutuhkan Laravel
# pcntl = dibutuhin Queue Worker biar bisa gracefully shutdown
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Install Composer dari image resminya
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory di dalam container
WORKDIR /var/www

# Copy semua file project ke dalam container
COPY . .

# Copy .env.docker ke .env biar laravel baca konfigurasi yang bener
# File .env.docker lu bikin manual (lihat contoh di bawah)
COPY .env.docker .env

# Install PHP dependencies (tanpa dev dependencies, lebih ringan di production)
RUN composer install --optimize-autoloader --no-dev

# Install Node dependencies & build asset React/Vite
RUN npm install && npm run build

# Generate app key (wajib kalau fresh deploy)
RUN php artisan key:generate --force

# Optimize Laravel: cache config, routes, views
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Set permission folder storage & cache supaya Laravel bisa nulis file
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

# Expose port yang dipakai artisan serve
EXPOSE 8000
