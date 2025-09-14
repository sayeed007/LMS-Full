# LMS Project Setup Guide

## Overview
This guide provides comprehensive instructions for setting up the complete Learning Management System (LMS) project from scratch. It includes both frontend (Next.js) and backend (Node.js/Express) setup with all necessary environment configurations, database setup, and deployment instructions.

## Project Architecture

```
LMS/
├── frontend/                    # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   ├── components/         # React components
│   │   ├── store/             # Redux Toolkit store
│   │   └── ...
│   ├── .env.local             # Frontend environment variables
│   └── package.json
├── backend/                    # Node.js/Express API Server
│   ├── src/
│   │   ├── controllers/       # API controllers
│   │   ├── models/           # MongoDB models
│   │   ├── routes/           # API routes
│   │   └── ...
│   ├── .env                  # Backend environment variables
│   └── package.json
├── PROJECT_SETUP.md           # This setup guide
└── README.md                  # Project overview
```

## Prerequisites

### Required Software
1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **yarn**
   - Verify npm: `npm --version`
   - Or install yarn: `npm install -g yarn`

3. **MongoDB** (v5.0 or higher)
   - **Option A**: Local Installation
     - Download from: https://www.mongodb.com/try/download/community
     - Start service: `mongod` or `brew services start mongodb/brew/mongodb-community`
   - **Option B**: MongoDB Atlas (Cloud)
     - Sign up at: https://www.mongodb.com/atlas
     - Create a free cluster

4. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

5. **Code Editor** (Recommended)
   - VS Code: https://code.visualstudio.com/
   - With extensions: ES7+ React/Redux/GraphQL Snippets, MongoDB

### Optional Services
1. **Google OAuth** (for Google sign-in)
   - Google Cloud Console: https://console.cloud.google.com/
   
2. **Cloudinary** (for file uploads)
   - Sign up at: https://cloudinary.com/

3. **Email Service** (for notifications)
   - Gmail App Password or SendGrid/Mailgun

## Environment Variables Setup

### 1. Backend Environment Variables

Create `backend/.env` file:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# Local MongoDB (uncomment for local setup)
# MONGODB_URI=mongodb://localhost:27017/lms_development

# MongoDB Atlas (recommended for production)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/lms_production?retryWrites=true&w=majority

# Test Database (for running tests)
MONGODB_TEST_URI=mongodb://localhost:27017/lms_test

# ===========================================
# JWT CONFIGURATION
# ===========================================
# Generate secure secrets using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_super_secure_jwt_secret_at_least_32_characters_long_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_different_from_jwt_secret
JWT_REFRESH_EXPIRES_IN=30d

# ===========================================
# SERVER CONFIGURATION
# ===========================================
PORT=5000
NODE_ENV=development
API_VERSION=v1

# ===========================================
# CORS & FRONTEND CONFIGURATION
# ===========================================
FRONTEND_URL=http://localhost:3000

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
# Bcrypt salt rounds (higher = more secure but slower)
BCRYPT_SALT_ROUNDS=12

# Session secret for Express sessions
SESSION_SECRET=your_session_secret_here_should_be_different_from_jwt

# Rate limiting configuration
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# ===========================================
# OAUTH CONFIGURATION (Optional)
# ===========================================
# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Microsoft OAuth (Future implementation)
# MICROSOFT_CLIENT_ID=your_microsoft_client_id
# MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret

# ===========================================
# EMAIL CONFIGURATION
# ===========================================
# Gmail SMTP (using App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Alternative: SendGrid
# SENDGRID_API_KEY=your_sendgrid_api_key

# Alternative: Mailgun
# MAILGUN_API_KEY=your_mailgun_api_key
# MAILGUN_DOMAIN=your_mailgun_domain

# ===========================================
# FILE UPLOAD CONFIGURATION
# ===========================================
# Cloudinary for image/file storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Local file storage (alternative)
# UPLOAD_PATH=./uploads
# MAX_FILE_SIZE=10485760

# ===========================================
# API DOCUMENTATION
# ===========================================
SWAGGER_TITLE=LMS API Documentation
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=Comprehensive API documentation for Learning Management System

# ===========================================
# MONITORING & LOGGING
# ===========================================
# Log level (error, warn, info, http, verbose, debug, silly)
LOG_LEVEL=info

# External monitoring services (optional)
# SENTRY_DSN=your_sentry_dsn_for_error_tracking
# NEW_RELIC_LICENSE_KEY=your_new_relic_license_key
```

### 2. Frontend Environment Variables

Create `frontend/.env.local` file:

```env
# ===========================================
# NEXT.JS CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_NAME=Learning Management System
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# API CONFIGURATION
# ===========================================
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_TIMEOUT=10000

# ===========================================
# AUTHENTICATION
# ===========================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_different_from_backend_secrets

# ===========================================
# OAUTH PROVIDERS (must match backend)
# ===========================================
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ===========================================
# FEATURES FLAGS
# ===========================================
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH=false
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_PWA=false

# ===========================================
# ANALYTICS & MONITORING (Optional)
# ===========================================
NEXT_PUBLIC_GA_TRACKING_ID=G-XXXXXXXXXX
NEXT_PUBLIC_HOTJAR_ID=1234567

# ===========================================
# FILE UPLOAD CONFIGURATION
# ===========================================
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=image/*,application/pdf,.doc,.docx

# ===========================================
# UI CONFIGURATION
# ===========================================
NEXT_PUBLIC_DEFAULT_THEME=light
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# ===========================================
# DEVELOPMENT CONFIGURATION
# ===========================================
# Enable Redux DevTools in production (not recommended)
NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS=false

# API call debugging
NEXT_PUBLIC_DEBUG_API=false
```

## Step-by-Step Setup Instructions

### 1. Project Initialization

```bash
# Clone or create the project directory
mkdir LMS
cd LMS

# Initialize Git repository
git init
git remote add origin <your-repository-url>

# Create main directories
mkdir frontend backend
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Initialize npm project
npm init -y

# Install production dependencies
npm install express mongoose bcryptjs jsonwebtoken cors helmet morgan dotenv express-rate-limit express-validator multer cloudinary nodemailer passport passport-local passport-jwt passport-google-oauth20 express-session connect-mongo swagger-jsdoc swagger-ui-express express-mongo-sanitize xss-clean hpp

# Install development dependencies
npm install --save-dev nodemon jest supertest

# Create source directory structure
mkdir src
mkdir src/config src/controllers src/middleware src/models src/routes src/utils

# Create main application file
touch src/app.js

# Update package.json scripts
```

Add to `backend/package.json`:
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest",
    "seed": "node scripts/seed.js"
  }
}
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Create Next.js application with TypeScript
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install @reduxjs/toolkit react-redux redux-persist lucide-react sonner class-variance-authority clsx tailwind-merge

# Install UI component dependencies (shadcn/ui)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input badge avatar select textarea

# Create additional directories
mkdir src/store src/types src/providers
mkdir src/store/api src/store/slices
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
# On macOS with Homebrew:
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian:
sudo systemctl start mongod

# On Windows:
net start MongoDB

# Create database and user (optional)
mongosh
use lms_development
db.createUser({
  user: "lms_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/atlas
2. Create account and free cluster
3. Create database user
4. Whitelist your IP address
5. Get connection string and add to `.env`

### 5. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins:
   - `http://localhost:3000` (frontend)
   - `http://localhost:5000` (backend)
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/v1/auth/google/callback`
7. Copy Client ID and Client Secret to `.env` files

### 6. Cloudinary Setup (Optional)

1. Sign up at https://cloudinary.com/
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to backend `.env` file

### 7. Email Configuration (Optional)

#### Gmail Setup:
1. Enable 2-Factor Authentication on your Google account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password in `SMTP_PASS` environment variable

#### SendGrid Setup:
1. Sign up at https://sendgrid.com/
2. Create API key
3. Add to `.env` file

## Running the Application

### 1. Start Backend Server

```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Server will run on http://localhost:5000
# API Documentation: http://localhost:5000/api-docs
# Health Check: http://localhost:5000/health
```

### 2. Start Frontend Application

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Application will run on http://localhost:3000
```

### 3. Development Workflow

```bash
# Backend development
cd backend
npm run dev        # Start with nodemon (auto-restart)
npm test          # Run test suite
npm run seed      # Seed database with sample data

# Frontend development
cd frontend
npm run dev       # Start Next.js development server
npm run build     # Create production build
npm run lint      # Run ESLint
```

## Testing the Setup

### 1. Backend API Testing

```bash
# Health check
curl http://localhost:5000/health

# API documentation
# Open browser: http://localhost:5000/api-docs

# Test user registration
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### 2. Frontend Testing

1. Open browser: http://localhost:3000
2. Check that pages load correctly
3. Test authentication flow
4. Verify API integration

### 3. Integration Testing

```bash
# Test API connection from frontend
# Check browser console for any errors
# Verify Redux DevTools functionality
```

## Deployment Guide

### 1. Production Environment Setup

#### Backend Production `.env`:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://production_user:password@cluster.mongodb.net/lms_production

# Update all URLs to production domains
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/v1/auth/google/callback

# Use strong production secrets
JWT_SECRET=super_secure_production_secret_64_characters_minimum
```

#### Frontend Production `.env.local`:
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXTAUTH_URL=https://yourdomain.com

# Disable development features
NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS=false
NEXT_PUBLIC_DEBUG_API=false
```

### 2. Deployment Options

#### Option A: Vercel (Frontend) + Railway/Render (Backend)
```bash
# Frontend to Vercel
npm i -g vercel
cd frontend
vercel

# Backend to Railway
# Connect GitHub repository to Railway
# Set environment variables in Railway dashboard
```

#### Option B: Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option C: Traditional Server (PM2)
```bash
# Install PM2
npm install -g pm2

# Backend deployment
cd backend
pm2 start src/app.js --name "lms-backend"

# Frontend deployment
cd frontend
npm run build
pm2 start npm --name "lms-frontend" -- start
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string in .env
# Verify IP whitelist (for MongoDB Atlas)
# Check firewall settings
```

#### 2. Port Conflicts
```bash
# Check if ports are in use
lsof -i :3000  # Frontend
lsof -i :5000  # Backend

# Kill processes if needed
kill -9 <PID>
```

#### 3. Environment Variables Not Loading
```bash
# Check file names (.env vs .env.local)
# Restart development servers
# Verify file is in correct directory
```

#### 4. OAuth Issues
```bash
# Check Google Console settings
# Verify callback URLs
# Check client ID/secret in .env files
# Clear browser cookies/storage
```

#### 5. CORS Issues
```bash
# Check CORS configuration in backend app.js
# Verify FRONTEND_URL in backend .env
# Check browser console for detailed errors
```

### Debug Commands

```bash
# Check environment variables
cd backend && node -e "console.log(process.env)"
cd frontend && npm run build # Will show missing env vars

# Check database connection
mongosh <your-mongodb-uri>

# Test API endpoints
curl -v http://localhost:5000/health

# Check logs
pm2 logs lms-backend
pm2 logs lms-frontend
```

## Security Checklist

### Before Production Deployment:

- [ ] Change all default passwords and secrets
- [ ] Use strong, unique JWT secrets (minimum 32 characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up proper rate limiting
- [ ] Configure secure cookie settings
- [ ] Enable MongoDB authentication
- [ ] Set up proper firewall rules
- [ ] Configure environment variables securely
- [ ] Set up error monitoring (Sentry)
- [ ] Enable access logs and monitoring
- [ ] Configure backup strategy
- [ ] Test authentication flows
- [ ] Verify file upload security
- [ ] Set up health monitoring

## Maintenance Tasks

### Regular Tasks:
- Update dependencies regularly
- Monitor database performance
- Review and rotate secrets
- Check security logs
- Update API documentation
- Run security audits
- Backup database
- Monitor error rates
- Update SSL certificates
- Review user feedback

This setup guide provides everything needed to get the LMS project running locally and deploy to production successfully. For any issues, refer to the troubleshooting section or check the individual README files in frontend/ and backend/ directories.