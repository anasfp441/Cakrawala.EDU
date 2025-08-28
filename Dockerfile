# CBT Sekolah - Docker Configuration
# Multi-stage build untuk aplikasi CBT Sekolah

# Stage 1: Base PHP Image
FROM php:8.1-apache AS base

# Set environment variables
ENV APACHE_DOCUMENT_ROOT /var/www/html
ENV PHP_VERSION 8.1
ENV COMPOSER_VERSION 2.5.5

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libssl-dev \
    libmcrypt-dev \
    libicu-dev \
    unzip \
    zip \
    wget \
    nano \
    vim \
    htop \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo \
        pdo_mysql \
        mysqli \
        mbstring \
        exif \
        pcntl \
        bcmath \
        zip \
        xml \
        intl \
        opcache

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure Apache
RUN a2enmod rewrite headers expires deflate
RUN a2enmod ssl
RUN a2enmod http2

# Configure PHP
RUN echo "memory_limit = 512M" > /usr/local/etc/php/conf.d/memory-limit.ini
RUN echo "upload_max_filesize = 10M" > /usr/local/etc/php/conf.d/upload-max-filesize.ini
RUN echo "post_max_size = 12M" > /usr/local/etc/php/conf.d/post-max-size.ini
RUN echo "max_execution_time = 300" > /usr/local/etc/php/conf.d/max-execution-time.ini
RUN echo "max_input_time = 300" > /usr/local/etc/php/conf.d/max-input-time.ini
RUN echo "date.timezone = Asia/Jakarta" > /usr/local/etc/php/conf.d/timezone.ini

# Configure OPcache
RUN echo "opcache.enable=1" > /usr/local/etc/php/conf.d/opcache.ini
RUN echo "opcache.memory_consumption=128" >> /usr/local/etc/php/conf.d/opcache.ini
RUN echo "opcache.interned_strings_buffer=8" >> /usr/local/etc/php/conf.d/opcache.ini
RUN echo "opcache.max_accelerated_files=4000" >> /usr/local/etc/php/conf.d/opcache.ini
RUN echo "opcache.revalidate_freq=2" >> /usr/local/etc/php/conf.d/opcache.ini
RUN echo "opcache.fast_shutdown=1" >> /usr/local/etc/php/conf.d/opcache.ini

# Stage 2: Development Image
FROM base AS development

# Install development tools
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install global npm packages
RUN npm install -g \
    eslint \
    prettier \
    stylelint \
    webpack \
    webpack-cli

# Set development environment
ENV APP_ENV=development
ENV DEBUG=true

# Stage 3: Production Image
FROM base AS production

# Set production environment
ENV APP_ENV=production
ENV DEBUG=false

# Copy application files
COPY . /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/uploads \
    && chmod -R 777 /var/www/html/logs \
    && chmod -R 777 /var/www/html/cache

# Create necessary directories
RUN mkdir -p /var/www/html/uploads/materi \
    && mkdir -p /var/www/html/uploads/tugas \
    && mkdir -p /var/www/html/logs \
    && mkdir -p /var/www/html/cache \
    && mkdir -p /var/www/html/backups

# Install production dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Build assets
RUN npm install && npm run build

# Remove development files
RUN rm -rf node_modules \
    && rm -rf tests \
    && rm -rf .git \
    && rm -rf .github \
    && rm -rf docs \
    && rm -rf README.md \
    && rm -rf package*.json \
    && rm -rf webpack.config.js \
    && rm -rf .eslintrc.js \
    && rm -rf .prettierrc \
    && rm -rf .stylelintrc

# Configure Apache virtual host
COPY docker/apache-vhost.conf /etc/apache2/sites-available/000-default.conf

# Configure SSL (if needed)
# COPY docker/ssl/ /etc/ssl/certs/
# RUN a2enmod ssl
# RUN a2ensite default-ssl

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Expose ports
EXPOSE 80 443

# Start Apache
CMD ["apache2-foreground"]

# Stage 4: MySQL Image
FROM mysql:8.0 AS database

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=cbt_root_password_2024
ENV MYSQL_DATABASE=cbt_sekolah_db
ENV MYSQL_USER=cbt_web
ENV MYSQL_PASSWORD=cbt_web_password_2024

# Copy database initialization script
COPY database.sql /docker-entrypoint-initdb.d/

# Configure MySQL
COPY docker/mysql.cnf /etc/mysql/conf.d/custom.cnf

# Expose port
EXPOSE 3306

# Stage 5: Nginx Reverse Proxy (Optional)
FROM nginx:alpine AS nginx

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx-site.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

# Stage 6: Redis Cache (Optional)
FROM redis:alpine AS redis

# Copy redis configuration
COPY docker/redis.conf /usr/local/etc/redis/redis.conf

# Expose port
EXPOSE 6379

# Start Redis
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]

# Stage 7: PHP-FPM (Alternative to Apache)
FROM php:8.1-fpm AS php-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    libxml2-dev \
    libonig-dev \
    libssl-dev \
    libmcrypt-dev \
    libicu-dev \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        pdo \
        pdo_mysql \
        mysqli \
        mbstring \
        exif \
        pcntl \
        bcmath \
        zip \
        xml \
        intl \
        opcache

# Configure PHP-FPM
COPY docker/php-fpm.conf /usr/local/etc/php-fpm.d/www.conf
COPY docker/php.ini /usr/local/etc/php/php.ini

# Expose port
EXPOSE 9000

# Start PHP-FPM
CMD ["php-fpm"]

# Stage 8: Complete Stack
FROM base AS complete

# Copy docker-compose configuration
COPY docker/docker-compose.yml /docker-compose.yml

# Copy startup script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

# Install additional tools
RUN apt-get update && apt-get install -y \
    mysql-client \
    redis-tools \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Copy supervisor configuration
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy application files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/uploads \
    && chmod -R 777 /var/www/html/logs \
    && chmod -R 777 /var/www/html/cache

# Create directories
RUN mkdir -p /var/www/html/uploads/materi \
    && mkdir -p /var/www/html/uploads/tugas \
    && mkdir -p /var/www/html/logs \
    && mkdir -p /var/www/html/cache \
    && mkdir -p /var/www/html/backups

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Build assets
RUN npm install && npm run build

# Remove development files
RUN rm -rf node_modules \
    && rm -rf tests \
    && rm -rf .git \
    && rm -rf .github \
    && rm -rf docs \
    && rm -rf README.md \
    && rm -rf package*.json \
    && rm -rf webpack.config.js \
    && rm -rf .eslintrc.js \
    && rm -rf .prettierrc \
    && rm -rf .stylelintrc

# Expose ports
EXPOSE 80 443 3306 6379 9000

# Start services
CMD ["/start.sh"]

# Labels
LABEL maintainer="CBT Sekolah Team <team@cbtsekolah.com>"
LABEL version="1.0.0"
LABEL description="Aplikasi CBT Sekolah - Sistem Pembelajaran Berbasis Komputer"
LABEL vendor="CBT Sekolah"
LABEL org.opencontainers.image.title="CBT Sekolah"
LABEL org.opencontainers.image.description="Sistem pembelajaran digital untuk sekolah"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.vendor="CBT Sekolah"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/username/cbt-sekolah"