FROM php:8.4-cli

ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies for PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl zip unzip \
    libpng-dev libjpeg62-turbo-dev libwebp-dev libfreetype6-dev \
    libonig-dev libxml2-dev \
    libzip-dev \
    ca-certificates \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install required PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Configure PHP resource limits for uploads and background tasks
RUN echo "upload_max_filesize = 25M\npost_max_size = 30M\nmemory_limit = 256M\nmax_execution_time = 120" > /usr/local/etc/php/conf.d/uploads.ini

# Install Composer and Node.js from official images
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY --from=node:22-slim /usr/local/bin /usr/local/bin
COPY --from=node:22-slim /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /var/www

# Install dependencies (cached layers)
COPY composer.json composer.lock ./
COPY package.json package-lock.json ./

ENV COMPOSER_PROCESS_TIMEOUT=3600
RUN composer install --optimize-autoloader --no-dev --no-scripts

RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --legacy-peer-deps

# Copy application source code
COPY . .
COPY .env.docker .env

RUN composer run-script post-autoload-dump

# Build frontend production assets
RUN npm run build

# Cache Laravel routes and views for production
RUN php artisan route:cache \
    && php artisan view:cache

# Set permissions for storage and bootstrap cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache \
    && chmod -R 775 /var/www/storage /var/www/bootstrap/cache

EXPOSE 8000
