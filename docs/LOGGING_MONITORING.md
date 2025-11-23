# Logging & Monitoring Guide

Complete guide for error tracking, logging, and monitoring in the LMS application.

## Table of Contents

1. [Overview](#overview)
2. [Winston Logger](#winston-logger)
3. [Sentry Error Tracking](#sentry-error-tracking)
4. [Request Logging](#request-logging)
5. [Error Handling](#error-handling)
6. [Log Management](#log-management)
7. [Production Setup](#production-setup)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The LMS application uses a comprehensive logging and monitoring system that combines:

- **Winston** - Structured logging with rotation and multiple transports
- **Sentry** - Real-time error tracking and performance monitoring
- **Morgan** - HTTP request logging
- **Custom Middleware** - Request tracking, security logging, and audit trails

### Architecture

```
Application Request
    ↓
Sentry Request Handler (captures request context)
    ↓
Morgan HTTP Logger (logs HTTP requests)
    ↓
Custom Request Logger (tracks metadata)
    ↓
Routes & Controllers
    ↓
Error Handler (logs errors, reports to Sentry)
    ↓
Winston Logger (writes to files/console)
    ↓
Sentry (sends errors to cloud)
```

---

## Winston Logger

Winston provides structured logging with multiple transports and log rotation.

### Configuration

Located in: `backend/src/config/logger.js`

### Log Levels

```javascript
{
  error: 0,    // System errors, exceptions
  warn: 1,     // Warning messages, deprecations
  info: 2,     // General information, startup messages
  http: 3,     // HTTP requests/responses
  debug: 4,    // Debug information
}
```

### Log Files

All logs are stored in the `logs/` directory (configurable via `LOG_DIR` env variable):

| File | Purpose | Rotation | Retention |
|------|---------|----------|-----------|
| `error-%DATE%.log` | Errors only (level: error) | Daily | 30 days |
| `combined-%DATE%.log` | All logs (all levels) | Daily | 30 days |
| `access-%DATE%.log` | HTTP access logs | Daily | 14 days |
| `audit-%DATE%.log` | Security & audit logs | Daily | 90 days |
| `security-%DATE%.log` | Security events | Daily | 90 days |

### Environment Variables

```env
# Logging Configuration
LOG_LEVEL=info                    # Log level (error, warn, info, http, debug)
LOG_DIR=logs                      # Log directory
LOG_MAX_SIZE=20m                  # Max log file size before rotation
LOG_MAX_FILES=30d                 # Log retention period
LOG_CONSOLE=true                  # Enable console logging
LOG_FILE=true                     # Enable file logging
```

### Usage Examples

#### Basic Logging

```javascript
const logger = require('./config/logger');

// Different log levels
logger.error('Database connection failed', { error: err.message });
logger.warn('Deprecated API endpoint accessed', { endpoint: '/old-api' });
logger.info('User registered successfully', { userId: user.id });
logger.http('GET /api/users 200 45ms');
logger.debug('Cache hit', { key: 'user:123' });
```

#### Structured Logging

```javascript
// Log with structured metadata
logger.info('User login', {
  userId: user.id,
  email: user.email,
  ip: req.ip,
  userAgent: req.get('user-agent'),
  timestamp: new Date().toISOString(),
});
```

#### Helper Methods

```javascript
// Authentication logging
logger.logAuth('login_success', {
  email: 'user@example.com',
  ip: '192.168.1.1',
});

// Audit logging
logger.logAudit('user_created', user, 'users', {
  role: 'student',
  organization: 'org123',
});

// Payment logging
logger.logPayment('payment_success', {
  userId: user.id,
  amount: 99.99,
  currency: 'USD',
  transactionId: 'txn_123',
});

// Security events
logger.logSecurity({
  event: 'failed_login_attempt',
  ip: req.ip,
  email: req.body.email,
});

// Performance logging
logger.logPerformance({
  route: 'GET /api/courses',
  duration: 245,
  slow: false,
});

// Error logging
logger.logError(error, {
  userId: user?.id,
  action: 'create_course',
  metadata: { courseId: course.id },
});
```

#### Custom Metadata

```javascript
// Add custom metadata to all logs
logger.defaultMeta = {
  service: 'lms-backend',
  version: '1.0.0',
  environment: process.env.NODE_ENV,
};
```

---

## Sentry Error Tracking

Sentry provides real-time error tracking and performance monitoring.

### Configuration

Located in: `backend/src/config/sentry.js`

### Environment Variables

```env
# Sentry Configuration
SENTRY_ENABLED=true
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1     # 10% of transactions
SENTRY_RELEASE=lms-backend@1.0.0
```

### Setup

1. **Create Sentry Project**: Visit [sentry.io](https://sentry.io) and create a new project
2. **Get DSN**: Copy the DSN from project settings
3. **Configure Environment**: Add `SENTRY_DSN` to `.env`
4. **Initialize**: Sentry is automatically initialized on server start

### Usage Examples

#### Capture Exceptions

```javascript
const { captureException } = require('./config/sentry');

try {
  // Your code
} catch (error) {
  captureException(error, {
    user: {
      id: user.id,
      email: user.email,
    },
    tags: {
      feature: 'course-creation',
      action: 'upload',
    },
    extra: {
      courseId: course.id,
      fileSize: file.size,
    },
  });
}
```

#### Capture Messages

```javascript
const { captureMessage } = require('./config/sentry');

captureMessage('Payment webhook received but signature invalid', 'warning', {
  tags: {
    provider: 'stripe',
    eventType: 'payment_intent.succeeded',
  },
  extra: {
    signature: req.headers['stripe-signature'],
  },
});
```

#### User Context

```javascript
const { setUser, clearUser } = require('./config/sentry');

// Set user context (automatically added to all events)
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
});

// Clear user context (e.g., on logout)
clearUser();
```

#### Breadcrumbs

```javascript
const { addBreadcrumb } = require('./config/sentry');

// Add breadcrumb for debugging
addBreadcrumb({
  message: 'User started course enrollment',
  category: 'enrollment',
  level: 'info',
  data: {
    courseId: course.id,
    userId: user.id,
  },
});
```

#### Performance Monitoring

```javascript
const { startTransaction } = require('./config/sentry');

// Start transaction
const transaction = startTransaction('process-payment', 'payment');

try {
  // Payment processing...

  // Mark successful
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

### Filtering Sensitive Data

Sentry automatically scrubs:
- Authorization headers
- Cookies
- Password fields
- Credit card numbers
- API keys

Additional filtering in `beforeSend` hook:

```javascript
beforeSend(event, hint) {
  // Don't send validation errors in development
  if (server.isDevelopment) {
    const error = hint.originalException;
    if (error && error.message && error.message.includes('ValidationError')) {
      return null;
    }
  }

  // Scrub sensitive data
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers.authorization;
  }

  return event;
}
```

---

## Request Logging

HTTP request logging using Morgan integrated with Winston.

### Configuration

Located in: `backend/src/middleware/requestLogger.js`

### Features

- **HTTP Request Logs**: All incoming requests with method, URL, status, duration
- **Slow Request Detection**: Automatically flags requests > 1000ms
- **Error Request Logging**: Enhanced logging for 4xx and 5xx responses
- **Sensitive Data Masking**: Automatically masks passwords, tokens, etc.
- **Security Event Tracking**: Logs authentication attempts, rate limits, etc.

### Usage

```javascript
const { requestLogger, errorLogger, logSecurityEvent } = require('./middleware/requestLogger');

// In server.js
app.use(requestLogger);

// ... your routes ...

// Error logger (before error handler)
app.use(errorLogger);
```

### Custom Logging

```javascript
// Log security event
logSecurityEvent(req, 'suspicious_activity', {
  reason: 'Multiple failed login attempts',
  count: 5,
});

// Track performance
const { trackRequestPerformance } = require('./middleware/requestLogger');
app.use('/api/slow-endpoint', trackRequestPerformance);
```

### Skipped Requests

The following requests are not logged to reduce noise:
- Health check endpoints (`/health`, `/api/health`)
- Static files (`.css`, `.js`, images)
- Successful OPTIONS requests (CORS preflight)

---

## Error Handling

Centralized error handling with proper logging and responses.

### Configuration

Located in: `backend/src/middleware/errorHandler.js`

### Error Classes

```javascript
const {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
} = require('./middleware/errorHandler');

// Throw specific errors
throw new ValidationError('Invalid email format');
throw new AuthenticationError('Invalid credentials');
throw new AuthorizationError('Admin access required');
throw new NotFoundError('Course');
throw new ConflictError('Email already exists');
throw new RateLimitError('Too many requests');
```

### Async Error Handling

```javascript
const { catchAsync } = require('./middleware/errorHandler');

// Wrap async route handlers
exports.createCourse = catchAsync(async (req, res, next) => {
  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});
```

### Assertions

```javascript
const { assert } = require('./middleware/errorHandler');

// Assert condition or throw error
assert(user, 'User not found', 404);
assert(user.role === 'admin', 'Admin access required', 403);
assert(course.instructor.toString() === user.id, 'Not authorized', 403);
```

### Response Helpers

```javascript
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require('./middleware/errorHandler');

// Success response
return successResponse(res, course, 'Course created successfully', 201);

// Error response
return errorResponse(res, 400, 'Invalid input', [
  { field: 'email', message: 'Email is required' },
]);

// Paginated response
return paginatedResponse(res, courses, {
  page: 1,
  totalPages: 10,
  totalItems: 100,
  limit: 10,
});
```

### Error Handler Setup

```javascript
const { errorHandler, notFound, sentryErrorHandler } = require('./middleware/errorHandler');

// In server.js (must be last middleware)

// 404 handler
app.use(notFound);

// Sentry error handler
app.use(sentryErrorHandler);

// Custom error handler
app.use(errorHandler);
```

---

## Log Management

### Log Rotation

Logs automatically rotate based on:
- **Size**: When file reaches `LOG_MAX_SIZE` (default: 20MB)
- **Time**: Daily rotation
- **Retention**: Old logs deleted after `LOG_MAX_FILES` days (default: 30 days)

### Log File Format

```json
{
  "level": "info",
  "message": "User login",
  "timestamp": "2025-11-23T10:30:00.000Z",
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "ip": "192.168.1.1",
  "service": "lms-backend",
  "environment": "production"
}
```

### Viewing Logs

```bash
# View recent logs
tail -f logs/combined-2025-11-23.log

# View error logs
tail -f logs/error-2025-11-23.log

# Search logs
grep "ERROR" logs/combined-2025-11-23.log

# View specific user activity
grep "userId.*507f1f77bcf86cd799439011" logs/audit-2025-11-23.log
```

### Log Cleanup

```bash
# Manual cleanup (delete logs older than 30 days)
find logs -name "*.log" -mtime +30 -delete

# Compress old logs
find logs -name "*.log" -mtime +7 -exec gzip {} \;
```

---

## Production Setup

### 1. Environment Variables

Create `.env.production`:

```env
# Logging
LOG_LEVEL=info
LOG_DIR=/var/log/lms
LOG_MAX_SIZE=20m
LOG_MAX_FILES=30d
LOG_CONSOLE=false
LOG_FILE=true

# Sentry
SENTRY_ENABLED=true
SENTRY_DSN=https://your-key@sentry.io/project-id
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_RELEASE=lms-backend@1.0.0
```

### 2. Log Directory Setup

```bash
# Create log directory
sudo mkdir -p /var/log/lms
sudo chown -R node:node /var/log/lms
sudo chmod 755 /var/log/lms
```

### 3. Log Rotation with Logrotate

Create `/etc/logrotate.d/lms`:

```
/var/log/lms/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 node node
    sharedscripts
    postrotate
        systemctl reload lms-backend
    endscript
}
```

### 4. PM2 Setup

```bash
# Start with PM2
pm2 start src/server.js --name lms-backend

# View logs
pm2 logs lms-backend

# Combined logs
pm2 logs lms-backend --lines 100

# Error logs only
pm2 logs lms-backend --err
```

### 5. Centralized Logging

For production, consider centralized logging:

#### Option 1: ELK Stack (Elasticsearch, Logstash, Kibana)

```javascript
// Add Elasticsearch transport
const { ElasticsearchTransport } = require('winston-elasticsearch');

logger.add(new ElasticsearchTransport({
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL,
  },
  index: 'lms-logs',
}));
```

#### Option 2: CloudWatch Logs

```javascript
// Add CloudWatch transport
const WinstonCloudWatch = require('winston-cloudwatch');

logger.add(new WinstonCloudWatch({
  logGroupName: '/aws/ec2/lms-backend',
  logStreamName: process.env.INSTANCE_ID,
  awsRegion: process.env.AWS_REGION,
}));
```

#### Option 3: Datadog

```javascript
// Use Datadog transport
const winston = require('winston');
const { datadog } = require('datadog-winston');

logger.add(datadog({
  apiKey: process.env.DATADOG_API_KEY,
  hostname: process.env.HOSTNAME,
  service: 'lms-backend',
  ddsource: 'nodejs',
}));
```

---

## Best Practices

### 1. Log Levels

Use appropriate log levels:

```javascript
// ERROR: System errors, exceptions
logger.error('Database connection failed', { error: err.message });

// WARN: Warnings, deprecations, rate limits
logger.warn('API rate limit exceeded', { userId, endpoint });

// INFO: General information, important business events
logger.info('User registered', { userId, email });

// HTTP: HTTP requests/responses
logger.http('GET /api/users 200 45ms');

// DEBUG: Debugging information
logger.debug('Cache hit', { key: 'user:123', ttl: 3600 });
```

### 2. Structured Logging

Always use structured logging with metadata:

```javascript
// ❌ Bad
logger.info(`User ${user.id} created course ${course.id}`);

// ✅ Good
logger.info('Course created', {
  userId: user.id,
  courseId: course.id,
  courseName: course.title,
  timestamp: new Date().toISOString(),
});
```

### 3. Sensitive Data

Never log sensitive data:

```javascript
// ❌ Bad
logger.info('User login', { password: req.body.password });

// ✅ Good
logger.info('User login', { email: req.body.email });
```

### 4. Error Context

Include context when logging errors:

```javascript
try {
  await processPayment(payment);
} catch (error) {
  logger.error('Payment processing failed', {
    error: error.message,
    stack: error.stack,
    userId: user.id,
    paymentId: payment.id,
    amount: payment.amount,
  });

  captureException(error, {
    user: { id: user.id },
    tags: { feature: 'payments' },
    extra: { paymentId: payment.id },
  });
}
```

### 5. Performance

Log strategically to avoid performance impact:

```javascript
// ❌ Bad - logs every cache access
cache.get(key, (err, value) => {
  logger.debug('Cache access', { key, value });
});

// ✅ Good - only log cache misses
cache.get(key, (err, value) => {
  if (!value) {
    logger.debug('Cache miss', { key });
  }
});
```

### 6. Audit Trail

Maintain audit logs for important actions:

```javascript
// User actions
logger.logAudit('user_created', user, 'users', { role: 'admin' });
logger.logAudit('course_published', user, `courses/${courseId}`);
logger.logAudit('permissions_changed', user, `users/${targetUserId}`, {
  oldRole: 'student',
  newRole: 'instructor',
});

// System actions
logger.logAudit('database_backup', null, 'system', {
  backupSize: '2.5GB',
  duration: '45s',
});
```

---

## Troubleshooting

### Logs Not Being Created

**Problem**: Log files are not being created

**Solutions**:
1. Check log directory permissions:
   ```bash
   ls -la logs/
   chmod 755 logs/
   ```

2. Check `LOG_FILE` environment variable:
   ```env
   LOG_FILE=true
   ```

3. Check for errors on startup:
   ```bash
   node src/server.js
   ```

### Logs Not Rotating

**Problem**: Old log files not being rotated

**Solutions**:
1. Check Winston configuration in `logger.js`:
   ```javascript
   maxSize: '20m',
   maxFiles: '30d',
   ```

2. Verify logrotate cron job:
   ```bash
   sudo systemctl status cron
   ```

3. Test logrotate manually:
   ```bash
   sudo logrotate -f /etc/logrotate.d/lms
   ```

### Sentry Not Receiving Errors

**Problem**: Errors not appearing in Sentry

**Solutions**:
1. Check Sentry is enabled:
   ```env
   SENTRY_ENABLED=true
   ```

2. Verify DSN is correct:
   ```bash
   echo $SENTRY_DSN
   ```

3. Check network connectivity:
   ```bash
   curl https://sentry.io
   ```

4. Check Sentry initialization:
   ```javascript
   const sentry = initSentry(app);
   console.log('Sentry initialized:', !!sentry);
   ```

5. Test error capture:
   ```javascript
   captureException(new Error('Test error'));
   ```

### High Log Volume

**Problem**: Too many logs, running out of disk space

**Solutions**:
1. Increase log level:
   ```env
   LOG_LEVEL=warn  # or error
   ```

2. Reduce retention period:
   ```env
   LOG_MAX_FILES=7d
   ```

3. Skip noisy endpoints:
   ```javascript
   function shouldSkipLogging(req, res) {
     if (req.url.includes('/health')) return true;
     if (req.url.includes('/metrics')) return true;
     return false;
   }
   ```

4. Compress old logs:
   ```bash
   gzip logs/*.log
   ```

### Missing Request Logs

**Problem**: Some HTTP requests not being logged

**Solutions**:
1. Check middleware order in `server.js`:
   ```javascript
   app.use(requestLogger);  // Must be before routes
   app.use('/api', routes);
   ```

2. Check skip conditions in `requestLogger.js`

3. Verify Morgan stream is working:
   ```javascript
   console.log('Morgan stream:', morganStream);
   ```

---

## Monitoring Dashboard

### Sentry Dashboard

Access: https://sentry.io

**Key Metrics**:
- Error rate and frequency
- Affected users
- Error trends over time
- Performance metrics
- Release tracking

### Custom Monitoring

Create monitoring endpoint:

```javascript
// In routes
router.get('/monitoring/stats', async (req, res) => {
  const { getLogStats } = require('../middleware/requestLogger');
  const stats = await getLogStats(req, res);

  res.json({
    logs: stats,
    sentry: {
      enabled: process.env.SENTRY_ENABLED === 'true',
      environment: process.env.SENTRY_ENVIRONMENT,
    },
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  });
});
```

---

## References

- [Winston Documentation](https://github.com/winstonjs/winston)
- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Morgan Documentation](https://github.com/expressjs/morgan)
- [Log Management Best Practices](https://www.loggly.com/ultimate-guide/node-logging-basics/)

---

**Last Updated**: 2025-11-23
**Maintained By**: LMS Development Team
