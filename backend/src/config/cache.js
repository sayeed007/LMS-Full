/**
 * Redis Cache Configuration
 *
 * Centralized Redis cache configuration for the application.
 * Provides caching utilities for improved performance.
 *
 * Usage:
 *   const cache = require('./config/cache');
 *
 *   // Get cached data
 *   const data = await cache.get('key');
 *
 *   // Set cached data
 *   await cache.set('key', data, 3600); // TTL in seconds
 *
 *   // Delete cached data
 *   await cache.del('key');
 */

const redis = require('redis');
const logger = require('./logger');
const { cache: cacheConfig } = require('./env.config');

// Redis client instance
let redisClient = null;
let isConnected = false;

/**
 * Initialize Redis client
 */
async function initRedis() {
  if (!cacheConfig.enabled) {
    logger.info('Redis cache is disabled');
    return null;
  }

  try {
    // Create Redis client
    redisClient = redis.createClient({
      url: cacheConfig.url,
      password: cacheConfig.password,
      socket: {
        connectTimeout: 10000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis: Max reconnection attempts reached');
            return new Error('Redis connection failed');
          }
          const delay = Math.min(retries * 100, 3000);
          logger.warn(`Redis: Reconnecting in ${delay}ms...`, { retries });
          return delay;
        },
      },
    });

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('Redis: Connecting...');
    });

    redisClient.on('ready', () => {
      isConnected = true;
      logger.info('Redis: Connected successfully', {
        url: cacheConfig.url.replace(/\/\/.*@/, '//***@'), // Hide password
      });
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      logger.error('Redis: Connection error', {
        error: err.message,
        stack: err.stack,
      });
    });

    redisClient.on('end', () => {
      isConnected = false;
      logger.warn('Redis: Connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis: Reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();

    return redisClient;
  } catch (error) {
    logger.error('Redis: Failed to initialize', {
      error: error.message,
      stack: error.stack,
    });
    return null;
  }
}

/**
 * Get Redis client
 */
function getClient() {
  return redisClient;
}

/**
 * Check if Redis is connected
 */
function isRedisConnected() {
  return isConnected && redisClient?.isOpen;
}

/**
 * Get value from cache
 * @param {string} key - Cache key
 * @returns {Promise<any>} - Cached value or null
 */
async function get(key) {
  if (!isRedisConnected()) {
    logger.debug('Cache miss (Redis not connected)', { key });
    return null;
  }

  try {
    const value = await redisClient.get(key);

    if (value) {
      logger.debug('Cache hit', { key });
      return JSON.parse(value);
    }

    logger.debug('Cache miss', { key });
    return null;
  } catch (error) {
    logger.error('Cache get error', {
      key,
      error: error.message,
    });
    return null;
  }
}

/**
 * Set value in cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<boolean>} - Success status
 */
async function set(key, value, ttl = 3600) {
  if (!isRedisConnected()) {
    logger.debug('Cache set skipped (Redis not connected)', { key });
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    await redisClient.setEx(key, ttl, serialized);

    logger.debug('Cache set', { key, ttl });
    return true;
  } catch (error) {
    logger.error('Cache set error', {
      key,
      error: error.message,
    });
    return false;
  }
}

/**
 * Delete value from cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
async function del(key) {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    await redisClient.del(key);
    logger.debug('Cache delete', { key });
    return true;
  } catch (error) {
    logger.error('Cache delete error', {
      key,
      error: error.message,
    });
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 * @param {string} pattern - Key pattern (e.g., 'user:*')
 * @returns {Promise<number>} - Number of keys deleted
 */
async function delPattern(pattern) {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length === 0) {
      return 0;
    }

    await redisClient.del(keys);
    logger.debug('Cache delete pattern', { pattern, count: keys.length });
    return keys.length;
  } catch (error) {
    logger.error('Cache delete pattern error', {
      pattern,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Check if key exists in cache
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Exists status
 */
async function exists(key) {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    const result = await redisClient.exists(key);
    return result === 1;
  } catch (error) {
    logger.error('Cache exists error', {
      key,
      error: error.message,
    });
    return false;
  }
}

/**
 * Set expiration time for a key
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<boolean>} - Success status
 */
async function expire(key, ttl) {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    await redisClient.expire(key, ttl);
    logger.debug('Cache expire', { key, ttl });
    return true;
  } catch (error) {
    logger.error('Cache expire error', {
      key,
      error: error.message,
    });
    return false;
  }
}

/**
 * Get time to live for a key
 * @param {string} key - Cache key
 * @returns {Promise<number>} - TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
 */
async function ttl(key) {
  if (!isRedisConnected()) {
    return -2;
  }

  try {
    return await redisClient.ttl(key);
  } catch (error) {
    logger.error('Cache TTL error', {
      key,
      error: error.message,
    });
    return -2;
  }
}

/**
 * Flush all cache data
 * @returns {Promise<boolean>} - Success status
 */
async function flush() {
  if (!isRedisConnected()) {
    return false;
  }

  try {
    await redisClient.flushAll();
    logger.warn('Cache flushed (all data cleared)');
    return true;
  } catch (error) {
    logger.error('Cache flush error', {
      error: error.message,
    });
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} - Cache statistics
 */
async function getStats() {
  if (!isRedisConnected()) {
    return {
      connected: false,
      enabled: cacheConfig.enabled,
    };
  }

  try {
    const info = await redisClient.info();
    const dbSize = await redisClient.dbSize();

    // Parse info string
    const stats = {};
    info.split('\n').forEach((line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key.trim()] = value.trim();
      }
    });

    return {
      connected: true,
      enabled: cacheConfig.enabled,
      keys: dbSize,
      usedMemory: stats.used_memory_human,
      connectedClients: stats.connected_clients,
      totalConnectionsReceived: stats.total_connections_received,
      totalCommandsProcessed: stats.total_commands_processed,
      opsPerSecond: stats.instantaneous_ops_per_sec,
      uptime: stats.uptime_in_seconds,
    };
  } catch (error) {
    logger.error('Cache stats error', {
      error: error.message,
    });
    return {
      connected: false,
      enabled: cacheConfig.enabled,
      error: error.message,
    };
  }
}

/**
 * Cache wrapper function
 * Automatically caches the result of a function
 * @param {string} key - Cache key
 * @param {Function} fn - Function to execute if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Cached or fresh data
 */
async function wrap(key, fn, ttl = 3600) {
  // Try to get from cache
  const cached = await get(key);
  if (cached !== null) {
    return cached;
  }

  // Execute function
  const result = await fn();

  // Cache the result
  await set(key, result, ttl);

  return result;
}

/**
 * Increment a counter in cache
 * @param {string} key - Cache key
 * @param {number} increment - Amount to increment (default: 1)
 * @returns {Promise<number>} - New value
 */
async function incr(key, increment = 1) {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const result = await redisClient.incrBy(key, increment);
    return result;
  } catch (error) {
    logger.error('Cache increment error', {
      key,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Decrement a counter in cache
 * @param {string} key - Cache key
 * @param {number} decrement - Amount to decrement (default: 1)
 * @returns {Promise<number>} - New value
 */
async function decr(key, decrement = 1) {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const result = await redisClient.decrBy(key, decrement);
    return result;
  } catch (error) {
    logger.error('Cache decrement error', {
      key,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Add item to a set
 * @param {string} key - Set key
 * @param {string|string[]} members - Member(s) to add
 * @returns {Promise<number>} - Number of members added
 */
async function sadd(key, members) {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const membersArray = Array.isArray(members) ? members : [members];
    const result = await redisClient.sAdd(key, membersArray);
    return result;
  } catch (error) {
    logger.error('Cache sadd error', {
      key,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Get all members of a set
 * @param {string} key - Set key
 * @returns {Promise<string[]>} - Set members
 */
async function smembers(key) {
  if (!isRedisConnected()) {
    return [];
  }

  try {
    return await redisClient.sMembers(key);
  } catch (error) {
    logger.error('Cache smembers error', {
      key,
      error: error.message,
    });
    return [];
  }
}

/**
 * Remove member from a set
 * @param {string} key - Set key
 * @param {string|string[]} members - Member(s) to remove
 * @returns {Promise<number>} - Number of members removed
 */
async function srem(key, members) {
  if (!isRedisConnected()) {
    return 0;
  }

  try {
    const membersArray = Array.isArray(members) ? members : [members];
    const result = await redisClient.sRem(key, membersArray);
    return result;
  } catch (error) {
    logger.error('Cache srem error', {
      key,
      error: error.message,
    });
    return 0;
  }
}

/**
 * Close Redis connection
 */
async function close() {
  if (redisClient) {
    try {
      await redisClient.quit();
      isConnected = false;
      logger.info('Redis: Connection closed gracefully');
    } catch (error) {
      logger.error('Redis: Error closing connection', {
        error: error.message,
      });
    }
  }
}

/**
 * Generate cache key
 * @param {string} prefix - Key prefix
 * @param {...any} parts - Key parts
 * @returns {string} - Generated cache key
 */
function generateKey(prefix, ...parts) {
  return `${prefix}:${parts.filter(Boolean).join(':')}`;
}

/**
 * Cache key patterns for different resources
 */
const CACHE_KEYS = {
  USER: (id) => generateKey('user', id),
  USER_PROFILE: (id) => generateKey('user', id, 'profile'),
  COURSE: (id) => generateKey('course', id),
  COURSE_LIST: (page, limit, filters) => generateKey('courses', page, limit, JSON.stringify(filters || {})),
  ENROLLMENT: (userId, courseId) => generateKey('enrollment', userId, courseId),
  LESSON: (id) => generateKey('lesson', id),
  ASSIGNMENT: (id) => generateKey('assignment', id),
  QUIZ: (id) => generateKey('quiz', id),
  SUBMISSION: (id) => generateKey('submission', id),
  CATEGORY: (id) => generateKey('category', id),
  CATEGORY_LIST: () => generateKey('categories', 'list'),
  STATS: (type, id) => generateKey('stats', type, id),
  LEADERBOARD: (courseId) => generateKey('leaderboard', courseId),
};

/**
 * Cache TTL constants (in seconds)
 */
const CACHE_TTL = {
  VERY_SHORT: 60, // 1 minute
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

module.exports = {
  // Initialization
  initRedis,
  getClient,
  isRedisConnected,
  close,

  // Basic operations
  get,
  set,
  del,
  delPattern,
  exists,
  expire,
  ttl,
  flush,

  // Advanced operations
  wrap,
  incr,
  decr,
  sadd,
  smembers,
  srem,

  // Utilities
  getStats,
  generateKey,

  // Constants
  CACHE_KEYS,
  CACHE_TTL,
};
