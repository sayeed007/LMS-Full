/**
 * Performance Utilities
 *
 * Utilities for query optimization, performance monitoring, and response optimization.
 *
 * Usage:
 *   const { optimizeQuery, measurePerformance } = require('./utils/performance.utils');
 *
 *   // Optimize mongoose query
 *   const courses = await optimizeQuery(Course.find({ isPublished: true }));
 *
 *   // Measure performance
 *   const result = await measurePerformance('createCourse', async () => {
 *     return await Course.create(data);
 *   });
 */

const logger = require('../config/logger');
const cache = require('../config/cache');

/**
 * Optimize Mongoose query for better performance
 * @param {object} query - Mongoose query
 * @param {object} options - Optimization options
 * @returns {object} - Optimized query
 */
function optimizeQuery(query, options = {}) {
  const {
    lean = true,          // Use lean() for faster queries
    select = null,        // Select specific fields
    limit = null,         // Limit results
    populate = null,      // Populate references
    cache: shouldCache = false,
    cacheTTL = 300,
  } = options;

  let optimized = query;

  // Use lean() for read-only queries (much faster)
  if (lean) {
    optimized = optimized.lean();
  }

  // Select only needed fields
  if (select) {
    optimized = optimized.select(select);
  }

  // Limit results if specified
  if (limit) {
    optimized = optimized.limit(limit);
  }

  // Populate with optimization
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach((pop) => {
        optimized = optimized.populate(pop);
      });
    } else {
      optimized = optimized.populate(populate);
    }
  }

  // Add caching if enabled
  if (shouldCache) {
    const originalExec = optimized.exec.bind(optimized);
    optimized.exec = async function () {
      const cacheKey = generateQueryCacheKey(query);
      return cache.wrap(cacheKey, originalExec, cacheTTL);
    };
  }

  return optimized;
}

/**
 * Generate cache key for query
 * @param {object} query - Mongoose query
 * @returns {string} - Cache key
 */
function generateQueryCacheKey(query) {
  const collection = query.mongooseCollection?.name || 'unknown';
  const conditions = JSON.stringify(query.getQuery());
  const options = JSON.stringify(query.getOptions());

  return `query:${collection}:${conditions}:${options}`;
}

/**
 * Measure performance of a function
 * @param {string} label - Performance label
 * @param {Function} fn - Function to measure
 * @returns {Promise<any>} - Function result
 */
async function measurePerformance(label, fn) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    const memoryUsed = process.memoryUsage().heapUsed - startMemory;

    logger.logPerformance({
      label,
      duration,
      memoryUsed: formatBytes(memoryUsed),
      success: true,
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.logPerformance({
      label,
      duration,
      success: false,
      error: error.message,
    });

    throw error;
  }
}

/**
 * Format bytes to human readable
 * @param {number} bytes - Bytes
 * @returns {string} - Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Batch process array items
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Batch size (default: 100)
 * @returns {Promise<Array>} - Processed results
 */
async function batchProcess(items, processor, batchSize = 100) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => processor(item))
    );
    results.push(...batchResults);

    logger.debug('Batch processed', {
      processed: Math.min(i + batchSize, items.length),
      total: items.length,
    });
  }

  return results;
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(fn, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;
    return fn(...args);
  };
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(fn, delay) {
  let timeoutId;

  return function (...args) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {object} options - Retry options
 * @returns {Promise<any>} - Function result
 */
async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    onRetry = null,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, error);
        }

        logger.warn('Retrying after error', {
          attempt: attempt + 1,
          maxRetries,
          delay,
          error: error.message,
        });

        await sleep(delay);
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Memoize function results
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Key generator function
 * @returns {Function} - Memoized function
 */
function memoize(fn, keyGenerator = (...args) => JSON.stringify(args)) {
  const cache = new Map();

  return async function (...args) {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = await fn(...args);
    cache.set(key, result);

    return result;
  };
}

/**
 * Parallel execution with concurrency limit
 * @param {Array} items - Items to process
 * @param {Function} processor - Processing function
 * @param {number} concurrency - Max concurrent executions
 * @returns {Promise<Array>} - Results
 */
async function parallelLimit(items, processor, concurrency = 5) {
  const results = [];
  const executing = [];

  for (const item of items) {
    const promise = processor(item).then((result) => {
      executing.splice(executing.indexOf(promise), 1);
      return result;
    });

    results.push(promise);
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * Get aggregation pipeline for performance
 * @param {string} collection - Collection name
 * @param {object} options - Aggregation options
 * @returns {Array} - Aggregation pipeline
 */
function getOptimizedPipeline(collection, options = {}) {
  const {
    match = {},
    sort = {},
    limit = null,
    skip = null,
    project = null,
    lookup = null,
  } = options;

  const pipeline = [];

  // 1. Match first (uses indexes)
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  // 2. Sort (uses indexes if possible)
  if (Object.keys(sort).length > 0) {
    pipeline.push({ $sort: sort });
  }

  // 3. Skip and limit (reduces data early)
  if (skip) {
    pipeline.push({ $skip: skip });
  }
  if (limit) {
    pipeline.push({ $limit: limit });
  }

  // 4. Project (reduces data size)
  if (project) {
    pipeline.push({ $project: project });
  }

  // 5. Lookup (join) last
  if (lookup) {
    if (Array.isArray(lookup)) {
      lookup.forEach((l) => pipeline.push({ $lookup: l }));
    } else {
      pipeline.push({ $lookup: lookup });
    }
  }

  return pipeline;
}

/**
 * Check query performance and suggest optimizations
 * @param {object} Model - Mongoose model
 * @param {object} query - Query object
 * @returns {Promise<object>} - Performance analysis
 */
async function analyzeQueryPerformance(Model, query) {
  try {
    const explain = await Model.find(query).explain('executionStats');
    const stats = explain.executionStats;

    const analysis = {
      executionTime: stats.executionTimeMillis,
      documentsExamined: stats.totalDocsExamined,
      documentsReturned: stats.nReturned,
      indexUsed: stats.executionStages.indexName || 'COLLSCAN',
      efficient: stats.totalDocsExamined === stats.nReturned,
      suggestions: [],
    };

    // Add suggestions
    if (analysis.indexUsed === 'COLLSCAN') {
      analysis.suggestions.push('Consider adding an index for this query');
    }

    if (analysis.documentsExamined > analysis.documentsReturned * 2) {
      analysis.suggestions.push('Query examines too many documents. Consider adding a more selective index');
    }

    if (analysis.executionTime > 100) {
      analysis.suggestions.push('Query is slow. Consider optimization or caching');
    }

    return analysis;
  } catch (error) {
    logger.error('Query analysis failed', {
      error: error.message,
    });
    return null;
  }
}

/**
 * Compress large JSON responses
 * @param {object} data - Data to compress
 * @param {number} threshold - Compression threshold in bytes
 * @returns {object} - Compressed data
 */
function compressResponse(data, threshold = 1024) {
  const dataStr = JSON.stringify(data);

  if (dataStr.length < threshold) {
    return { compressed: false, data };
  }

  const zlib = require('zlib');
  const compressed = zlib.gzipSync(dataStr);

  return {
    compressed: true,
    data: compressed.toString('base64'),
    originalSize: dataStr.length,
    compressedSize: compressed.length,
  };
}

/**
 * Pagination helper with optimization
 * @param {object} Model - Mongoose model
 * @param {object} query - Query object
 * @param {object} options - Pagination options
 * @returns {Promise<object>} - Paginated results
 */
async function paginateWithOptimization(Model, query, options = {}) {
  const {
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    select = null,
    populate = null,
    lean = true,
  } = options;

  const skip = (page - 1) * limit;

  // Count total (with caching)
  const cacheKey = cache.generateKey('count', Model.collection.name, JSON.stringify(query));
  const total = await cache.wrap(
    cacheKey,
    () => Model.countDocuments(query),
    60 // 1 minute TTL for counts
  );

  // Execute query with optimizations
  let resultsQuery = Model.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  if (select) {
    resultsQuery = resultsQuery.select(select);
  }

  if (populate) {
    resultsQuery = resultsQuery.populate(populate);
  }

  if (lean) {
    resultsQuery = resultsQuery.lean();
  }

  const results = await resultsQuery;

  return {
    results,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

/**
 * Monitor memory usage
 * @returns {object} - Memory usage statistics
 */
function getMemoryUsage() {
  const usage = process.memoryUsage();

  return {
    heapUsed: formatBytes(usage.heapUsed),
    heapTotal: formatBytes(usage.heapTotal),
    external: formatBytes(usage.external),
    rss: formatBytes(usage.rss),
    percentage: ((usage.heapUsed / usage.heapTotal) * 100).toFixed(2) + '%',
  };
}

/**
 * Check if response should be cached
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @returns {boolean} - Should cache
 */
function shouldCacheResponse(req, res) {
  // Don't cache if method is not GET
  if (req.method !== 'GET') {
    return false;
  }

  // Don't cache if status is not 2xx
  if (res.statusCode < 200 || res.statusCode >= 300) {
    return false;
  }

  // Don't cache if response has auth headers
  if (res.get('Authorization')) {
    return false;
  }

  // Don't cache if Cache-Control says no
  const cacheControl = res.get('Cache-Control');
  if (cacheControl && cacheControl.includes('no-cache')) {
    return false;
  }

  return true;
}

module.exports = {
  // Query optimization
  optimizeQuery,
  generateQueryCacheKey,
  analyzeQueryPerformance,
  getOptimizedPipeline,

  // Performance measurement
  measurePerformance,
  getMemoryUsage,

  // Async utilities
  batchProcess,
  parallelLimit,
  retry,
  sleep,

  // Function utilities
  throttle,
  debounce,
  memoize,

  // Response optimization
  compressResponse,
  shouldCacheResponse,

  // Pagination
  paginateWithOptimization,

  // Helpers
  formatBytes,
};
