# Database Optimization Guide

Complete guide for MongoDB database optimization, backup/restore, indexing, and monitoring for the LMS Platform.

## Table of Contents

1. [Overview](#overview)
2. [Database Indexes](#database-indexes)
3. [Query Optimization](#query-optimization)
4. [Backup & Restore](#backup--restore)
5. [Database Maintenance](#database-maintenance)
6. [Monitoring & Health Checks](#monitoring--health-checks)
7. [Performance Tuning](#performance-tuning)
8. [Best Practices](#best-practices)

---

## Overview

The LMS platform includes comprehensive database optimization tools:

- **17 collections** with optimized indexes
- **150+ indexes** across all collections
- Automated backup and restore system
- Query performance monitoring
- Health check and diagnostics
- Collection validation and optimization

---

## Database Indexes

### Index Configuration

All database indexes are centrally managed in `backend/src/config/database.indexes.js`.

**Collections with Indexes:**
- User (12 indexes)
- Course (15 indexes)
- Enrollment (9 indexes)
- Chapter (4 indexes)
- Lesson (8 indexes)
- Quiz (6 indexes)
- Question (7 indexes)
- Assignment (5 indexes)
- Article (12 indexes)
- Certificate (5 indexes)
- Category (6 indexes)
- Organization (5 indexes)
- Conversation (3 indexes)
- Message (5 indexes)
- QuestionBank (4 indexes)
- Content (4 indexes)
- Setting (3 indexes)

### Creating Indexes

#### Initialize All Indexes

```bash
# Create all indexes
npm run db:indexes

# Or initialize database (includes indexes)
npm run db:init
```

#### Programmatic Usage

```javascript
const { createAllIndexes, createModelIndexes } = require('./config/database.indexes');

// Create all indexes
await createAllIndexes();

// Create indexes for specific model
await createModelIndexes('User');
```

### Index Types

**1. Unique Indexes**
```javascript
// Prevent duplicate emails
{ fields: { email: 1 }, options: { unique: true } }

// Prevent duplicate enrollments
{ fields: { student: 1, course: 1 }, options: { unique: true } }
```

**2. Compound Indexes**
```javascript
// Optimize queries filtering by multiple fields
{ fields: { organization: 1, role: 1 }, options: { background: true } }
{ fields: { isPublished: 1, status: 1 }, options: { background: true } }
```

**3. Text Search Indexes**
```javascript
// Enable full-text search
{ fields: { title: 'text', description: 'text', tags: 'text' }, options: { background: true } }
```

**4. Sparse Indexes**
```javascript
// Index only documents with the field
{ fields: { domain: 1 }, options: { unique: true, sparse: true } }
```

### View Index Statistics

```bash
# Show index statistics for all collections
npm run db:init
```

```javascript
const { getIndexStats } = require('./config/database.indexes');

const stats = await getIndexStats();
// Returns index count for each collection
```

---

## Query Optimization

### Query Analysis

```javascript
const { analyzeQuery } = require('./utils/database.utils');
const Course = require('./models/Course');

// Analyze query performance
const analysis = await analyzeQuery(Course, { isPublished: true });

console.log(analysis);
// {
//   query: { isPublished: true },
//   executionTime: 45,
//   nReturned: 150,
//   totalDocsExamined: 150,
//   totalKeysExamined: 150,
//   indexUsed: 'isPublished_1',
//   efficient: true,
//   needsIndex: false
// }
```

### Finding Slow Queries

```javascript
const { enableProfiler, findSlowQueries } = require('./utils/database.utils');

// Enable database profiler (tracks queries > 100ms)
await enableProfiler(1, 100);

// Find slow queries
const slowQueries = await findSlowQueries(100);

console.log(slowQueries);
// {
//   enabled: true,
//   threshold: 100,
//   count: 5,
//   queries: [...]
// }
```

### Efficient Pagination

```javascript
const { paginateQuery, efficientCount } = require('./utils/database.utils');

// Efficient pagination
const page = 1;
const limit = 20;
const query = Course.find({ isPublished: true });

const courses = await paginateQuery(query, page, limit, { createdAt: -1 });

// Efficient counting
const total = await efficientCount(Course, { isPublished: true });
```

### Bulk Operations

```javascript
const { bulkInsert, bulkUpdate } = require('./utils/database.utils');

// Bulk insert with validation
const documents = [...]; // Array of documents
const result = await bulkInsert(Course, documents, {
  batchSize: 1000,
  validateBeforeInsert: true
});

// Bulk update
const updates = [
  { filter: { _id: id1 }, update: { $set: { status: 'published' } } },
  { filter: { _id: id2 }, update: { $set: { status: 'published' } } }
];

await bulkUpdate(Course, updates, { batchSize: 1000 });
```

---

## Backup & Restore

### Creating Backups

#### Basic Backup

```bash
# Create backup
npm run db:backup
```

#### Compressed Backup

```bash
# Create compressed backup (recommended)
npm run db:backup:compress
```

#### Backup Configuration

Environment variables:
```env
# Backup directory
DB_BACKUP_PATH=/backups/mongodb

# Retention period (days)
DB_BACKUP_RETENTION=30

# S3 upload (optional)
AWS_S3_BACKUP_BUCKET=my-lms-backups
AWS_REGION=us-east-1
```

#### Automated Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /var/www/lms-platform/backend && npm run db:backup:compress >> /var/log/lms/backup.log 2>&1
```

Or use PM2:
```bash
pm2 install pm2-cron
pm2 set pm2-cron:jobs '[{"time":"0 2 * * *","cmd":"cd /var/www/lms-platform/backend && npm run db:backup:compress"}]'
```

### Listing Backups

```bash
# List all available backups
npm run db:list-backups
```

Output:
```
Available Backups:
--------------------------------------------------------------------------------
Name                                     Size            Age             Type
--------------------------------------------------------------------------------
backup-2025-11-22T10-30-00.tar.gz       45.2 MB         Today           Archive
backup-2025-11-21T02-00-00.tar.gz       44.8 MB         1 day ago       Archive
backup-2025-11-20T02-00-00.tar.gz       44.1 MB         2 days ago      Archive

Total: 3 backup(s)
```

### Restoring Backups

#### Restore Specific Backup

```bash
# Restore by name
npm run db:restore backup-2025-11-22T10-30-00

# Drop existing data before restore (DANGEROUS!)
npm run db:restore backup-2025-11-22T10-30-00 -- --drop
```

#### Restore Latest Backup

```bash
# Restore most recent backup
npm run db:restore:latest
```

**Warning:** Restore operations can overwrite or merge with existing data. Always backup current data before restoring.

### Backup Best Practices

1. **Schedule Regular Backups**
   - Daily backups for production
   - Keep 30 days of backups
   - Test restore monthly

2. **Use Compression**
   - Saves 70-80% disk space
   - Faster uploads to cloud storage

3. **Off-Site Storage**
   - Upload to S3, Google Cloud, or Azure
   - Protect against hardware failure
   - Enable versioning

4. **Test Restores**
   - Regularly test restore procedure
   - Verify data integrity
   - Document restore process

5. **Monitor Backup Jobs**
   - Check backup logs daily
   - Alert on failures
   - Monitor disk space

---

## Database Maintenance

### Initialize Database

```bash
# Full initialization (health check + indexes + stats)
npm run db:init

# Create indexes only
npm run db:indexes

# Validate collections
npm run db:validate
```

### Collection Validation

```javascript
const { validateCollection } = require('./utils/database.utils');

// Validate single collection
const result = await validateCollection('users');

if (!result.valid) {
  console.log('Validation errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

### Collection Optimization

```javascript
const { optimizeCollection } = require('./utils/database.utils');

// Compact collection (reclaim space)
await optimizeCollection('users');
```

### Cleanup Old Documents

```javascript
const { cleanupOldDocuments } = require('./utils/database.utils');

// Dry run (see what would be deleted)
const dryRun = await cleanupOldDocuments(
  AuditLog,
  'createdAt',
  90,
  { dryRun: true }
);

console.log(`Would delete ${dryRun.wouldDelete} documents`);

// Actually delete
const result = await cleanupOldDocuments(
  AuditLog,
  'createdAt',
  90
);

console.log(`Deleted ${result.deleted} documents`);
```

---

## Monitoring & Health Checks

### Database Health Check

```javascript
const { checkDatabaseHealth } = require('./utils/database.utils');

const health = await checkDatabaseHealth();

console.log(health);
// {
//   connected: true,
//   version: '6.0.5',
//   uptime: 86400,
//   connections: { current: 5, available: 995 },
//   memory: { resident: 256, virtual: 512 },
//   models: 17,
//   collections: 17
// }
```

### Collection Statistics

```javascript
const { getCollectionStats, getAllCollectionStats } = require('./utils/database.utils');

// Single collection
const stats = await getCollectionStats('users');
console.log(stats);
// {
//   collection: 'users',
//   count: 1500,
//   size: 2048000,
//   avgObjSize: 1365,
//   indexes: 12,
//   indexSize: 512000
// }

// All collections
const allStats = await getAllCollectionStats();
```

### Database Size

```javascript
const { getDatabaseSize } = require('./utils/database.utils');

const size = await getDatabaseSize();
console.log(size);
// {
//   database: 'lms_production',
//   collections: 17,
//   objects: 50000,
//   dataSize: 52428800,     // 50 MB
//   indexSize: 10485760,    // 10 MB
//   totalSize: 62914560     // 60 MB
// }
```

### Current Operations

```javascript
const { getCurrentOperations, killOperation } = require('./utils/database.utils');

// Get running operations
const ops = await getCurrentOperations();

// Kill long-running operation
await killOperation(opid);
```

### Connection Pool Stats

```javascript
const { getConnectionPoolStats } = require('./utils/database.utils');

const poolStats = getConnectionPoolStats();
console.log(poolStats);
// {
//   totalConnections: 10,
//   availableConnections: 5,
//   checkoutCount: 5,
//   waitQueueSize: 0
// }
```

---

## Performance Tuning

### Connection Pooling

Configure in `.env`:
```env
MONGODB_POOL_SIZE=10
MONGODB_MAX_POOL_SIZE=50
MONGODB_MIN_POOL_SIZE=5
MONGODB_SOCKET_TIMEOUT=45000
```

### Query Optimization Tips

**1. Use Indexes Effectively**
```javascript
// Bad: No index on status
Course.find({ status: 'published' });

// Good: Index exists on status
Course.find({ status: 'published' });
// Uses index: status_1
```

**2. Limit Fields**
```javascript
// Bad: Returns all fields
Course.find({});

// Good: Return only needed fields
Course.find({}).select('title instructor price');
```

**3. Use Lean Queries**
```javascript
// Bad: Returns Mongoose documents (slower)
const courses = await Course.find({});

// Good: Returns plain objects (faster)
const courses = await Course.find({}).lean();
```

**4. Avoid $where and $regex**
```javascript
// Bad: Very slow
Course.find({ $where: 'this.price > 100' });

// Good: Use regular operators
Course.find({ price: { $gt: 100 } });
```

**5. Paginate Results**
```javascript
// Bad: Returns all documents
const courses = await Course.find({});

// Good: Paginate
const courses = await Course.find({})
  .skip((page - 1) * limit)
  .limit(limit);
```

### Aggregation Optimization

**1. Match Early**
```javascript
// Good: Filter early in pipeline
Course.aggregate([
  { $match: { isPublished: true } },  // Filter first
  { $lookup: { ... } },
  { $project: { ... } }
]);
```

**2. Project Early**
```javascript
// Good: Remove unnecessary fields early
Course.aggregate([
  { $match: { ... } },
  { $project: { title: 1, instructor: 1 } },  // Reduce data
  { $lookup: { ... } }
]);
```

**3. Use Indexes in Aggregation**
```javascript
// Ensure $match uses indexed fields
Course.aggregate([
  { $match: { isPublished: true, category: 'programming' } }
  // Uses compound index: isPublished_1_category_1
]);
```

---

## Best Practices

### Index Management

1. **Create Background Indexes**
   - Always use `{ background: true }`
   - Prevents blocking other operations
   - Especially important in production

2. **Monitor Index Usage**
   ```javascript
   // Find unused indexes
   db.collection.aggregate([
     { $indexStats: {} },
     { $match: { 'accesses.ops': { $lt: 10 } } }
   ]);
   ```

3. **Avoid Over-Indexing**
   - Each index adds write overhead
   - Balance query performance vs write performance
   - Remove unused indexes

4. **Use Compound Indexes Wisely**
   - Order matters: most selective fields first
   - One compound index can replace multiple single-field indexes

### Query Best Practices

1. **Use Explain to Analyze Queries**
   ```javascript
   const explain = await Course.find({ ... }).explain('executionStats');
   console.log(explain.executionStats);
   ```

2. **Avoid N+1 Queries**
   ```javascript
   // Bad: N+1 queries
   for (const course of courses) {
     course.instructor = await User.findById(course.instructor);
   }

   // Good: Single query with populate
   const courses = await Course.find({}).populate('instructor');
   ```

3. **Use Projection**
   - Only select fields you need
   - Reduces network transfer
   - Faster JSON serialization

4. **Implement Caching**
   - Cache frequently accessed data
   - Use Redis for query results
   - Invalidate cache on updates

### Backup Best Practices

1. **3-2-1 Rule**
   - 3 copies of data
   - 2 different storage types
   - 1 off-site copy

2. **Automate Backups**
   - Schedule daily backups
   - Rotate old backups
   - Alert on failures

3. **Test Restores**
   - Monthly restore tests
   - Document procedure
   - Train team members

4. **Encrypt Backups**
   - Encrypt at rest
   - Secure transfer
   - Protect credentials

### Production Checklist

- [ ] All indexes created
- [ ] Connection pooling configured
- [ ] Daily backups scheduled
- [ ] Backup retention configured
- [ ] Off-site backups enabled
- [ ] Monitoring and alerts set up
- [ ] Query profiler enabled
- [ ] Slow query logging enabled
- [ ] Regular maintenance scheduled
- [ ] Restore procedure documented
- [ ] Team trained on procedures

---

## Troubleshooting

### Slow Queries

1. **Enable Profiler**
   ```bash
   npm run db:init
   ```
   ```javascript
   const { enableProfiler } = require('./utils/database.utils');
   await enableProfiler(1, 100); // Log queries > 100ms
   ```

2. **Find Slow Queries**
   ```javascript
   const { findSlowQueries } = require('./utils/database.utils');
   const slow = await findSlowQueries(100);
   ```

3. **Add Missing Indexes**
   - Check if query uses indexes
   - Create compound indexes for common filters
   - Use `explain()` to verify

### High Memory Usage

1. **Check Collection Sizes**
   ```bash
   npm run db:init
   ```

2. **Compact Collections**
   ```javascript
   await optimizeCollection('large_collection');
   ```

3. **Archive Old Data**
   - Move old documents to archive collection
   - Use TTL indexes for automatic deletion

### Connection Issues

1. **Check Connection Pool**
   ```javascript
   const stats = getConnectionPoolStats();
   console.log(stats);
   ```

2. **Increase Pool Size**
   ```env
   MONGODB_MAX_POOL_SIZE=100
   ```

3. **Check Timeouts**
   ```env
   MONGODB_SOCKET_TIMEOUT=45000
   MONGODB_SERVER_SELECTION_TIMEOUT=5000
   ```

---

## Support

For additional help:

- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [Mongoose Performance](https://mongoosejs.com/docs/guide.html#indexes)
- Project Documentation: `/docs`

---

Last Updated: 2025-11-22
