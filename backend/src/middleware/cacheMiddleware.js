/**
 * Cache Middleware
 *
 * Middleware for caching API responses using Redis.
 * Provides automatic caching, cache invalidation, and cache warming.
 *
 * Usage:
 *   const { cacheResponse, invalidateCache } = require('./middleware/cacheMiddleware');
 *
 *   // Cache GET requests
 *   router.get('/api/courses', cacheResponse(300), getCourses);
 *
 *   // Invalidate cache on POST/PUT/DELETE
 *   router.post('/api/courses', invalidateCache('courses:*'), createCourse);
 */

const cache = require('../config/cache');
const logger = require('../config/logger');

/**
 * Cache response middleware
 * @param {number} ttl - Time to live in seconds (default: 5 minutes)
 * @param {Function} keyGenerator - Custom key generator function
 * @returns {Function} - Express middleware
 */
function cacheResponse(ttl = 300, keyGenerator = null) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if disabled
    if (!cache.isRedisConnected()) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator
        ? keyGenerator(req)
        : generateCacheKey(req);

      // Try to get from cache
      const cachedData = await cache.get(cacheKey);

      if (cachedData) {
        // Return cached response
        logger.debug('Cache hit for request', {
          method: req.method,
          url: req.originalUrl,
          key: cacheKey,
        });

        return res.status(200).json({
          ...cachedData,
          cached: true,
          cachedAt: cachedData._cachedAt || new Date().toISOString(),
        });
      }

      // Cache miss - store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function (data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const cacheData = {
            ...data,
            _cachedAt: new Date().toISOString(),
          };

          cache.set(cacheKey, cacheData, ttl).catch((err) => {
            logger.error('Failed to cache response', {
              key: cacheKey,
              error: err.message,
            });
          });

          logger.debug('Response cached', {
            method: req.method,
            url: req.originalUrl,
            key: cacheKey,
            ttl,
          });
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', {
        error: error.message,
        url: req.originalUrl,
      });
      next();
    }
  };
}

/**
 * Generate cache key from request
 * @param {object} req - Express request object
 * @returns {string} - Cache key
 */
function generateCacheKey(req) {
  const parts = [
    req.baseUrl || '',
    req.path || req.url,
  ];

  // Add query string if present
  if (Object.keys(req.query).length > 0) {
    const sortedQuery = Object.keys(req.query)
      .sort()
      .map((key) => `${key}=${req.query[key]}`)
      .join('&');
    parts.push(sortedQuery);
  }

  // Add user ID if authenticated
  if (req.user?.id) {
    parts.push(`user:${req.user.id}`);
  }

  return `api:${parts.join(':')}`;
}

/**
 * Invalidate cache middleware
 * @param {string|string[]} patterns - Cache key pattern(s) to invalidate
 * @returns {Function} - Express middleware
 */
function invalidateCache(...patterns) {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to invalidate cache after successful response
    res.json = function (data) {
      // Only invalidate on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        Promise.all(
          patterns.map(async (pattern) => {
            try {
              const count = await cache.delPattern(pattern);
              if (count > 0) {
                logger.debug('Cache invalidated', {
                  pattern,
                  count,
                  method: req.method,
                  url: req.originalUrl,
                });
              }
            } catch (error) {
              logger.error('Cache invalidation error', {
                pattern,
                error: error.message,
              });
            }
          })
        ).catch((err) => {
          logger.error('Cache invalidation failed', {
            error: err.message,
          });
        });
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache warming middleware
 * Proactively loads data into cache
 * @param {string} key - Cache key
 * @param {Function} dataLoader - Function to load data
 * @param {number} ttl - Time to live in seconds
 */
async function warmCache(key, dataLoader, ttl = 3600) {
  try {
    // Check if already cached
    const exists = await cache.exists(key);
    if (exists) {
      logger.debug('Cache already warm', { key });
      return;
    }

    // Load data
    const data = await dataLoader();

    // Cache the data
    await cache.set(key, data, ttl);

    logger.info('Cache warmed', { key, ttl });
  } catch (error) {
    logger.error('Cache warming failed', {
      key,
      error: error.message,
    });
  }
}

/**
 * Query result caching helper
 * Wraps mongoose queries with caching
 * @param {string} key - Cache key
 * @param {Function} query - Mongoose query function
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Query result
 */
async function cacheQuery(key, query, ttl = 300) {
  return cache.wrap(key, query, ttl);
}

/**
 * User-specific cache middleware
 * Caches responses per user
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware
 */
function cachePerUser(ttl = 300) {
  return cacheResponse(ttl, (req) => {
    const userId = req.user?.id || 'anonymous';
    return `api:user:${userId}:${req.path}:${JSON.stringify(req.query)}`;
  });
}

/**
 * Course-specific cache middleware
 * Caches responses per course
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware
 */
function cachePerCourse(ttl = 300) {
  return cacheResponse(ttl, (req) => {
    const courseId = req.params.courseId || req.params.id;
    return `api:course:${courseId}:${req.path}:${JSON.stringify(req.query)}`;
  });
}

/**
 * Paginated response cache middleware
 * Caches paginated API responses
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware
 */
function cachePaginated(ttl = 300) {
  return cacheResponse(ttl, (req) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const sort = req.query.sort || '';
    return `api:${req.path}:page:${page}:limit:${limit}:sort:${sort}`;
  });
}

/**
 * Conditional cache middleware
 * Only caches if condition is met
 * @param {Function} condition - Condition function
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} - Express middleware
 */
function cacheIf(condition, ttl = 300) {
  return (req, res, next) => {
    if (condition(req)) {
      return cacheResponse(ttl)(req, res, next);
    }
    next();
  };
}

/**
 * No-cache middleware
 * Adds headers to prevent caching
 * @returns {Function} - Express middleware
 */
function noCache() {
  return (req, res, next) => {
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    next();
  };
}

/**
 * ETag middleware for conditional requests
 * @returns {Function} - Express middleware
 */
function etag() {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      // Generate ETag from response data
      const crypto = require('crypto');
      const hash = crypto
        .createHash('md5')
        .update(JSON.stringify(data))
        .digest('hex');

      const etag = `"${hash}"`;

      // Check if client has fresh version
      const clientEtag = req.headers['if-none-match'];
      if (clientEtag === etag) {
        return res.status(304).end();
      }

      // Set ETag header
      res.set('ETag', etag);

      return originalJson(data);
    };

    next();
  };
}

/**
 * Cache statistics endpoint handler
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
async function getCacheStats(req, res) {
  try {
    const stats = await cache.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error('Failed to get cache stats', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve cache statistics',
    });
  }
}

/**
 * Clear cache endpoint handler
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
async function clearCache(req, res) {
  try {
    const { pattern } = req.body;

    if (pattern) {
      // Clear specific pattern
      const count = await cache.delPattern(pattern);
      logger.info('Cache cleared by pattern', {
        pattern,
        count,
        userId: req.user?.id,
      });

      return res.json({
        success: true,
        message: `Cleared ${count} cache entries matching pattern: ${pattern}`,
        count,
      });
    } else {
      // Clear all cache
      await cache.flush();
      logger.warn('All cache cleared', {
        userId: req.user?.id,
      });

      return res.json({
        success: true,
        message: 'All cache cleared successfully',
      });
    }
  } catch (error) {
    logger.error('Failed to clear cache', {
      error: error.message,
    });

    res.status(500).json({
      success: false,
      error: 'Failed to clear cache',
    });
  }
}

/**
 * Cache key generator helpers
 */
const cacheKeys = {
  course: (id) => `course:${id}`,
  courses: (filters) => `courses:${JSON.stringify(filters || {})}`,
  user: (id) => `user:${id}`,
  enrollment: (userId, courseId) => `enrollment:${userId}:${courseId}`,
  lesson: (id) => `lesson:${id}`,
  assignment: (id) => `assignment:${id}`,
  quiz: (id) => `quiz:${id}`,
  leaderboard: (courseId) => `leaderboard:${courseId}`,
  stats: (type, id) => `stats:${type}:${id}`,
};

module.exports = {
  // Middleware
  cacheResponse,
  invalidateCache,
  cachePerUser,
  cachePerCourse,
  cachePaginated,
  cacheIf,
  noCache,
  etag,

  // Utilities
  warmCache,
  cacheQuery,
  generateCacheKey,

  // Handlers
  getCacheStats,
  clearCache,

  // Helpers
  cacheKeys,
};
