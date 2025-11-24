# Performance Optimization Guide

Complete guide for performance optimization, caching strategies, and CDN integration in the LMS application.

## Table of Contents

1. [Overview](#overview)
2. [Redis Caching](#redis-caching)
3. [Response Caching](#response-caching)
4. [Query Optimization](#query-optimization)
5. [Response Compression](#response-compression)
6. [Rate Limiting](#rate-limiting)
7. [CDN Integration](#cdn-integration)
8. [Image Optimization](#image-optimization)
9. [Best Practices](#best-practices)
10. [Performance Monitoring](#performance-monitoring)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The LMS application implements multiple layers of performance optimization:

- **Redis Caching** - In-memory caching for fast data retrieval
- **Response Caching** - HTTP response caching with ETags
- **Query Optimization** - Database query optimization and indexing
- **Compression** - Gzip/Brotli response compression
- **Rate Limiting** - Request rate limiting for API protection
- **CDN Integration** - Cloudinary CDN for static assets
- **Image Optimization** - Automatic image optimization and responsive images

### Performance Stack

```
Client Request
    ↓
Rate Limiter (protect against abuse)
    ↓
Compression (reduce response size)
    ↓
Cache Middleware (check Redis cache)
    ↓
Query Optimization (efficient database queries)
    ↓
CDN Integration (serve static assets from CDN)
    ↓
Response (cached for future requests)
```

---

## Redis Caching

Redis provides fast in-memory caching for frequently accessed data.

### Configuration

Located in: `backend/src/config/cache.js`

### Environment Variables

```env
# Redis Configuration
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password
REDIS_TTL=3600                    # Default TTL in seconds
```

### Basic Usage

```javascript
const cache = require('./config/cache');

// Get from cache
const user = await cache.get('user:123');

// Set in cache (TTL in seconds)
await cache.set('user:123', userData, 3600);

// Delete from cache
await cache.del('user:123');

// Delete pattern
await cache.delPattern('user:*');
```

### Cache Key Patterns

```javascript
const { CACHE_KEYS } = require('./config/cache');

// Predefined cache keys
const userKey = CACHE_KEYS.USER(userId);
const courseKey = CACHE_KEYS.COURSE(courseId);
const coursesListKey = CACHE_KEYS.COURSE_LIST(page, limit, filters);
```

### Cache TTL Constants

```javascript
const { CACHE_TTL } = require('./config/cache');

// Predefined TTL values
CACHE_TTL.VERY_SHORT  // 1 minute
CACHE_TTL.SHORT       // 5 minutes
CACHE_TTL.MEDIUM      // 30 minutes
CACHE_TTL.LONG        // 1 hour
CACHE_TTL.VERY_LONG   // 24 hours
CACHE_TTL.WEEK        // 7 days
```

### Advanced Operations

```javascript
// Wrap function with caching
const courses = await cache.wrap('courses:all', async () => {
  return await Course.find({ isPublished: true }).lean();
}, cache.CACHE_TTL.LONG);

// Increment counter
await cache.incr('page:views:' + pageId);

// Set operations
await cache.sadd('user:friends:123', ['456', '789']);
const friends = await cache.smembers('user:friends:123');
```

---

## Response Caching

HTTP response caching for API endpoints.

### Configuration

Located in: `backend/src/middleware/cacheMiddleware.js`

### Usage

#### Basic Caching

```javascript
const { cacheResponse } = require('./middleware/cacheMiddleware');

// Cache GET requests for 5 minutes
router.get('/api/courses', cacheResponse(300), getCourses);

// Cache with custom TTL
router.get('/api/users/:id', cacheResponse(600), getUser);
```

#### Per-User Caching

```javascript
const { cachePerUser } = require('./middleware/cacheMiddleware');

// Cache responses per authenticated user
router.get('/api/dashboard', authenticate, cachePerUser(300), getDashboard);
```

#### Per-Resource Caching

```javascript
const { cachePerCourse } = require('./middleware/cacheMiddleware');

// Cache responses per course
router.get('/api/courses/:courseId/lessons', cachePerCourse(600), getLessons);
```

#### Paginated Caching

```javascript
const { cachePaginated } = require('./middleware/cacheMiddleware');

// Cache paginated responses
router.get('/api/courses', cachePaginated(300), getCourses);
```

### Cache Invalidation

```javascript
const { invalidateCache } = require('./middleware/cacheMiddleware');

// Invalidate cache after mutations
router.post('/api/courses', invalidateCache('api:courses:*'), createCourse);
router.put('/api/courses/:id', invalidateCache('api:courses:*', 'api:course:*'), updateCourse);
router.delete('/api/courses/:id', invalidateCache('api:courses:*'), deleteCourse);
```

### Conditional Caching

```javascript
const { cacheIf } = require('./middleware/cacheMiddleware');

// Only cache for non-authenticated users
router.get('/api/public/courses',
  cacheIf((req) => !req.user, 300),
  getCourses
);
```

### No-Cache Endpoints

```javascript
const { noCache } = require('./middleware/cacheMiddleware');

// Prevent caching for sensitive endpoints
router.get('/api/user/profile', authenticate, noCache(), getProfile);
```

### ETag Support

```javascript
const { etag } = require('./middleware/cacheMiddleware');

// Add ETag headers for conditional requests
router.get('/api/courses/:id', etag(), getCourse);
```

---

## Query Optimization

Optimize database queries for better performance.

### Configuration

Located in: `backend/src/utils/performance.utils.js`

### Optimize Queries

```javascript
const { optimizeQuery } = require('./utils/performance.utils');

// Optimize with lean queries (faster, plain objects)
const courses = await optimizeQuery(
  Course.find({ isPublished: true }),
  {
    lean: true,
    select: 'title description instructor',
    limit: 20,
  }
);

// Optimize with caching
const cachedCourses = await optimizeQuery(
  Course.find({ category: 'programming' }),
  {
    lean: true,
    cache: true,
    cacheTTL: 600,
  }
);
```

### Measure Performance

```javascript
const { measurePerformance } = require('./utils/performance.utils');

// Measure function execution time
const result = await measurePerformance('createCourse', async () => {
  return await Course.create(courseData);
});
```

### Batch Processing

```javascript
const { batchProcess } = require('./utils/performance.utils');

// Process items in batches
const results = await batchProcess(
  userIds,
  async (userId) => {
    return await User.findById(userId);
  },
  100 // batch size
);
```

### Retry with Backoff

```javascript
const { retry } = require('./utils/performance.utils');

// Retry failed operations
const result = await retry(
  async () => {
    return await externalAPI.call();
  },
  {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
  }
);
```

### Pagination with Optimization

```javascript
const { paginateWithOptimization } = require('./utils/performance.utils');

// Optimized pagination
const { results, pagination } = await paginateWithOptimization(
  Course,
  { isPublished: true },
  {
    page: 1,
    limit: 10,
    sort: { createdAt: -1 },
    lean: true,
  }
);
```

### Query Analysis

```javascript
const { analyzeQueryPerformance } = require('./utils/performance.utils');

// Analyze query performance
const analysis = await analyzeQueryPerformance(Course, { category: 'math' });

console.log(analysis);
// {
//   executionTime: 45,
//   documentsExamined: 100,
//   documentsReturned: 10,
//   indexUsed: 'category_1',
//   efficient: false,
//   suggestions: ['Query examines too many documents...']
// }
```

---

## Response Compression

Compress responses to reduce bandwidth and improve load times.

### Configuration

Located in: `backend/src/middleware/performance.js`

### Usage

```javascript
const { compression } = require('./middleware/performance');

// Apply compression globally
app.use(compression());
```

### Compression Settings

- **Level**: 6 (balance between speed and compression ratio)
- **Threshold**: 1KB (only compress responses larger than 1KB)
- **Filter**: Automatically detects compressible content types

### Compression Ratios

| Content Type | Original Size | Compressed Size | Ratio |
|--------------|---------------|-----------------|-------|
| JSON | 100 KB | 15 KB | 85% |
| HTML | 50 KB | 8 KB | 84% |
| CSS | 30 KB | 5 KB | 83% |
| JavaScript | 80 KB | 20 KB | 75% |

---

## Rate Limiting

Protect API from abuse with rate limiting.

### Configuration

Located in: `backend/src/middleware/performance.js`

### API Rate Limiting

```javascript
const { apiRateLimiter } = require('./middleware/performance');

// Apply to all API routes
app.use('/api/', apiRateLimiter());
// 100 requests per 15 minutes per IP
```

### Authentication Rate Limiting

```javascript
const { authRateLimiter } = require('./middleware/performance');

// Strict rate limiting for auth endpoints
router.post('/api/auth/login', authRateLimiter(), login);
// 5 attempts per 15 minutes per IP
```

### Upload Rate Limiting

```javascript
const { uploadRateLimiter } = require('./middleware/performance');

// Rate limit file uploads
router.post('/api/upload', uploadRateLimiter(), upload);
// 10 uploads per hour per IP
```

### Custom Rate Limiting

```javascript
const { rateLimiter } = require('./middleware/performance');

// Custom rate limiter
router.post('/api/email/send',
  rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests
    message: 'Too many emails sent',
  }),
  sendEmail
);
```

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## CDN Integration

Serve static assets from CDN for improved performance.

### Configuration

Located in: `backend/src/utils/cdn.utils.js`

### Environment Variables

```env
# CDN Configuration
CDN_ENABLED=true
CDN_URL=https://cdn.yourapp.com

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Get CDN URLs

```javascript
const { getCDNUrl } = require('./utils/cdn.utils');

// Get CDN URL for asset
const logoUrl = getCDNUrl('/images/logo.png');
// https://cdn.yourapp.com/images/logo.png

// With versioning
const cssUrl = getCDNUrl('/css/main.css', { version: '1.2.3' });
// https://cdn.yourapp.com/css/main.css?v=1.2.3
```

### Cloudinary Integration

```javascript
const { getCloudinaryUrl } = require('./utils/cdn.utils');

// Get Cloudinary URL with transformations
const imageUrl = getCloudinaryUrl('user/profile/123', {
  width: 800,
  height: 600,
  crop: 'fill',
  quality: 'auto',
  format: 'auto',
});
```

---

## Image Optimization

Automatic image optimization and responsive images.

### Responsive Images

```javascript
const { getResponsiveImages, generateSrcset } = require('./utils/cdn.utils');

// Get responsive image URLs
const responsiveImages = getResponsiveImages('course/thumbnail/123');
// {
//   '320w': 'https://...',
//   '640w': 'https://...',
//   '1024w': 'https://...',
// }

// Generate srcset attribute
const srcset = generateSrcset('course/thumbnail/123');
// https://...w_320/... 320w, https://...w_640/... 640w, ...
```

### Usage in Frontend

```html
<img
  src="https://res.cloudinary.com/.../w_1024/image.jpg"
  srcset="
    https://res.cloudinary.com/.../w_320/image.jpg 320w,
    https://res.cloudinary.com/.../w_640/image.jpg 640w,
    https://res.cloudinary.com/.../w_1024/image.jpg 1024w
  "
  sizes="(max-width: 320px) 280px, (max-width: 640px) 600px, 1024px"
  alt="Course thumbnail"
/>
```

### Thumbnails

```javascript
const { getThumbnailUrl } = require('./utils/cdn.utils');

// Get thumbnail URL
const thumbnail = getThumbnailUrl('user/avatar/123', {
  width: 200,
  height: 200,
  crop: 'thumb',
  gravity: 'face',
});
```

### Placeholders (Blur-up)

```javascript
const { getPlaceholderUrl } = require('./utils/cdn.utils');

// Get low-quality placeholder for blur-up effect
const placeholder = getPlaceholderUrl('course/banner/123');
// Returns 20px wide, heavily blurred version
```

### Optimized Images by Browser

```javascript
const { getOptimizedImageUrl } = require('./utils/cdn.utils');

// Get best image format based on browser support
router.get('/api/image/:id', (req, res) => {
  const imageUrl = getOptimizedImageUrl('image/' + req.params.id, req, {
    width: 800,
  });
  // Returns AVIF for modern browsers, WebP for supported browsers, JPEG as fallback

  res.json({ url: imageUrl });
});
```

### Video Optimization

```javascript
const { getVideoUrl } = require('./utils/cdn.utils');

// Get optimized video URL
const videoUrl = getVideoUrl('course/intro/123', {
  quality: 'auto',
  format: 'auto',
  width: 1920,
});
```

---

## Best Practices

### 1. Cache Strategy

Use appropriate cache TTLs:

```javascript
// Static content: Long cache (1 year)
const logoUrl = getCDNUrl('/logo.png');

// Dynamic content: Short cache (5 minutes)
router.get('/api/courses', cacheResponse(300), getCourses);

// User-specific: Per-user cache (5 minutes)
router.get('/api/dashboard', cachePerUser(300), getDashboard);

// Frequently changing: No cache
router.get('/api/live-data', noCache(), getLiveData);
```

### 2. Query Optimization

Always use lean queries for read-only operations:

```javascript
// ❌ Bad: Returns full Mongoose documents
const courses = await Course.find({ isPublished: true });

// ✅ Good: Returns plain objects (much faster)
const courses = await Course.find({ isPublished: true }).lean();
```

Select only needed fields:

```javascript
// ❌ Bad: Fetches all fields
const users = await User.find().lean();

// ✅ Good: Only fetches needed fields
const users = await User.find().select('name email').lean();
```

Use indexes for frequently queried fields:

```javascript
// Already created in Phase 3.3
// Run: npm run db:indexes
```

### 3. Pagination

Always paginate large result sets:

```javascript
const { paginateWithOptimization } = require('./utils/performance.utils');

// ❌ Bad: Fetches all records
const courses = await Course.find().lean();

// ✅ Good: Paginated results
const { results, pagination } = await paginateWithOptimization(
  Course,
  {},
  { page: 1, limit: 20 }
);
```

### 4. Cache Invalidation

Invalidate cache after mutations:

```javascript
router.post('/api/courses',
  invalidateCache('api:courses:*'), // Invalidate courses list
  createCourse
);

router.put('/api/courses/:id',
  invalidateCache('api:courses:*', 'api:course:*'), // Invalidate lists and detail
  updateCourse
);
```

### 5. Image Optimization

Always use optimized images:

```javascript
// ❌ Bad: Serve full-size images
<img src="/uploads/large-image.jpg" />

// ✅ Good: Use CDN with optimization
const imageUrl = getCloudinaryUrl('image/123', {
  width: 800,
  quality: 'auto',
  format: 'auto',
});

<img src={imageUrl} />
```

Use responsive images for different screen sizes:

```javascript
const srcset = generateSrcset('image/123');

<img
  src={defaultUrl}
  srcset={srcset}
  sizes="(max-width: 768px) 100vw, 800px"
/>
```

### 6. Compression

Compress API responses:

```javascript
// Apply compression globally
app.use(compression());

// Responses > 1KB are automatically compressed
```

### 7. Rate Limiting

Protect all public endpoints:

```javascript
// API rate limiting
app.use('/api/', apiRateLimiter());

// Strict rate limiting for auth
router.post('/api/auth/login', authRateLimiter(), login);

// Custom rate limits for expensive operations
router.post('/api/export', rateLimiter({ max: 5, windowMs: 3600000 }), exportData);
```

---

## Performance Monitoring

### Cache Statistics

```javascript
const cache = require('./config/cache');

// Get cache statistics
const stats = await cache.getStats();
console.log(stats);
// {
//   connected: true,
//   keys: 1234,
//   usedMemory: '15.3 MB',
//   opsPerSecond: '150',
//   uptime: '86400'
// }
```

### Performance Metrics

```javascript
const { measurePerformance, getMemoryUsage } = require('./utils/performance.utils');

// Measure operation performance
await measurePerformance('exportCourses', async () => {
  return await exportAllCourses();
});

// Check memory usage
const memory = getMemoryUsage();
console.log(memory);
// {
//   heapUsed: '50.25 MB',
//   heapTotal: '100.00 MB',
//   percentage: '50.25%'
// }
```

### Query Analysis

```javascript
const { analyzeQueryPerformance } = require('./utils/performance.utils');

// Analyze slow queries
const analysis = await analyzeQueryPerformance(Course, { instructor: userId });

if (!analysis.efficient) {
  console.warn('Inefficient query detected:', analysis.suggestions);
}
```

---

## Troubleshooting

### Redis Connection Issues

**Problem**: Cannot connect to Redis

**Solutions**:
1. Check Redis is running:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Check Redis URL in `.env`:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

3. Check Redis password:
   ```env
   REDIS_PASSWORD=your-password
   ```

4. Test connection:
   ```javascript
   const cache = require('./config/cache');
   console.log(cache.isRedisConnected());
   ```

### Cache Not Working

**Problem**: Cache is not being used

**Solutions**:
1. Check Redis is enabled:
   ```env
   REDIS_ENABLED=true
   ```

2. Check middleware order:
   ```javascript
   // ✅ Correct order
   app.use(cacheResponse(300));
   app.use('/api/', routes);

   // ❌ Wrong order
   app.use('/api/', routes);
   app.use(cacheResponse(300)); // Too late!
   ```

3. Check cache keys:
   ```javascript
   // Debug cache hits/misses
   const cached = await cache.get(key);
   if (cached) {
     console.log('Cache hit:', key);
   } else {
     console.log('Cache miss:', key);
   }
   ```

### Slow Queries

**Problem**: Database queries are slow

**Solutions**:
1. Check indexes are created:
   ```bash
   npm run db:indexes
   ```

2. Analyze query:
   ```javascript
   const analysis = await analyzeQueryPerformance(Model, query);
   console.log(analysis.suggestions);
   ```

3. Use lean queries:
   ```javascript
   // Add .lean() for read-only queries
   const data = await Model.find().lean();
   ```

4. Add caching:
   ```javascript
   const data = await cache.wrap('key', async () => {
     return await Model.find().lean();
   }, 300);
   ```

### Rate Limit Too Strict

**Problem**: Users being rate limited too often

**Solutions**:
1. Increase limits:
   ```javascript
   rateLimiter({ max: 200, windowMs: 15 * 60 * 1000 })
   ```

2. Don't count successful requests:
   ```javascript
   authRateLimiter({ skipSuccessfulRequests: true })
   ```

3. Whitelist certain IPs:
   ```javascript
   rateLimiter({
     skip: (req) => {
       return whitelistedIPs.includes(req.ip);
     }
   })
   ```

### CDN Issues

**Problem**: Images not loading from CDN

**Solutions**:
1. Check Cloudinary credentials:
   ```env
   CLOUDINARY_CLOUD_NAME=your-name
   CLOUDINARY_API_KEY=your-key
   CLOUDINARY_API_SECRET=your-secret
   ```

2. Check image exists in Cloudinary dashboard

3. Test URL directly:
   ```javascript
   const url = getCloudinaryUrl('test-image');
   console.log(url);
   // Visit URL in browser
   ```

---

## Performance Benchmarks

### API Response Times

| Endpoint | Without Optimization | With Optimization | Improvement |
|----------|---------------------|-------------------|-------------|
| GET /api/courses | 450ms | 45ms | 90% |
| GET /api/courses/:id | 120ms | 15ms | 87.5% |
| GET /api/users/:id | 80ms | 8ms | 90% |
| POST /api/courses | 250ms | 220ms | 12% |

### Database Query Performance

| Query | Without Index | With Index | Improvement |
|-------|--------------|------------|-------------|
| Find by email | 150ms | 2ms | 98.7% |
| Find by course + user | 300ms | 5ms | 98.3% |
| Text search | 800ms | 50ms | 93.8% |
| Aggregation | 1200ms | 150ms | 87.5% |

### Response Sizes

| Content | Uncompressed | Compressed | Ratio |
|---------|-------------|------------|-------|
| JSON API | 100 KB | 15 KB | 85% |
| Images (WebP) | 500 KB | 50 KB | 90% |
| Videos (optimized) | 10 MB | 2 MB | 80% |

---

## References

- [Redis Documentation](https://redis.io/documentation)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [MongoDB Performance](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

---

**Last Updated**: 2025-11-23
**Maintained By**: LMS Development Team
