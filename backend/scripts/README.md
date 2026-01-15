# LMS Database Seeding Scripts

Complete database seeding solution for the Learning Management System.

## 🎯 Overview

This directory contains scripts to seed the LMS database with sample data including:
- **Users**: Admin, instructors, and students
- **Categories**: Course categories
- **Courses**: 2 complete courses (GitHub Mastery, SOLID Principles)
- **Question Banks**: Default question banks for each course
- **System Settings**: Default configuration

## 📁 Directory Structure

```
scripts/
├── seed.js                    # Main seeding orchestrator
├── dropDatabase.js            # Database reset utility
├── README.md                  # This file
└── seeders/
    ├── core/
    │   ├── users.js          # User accounts
    │   ├── categories.js     # Course categories
    │   └── settings.js       # System settings
    ├── questionBanks/
    │   └── defaultBanks.js   # Question bank templates
    └── courses/
        ├── github-mastery/
        │   ├── courseStructure.json
        │   └── seed.js
        └── solid-principles/
            ├── courseStructure.json
            └── seed.js
```

## 🚀 Quick Start

### Seed Everything (Fresh Start)

```bash
# From backend directory
npm run seed

# Or from scripts directory
node seed.js
```

This will:
1. ⚠️  **Drop the entire database** (with confirmation)
2. Seed core data (users, categories, settings)
3. Seed 2 complete courses
4. Create question banks
5. Display summary and login credentials

### Drop Database Only

```bash
# From backend directory
npm run seed:drop

# Or from scripts directory
node dropDatabase.js
```

## 👥 Seeded Users

### Admin
- **Email**: admin@lms.com
- **Password**: admin123
- **Role**: Administrator

### Instructors
- **Email**: john.instructor@lms.com
- **Password**: instructor123
- **Department**: Computer Science

- **Email**: jane.instructor@lms.com
- **Password**: instructor123
- **Department**: Software Engineering

### Students (5 total)
- **Email**: alice.student@lms.com
- **Password**: student123

- **Email**: bob.student@lms.com
- **Password**: student123

- **Email**: charlie.student@lms.com
- **Password**: student123

- **Email**: diana.student@lms.com
- **Password**: student123

- **Email**: ethan.student@lms.com
- **Password**: student123

## 📚 Seeded Courses

### 1. GitHub Mastery
- **Instructor**: John Doe
- **Category**: DevOps
- **Level**: Beginner
- **Duration**: 6 hours
- **Status**: Published

### 2. SOLID Principles
- **Instructor**: Jane Smith
- **Category**: Software Engineering
- **Level**: Intermediate
- **Duration**: 8 hours
- **Status**: Published

## 📂 Seeded Categories

- Programming
- Software Engineering
- Web Development
- Database
- DevOps
- Mobile Development

## ⚙️ Environment Variables

Make sure your `.env` file contains:

```env
MONGODB_URI=mongodb://localhost:27017/lms
```

## 🔧 Adding New Seeders

### Add a New Course

1. Create a new folder in `seeders/courses/your-course-name/`
2. Add `courseStructure.json` with course data
3. Create `seed.js` following the existing pattern
4. Import and call in main `seed.js`

### Add New Core Data

1. Create seeder in `seeders/core/`
2. Export a seed function
3. Import and call in main `seed.js`

## 📝 Notes

- **⚠️  WARNING**: Running the seed script will **DELETE ALL DATA** in your database
- Always backup important data before seeding
- Seeding is idempotent - you can run it multiple times
- All passwords are hashed using bcrypt
- Courses are automatically published and approved

## 🐛 Troubleshooting

### Connection Issues
```bash
# Check MongoDB is running
mongosh

# Verify connection string in .env
echo $MONGODB_URI
```

### Seeding Errors
- Ensure all models are properly defined
- Check for unique constraint violations
- Verify foreign key references

## 📊 Package.json Scripts

Add these to your `backend/package.json`:

```json
{
  "scripts": {
    "seed": "node scripts/seed.js",
    "seed:drop": "node scripts/dropDatabase.js"
  }
}
```

---

**Last Updated**: January 2026
**Maintainer**: LMS Development Team
