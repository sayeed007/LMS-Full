# Environment Variables Documentation

Complete reference guide for all environment variables used in the LMS Platform.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Application Environment](#application-environment)
3. [Server Configuration](#server-configuration)
4. [Database Configuration](#database-configuration)
5. [Authentication & Security](#authentication--security)
6. [CORS Configuration](#cors-configuration)
7. [Rate Limiting](#rate-limiting)
8. [Email Configuration](#email-configuration)
9. [File Upload & Storage](#file-upload--storage)
10. [Payment Gateways](#payment-gateways)
11. [OAuth & Social Login](#oauth--social-login)
12. [Redis Configuration](#redis-configuration)
13. [Logging & Monitoring](#logging--monitoring)
14. [Security Headers](#security-headers)
15. [Additional Services](#additional-services)

---

## Quick Start

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your values
npm install
npm run dev
```

---

## Application Environment

### `NODE_ENV`

**Description**: Application environment mode
**Type**: String
**Options**: `development`, `staging`, `production`
**Default**: `development`
**Required**: Yes
**Example**: `NODE_ENV=production`

**Notes**:
- Controls logging verbosity, error details, and security settings
- In production: errors are logged but not shown to users
- In development: detailed error messages and stack traces are shown

---

## Server Configuration

### `PORT`

**Description**: Server port number
**Type**: Integer
**Default**: `5000`
**Required**: Yes
**Example**: `PORT=5000`

**Notes**:
- Must be between 1024-65535 (avoid system ports)
- Use port 80 for HTTP or 443 for HTTPS in production

### `HOST`

**Description**: Server host address
**Type**: String
**Default**: `localhost`
**Example**: `HOST=0.0.0.0`

**Notes**:
- Use `localhost` for development
- Use `0.0.0.0` in production to accept connections from all interfaces

### `API_VERSION`

**Description**: API version prefix
**Type**: String
**Default**: `v1`
**Example**: `API_VERSION=v1`

**Notes**:
- Used in API routes: `/api/v1/users`
- Increment for breaking changes: `v2`, `v3`

### `BACKEND_URL`

**Description**: Full backend URL
**Type**: URL
**Default**: `http://localhost:5000`
**Required**: Yes
**Example**: `BACKEND_URL=https://api.yourlms.com`

**Notes**:
- Include protocol (http:// or https://)
- Used for generating links in emails and callbacks

### `FRONTEND_URL`

**Description**: Full frontend URL
**Type**: URL
**Default**: `http://localhost:3000`
**Required**: Yes
**Example**: `FRONTEND_URL=https://www.yourlms.com`

**Notes**:
- Used for CORS, redirects, and OAuth callbacks
- Must match your actual frontend domain in production

### `SERVER_TIMEOUT`

**Description**: Request timeout in milliseconds
**Type**: Integer
**Default**: `30000` (30 seconds)
**Example**: `SERVER_TIMEOUT=30000`

### `TRUST_PROXY`

**Description**: Trust proxy headers (X-Forwarded-For)
**Type**: Boolean
**Default**: `false`
**Example**: `TRUST_PROXY=true`

**Notes**:
- Set to `true` when behind nginx, load balancer, or CDN
- Required for correct IP address logging

---

## Database Configuration

### `MONGODB_URI`

**Description**: MongoDB connection string
**Type**: Connection String
**Required**: Yes
**Example**:
```
# Local
MONGODB_URI=mongodb://localhost:27017/lms_database

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Notes**:
- Replace `username`, `password`, and `cluster` with your actual values
- Database name is specified at the end of the URI

### `MONGODB_POOL_SIZE`

**Description**: Number of connections in the pool
**Type**: Integer
**Default**: `10`
**Recommended**: `5-20` (development), `10-50` (production)
**Example**: `MONGODB_POOL_SIZE=10`

### `DB_BACKUP_ENABLED`

**Description**: Enable automatic database backups
**Type**: Boolean
**Default**: `false`
**Example**: `DB_BACKUP_ENABLED=true`

### `DB_BACKUP_SCHEDULE`

**Description**: Cron expression for backup schedule
**Type**: Cron Expression
**Default**: `0 2 * * *` (daily at 2 AM)
**Example**: `DB_BACKUP_SCHEDULE=0 2 * * *`

**Cron Format**:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, both 0 and 7 are Sunday)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

---

## Authentication & Security

### `JWT_SECRET`

**Description**: Secret key for signing JWT tokens
**Type**: String
**Required**: Yes
**Minimum Length**: 32 characters
**Example**: `JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters`

**Notes**:
- **CRITICAL**: Use a strong random string in production
- Generate with: `openssl rand -base64 64`
- Never commit actual secrets to version control

### `JWT_EXPIRES_IN`

**Description**: JWT access token expiration time
**Type**: Time String
**Default**: `15m` (15 minutes)
**Format**: `30s`, `15m`, `1h`, `7d`
**Example**: `JWT_EXPIRES_IN=15m`

**Notes**:
- Keep short for security (5-30 minutes)
- Use refresh tokens for longer sessions

### `JWT_REFRESH_SECRET`

**Description**: Secret key for refresh tokens
**Type**: String
**Required**: Yes
**Minimum Length**: 32 characters
**Example**: `JWT_REFRESH_SECRET=different-secret-for-refresh-tokens`

**Notes**:
- **MUST** be different from `JWT_SECRET`
- Use a different random string

### `JWT_REFRESH_EXPIRES_IN`

**Description**: Refresh token expiration time
**Type**: Time String
**Default**: `7d` (7 days)
**Recommended**: `7d` to `30d`
**Example**: `JWT_REFRESH_EXPIRES_IN=7d`

### `SESSION_SECRET`

**Description**: Secret for session encryption
**Type**: String
**Required**: Yes
**Minimum Length**: 32 characters
**Example**: `SESSION_SECRET=session-secret-minimum-32-characters`

### `COOKIE_SECURE`

**Description**: Use secure cookies (HTTPS only)
**Type**: Boolean
**Default**: `false` (development), `true` (production)
**Example**: `COOKIE_SECURE=true`

**Notes**:
- **MUST** be `true` in production with HTTPS
- Set to `false` only in local development

### `BCRYPT_SALT_ROUNDS`

**Description**: bcrypt hashing cost factor
**Type**: Integer
**Default**: `12`
**Range**: `10-15`
**Example**: `BCRYPT_SALT_ROUNDS=12`

**Notes**:
- Higher = more secure but slower
- 10 = fast, 12 = recommended, 15 = very slow
- Doubling this value doubles the time required

### `MAX_LOGIN_ATTEMPTS`

**Description**: Maximum failed login attempts before lockout
**Type**: Integer
**Default**: `5`
**Example**: `MAX_LOGIN_ATTEMPTS=5`

### `LOCKOUT_DURATION`

**Description**: Account lockout duration in milliseconds
**Type**: Integer
**Default**: `900000` (15 minutes)
**Example**: `LOCKOUT_DURATION=900000`

### `ENABLE_2FA`

**Description**: Enable two-factor authentication
**Type**: Boolean
**Default**: `false`
**Example**: `ENABLE_2FA=true`

---

## CORS Configuration

### `CORS_ORIGIN`

**Description**: Allowed origins for CORS
**Type**: Comma-separated URLs
**Required**: Yes
**Example**: `CORS_ORIGIN=http://localhost:3000,https://www.yourlms.com`

**Notes**:
- Use specific domains in production (never `*`)
- Include all your frontend domains
- Must include protocol (http:// or https://)

### `CORS_CREDENTIALS`

**Description**: Allow credentials in CORS requests
**Type**: Boolean
**Default**: `true`
**Example**: `CORS_CREDENTIALS=true`

**Notes**:
- Required for sending cookies with requests
- Must be `true` for authenticated requests

---

## Rate Limiting

### `RATE_LIMIT_WINDOW_MS`

**Description**: Time window for rate limiting in milliseconds
**Type**: Integer
**Default**: `900000` (15 minutes)
**Example**: `RATE_LIMIT_WINDOW_MS=900000`

### `RATE_LIMIT_MAX_REQUESTS`

**Description**: Maximum requests per window
**Type**: Integer
**Default**: `100`
**Example**: `RATE_LIMIT_MAX_REQUESTS=100`

**Notes**:
- Prevents DDoS and brute force attacks
- Adjust based on expected traffic

### `AUTH_RATE_LIMIT_MAX_REQUESTS`

**Description**: Max login attempts per window
**Type**: Integer
**Default**: `5`
**Example**: `AUTH_RATE_LIMIT_MAX_REQUESTS=5`

**Notes**:
- Keep low to prevent brute force attacks
- Recommended: 3-10

---

## Email Configuration

### `EMAIL_SERVICE`

**Description**: Email service provider
**Type**: String
**Options**: `gmail`, `outlook`, `sendgrid`, `mailgun`, `ses`, `smtp`
**Default**: `gmail`
**Example**: `EMAIL_SERVICE=sendgrid`

### `EMAIL_HOST`

**Description**: SMTP server hostname
**Type**: String
**Example**: `EMAIL_HOST=smtp.gmail.com`

**Common Values**:
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- SendGrid: `smtp.sendgrid.net`
- Mailgun: `smtp.mailgun.org`

### `EMAIL_PORT`

**Description**: SMTP server port
**Type**: Integer
**Example**: `EMAIL_PORT=587`

**Common Values**:
- `587`: TLS/STARTTLS (recommended)
- `465`: SSL
- `25`: Unencrypted (not recommended)

### `EMAIL_USERNAME`

**Description**: SMTP authentication username
**Type**: String
**Required**: Yes (for authenticated SMTP)
**Example**: `EMAIL_USERNAME=your-email@gmail.com`

### `EMAIL_PASSWORD`

**Description**: SMTP authentication password
**Type**: String
**Required**: Yes (for authenticated SMTP)
**Example**: `EMAIL_PASSWORD=your-app-password`

**Notes**:
- For Gmail: Use App Password, not your regular password
- Enable 2FA and generate App Password in Gmail settings

### `EMAIL_FROM`

**Description**: Sender email address
**Type**: Email
**Required**: Yes
**Example**: `EMAIL_FROM=noreply@yourlms.com`

### `EMAIL_FROM_NAME`

**Description**: Sender display name
**Type**: String
**Default**: `LMS Platform`
**Example**: `EMAIL_FROM_NAME=LMS Platform`

---

## File Upload & Storage

### `MAX_FILE_SIZE`

**Description**: Maximum file upload size in bytes
**Type**: Integer
**Default**: `10485760` (10MB)
**Example**: `MAX_FILE_SIZE=10485760`

**Notes**:
- 1MB = 1048576 bytes
- 10MB = 10485760 bytes
- 100MB = 104857600 bytes

### `STORAGE_PROVIDER`

**Description**: File storage provider
**Type**: String
**Options**: `cloudinary`, `aws-s3`, `local`
**Default**: `cloudinary`
**Example**: `STORAGE_PROVIDER=cloudinary`

### `CLOUDINARY_CLOUD_NAME`

**Description**: Cloudinary cloud name
**Type**: String
**Required**: If using Cloudinary
**Example**: `CLOUDINARY_CLOUD_NAME=your-cloud-name`

**Notes**:
- Get from Cloudinary dashboard
- Free tier: 25 credits/month

### `CLOUDINARY_API_KEY`

**Description**: Cloudinary API key
**Type**: String
**Required**: If using Cloudinary
**Example**: `CLOUDINARY_API_KEY=123456789012345`

### `CLOUDINARY_API_SECRET`

**Description**: Cloudinary API secret
**Type**: String
**Required**: If using Cloudinary
**Example**: `CLOUDINARY_API_SECRET=your-api-secret`

---

## Payment Gateways

### Stripe

#### `STRIPE_ENABLED`

**Description**: Enable Stripe payments
**Type**: Boolean
**Default**: `false`
**Example**: `STRIPE_ENABLED=true`

#### `STRIPE_PUBLIC_KEY`

**Description**: Stripe publishable key
**Type**: String
**Example**:
```
# Test
STRIPE_PUBLIC_KEY=pk_test_51xxxxx

# Live
STRIPE_PUBLIC_KEY=pk_live_51xxxxx
```

#### `STRIPE_SECRET_KEY`

**Description**: Stripe secret key
**Type**: String
**Required**: If Stripe enabled
**Example**:
```
# Test
STRIPE_SECRET_KEY=sk_test_51xxxxx

# Live
STRIPE_SECRET_KEY=sk_live_51xxxxx
```

**Notes**:
- **CRITICAL**: Never expose secret key to browser
- Use test keys in development
- Switch to live keys only in production

#### `STRIPE_WEBHOOK_SECRET`

**Description**: Stripe webhook signing secret
**Type**: String
**Example**: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

**Notes**:
- Required for webhook verification
- Get from Stripe Dashboard → Webhooks

### PayPal

#### `PAYPAL_ENABLED`

**Description**: Enable PayPal payments
**Type**: Boolean
**Default**: `false`
**Example**: `PAYPAL_ENABLED=true`

#### `PAYPAL_MODE`

**Description**: PayPal environment mode
**Type**: String
**Options**: `sandbox`, `live`
**Default**: `sandbox`
**Example**: `PAYPAL_MODE=live`

#### `PAYPAL_CLIENT_ID`

**Description**: PayPal client ID
**Type**: String
**Required**: If PayPal enabled
**Example**: `PAYPAL_CLIENT_ID=AXxxx`

#### `PAYPAL_CLIENT_SECRET`

**Description**: PayPal client secret
**Type**: String
**Required**: If PayPal enabled
**Example**: `PAYPAL_CLIENT_SECRET=EXxxx`

---

## OAuth & Social Login

### Google OAuth

#### `GOOGLE_ENABLED`

**Description**: Enable Google OAuth login
**Type**: Boolean
**Default**: `false`
**Example**: `GOOGLE_ENABLED=true`

#### `GOOGLE_CLIENT_ID`

**Description**: Google OAuth client ID
**Type**: String
**Example**: `GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com`

**Notes**:
- Get from Google Cloud Console
- Create OAuth 2.0 credentials

#### `GOOGLE_CLIENT_SECRET`

**Description**: Google OAuth client secret
**Type**: String
**Example**: `GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx`

#### `GOOGLE_CALLBACK_URL`

**Description**: OAuth callback URL
**Type**: URL
**Example**: `GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback`

**Notes**:
- Must match authorized redirect URI in Google Console
- Change to production URL in production

---

## Redis Configuration

### `REDIS_ENABLED`

**Description**: Enable Redis for caching and sessions
**Type**: Boolean
**Default**: `false`
**Example**: `REDIS_ENABLED=true`

### `REDIS_URL`

**Description**: Redis connection URL
**Type**: Connection String
**Example**:
```
# Local
REDIS_URL=redis://localhost:6379

# With password
REDIS_URL=redis://:password@localhost:6379

# Remote
REDIS_URL=redis://:password@redis.yourdomain.com:6379
```

### `REDIS_HOST`

**Description**: Redis server hostname
**Type**: String
**Default**: `localhost`
**Example**: `REDIS_HOST=redis.yourdomain.com`

### `REDIS_PORT`

**Description**: Redis server port
**Type**: Integer
**Default**: `6379`
**Example**: `REDIS_PORT=6379`

### `REDIS_PASSWORD`

**Description**: Redis authentication password
**Type**: String
**Example**: `REDIS_PASSWORD=your-redis-password`

**Notes**:
- **REQUIRED** in production for security
- Leave empty for local development without auth

---

## Logging & Monitoring

### `LOG_LEVEL`

**Description**: Logging verbosity level
**Type**: String
**Options**: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`
**Default**: `info` (production), `debug` (development)
**Example**: `LOG_LEVEL=info`

**Levels**:
- `error`: Only errors
- `warn`: Errors and warnings
- `info`: General information (recommended for production)
- `debug`: Detailed debugging information

### `SENTRY_ENABLED`

**Description**: Enable Sentry error tracking
**Type**: Boolean
**Default**: `false`
**Example**: `SENTRY_ENABLED=true`

### `SENTRY_DSN`

**Description**: Sentry Data Source Name
**Type**: URL
**Example**: `SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx`

**Notes**:
- Get from Sentry.io project settings
- Free tier: 5,000 errors/month

---

## Security Headers

### `CSP_ENABLED`

**Description**: Enable Content Security Policy
**Type**: Boolean
**Default**: `true`
**Example**: `CSP_ENABLED=true`

### `HSTS_ENABLED`

**Description**: Enable HTTP Strict Transport Security
**Type**: Boolean
**Default**: `false` (development), `true` (production)
**Example**: `HSTS_ENABLED=true`

**Notes**:
- **REQUIRED** in production with HTTPS
- Prevents downgrade attacks

### `HSTS_MAX_AGE`

**Description**: HSTS max age in seconds
**Type**: Integer
**Default**: `31536000` (1 year)
**Example**: `HSTS_MAX_AGE=31536000`

---

## Additional Services

### `SWAGGER_ENABLED`

**Description**: Enable API documentation (Swagger)
**Type**: Boolean
**Default**: `true` (development), `false` (production)
**Example**: `SWAGGER_ENABLED=true`

**Notes**:
- Accessible at: `/api-docs`
- Disable in production for security

### `MAINTENANCE_MODE`

**Description**: Enable maintenance mode
**Type**: Boolean
**Default**: `false`
**Example**: `MAINTENANCE_MODE=true`

**Notes**:
- Returns 503 Service Unavailable to all requests
- Useful during deployments or updates

---

## Environment-Specific Recommendations

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
SWAGGER_ENABLED=true
CACHE_ENABLED=false
REDIS_ENABLED=false
SENTRY_ENABLED=false
```

### Staging

```env
NODE_ENV=staging
LOG_LEVEL=info
SWAGGER_ENABLED=true
CACHE_ENABLED=true
REDIS_ENABLED=true
SENTRY_ENABLED=true
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=warn
SWAGGER_ENABLED=false
CACHE_ENABLED=true
REDIS_ENABLED=true
SENTRY_ENABLED=true
HSTS_ENABLED=true
COOKIE_SECURE=true
```

---

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use strong random secrets** (minimum 32 characters)
3. **Rotate secrets regularly** (every 90 days)
4. **Use different secrets** for each environment
5. **Enable HTTPS** in production
6. **Set secure cookies** (`COOKIE_SECURE=true`)
7. **Enable HSTS** in production
8. **Limit CORS origins** (no wildcards in production)
9. **Use environment-specific credentials**
10. **Monitor and log security events**

---

## Generating Secure Secrets

### Using OpenSSL

```bash
# Generate 32-byte random string
openssl rand -base64 32

# Generate 64-byte random string
openssl rand -base64 64

# Generate hex string
openssl rand -hex 32
```

### Using Node.js

```javascript
// Generate random string
require('crypto').randomBytes(32).toString('base64')
```

---

## Troubleshooting

### Common Issues

#### "Missing required environment variables"

**Solution**: Ensure all required variables are set in `.env`

#### "Invalid MongoDB URI"

**Solution**: Check connection string format and credentials

#### "CORS error"

**Solution**: Add your frontend URL to `CORS_ORIGIN`

#### "Email not sending"

**Solution**:
1. Check EMAIL_USERNAME and EMAIL_PASSWORD
2. For Gmail: enable 2FA and use App Password
3. Check EMAIL_HOST and EMAIL_PORT

#### "Stripe webhook failed"

**Solution**: Set correct `STRIPE_WEBHOOK_SECRET` from Stripe Dashboard

---

## Support

For additional help:

- Documentation: `/docs`
- GitHub Issues: [Create an issue](https://github.com/yourusername/lms-platform/issues)
- Email: support@yourlms.com

---

Last Updated: 2025-11-22
