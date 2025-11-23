/**
 * Database Utilities
 *
 * Utility functions for database operations, optimization, and monitoring.
 *
 * Usage:
 *   const { checkDatabaseHealth, optimizeQuery, getCollectionStats } = require('./utils/database.utils');
 */

const mongoose = require('mongoose');

/**
 * Check database connection health
 */
async function checkDatabaseHealth() {
  try {
    const health = {
      connected: mongoose.connection.readyState === 1,
      readyState: mongoose.connection.readyState,
      readyStateString: getReadyStateString(mongoose.connection.readyState),
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      models: Object.keys(mongoose.connection.models).length,
      collections: Object.keys(mongoose.connection.collections).length,
    };

    // Get database stats
    if (health.connected) {
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();

      health.version = serverStatus.version;
      health.uptime = serverStatus.uptime;
      health.connections = {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available,
        totalCreated: serverStatus.connections.totalCreated,
      };
      health.memory = {
        resident: serverStatus.mem.resident,
        virtual: serverStatus.mem.virtual,
      };
    }

    return health;
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
}

/**
 * Get ready state as string
 */
function getReadyStateString(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[state] || 'unknown';
}

/**
 * Get collection statistics
 */
async function getCollectionStats(collectionName) {
  try {
    const collection = mongoose.connection.collection(collectionName);
    const stats = await collection.stats();

    return {
      collection: collectionName,
      count: stats.count,
      size: stats.size,
      storageSize: stats.storageSize,
      avgObjSize: stats.avgObjSize,
      indexes: stats.nindexes,
      indexSize: stats.totalIndexSize,
      indexSizes: stats.indexSizes,
    };
  } catch (error) {
    return {
      collection: collectionName,
      error: error.message,
    };
  }
}

/**
 * Get all collections statistics
 */
async function getAllCollectionStats() {
  const collections = Object.keys(mongoose.connection.collections);
  const stats = [];

  for (const collectionName of collections) {
    const stat = await getCollectionStats(collectionName);
    stats.push(stat);
  }

  return stats;
}

/**
 * Analyze query performance
 */
async function analyzeQuery(Model, query, options = {}) {
  try {
    const startTime = Date.now();

    // Execute query with explain
    const explain = await Model.find(query).explain('executionStats');

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    const stats = explain.executionStats;

    return {
      query,
      executionTime,
      nReturned: stats.nReturned,
      totalDocsExamined: stats.totalDocsExamined,
      totalKeysExamined: stats.totalKeysExamined,
      executionStages: stats.executionStages.stage,
      indexUsed: stats.executionStages.indexName || 'COLLSCAN',
      efficient: stats.totalDocsExamined === stats.nReturned,
      needsIndex: stats.executionStages.stage === 'COLLSCAN' && stats.nReturned > 100,
    };
  } catch (error) {
    return {
      query,
      error: error.message,
    };
  }
}

/**
 * Find slow queries
 */
async function findSlowQueries(threshold = 100) {
  try {
    const adminDb = mongoose.connection.db.admin();
    const profilerStatus = await adminDb.command({ profile: -1 });

    if (profilerStatus.was === 0) {
      return {
        enabled: false,
        message: 'Database profiler is not enabled',
      };
    }

    const systemProfile = mongoose.connection.collection('system.profile');
    const slowQueries = await systemProfile
      .find({ millis: { $gt: threshold } })
      .sort({ ts: -1 })
      .limit(100)
      .toArray();

    return {
      enabled: true,
      threshold,
      count: slowQueries.length,
      queries: slowQueries.map((q) => ({
        timestamp: q.ts,
        operation: q.op,
        namespace: q.ns,
        duration: q.millis,
        command: q.command,
      })),
    };
  } catch (error) {
    return {
      enabled: false,
      error: error.message,
    };
  }
}

/**
 * Enable database profiler
 */
async function enableProfiler(level = 1, slowMs = 100) {
  try {
    const adminDb = mongoose.connection.db.admin();
    const result = await adminDb.command({
      profile: level, // 0=off, 1=slow only, 2=all
      slowms: slowMs,
    });

    return {
      success: true,
      level,
      slowMs,
      result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Disable database profiler
 */
async function disableProfiler() {
  try {
    const adminDb = mongoose.connection.db.admin();
    await adminDb.command({ profile: 0 });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get database size
 */
async function getDatabaseSize() {
  try {
    const adminDb = mongoose.connection.db.admin();
    const stats = await mongoose.connection.db.stats();

    return {
      database: mongoose.connection.name,
      collections: stats.collections,
      views: stats.views,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      totalSize: stats.dataSize + stats.indexSize,
      fsUsedSize: stats.fsUsedSize,
      fsTotalSize: stats.fsTotalSize,
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
}

/**
 * Optimize collection (compact)
 */
async function optimizeCollection(collectionName) {
  try {
    const result = await mongoose.connection.db.command({
      compact: collectionName,
      force: true,
    });

    return {
      collection: collectionName,
      success: true,
      result,
    };
  } catch (error) {
    return {
      collection: collectionName,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Validate collection
 */
async function validateCollection(collectionName) {
  try {
    const result = await mongoose.connection.db.command({
      validate: collectionName,
      full: true,
    });

    return {
      collection: collectionName,
      valid: result.valid,
      errors: result.errors || [],
      warnings: result.warnings || [],
    };
  } catch (error) {
    return {
      collection: collectionName,
      valid: false,
      error: error.message,
    };
  }
}

/**
 * Get current database operations
 */
async function getCurrentOperations() {
  try {
    const adminDb = mongoose.connection.db.admin();
    const currentOp = await adminDb.command({ currentOp: 1 });

    return {
      inprog: currentOp.inprog.map((op) => ({
        opid: op.opid,
        active: op.active,
        secs_running: op.secs_running,
        op: op.op,
        ns: op.ns,
        command: op.command,
        client: op.client,
      })),
    };
  } catch (error) {
    return {
      error: error.message,
    };
  }
}

/**
 * Kill operation by opid
 */
async function killOperation(opid) {
  try {
    const adminDb = mongoose.connection.db.admin();
    await adminDb.command({ killOp: 1, op: opid });

    return {
      success: true,
      opid,
    };
  } catch (error) {
    return {
      success: false,
      opid,
      error: error.message,
    };
  }
}

/**
 * Paginate query results efficiently
 */
function paginateQuery(query, page = 1, limit = 10, sort = {}) {
  const skip = (page - 1) * limit;

  return query.sort(sort).skip(skip).limit(limit);
}

/**
 * Count documents efficiently
 */
async function efficientCount(Model, filter = {}) {
  try {
    // Use estimatedDocumentCount for empty filter (faster)
    if (Object.keys(filter).length === 0) {
      return await Model.estimatedDocumentCount();
    }

    // Use countDocuments for filtered queries
    return await Model.countDocuments(filter);
  } catch (error) {
    return 0;
  }
}

/**
 * Bulk insert with validation
 */
async function bulkInsert(Model, documents, options = {}) {
  try {
    const {
      batchSize = 1000,
      ordered = false,
      validateBeforeInsert = true,
    } = options;

    // Validate documents if needed
    if (validateBeforeInsert) {
      for (const doc of documents) {
        const instance = new Model(doc);
        await instance.validate();
      }
    }

    // Insert in batches
    const results = [];
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const result = await Model.insertMany(batch, { ordered });
      results.push(...result);
    }

    return {
      success: true,
      inserted: results.length,
      documents: results,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Bulk update with validation
 */
async function bulkUpdate(Model, updates, options = {}) {
  try {
    const { batchSize = 1000 } = options;

    const bulkOps = updates.map((update) => ({
      updateOne: {
        filter: update.filter,
        update: update.update,
        upsert: update.upsert || false,
      },
    }));

    // Execute in batches
    let totalModified = 0;
    for (let i = 0; i < bulkOps.length; i += batchSize) {
      const batch = bulkOps.slice(i, i + batchSize);
      const result = await Model.bulkWrite(batch);
      totalModified += result.modifiedCount;
    }

    return {
      success: true,
      modified: totalModified,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Clean up old documents
 */
async function cleanupOldDocuments(Model, dateField, daysOld, options = {}) {
  try {
    const { dryRun = false, batchSize = 1000 } = options;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const filter = { [dateField]: { $lt: cutoffDate } };

    // Count documents to be deleted
    const count = await Model.countDocuments(filter);

    if (dryRun) {
      return {
        dryRun: true,
        wouldDelete: count,
        cutoffDate,
      };
    }

    // Delete in batches
    let deleted = 0;
    while (deleted < count) {
      const result = await Model.deleteMany(filter).limit(batchSize);
      deleted += result.deletedCount;

      if (result.deletedCount === 0) break;
    }

    return {
      success: true,
      deleted,
      cutoffDate,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Aggregate with performance tracking
 */
async function performanceAggregate(Model, pipeline, options = {}) {
  const startTime = Date.now();

  try {
    const result = await Model.aggregate(pipeline, options);
    const endTime = Date.now();

    return {
      success: true,
      executionTime: endTime - startTime,
      results: result,
      count: result.length,
    };
  } catch (error) {
    const endTime = Date.now();

    return {
      success: false,
      executionTime: endTime - startTime,
      error: error.message,
    };
  }
}

/**
 * Get connection pool stats
 */
function getConnectionPoolStats() {
  const pool = mongoose.connection.client?.topology?.s?.pool;

  if (!pool) {
    return {
      available: false,
      message: 'Connection pool information not available',
    };
  }

  return {
    available: true,
    totalConnections: pool.totalConnectionCount,
    availableConnections: pool.availableConnectionCount,
    checkoutCount: pool.checkoutCount,
    waitQueueSize: pool.waitQueueSize,
  };
}

module.exports = {
  // Health and monitoring
  checkDatabaseHealth,
  getCollectionStats,
  getAllCollectionStats,
  getDatabaseSize,
  getConnectionPoolStats,

  // Query optimization
  analyzeQuery,
  findSlowQueries,
  enableProfiler,
  disableProfiler,
  getCurrentOperations,
  killOperation,

  // Collection operations
  optimizeCollection,
  validateCollection,

  // Query helpers
  paginateQuery,
  efficientCount,
  performanceAggregate,

  // Bulk operations
  bulkInsert,
  bulkUpdate,
  cleanupOldDocuments,
};
