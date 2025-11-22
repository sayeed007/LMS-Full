# LMS Security Documentation

**Last Updated**: 2025-11-22
**Version**: 1.0
**Status**: Production-Ready Security Hardening Complete

---

## Overview

This document outlines the comprehensive security measures implemented in the LMS platform. All security features have been configured to protect against common vulnerabilities including XSS, CSRF, SQL/NoSQL injection, DDoS attacks, and more.

---

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Authentication & Authorization](#authentication--authorization)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
5. [Data Protection](#data-protection)
6. [Security Headers](#security-headers)
7. [File Upload Security](#file-upload-security)
8. [API Security](#api-security)
9. [Monitoring & Logging](#monitoring--logging)
10. [Security Best Practices](#security-best-practices)
11. [Incident Response](#incident-response)

---

## Security Architecture

### Defense in Depth

The LMS implements multiple layers of security:

1. **Network Layer**: IP whitelisting/blacklisting, DDoS protection
2. **Application Layer**: Input validation, rate limiting, CSRF protection
3. **Data Layer**: Encryption at rest and in transit, secure sessions
4. **Authentication Layer**: JWT tokens, password hashing, account lockout
5. **Authorization Layer**: Role-based access control (RBAC)

### Security Configuration

All security settings are centralized in `backend/src/config/security.config.js`:

```javascript
// Example security settings
{
  rateLimit: { ... },
  cors: { ... },
  helmet: { ... },
  fileUpload: { ... },
  password: { ... }
}
```

---

## Authentication & Authorization

### Password Security

**Password Requirements**:
- Minimum length: 8 characters
- Maximum length: 128 characters
- Must contain: uppercase, lowercase, numbers
- Optional: special characters
- Blocked: Common passwords (password, 12345678, etc.)

**Password Storage**:
- Hashed using bcrypt with salt rounds: 12
- Never stored in plain text
- Never logged or exposed in responses

### JWT Tokens

**Access Tokens**:
- Expiry: 15 minutes
- Used for API authentication
- Stored in memory (not localStorage)

**Refresh Tokens**:
- Expiry: 7 days
- HTTP-only cookie
- Secure flag in production
- SameSite: 'lax' for CSRF protection

### Account Lockout Policy

- **Max failed attempts**: 5
- **Lockout duration**: 15 minutes
- **Reset on success**: Yes
- Automatic unlock after duration

### Session Security

```javascript
{
  name: 'lms.sid', // Custom cookie name
  secret: process.env.SESSION_SECRET,
  cookie: {
    secure: true, // HTTPS only in production
    httpOnly: true, // Prevent XSS
    sameSite: 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}
```

---

## Input Validation & Sanitization

### Validation Middleware

All user inputs are validated using `express-validator`:

**Common Validations**:
- Email: Format validation, normalization
- Passwords: Strength requirements, common password check
- Strings: Length limits, HTML escaping
- URLs: Protocol validation, length limits
- Numbers: Range validation, type checking
- Dates: ISO 8601 format, range checks

### NoSQL Injection Prevention

**MongoDB Sanitization**:
- Characters `$` and `.` are replaced with `_`
- Query parameters are sanitized
- Body content is validated

```javascript
// Automatic sanitization
app.use(mongoSanitize({
  replaceWith: '_'
}));
```

### XSS Prevention

**HTML Sanitization**:
- Script tags removed
- Event handlers stripped
- HTML entities escaped
- Content Security Policy enforced

```javascript
// XSS Clean middleware applied globally
app.use(xss());
```

---

## Rate Limiting & DDoS Protection

### Global Rate Limits

**Default (all /api routes)**:
- Window: 15 minutes
- Max requests: 100 per IP
- Response: 429 Too Many Requests

### Endpoint-Specific Limits

| Endpoint Type | Window | Max Requests | Use Case |
|--------------|--------|--------------|----------|
| Authentication | 15 min | 5 | Login attempts |
| Password Reset | 1 hour | 3 | Reset requests |
| File Upload | 1 hour | 50 | Upload operations |
| Payment | 1 hour | 10 | Payment transactions |
| Email | 1 hour | 20 | Email sending |

### IP Control

**Whitelisting**:
- Admin IPs bypass rate limiting
- Configure via `IP_WHITELIST` env variable

**Blacklisting**:
- Blocked IPs get 403 Forbidden
- Configure via `IP_BLACKLIST` env variable

### Distributed Rate Limiting

- Uses MongoDB for rate limit storage
- Works across multiple server instances
- Automatic cleanup of expired records

---

## Data Protection

### Encryption at Rest

**Sensitive Fields**:
- Passwords: bcrypt hashing
- API keys: Excluded from responses (`select: false`)
- Payment credentials: Encrypted storage

### Encryption in Transit

**HTTPS Enforcement**:
- All production traffic uses HTTPS
- HTTP requests redirected to HTTPS
- Strict Transport Security (HSTS) header

```javascript
// HSTS header
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Data Masking

**Audit Logs**:
- Sensitive fields are masked:
  - password, token, apiKey, secret
  - creditCard, refreshToken
- Only last 4 digits of sensitive IDs shown

---

## Security Headers

### Helmet Configuration

The platform uses Helmet.js with custom configuration:

```javascript
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      // ... more directives
    }
  }
}
```

### Custom Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## File Upload Security

### File Validation

**Size Limits**:
- Images: 5MB
- Videos: 100MB
- Documents: 10MB
- Audio: 20MB

**Allowed MIME Types**:
```javascript
{
  image: ['image/jpeg', 'image/png', 'image/gif'],
  video: ['video/mp4', 'video/webm'],
  document: ['application/pdf', 'application/msword'],
  audio: ['audio/mpeg', 'audio/wav']
}
```

**File Extension Validation**:
- Whitelist approach (only allowed extensions)
- Double extension check
- MIME type verification

### Upload Security Measures

1. **Virus Scanning**: Recommended (ClamAV integration)
2. **Storage**: Cloudinary (external CDN)
3. **Access Control**: Signed URLs for private files
4. **Metadata Stripping**: EXIF data removed

---

## API Security

### CORS Configuration

```javascript
{
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}
```

### CSRF Protection

**Implementation**:
- Double-submit cookie pattern
- CSRF token in cookie and header
- Validated on state-changing requests (POST, PUT, DELETE, PATCH)

**Configuration**:
```javascript
{
  cookieName: 'XSRF-TOKEN',
  headerName: 'X-CSRF-Token',
  enabled: process.env.NODE_ENV === 'production'
}
```

### API Versioning

- Current version: v1
- Path: `/api/v1/*`
- Backward compatibility maintained

---

## Monitoring & Logging

### Audit Logging

**Logged Events**:
- Failed login attempts (with IP address)
- Successful logins (optional, for high-security)
- Password changes
- Role changes
- Data modifications (admin actions)
- Suspicious activities

**Log Format**:
```json
{
  "timestamp": "2025-11-22T10:30:00Z",
  "event": "failed_login",
  "userId": "user123",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "details": {}
}
```

### Security Monitoring

**Suspicious Activity Detection**:
- Directory traversal attempts
- Script injection attempts
- SQL/NoSQL injection patterns
- Unusual request patterns

**Alerting**:
- Failed login thresholds
- Rate limit violations
- Blacklisted IP attempts
- Privilege escalation attempts

---

## Security Best Practices

### For Developers

1. **Never commit secrets**:
   - Use `.env` files
   - Add sensitive files to `.gitignore`
   - Use environment variables

2. **Input Validation**:
   - Validate all user inputs
   - Use whitelist approach
   - Sanitize before storage

3. **Authentication**:
   - Use JWT for stateless auth
   - Implement refresh tokens
   - Never store passwords in plain text

4. **Authorization**:
   - Check permissions on every request
   - Use role-based access control
   - Principle of least privilege

5. **Error Handling**:
   - Never expose stack traces
   - Use generic error messages
   - Log details server-side only

### For Administrators

1. **Environment Configuration**:
   - Set strong `SESSION_SECRET`
   - Configure `JWT_SECRET`
   - Enable HTTPS in production

2. **Regular Updates**:
   - Keep dependencies updated
   - Apply security patches
   - Monitor npm audit

3. **Backup & Recovery**:
   - Regular database backups
   - Test restore procedures
   - Offsite backup storage

4. **Access Control**:
   - Use strong admin passwords
   - Enable 2FA for admins (future)
   - Limit admin access by IP (optional)

5. **Monitoring**:
   - Review audit logs regularly
   - Monitor failed login attempts
   - Check rate limit violations

---

## Incident Response

### Security Incident Response Plan

**Phase 1: Detection**
- Monitor audit logs
- Check security alerts
- Review suspicious activities

**Phase 2: Containment**
- Block malicious IPs
- Disable compromised accounts
- Isolate affected systems

**Phase 3: Investigation**
- Review logs and traces
- Identify attack vector
- Assess damage

**Phase 4: Remediation**
- Patch vulnerabilities
- Reset compromised credentials
- Update security measures

**Phase 5: Recovery**
- Restore from backups if needed
- Verify system integrity
- Resume normal operations

**Phase 6: Post-Incident**
- Document incident
- Update security policies
- Implement preventive measures

### Contact Information

**Security Team**:
- Email: security@yourlms.com
- Response Time: 24 hours
- Escalation: critical-security@yourlms.com

---

## Environment Variables

### Required Security Variables

```bash
# Authentication
JWT_SECRET=your-very-strong-random-secret-min-32-chars
SESSION_SECRET=another-very-strong-random-secret-min-32-chars

# CORS
FRONTEND_URL=https://yourdomain.com

# Security
IP_WHITELIST=192.168.1.1,10.0.0.1
IP_BLACKLIST=
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/lms

# Email
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
```

---

## Security Checklist

### Pre-Production

- [ ] All environment variables configured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled (if using cookies)
- [ ] Input validation on all endpoints
- [ ] File upload restrictions configured
- [ ] Audit logging enabled
- [ ] Database backups configured
- [ ] Error monitoring setup (Sentry, etc.)

### Production

- [ ] Regular security audits
- [ ] Dependency updates (monthly)
- [ ] Log review (weekly)
- [ ] Backup verification (weekly)
- [ ] Incident response plan tested
- [ ] Security training for team
- [ ] Third-party security audit (annually)

---

## Vulnerability Reporting

### Responsible Disclosure

If you discover a security vulnerability:

1. **Do NOT** publicly disclose the issue
2. Email: security@yourlms.com with details
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)
4. Allow 30 days for resolution
5. Recognition in security advisories (optional)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-22 | Initial security hardening implementation |

---

**Document Maintained By**: LMS Security Team
**Review Cycle**: Quarterly
**Next Review**: 2026-02-22
