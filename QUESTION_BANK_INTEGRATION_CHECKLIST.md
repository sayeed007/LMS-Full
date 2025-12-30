# Question Bank Integration Checklist

Use this checklist to integrate the Question Bank features into your application.

## ✅ Backend Setup (Already Complete)

- [x] Question versioning model created
- [x] Version routes configured
- [x] Import/Export endpoints implemented
- [x] CSV parser utilities created
- [x] JSON/QTI exporters created
- [x] Rate limiting configured
- [x] Validation middleware added
- [x] Database indexes created

## ✅ Frontend Setup (Already Complete)

- [x] RTK Query API slices created
- [x] Version history components built
- [x] Import/Export dialogs created
- [x] Integrated components created
- [x] QuestionVersion tag added to baseApi
- [x] TypeScript types defined
- [x] Index files for exports created

## 📋 Integration Steps

### Step 1: Update Question Bank Header

Add import/export buttons to your question bank header:

```tsx
// Example: QuestionsPageClient.tsx
import { QuestionBankActions } from '@/components/question-bank/QuestionBankActions'

function QuestionBankHeader() {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1>Questions</h1>

      {/* Add this */}
      <QuestionBankActions
        questionBankId={questionBankId}
        questionBankName={questionBank?.name}
        onImportSuccess={refetchQuestions}
      />
    </div>
  )
}
```

**Files to Update**:
- [ ] `frontend/src/components/question-bank/QuestionsPageClient.tsx`
- [ ] Or your custom question bank page component

### Step 2: Update Question Editor

Replace QuestionEditor with QuestionEditorWithHistory:

```tsx
// Before:
import { QuestionEditor } from '@/components/question-bank/QuestionEditor'

<QuestionEditor
  question={question}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
/>

// After:
import { QuestionEditorWithHistory } from '@/components/question-bank/QuestionEditorWithHistory'

<QuestionEditorWithHistory
  question={question}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  showVersionHistory={true}
/>
```

**Files to Update**:
- [ ] `frontend/src/components/question-bank/QuestionsPageClient.tsx`
- [ ] Or wherever you use QuestionEditor

### Step 3: Test Version History

1. [ ] Open a question in the editor
2. [ ] Make changes to the question
3. [ ] Save the changes
4. [ ] Click "Version History" tab
5. [ ] Verify version timeline appears
6. [ ] Select two versions and click "Compare"
7. [ ] Verify diff view shows changes
8. [ ] Click restore on an old version
9. [ ] Verify restoration creates new version

### Step 4: Test Import Functionality

1. [ ] Click "Import" button
2. [ ] Select CSV format
3. [ ] Upload a CSV file with sample questions
4. [ ] Verify import progress
5. [ ] Check import results
6. [ ] Verify questions appear in list
7. [ ] Repeat for JSON format
8. [ ] Repeat for QTI format

### Step 5: Test Export Functionality

1. [ ] Click "Export" button
2. [ ] Select CSV format
3. [ ] Enable "Include Metadata"
4. [ ] Click "Export CSV"
5. [ ] Verify file downloads
6. [ ] Open file and verify content
7. [ ] Repeat for JSON format
8. [ ] Repeat for QTI format

## 🧪 Testing Scenarios

### Version History Testing

- [ ] **Create Version**: Update question text, verify new version created
- [ ] **View Timeline**: Check all versions appear with user and timestamp
- [ ] **Compare Versions**: Select two versions, verify diff display
- [ ] **Restore Version**: Restore old version, verify new version created
- [ ] **Auto-save Detection**: Verify auto-saved versions are marked
- [ ] **Pagination**: Create 25+ versions, verify pagination works
- [ ] **Statistics**: Check version stats display correctly
- [ ] **Permissions**: Verify non-owners can't restore (if applicable)

### Import Testing

#### CSV Import
- [ ] Valid CSV with all fields
- [ ] CSV with minimal fields (text, type)
- [ ] CSV with special characters
- [ ] CSV with HTML content
- [ ] CSV with multiple choice questions
- [ ] CSV with single choice questions
- [ ] CSV with true/false questions
- [ ] CSV with descriptive questions
- [ ] Invalid CSV (missing headers)
- [ ] Invalid CSV (wrong format)
- [ ] Empty CSV file
- [ ] Large CSV (100+ questions)

#### JSON Import
- [ ] Valid JSON array
- [ ] JSON with all metadata
- [ ] JSON with minimal fields
- [ ] Invalid JSON format
- [ ] Empty JSON array

#### QTI Import
- [ ] Valid QTI 2.1 XML
- [ ] QTI from Moodle
- [ ] QTI with multiple question types
- [ ] Invalid XML format

### Export Testing

#### CSV Export
- [ ] Export with metadata
- [ ] Export without metadata
- [ ] Export empty question bank
- [ ] Export single question
- [ ] Export 100+ questions
- [ ] Verify choices format (pipe-separated)
- [ ] Verify correct answer markers ([*])
- [ ] Verify HTML stripping

#### JSON Export
- [ ] Export with metadata
- [ ] Export without metadata
- [ ] Verify complete data structure
- [ ] Verify timestamps
- [ ] Verify user attribution

#### QTI Export
- [ ] Export to QTI 2.1
- [ ] Verify XML structure
- [ ] Verify question types mapping
- [ ] Verify response processing
- [ ] Import exported QTI to Moodle/Canvas

## 🔧 Configuration Options

### Environment Variables
No additional environment variables needed.

### Feature Flags (Optional)

If you want to enable/disable features:

```tsx
// config/features.ts
export const FEATURES = {
  QUESTION_VERSIONING: true,
  QUESTION_IMPORT_EXPORT: true,
  VERSION_CLEANUP: true, // Admin only
}

// Usage:
{FEATURES.QUESTION_VERSIONING && (
  <QuestionEditorWithHistory ... />
)}
```

### Pagination Settings

Customize version history pagination:

```tsx
const { data } = useGetQuestionVersionsQuery({
  questionId,
  page: 1,
  limit: 50  // Adjust as needed (default: 20, max: 100)
})
```

### Cleanup Settings

Configure version cleanup (admin only):

```tsx
const [cleanupVersions] = useCleanupVersionsMutation()

await cleanupVersions({
  questionId,
  keepCount: 50  // Keep last 50 versions (default)
}).unwrap()
```

## 📊 Monitoring

### Backend Logs

Monitor these events:
- Version creation
- Version restoration
- Import operations
- Export operations
- Cleanup operations

### Frontend Analytics (Optional)

Track these events:
```tsx
// Example with analytics
const handleExport = async (format) => {
  analytics.track('question_export', { format })
  // ... export logic
}

const handleImport = async () => {
  analytics.track('question_import', { format })
  // ... import logic
}

const handleRestore = async (version) => {
  analytics.track('version_restore', { version })
  // ... restore logic
}
```

## 🐛 Troubleshooting

### Version History Issues

**Problem**: Versions not showing
- **Check**: Question has `_id` or `id` field
- **Check**: Backend version endpoint returning data
- **Check**: RTK Query cache not stale

**Problem**: Compare not working
- **Check**: Both version numbers are valid
- **Check**: Backend compare endpoint accessible
- **Check**: Network requests succeeding

**Problem**: Restore fails
- **Check**: User has permission
- **Check**: Version exists
- **Check**: Backend restore endpoint working

### Import Issues

**Problem**: Import fails immediately
- **Check**: File format matches selection
- **Check**: File is not empty
- **Check**: File encoding is UTF-8

**Problem**: Some questions skipped
- **Check**: Question validation rules
- **Check**: Required fields present
- **Check**: Question types valid
- **Check**: Backend logs for specific errors

**Problem**: Import slow for large files
- **Expected**: Files with 1000+ questions take time
- **Solution**: Break into smaller batches

### Export Issues

**Problem**: Download fails
- **Check**: Browser allows downloads
- **Check**: Blob API supported
- **Check**: Network request succeeds

**Problem**: Empty file downloads
- **Check**: Question bank has questions
- **Check**: Backend export endpoint working
- **Check**: Format parameter correct

**Problem**: CSV content garbled
- **Check**: File encoding (should be UTF-8)
- **Check**: Special characters escaped
- **Check**: Browser's default encoding

## 🚀 Performance Optimization

### Backend
- [x] Indexes on questionId + version
- [x] Pagination for large result sets
- [x] Efficient diff algorithm
- [x] Stream processing for large files

### Frontend
- [x] Lazy queries for exports
- [x] Pagination for version history
- [x] Tag-based cache invalidation
- [x] Optimistic updates
- [x] Blob disposal after download

### Recommendations
- [ ] Implement version cleanup schedule
- [ ] Monitor version storage growth
- [ ] Cache frequently accessed versions
- [ ] Implement rate limiting on frontend

## 📝 Documentation

### For Developers
- [x] `QUESTION_BANK_FRONTEND_GUIDE.md` - Complete usage guide
- [x] `QUESTION_BANK_COMPLETE_SUMMARY.md` - Feature summary
- [x] `QUESTION_BANK_QUICK_REFERENCE.md` - Quick reference card
- [x] `QUESTION_VERSIONING_IMPLEMENTATION.md` - Backend details

### For Users (TODO)
- [ ] Create user-facing documentation
- [ ] Add tooltips in UI
- [ ] Create video tutorials
- [ ] FAQ section

## ✨ Optional Enhancements

These are not required but can enhance the feature:

### UI Enhancements
- [ ] Version labels/tags
- [ ] Keyboard shortcuts
- [ ] Drag-and-drop import anywhere
- [ ] Preview before import
- [ ] Batch operations

### Functionality Enhancements
- [ ] Export scheduling
- [ ] Import templates
- [ ] Version analytics dashboard
- [ ] Collaborative editing indicators
- [ ] Real-time sync

### Integration Enhancements
- [ ] Cloud storage export
- [ ] Email export links
- [ ] Webhook notifications
- [ ] API access tokens

## 🎉 Completion Checklist

### Required for Launch
- [x] Backend endpoints implemented
- [x] Frontend components created
- [x] Basic testing completed
- [ ] Integration into main app
- [ ] User acceptance testing
- [ ] Documentation reviewed

### Nice to Have
- [ ] Advanced analytics
- [ ] User onboarding
- [ ] Video tutorials
- [ ] Advanced features

## 📞 Support

### Issues Found?
1. Check the troubleshooting section above
2. Review the complete guide in `QUESTION_BANK_FRONTEND_GUIDE.md`
3. Check browser console for errors
4. Check network tab for failed requests
5. Review backend logs

### Need Help?
- Developer Guide: `QUESTION_BANK_FRONTEND_GUIDE.md`
- Quick Reference: `QUESTION_BANK_QUICK_REFERENCE.md`
- Backend Details: `QUESTION_VERSIONING_IMPLEMENTATION.md`

---

**Status**: Ready for Integration
**Last Updated**: December 30, 2025
**Version**: 1.0.0
