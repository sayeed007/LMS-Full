# Environment Setup Guide

Step-by-step guide to configure your LMS Platform environment for development, staging, and production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Development)](#quick-start-development)
3. [Development Environment](#development-environment)
4. [Staging Environment](#staging-environment)
5. [Production Environment](#production-environment)
6. [Service Configuration](#service-configuration)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0 or higher
- **Git**: v2.0 or higher

### Optional Software

- **Redis**: v7.0 or higher (recommended for production)
- **Docker**: For containerized deployment
- **PM2**: For process management in production

### Verify Installation

```bash
node --version
npm --version
mongo --version
git --version
```

---

## Quick Start (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lms-platform.git
cd lms-platform
```

### 2. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.development .env

# OR start from example
cp .env.example .env

# Install dependencies
npm install

# Start MongoDB (if not running)
# macOS/Linux:
mongod --dbpath ~/data/db

# Windows:
mongod --dbpath C:\data\db

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

---

## Development Environment

### Step 1: Backend Configuration

```bash
cd backend
cp .env.development .env
```

### Step 2: Edit Backend .env

Open `.env` and configure the following:

#### Minimal Required Configuration

```env
# Database
MONGODB_URI=mongodb://localhost:27017/lms_development

# Secrets (generate random strings)
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
COOKIE_SECRET=$(openssl rand -base64 32)

# URLs
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Optional Services

```env
# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=dev@lms-local.com

# File Storage (use local in development)
STORAGE_PROVIDER=local
LOCAL_UPLOAD_DIR=uploads

# Redis (optional)
REDIS_ENABLED=false
```

### Step 3: Frontend Configuration

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Features
NEXT_PUBLIC_FEATURE_CHAT=true
NEXT_PUBLIC_FEATURE_CERTIFICATES=true
```

### Step 4: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 5: Start Development Servers

#### Option 1: Separate Terminals

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

#### Option 2: Using Concurrently (from root)

```bash
npm install -g concurrently
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### Step 6: Verify Installation

1. Open http://localhost:3000
2. Check API docs at http://localhost:5000/api-docs
3. Try registering a new user

---

## Staging Environment

### Step 1: Prepare Staging Server

```bash
# SSH into staging server
ssh user@staging-server.com

# Create application directory
mkdir -p /var/www/lms
cd /var/www/lms

# Clone repository
git clone https://github.com/yourusername/lms-platform.git
cd lms-platform
```

### Step 2: Backend Configuration

```bash
cd backend
cp .env.staging .env
```

Edit `.env` with staging values:

```env
NODE_ENV=staging

# Server
PORT=5000
HOST=0.0.0.0
BACKEND_URL=https://api-staging.yourlms.com
FRONTEND_URL=https://staging.yourlms.com

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://staging-user:PASSWORD@staging-cluster.mongodb.net/lms_staging

# Secrets (GENERATE NEW ONES!)
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
COOKIE_SECRET=$(openssl rand -base64 64)

# Security
COOKIE_SECURE=true
TRUST_PROXY=true

# CORS
CORS_ORIGIN=https://staging.yourlms.com

# Email (SendGrid)
EMAIL_SERVICE=sendgrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=SG.your-api-key

# File Storage (Cloudinary)
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-staging-cloud
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payments (Test/Sandbox)
STRIPE_ENABLED=true
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Redis
REDIS_ENABLED=true
REDIS_URL=redis://:password@redis-staging.com:6379

# Monitoring
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project
```

### Step 3: Install and Build

```bash
# Backend
cd backend
npm install --production
npm run build  # if you have a build step

# Frontend
cd frontend
npm install
npm run build
```

### Step 4: Configure Reverse Proxy (Nginx)

Create `/etc/nginx/sites-available/lms-staging`:

```nginx
# Backend API
server {
    listen 80;
    server_name api-staging.yourlms.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name staging.yourlms.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/lms-staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: SSL Configuration (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificates
sudo certbot --nginx -d staging.yourlms.com -d api-staging.yourlms.com

# Auto-renewal (already configured by certbot)
sudo certbot renew --dry-run
```

### Step 6: Process Management (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "lms-backend-staging" -- start

# Start frontend
cd frontend
pm2 start npm --name "lms-frontend-staging" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 7: Verify Deployment

1. Access https://staging.yourlms.com
2. Check API: https://api-staging.yourlms.com/health
3. Monitor logs: `pm2 logs`

---

## Production Environment

### Step 1: Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Strong random secrets generated
- [ ] MongoDB backup configured
- [ ] SSL certificates obtained
- [ ] Monitoring services set up (Sentry, New Relic)
- [ ] Payment gateways in live mode
- [ ] Email service configured
- [ ] Redis configured and secured
- [ ] Domain DNS configured
- [ ] Firewall rules configured

### Step 2: Server Preparation

```bash
# Update system
sudo apt-get update
sudo apt-get upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
# Follow: https://docs.mongodb.com/manual/installation/

# Install Redis
sudo apt-get install redis-server

# Install Nginx
sudo apt-get install nginx

# Install PM2
sudo npm install -g pm2

# Create application user
sudo adduser lms
sudo usermod -aG sudo lms
```

### Step 3: Application Deployment

```bash
# Switch to application user
su - lms

# Clone repository
cd /var/www
git clone https://github.com/yourusername/lms-platform.git
cd lms-platform

# Checkout production branch
git checkout main
```

### Step 4: Backend Configuration

```bash
cd backend
cp .env.production .env
```

**CRITICAL**: Edit `.env` and replace ALL placeholders with production values:

```env
NODE_ENV=production

# Generate strong secrets
JWT_SECRET=$(openssl rand -base64 64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64)
SESSION_SECRET=$(openssl rand -base64 64)
COOKIE_SECRET=$(openssl rand -base64 64)

# Production URLs
BACKEND_URL=https://api.yourlms.com
FRONTEND_URL=https://www.yourlms.com

# Database (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://prod-user:STRONG-PASSWORD@production-cluster.mongodb.net/lms_production?retryWrites=true&w=majority

# Enable all security features
COOKIE_SECURE=true
HSTS_ENABLED=true
TRUST_PROXY=true

# Production email (SendGrid recommended)
EMAIL_SERVICE=sendgrid
EMAIL_PASSWORD=SG.PRODUCTION-API-KEY

# Production storage
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=production-cloud
CLOUDINARY_API_KEY=production-key
CLOUDINARY_API_SECRET=production-secret

# LIVE payment credentials
STRIPE_ENABLED=true
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Redis (required in production)
REDIS_ENABLED=true
REDIS_URL=redis://:STRONG-PASSWORD@redis-prod.com:6379

# Monitoring (required)
SENTRY_ENABLED=true
SENTRY_DSN=https://your-production-dsn@sentry.io/project

# Logging
LOG_LEVEL=warn
LOG_FILE_ENABLED=true
AUDIT_LOG_ENABLED=true
```

### Step 5: Install Dependencies

```bash
# Backend
cd backend
npm ci --production
# npm run build  # if needed

# Frontend
cd frontend
npm ci
npm run build
```

### Step 6: Database Setup

```bash
# Create indexes
npm run db:indexes

# Seed initial data (admin user, etc.)
npm run db:seed
```

### Step 7: Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Block direct access to app ports
sudo ufw deny 3000
sudo ufw deny 5000

# Enable firewall
sudo ufw enable
```

### Step 8: Production Nginx Configuration

```nginx
# /etc/nginx/sites-available/lms-production

# Backend API
server {
    listen 443 ssl http2;
    server_name api.yourlms.com;

    ssl_certificate /etc/letsencrypt/live/api.yourlms.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourlms.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API proxy
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}

# Frontend
server {
    listen 443 ssl http2;
    server_name www.yourlms.com yourlms.com;

    ssl_certificate /etc/letsencrypt/live/www.yourlms.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.yourlms.com/privkey.pem;

    # SSL Configuration (same as above)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name www.yourlms.com yourlms.com api.yourlms.com;
    return 301 https://$host$request_uri;
}
```

### Step 9: Start Production Services

```bash
# Backend
cd /var/www/lms-platform/backend
pm2 start npm --name "lms-backend" -- start
pm2 startup
pm2 save

# Frontend
cd /var/www/lms-platform/frontend
pm2 start npm --name "lms-frontend" -- start
pm2 save

# Monitor
pm2 status
pm2 logs
```

### Step 10: Automated Backups

Create `/root/backup-lms.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/lms"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup MongoDB
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/mongo_$DATE"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" /var/www/lms-platform/backend/uploads

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
crontab -e
# Add:
0 2 * * * /root/backup-lms.sh
```

### Step 11: Monitoring Setup

```bash
# Install monitoring tools
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Monitor with PM2
pm2 web  # Access at http://localhost:9615
```

---

## Service Configuration

### MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create new cluster
3. Configure network access:
   - Add your server IP to IP whitelist
   - Or use 0.0.0.0/0 (less secure)
4. Create database user
5. Get connection string
6. Update `MONGODB_URI` in `.env`

### Gmail App Password

1. Enable 2-Factor Authentication
2. Go to https://myaccount.google.com/apppasswords
3. Generate app password for "Mail"
4. Use generated password in `EMAIL_PASSWORD`

### Stripe Setup

1. Go to https://dashboard.stripe.com
2. Get API keys from Developers → API keys
3. Test mode: Use `pk_test_` and `sk_test_`
4. Live mode: Use `pk_live_` and `sk_live_`
5. Configure webhooks:
   - URL: `https://api.yourlms.com/api/v1/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.failed`
6. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### Cloudinary Setup

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy:
   - Cloud name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

---

## Deployment

### Manual Deployment

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Rebuild
npm run build

# Restart services
pm2 restart all
```

### Automated Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/lms-platform
            git pull origin main
            cd backend && npm ci && pm2 restart lms-backend
            cd ../frontend && npm ci && npm run build && pm2 restart lms-frontend
```

---

## Troubleshooting

### Common Issues

#### "Cannot connect to MongoDB"

```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string
echo $MONGODB_URI

# Test connection
mongo "$MONGODB_URI" --eval "db.adminCommand('ping')"
```

#### "Port already in use"

```bash
# Find process using port
sudo lsof -i:5000

# Kill process
sudo kill -9 <PID>
```

#### "CORS error in browser"

- Check `CORS_ORIGIN` includes your frontend URL
- Verify frontend URL in browser matches exactly
- Check protocol (http vs https)

#### "Email not sending"

```bash
# Test SMTP connection
telnet smtp.gmail.com 587

# Check credentials
echo $EMAIL_USERNAME
echo $EMAIL_PASSWORD

# Check logs
tail -f logs/combined.log
```

#### "Files not uploading"

- Check `MAX_FILE_SIZE` setting
- Verify storage provider credentials
- Check disk space: `df -h`
- Check permissions: `ls -la uploads/`

### Logs

```bash
# PM2 logs
pm2 logs

# Application logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
sudo journalctl -u mongod
```

---

## Support

Need help? Check:

- [Environment Variables Documentation](./ENVIRONMENT_VARIABLES.md)
- [Security Documentation](./SECURITY.md)
- [Email Setup Guide](./EMAIL_SETUP_GUIDE.md)
- [Payment Setup Guide](./PAYMENT_SETUP_GUIDE.md)

---

Last Updated: 2025-11-22
