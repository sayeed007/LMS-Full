# GitHub Mastery Course - Reference Guide

## Overview

This is a comprehensive GitHub course designed to test all content types and features in your LMS.

**Course Details:**

- **Title:** Mastering GitHub: From Basics to Advanced Workflows
- **Level:** Beginner
- **Duration:** ~6 hours
- **Chapters:** 5
- **Lessons:** 20 (19 in chapters + 1 standalone)
- **Price:** $49.99 (discounted from $79.99)

## Course Structure

### Chapter 1: Getting Started with Git & GitHub (4 lessons)

1. **What is Version Control?** - Text content
2. **Installing Git** - Block content (text + image + video)
3. **Creating Your GitHub Account** - Video content
4. **Git Configuration Basics** - Document content

### Chapter 2: Git Fundamentals (4 lessons)

1. **Understanding Git Repositories** - Block content (text + image)
2. **Basic Git Commands** - Text content
3. **Git Commands Quiz** - Quiz content (2 questions)
4. **Git Workflow Assignment** - Assignment content

### Chapter 3: Branching & Merging (4 lessons)

1. **Understanding Branches** - Video content
2. **Creating and Switching Branches** - Block content (text + video)
3. **Merging Branches** - Audio content
4. **Branching Quiz** - Quiz content

### Chapter 4: GitHub Collaboration (4 lessons)

1. **Pull Requests Explained** - Block content (text + image + video + document)
2. **Code Review Best Practices** - Text content
3. **Collaboration Assignment** - Assignment content
4. **GitHub Issues & Projects** - Video content

### Chapter 5: GitHub Actions & CI/CD (4 lessons)

1. **Introduction to GitHub Actions** - Block content (text + video + image)
2. **Creating Your First Workflow** - Document content
3. **GitHub Actions Quiz** - Quiz content (2 questions)
4. **Final Project: Build a CI/CD Pipeline** - Assignment content

### Standalone Lesson

- **GitHub Cheat Sheet & Resources** - Document content

## Content Types Included

### ✅ All 7 Content Types

1. **Text** - Simple markdown text content
2. **Block** - Mixed media blocks containing:
   - Text blocks
   - Image blocks
   - Video blocks
   - Audio blocks
   - Document blocks
3. **Video** - Embedded YouTube videos
4. **Audio** - Audio files (MP3)
5. **Document** - PDF documents
6. **Quiz** - Interactive quizzes with:
   - Single choice questions
   - Multiple choice questions
   - Time limits
   - Passing scores
   - Feedback
7. **Assignment** - Graded assignments with:
   - Instructions
   - File uploads
   - URL submissions
   - Due dates
   - Late submission policies

## How to Use This for Testing

### Option 1: Manual Creation (Recommended for Testing UI)

Use `courseStructure.json` as a reference while creating the course through the UI:

1. **Create Course:**
   - Copy course metadata from JSON
   - Set title, description, pricing, etc.

2. **Create Chapters:**
   - Follow the chapter structure
   - Create 5 chapters in order

3. **Create Lessons:**
   - For each chapter, create lessons
   - Test different content types

4. **Add Content:**
   - Use the content editor to add various content types
   - Test block editor with mixed media
   - Create quizzes with different question types
   - Set up assignments with file uploads

5. **Create Standalone Lesson:**
   - Create a lesson without assigning to a chapter

### Option 2: Automated Seeding (Backup)

If you need to quickly populate the database:

```bash
cd backend/scripts/seeders/courses/github-mastery
node seed.js
```

This will create the entire course structure automatically.

## Testing Checklist

### Content Creation

- [ ] Create course with all metadata
- [ ] Create chapters in order
- [ ] Create lessons with different types
- [ ] Add text content
- [ ] Add block content with mixed media
- [ ] Add video content
- [ ] Add audio content
- [ ] Add document content
- [ ] Create quiz with questions
- [ ] Create assignment with settings
- [ ] Create standalone lesson

### Content Display

- [ ] View course detail page
- [ ] Expand/collapse chapters
- [ ] View lesson previews
- [ ] Play videos
- [ ] Download documents
- [ ] View quiz questions
- [ ] View assignment details

### Enrollment & Learning

- [ ] Enroll in course
- [ ] Navigate through lessons
- [ ] Complete text lessons
- [ ] Watch videos
- [ ] Take quizzes
- [ ] Submit assignments
- [ ] Track progress

### Edge Cases

- [ ] Standalone lesson display
- [ ] Empty chapters
- [ ] Lessons without content
- [ ] Quiz time limits
- [ ] Assignment file uploads
- [ ] Late submissions

## Content URLs

All external URLs in the JSON are examples. Replace with actual content:

- **Images:** Unsplash placeholder images
- **Videos:** YouTube tutorial videos
- **Documents:** Example PDF URLs
- **Audio:** Example MP3 URLs

## Notes

- First lesson in each chapter is marked as preview (free)
- Quizzes have different settings (time limits, attempts, passing scores)
- Assignments have various submission types (file, URL, mixed)
- Block content demonstrates all 5 block types
- Course includes both chapter-based and standalone lessons

## Support

If you encounter any issues while creating the course:

1. Check the JSON structure for reference
2. Verify all required fields are filled
3. Ensure content types match the schema
4. Use the seeder script as a fallback

---

**Happy Testing! 🚀**
