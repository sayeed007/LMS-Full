# Question Bank - Question Versioning System ✅

**Date Completed:** 2025-12-30
**Status:** Backend COMPLETED - Frontend Pending
**Effort:** 4 hours
**Priority:** 🟡 HIGH PRIORITY

---

## 🎯 Summary

Successfully implemented a comprehensive question versioning system for the Question Bank feature. The system automatically tracks all changes to questions, stores complete revision history, enables version comparison, and allows restoring previous versions.

---

## ✅ Backend Implementation Complete

### 1. QuestionVersion Model
**File:** `backend/src/models/QuestionVersion.js`

**Purpose:** Store complete snapshots of question data at each save point

**Schema:**
```javascript
{
  questionId: ObjectId,           // Reference to Question
  version: Number,                // Incremental version number (1, 2, 3...)
  data: {                         // Complete snapshot of question at this version
    text, type, choices, correctAnswer, explanation,
    difficulty, points, timeLimit, tags, attachments
  },
  changeDescription: String,      // Optional description of what changed
  modifiedFields: [String],       // List of fields modified in this version
  changedBy: ObjectId,            // User who made the changes
  isAutoSaved: Boolean,           // Auto-save vs manual save
  dataSize: Number,               // Size in bytes for monitoring
  createdAt: Date,                // When this version was created
  updatedAt: Date
}
```

**Key Features:**
- ✅ Automatic version numbering (v1, v2, v3...)
- ✅ Complete data snapshots (not diffs)
- ✅ Change tracking (which fields were modified)
- ✅ User attribution (who made each change)
- ✅ Storage size monitoring
- ✅ Efficient indexing for fast queries

**Static Methods:**
```javascript
// Find all versions for a question
QuestionVersion.findByQuestion(questionId, { limit, skip, sort })

// Get latest version
QuestionVersion.findLatestVersion(questionId)

// Get specific version number
QuestionVersion.findByVersion(questionId, versionNumber)

// Count total versions
QuestionVersion.countVersions(questionId)

// Create new version from question data
QuestionVersion.createVersion(questionId, questionData, userId, description)

// Detect which fields changed between versions
QuestionVersion.detectChanges(oldData, newData)

// Cleanup old versions (retention policy)
QuestionVersion.cleanupOldVersions(questionId, keepCount)
```

**Instance Methods:**
```javascript
// Compare this version with another
version.compareWith(otherVersion)

// Restore this version to the question
version.restoreToQuestion()
```

**Indexes:**
```javascript
{ questionId: 1, version: -1 }   // Fast version lookup
{ questionId: 1, createdAt: -1 } // Time-based queries
{ changedBy: 1 }                  // User activity tracking
```

---

### 2. Automatic Versioning in Controllers
**File:** `backend/src/controllers/questionController.js`

#### Create Question - Initial Version
```javascript
// After creating question, create v1
const question = await Question.create(questionData);

const versionData = extractVersionData(question);
await QuestionVersion.createVersion(
  question._id,
  versionData,
  req.user.id,
  'Initial version'
);
```

#### Update Question - New Version on Every Save
```javascript
// After updating question, create new version
const updatedQuestion = await Question.findByIdAndUpdate(...);

const versionData = extractVersionData(updatedQuestion);
await QuestionVersion.createVersion(
  updatedQuestion._id,
  versionData,
  req.user.id,
  req.body.changeDescription || null  // Optional description
);
```

**Versioning Triggers:**
- ✅ Question created → v1
- ✅ Question updated → v2, v3, v4...
- ✅ Version restored → new version with description "Restored to version X"

---

### 3. Version Management API
**File:** `backend/src/controllers/questionVersionController.js`

#### Endpoints Implemented:

**GET /api/v1/questions/:questionId/versions**
- Get all versions for a question
- Supports pagination
- Returns versions sorted by latest first
- Populates user information (changedBy)

**GET /api/v1/questions/:questionId/versions/latest**
- Get the most recent version
- Useful for quick access to current state

**GET /api/v1/questions/:questionId/versions/:versionNumber**
- Get a specific version by number
- Returns complete version data

**GET /api/v1/questions/:questionId/versions/stats**
- Get version statistics:
  - Total version count
  - First version info (who created, when)
  - Latest version info
  - Total storage used (KB)
  - Number of contributors

**GET /api/v1/questions/:questionId/versions/compare?from=1&to=2**
- Compare two versions
- Returns structured diff:
  - `added`: Fields added in newer version
  - `modified`: Fields changed with old and new values
  - `removed`: Fields removed in newer version

**POST /api/v1/questions/:questionId/versions/:versionNumber/restore**
- Restore question to a specific version
- Updates the question with version data
- Creates a new version with description "Restored to version X"
- Returns updated question

**DELETE /api/v1/questions/:questionId/versions/cleanup?keepCount=50**
- Admin-only endpoint
- Deletes old versions, keeping only most recent N
- Default keeps 50 versions
- Returns count of deleted versions

---

### 4. Routes Configuration
**File:** `backend/src/routes/questionVersionRoutes.js`

All version routes are nested under question routes:
```
/api/v1/questions/:questionId/versions
```

**Route Structure:**
```
GET    /                          → Get all versions
GET    /latest                    → Get latest version
GET    /stats                     → Get version statistics
GET    /compare?from=1&to=2       → Compare versions
GET    /:versionNumber            → Get specific version
POST   /:versionNumber/restore    → Restore version
DELETE /cleanup?keepCount=50      → Cleanup old versions (admin)
```

**Security:**
- ✅ All routes require authentication (`protect` middleware)
- ✅ Permission checks: owner, org admin, or super admin only
- ✅ Cleanup endpoint restricted to admins only

---

## 📊 Features Summary

### Automatic Version Tracking
- ✅ Versions created automatically on create/update
- ✅ No manual intervention needed
- ✅ Zero-config for question authors

### Complete History
- ✅ Every change is tracked
- ✅ Full snapshots (not incremental diffs)
- ✅ Can see exact state at any point in time

### Version Comparison
- ✅ Compare any two versions
- ✅ See what changed between versions
- ✅ Field-level granularity

### Version Restore
- ✅ Roll back to any previous version
- ✅ Restore creates a new version (no history loss)
- ✅ Maintains audit trail

### Storage Management
- ✅ Track storage usage per question
- ✅ Cleanup old versions automatically
- ✅ Configurable retention policy

### User Attribution
- ✅ Know who made each change
- ✅ Track contributors to a question
- ✅ Audit trail for compliance

---

## 🔒 Security & Permissions

### Permission Model
```javascript
// Can view versions:
- Question owner
- Organization admin
- Super admin

// Can restore versions:
- Question owner
- Organization admin
- Super admin

// Can cleanup versions:
- Organization admin only
- Super admin only
```

### Data Protection
- ✅ Version data is sanitized (uses same middleware as questions)
- ✅ HTML content is cleaned with DOMPurify
- ✅ No sensitive data exposure

---

## 💾 Storage Considerations

### Storage Strategy
- **Full Snapshots:** Each version stores complete question data
- **Why Not Diffs:** Simpler, faster, more reliable
- **Storage Cost:** ~1-5KB per version (acceptable)

### Storage Calculations
```
Average question: 2KB
50 versions: 100KB
1000 questions with 50 versions each: 100MB
```

### Retention Policy
- **Default:** Keep 50 most recent versions
- **Configurable:** Can adjust per organization
- **Cleanup:** Admin-triggered manual cleanup

---

## 📈 Performance Optimizations

### Database Indexes
```javascript
{ questionId: 1, version: -1 }   // Compound index for fast lookups
{ questionId: 1, createdAt: -1 } // Time-based queries
{ changedBy: 1 }                  // User activity queries
```

### Query Performance
- ✅ Latest version: O(1) with index
- ✅ Get version: O(1) with compound index
- ✅ Compare versions: 2 x O(1) = O(1)
- ✅ List versions: O(n) with pagination

---

## 🧪 API Usage Examples

### Create Question (Auto-creates v1)
```bash
POST /api/v1/questions
{
  "text": "<p>What is <strong>2 + 2</strong>?</p>",
  "type": "single-choice",
  "questionBank": "676...",
  "choices": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true }
  ]
}

# Response includes question + automatic v1 created
```

### Update Question (Auto-creates v2)
```bash
PATCH /api/v1/questions/123
{
  "text": "<p>What is <strong>3 + 3</strong>?</p>",
  "changeDescription": "Updated question numbers"
}

# Automatic v2 created with change description
```

### Get All Versions
```bash
GET /api/v1/questions/123/versions?page=1&limit=10

# Response:
{
  "status": "success",
  "results": 10,
  "totalVersions": 25,
  "currentPage": 1,
  "totalPages": 3,
  "data": {
    "versions": [
      {
        "_id": "...",
        "questionId": "123",
        "version": 25,
        "data": { ... },
        "changeDescription": "Fixed typo",
        "modifiedFields": ["text"],
        "changedBy": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2025-12-30T10:30:00Z"
      },
      // ... more versions
    ]
  }
}
```

### Get Specific Version
```bash
GET /api/v1/questions/123/versions/5

# Returns version 5 data
```

### Compare Two Versions
```bash
GET /api/v1/questions/123/versions/compare?from=5&to=10

# Response:
{
  "status": "success",
  "data": {
    "from": { version 5 data },
    "to": { version 10 data },
    "changes": {
      "modified": [
        {
          "field": "text",
          "oldValue": "What is 2 + 2?",
          "newValue": "What is 3 + 3?"
        },
        {
          "field": "choices",
          "oldValue": [...],
          "newValue": [...]
        }
      ]
    }
  }
}
```

### Restore Version
```bash
POST /api/v1/questions/123/versions/5/restore

# Restores question to state of v5
# Creates new version (v26) with description "Restored to version 5"

# Response:
{
  "status": "success",
  "message": "Successfully restored to version 5",
  "data": {
    "question": { ... }  // Updated question
  }
}
```

### Get Version Statistics
```bash
GET /api/v1/questions/123/versions/stats

# Response:
{
  "status": "success",
  "data": {
    "stats": {
      "totalVersions": 25,
      "firstVersion": {
        "version": 1,
        "createdAt": "2025-01-15T08:00:00Z",
        "createdBy": { "name": "Jane Smith", ... }
      },
      "latestVersion": {
        "version": 25,
        "createdAt": "2025-12-30T10:30:00Z",
        "createdBy": { "name": "John Doe", ... }
      },
      "totalStorageKB": "48.50",
      "totalContributors": 3
    }
  }
}
```

### Cleanup Old Versions (Admin Only)
```bash
DELETE /api/v1/questions/123/versions/cleanup?keepCount=20

# Deletes old versions, keeps 20 most recent

# Response:
{
  "status": "success",
  "message": "Deleted 5 old versions",
  "data": {
    "deletedCount": 5,
    "keptCount": 20
  }
}
```

---

## 🔄 Version Lifecycle

### 1. Question Created
```
Action: POST /api/v1/questions
Result: Question created + v1 created
Description: "Initial version"
```

### 2. Question Updated
```
Action: PATCH /api/v1/questions/123
Result: Question updated + v2 created
Description: Optional user-provided description
```

### 3. Version Restored
```
Action: POST /api/v1/questions/123/versions/5/restore
Result: Question = v5 data + v3 created
Description: "Restored to version 5"
```

### 4. Version Cleanup
```
Action: DELETE /api/v1/questions/123/versions/cleanup?keepCount=50
Result: Old versions deleted, 50 most recent kept
```

---

## 📝 Data Model Example

### Question After 3 Updates:

**Question Document (Current State):**
```javascript
{
  _id: "123",
  text: "What is 5 + 5?",
  type: "single-choice",
  choices: [
    { text: "8", isCorrect: false },
    { text: "10", isCorrect: true }
  ],
  // ... other fields
  updatedAt: "2025-12-30T12:00:00Z"
}
```

**Version History:**
```javascript
// v1 - Initial version
{
  version: 1,
  data: {
    text: "What is 2 + 2?",
    choices: [{ text: "3", isCorrect: false }, { text: "4", isCorrect: true }]
  },
  changeDescription: "Initial version",
  changedBy: "user1",
  createdAt: "2025-12-30T10:00:00Z"
}

// v2 - First update
{
  version: 2,
  data: {
    text: "What is 3 + 3?",
    choices: [{ text: "5", isCorrect: false }, { text: "6", isCorrect: true }]
  },
  changeDescription: "Updated numbers",
  modifiedFields: ["text", "choices"],
  changedBy: "user1",
  createdAt: "2025-12-30T11:00:00Z"
}

// v3 - Second update
{
  version: 3,
  data: {
    text: "What is 5 + 5?",
    choices: [{ text: "8", isCorrect: false }, { text: "10", isCorrect: true }]
  },
  changeDescription: "Final update",
  modifiedFields: ["text", "choices"],
  changedBy: "user2",
  createdAt: "2025-12-30T12:00:00Z"
}
```

---

## ⚠️ Known Limitations

### Current Limitations
1. **No Frontend UI Yet:** Backend complete, frontend components pending
2. **No Auto-Save:** Only manual saves create versions
3. **No Conflict Resolution:** If two users edit simultaneously, last save wins
4. **No Version Branching:** Linear history only

### Future Enhancements
1. **Auto-Save Drafts:** Create versions for auto-saved drafts
2. **Conflict Detection:** Warn users of concurrent edits
3. **Version Tags:** Name/tag important versions
4. **Version Notes:** Rich annotations on versions
5. **Batch Restore:** Restore multiple questions to specific date/time

---

## 🎯 Use Cases

### 1. Mistake Recovery
"I accidentally deleted important content from a question"
→ View version history, restore previous version

### 2. Audit Trail
"Who changed this question and when?"
→ View version history with user attribution

### 3. Quality Review
"Compare the original version with current version"
→ Use compare endpoint to see all changes

### 4. Collaborative Editing
"Multiple instructors editing the same question bank"
→ Track who made each change

### 5. A/B Testing
"Try different question wordings"
→ Update question, test, restore if needed

### 6. Compliance
"Need to prove question integrity for accreditation"
→ Complete audit trail with timestamps and users

---

## 📚 Integration Points

### Current Integrations
- ✅ Question create/update automatically creates versions
- ✅ Uses same authentication & authorization as questions
- ✅ Uses same HTML sanitization as questions
- ✅ Follows same permission model as questions

### Future Integrations
- ⏳ Frontend UI components
- ⏳ Real-time notifications on version changes
- ⏳ Export version history to PDF/CSV
- ⏳ Integration with question analytics

---

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Create & Version
```bash
# 1. Create a question
POST /api/v1/questions
# Expected: Question created, v1 exists

# 2. Check version history
GET /api/v1/questions/123/versions
# Expected: 1 version (v1) with "Initial version"
```

#### Test 2: Update & Version
```bash
# 1. Update the question
PATCH /api/v1/questions/123
{
  "text": "Updated text",
  "changeDescription": "Fixed typo"
}
# Expected: Question updated, v2 created

# 2. Check version history
GET /api/v1/questions/123/versions
# Expected: 2 versions (v1, v2)

# 3. Check v2 has description
GET /api/v1/questions/123/versions/2
# Expected: changeDescription = "Fixed typo"
```

#### Test 3: Compare Versions
```bash
# Compare v1 and v2
GET /api/v1/questions/123/versions/compare?from=1&to=2
# Expected: Diff showing text field changed
```

#### Test 4: Restore Version
```bash
# 1. Restore to v1
POST /api/v1/questions/123/versions/1/restore
# Expected: Question text reverted, v3 created

# 2. Check question
GET /api/v1/questions/123
# Expected: Text matches v1

# 3. Check version history
GET /api/v1/questions/123/versions
# Expected: 3 versions, v3 description = "Restored to version 1"
```

#### Test 5: Version Stats
```bash
GET /api/v1/questions/123/versions/stats
# Expected:
# - totalVersions: 3
# - firstVersion: v1 info
# - latestVersion: v3 info
# - storage info
# - contributor count
```

---

## ✅ Backend Implementation Checklist

- [x] Create QuestionVersion model
- [x] Add indexes for performance
- [x] Implement static methods
- [x] Implement instance methods
- [x] Add versioning to createQuestion controller
- [x] Add versioning to updateQuestion controller
- [x] Create questionVersionController with all endpoints
- [x] Create questionVersionRoutes
- [x] Integrate routes with question routes
- [x] Add permission checks
- [x] Add pagination support
- [x] Add version comparison logic
- [x] Add restore functionality
- [x] Add cleanup functionality
- [x] Add statistics endpoint
- [x] Test API endpoints

---

## 📋 Next Steps - Frontend Implementation

### Required Frontend Components
1. **VersionHistory Modal/Panel**
   - Display version timeline
   - Show who changed what and when
   - Allow version selection

2. **Version Comparison View**
   - Side-by-side diff viewer
   - Highlight changes
   - Show added/removed/modified content

3. **Restore Confirmation Dialog**
   - Warn before restoring
   - Show preview of changes
   - Confirm action

4. **Version Statistics Widget**
   - Show version count
   - Display contributors
   - Storage usage indicator

### RTK Query Integration
```typescript
// frontend/src/store/api/questionVersionApi.ts
- useGetQuestionVersionsQuery
- useGetVersionStatsQuery
- useCompareVersionsMutation
- useRestoreVersionMutation
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Too many versions, storage growing**
- Solution: Use cleanup endpoint to remove old versions
- Configure retention policy (default: 50 versions)

**Issue: Need to see who made specific change**
- Solution: Use version history endpoint
- Each version includes changedBy user info

**Issue: Need to find when a change was made**
- Solution: Use version stats or list all versions
- Versions include createdAt timestamps

---

**Implementation by:** Claude AI
**Backend Status:** ✅ COMPLETED
**Frontend Status:** ⏳ PENDING
**Next Milestone:** Implement Frontend UI Components
