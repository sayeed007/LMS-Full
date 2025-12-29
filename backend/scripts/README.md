# Backend Scripts - Organized Structure

This directory contains all backend scripts organized by function for better maintainability.

## 📁 Directory Structure

```
backend/scripts/
├── database/              # Database utilities
│   ├── backup-database.js
│   ├── restore-database.js
│   ├── init-database.js
│   └── validate-env.js
│
├── seeders/               # All seeding scripts
│   ├── core/              # Core data seeders
│   │   ├── seedAll.js     # Main seeder orchestrator ⭐
│   │   ├── userSeeder.js
│   │   └── categorySeeder.js
│   │
│   ├── courses/           # Course content seeders
│   │   ├── improvedCourseSeeder.js
│   │   ├── courseSeeder.js (legacy)
│   │   ├── lessonSeeder.js
│   │   └── solid-principles/
│   │       ├── solidPrinciplesCourseSeederComplete.js
│   │       ├── SOLID_COURSE_README.md
│   │       └── testSOLIDCourseStructure.js
│   │
│   ├── content/           # Article and content seeders
│   │   ├── improvedArticleSeeder.js
│   │   └── seedArticles.js
│   │
│   ├── assessments/       # Quiz and assessment seeders
│   │   ├── quizSeeder.js
│   │   └── seedQuestionBanks.js
│   │
│   └── students/          # Student-related seeders
│       └── enrollmentSeeder.js
│
├── migrations/            # Database migrations
│   └── migrateBlocksField.js
│
├── index.js
└── README.md             # This file
```

## 🚀 Quick Start

### Seed Everything (Recommended)
\`\`\`bash
cd backend/scripts/seeders/core
node seedAll.js
\`\`\`

### Clear Database
\`\`\`bash
cd backend/scripts/seeders/core
node seedAll.js --clear
\`\`\`

## 🔑 Test Accounts (After Seeding)

- **Admin**: admin@lms.com / password123
- **Instructor**: john.doe@lms.com / password123
- **Student**: alice.student@lms.com / password123

## 📝 Adding New Seeders

1. Choose correct location (core/courses/content/assessments/students)
2. Use correct model path: \`../../../src/models/\`
3. Export your seeder function
4. Update \`seedAll.js\` to include it

## 📖 More Documentation

- SOLID Course: \`seeders/courses/solid-principles/SOLID_COURSE_README.md\`
- Each seeder may have inline documentation

---

**Structure Version**: 2.0 (Reorganized Dec 2024)
