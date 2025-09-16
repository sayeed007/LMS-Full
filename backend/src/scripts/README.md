# LMS Database Seeding System

## Overview
This comprehensive seeding system sets up a complete Learning Management System database with realistic sample data, including users, courses, lessons, quizzes, and enrollments.

## Quick Start (One-Click Seeding)

### Prerequisites
1. MongoDB running locally or connection string in `.env`
2. Node.js and npm installed
3. All dependencies installed (`npm install`)

### One-Click Commands
```bash
# Full database seeding (recommended for first-time setup)
npm run seed

# Clear database only
npm run seed:clear

# Complete database reset (clear + seed)
npm run db:reset

# Show help
npm run seed:help
```

## Architecture Improvements

### Fixed Course Structure
The course structure now properly follows the hierarchy: **Course → Chapter → Lesson**

```javascript
Course: {
  title: "JavaScript Fundamentals",
  chapters: [
    {
      title: "Variables and Data Types",
      lessons: [
        {
          title: "Introduction to Variables",
          content: "...",
          type: "text",
          duration: 15
        }
      ]
    }
  ]
}
```

### Enhanced Models

#### Course Model (`/models/Course.js`)
- ✅ Embedded lesson structure within chapters
- ✅ Enhanced resource schema with detailed metadata
- ✅ Improved assignment details with file upload settings
- ✅ Better validation and field consistency
- ✅ Comprehensive analytics and settings

#### Assignment Model (`/models/Assignment.js`) - **NEW**
- ✅ Complete assignment management system
- ✅ Multiple submission types (text, file, URL, code)
- ✅ Auto-grading support for code assignments
- ✅ Plagiarism checking integration
- ✅ Late submission handling with penalties

#### User Model (`/models/User.js`)
- ✅ Added profile fields for consistency
- ✅ Fixed field naming inconsistencies
- ✅ Enhanced subscription and learning progress tracking

## Seeding Components

### 1. Core Data Seeders
- **User Seeder** (`userSeeder.js`): Creates admins, instructors, and students
- **Category Seeder** (`categorySeeder.js`): Sets up course categories

### 2. Course Content Seeders
- **Improved Course Seeder** (`improvedCourseSeeder.js`): Creates complete courses with embedded lessons
- **Legacy Lesson Seeder** (`lessonSeeder.js`): For backward compatibility

### 3. Assessment Seeders
- **Quiz Seeder** (`quizSeeder.js`): Creates quizzes, questions, and question banks
- **Enrollment Seeder** (`enrollmentSeeder.js`): Sets up student enrollments

### 4. Main Seeder
- **Comprehensive Seeder** (`seedAll.js`): Orchestrates all seeding with proper error handling

## Sample Data Created

### Users (14 total)
- **1 Super Admin**: `admin@lms.com`
- **1 Org Admin**: `org.admin@lms.com`
- **4 Instructors**: Subject matter experts
- **8 Students**: Diverse learner profiles

### Courses (4 complete courses)
1. **JavaScript Mastery** (40 hours, 3 chapters, 6+ lessons)
2. **Machine Learning with Python** (60 hours, 1+ chapters)
3. **UI/UX Design Systems** (30 hours, design assignments)
4. **Ethical Hacking & Penetration Testing** (80 hours, advanced content)

### Course Features
- ✅ Multiple lesson types (text, video, quiz, assignment)
- ✅ Rich content with markdown formatting
- ✅ Resource attachments and external links
- ✅ Progressive difficulty levels
- ✅ Real-world project assignments

### Assessments & Content
- **6 Question Banks**: Organized by course and topic
- **11+ Questions**: Multiple choice, true/false, descriptive
- **4 Quizzes**: Complete with settings, time limits, and grading
- **8 Articles**: Comprehensive technical articles with rich content
- **26+ Student Enrollments**: Realistic progress tracking

### Additional Data
- **25+ Categories**: Comprehensive subject areas covering all major topics

## Database Schema Improvements

### Better Relationships
```
User (1) → (∞) Course.instructor
Course (1) → (∞) Chapter
Chapter (1) → (∞) Lesson
Course (1) → (∞) Assignment
User (∞) ↔ (∞) Course.enrollments
```

### Enhanced Fields
- Proper timestamp tracking
- Comprehensive metadata
- Analytics and statistics
- Settings and preferences
- Resource management

## Testing Accounts

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | `admin@lms.com` | `password123` | Full system access |
| Instructor | `john.doe@lms.com` | `password123` | JavaScript expert |
| Instructor | `sarah.wilson@lms.com` | `password123` | ML/Data Science |
| Instructor | `michael.chen@lms.com` | `password123` | UI/UX Designer |
| Instructor | `emily.rodriguez@lms.com` | `password123` | Cybersecurity |
| Student | `alice.student@lms.com` | `password123` | CS student |
| Student | `bob.johnson@lms.com` | `password123` | Career changer |

## Advanced Usage

### Custom Seeding
```bash
# Run specific seeder
node src/scripts/userSeeder.js

# Run improved course seeder only
node src/scripts/improvedCourseSeeder.js
```

### Environment Variables
Create `.env` file with:
```env
MONGODB_URI=mongodb://localhost:27017/lms_database
# or
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/lms_database
```

### Error Handling
The seeding system includes:
- ✅ Database connection retry logic
- ✅ Graceful error recovery
- ✅ Detailed error messages
- ✅ Progress tracking
- ✅ Cleanup on failure

## Development Notes

### Performance Optimizations
- Batch insertions for better performance
- Minimal database queries
- Efficient relationship handling
- Progress tracking without excessive logging

### Data Consistency
- All foreign keys properly validated
- Consistent field naming across models
- Proper default values
- Data type consistency

### Extensibility
- Easy to add new courses or content
- Modular seeder design
- Configurable data amounts
- Template-based course creation

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```
   Solution: Check MONGODB_URI in .env file
   ```

2. **Model Validation Errors**
   ```
   Solution: Ensure all required models are imported
   ```

3. **Memory Issues with Large Data**
   ```
   Solution: Run seeders individually or adjust batch sizes
   ```

### Debug Mode
Run with additional logging:
```bash
DEBUG=* npm run seed
```

## File Structure
```
backend/src/scripts/
├── README.md                    # This file
├── seedAll.js                   # Main comprehensive seeder
├── improvedCourseSeeder.js      # Enhanced course creation
├── userSeeder.js                # User accounts
├── categorySeeder.js            # Course categories
├── lessonSeeder.js              # Legacy lesson seeder
├── quizSeeder.js                # Assessments
├── enrollmentSeeder.js          # Student enrollments
└── index.js                     # Original seeder (legacy)
```

## Next Steps

1. **Run the seeder**: `npm run seed`
2. **Start your application**: `npm run dev`
3. **Login with test accounts** and explore the rich content
4. **Customize courses** by editing `improvedCourseSeeder.js`
5. **Add more content** following the established patterns

---

*This seeding system provides a production-ready foundation for your LMS with realistic, comprehensive sample data.*