const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

const Chapter = require('./src/models/Chapter');
const Lesson = require('./src/models/Lesson');
const Enrollment = require('./src/models/Enrollment');
const Course = require('./src/models/Course'); // New schema
const Content = require('./src/models/Content');

// Connect DB
const DB = process.env.MONGODB_URI;

const migrate = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB connection successful!');
    
    console.log('Starting Migration v2...');

    // Use raw collection to get data hidden by new schema (wait for connection)
    if (!mongoose.connection.db) {
       throw new Error('Database connection established but db object is missing');
    }
    const rawCourses = await mongoose.connection.db.collection('courses').find({}).toArray();
    console.log(`Found ${rawCourses.length} courses to process.`);

    for (const rawCourse of rawCourses) {
      console.log(`Processing Course: ${rawCourse.title} (${rawCourse._id})`);

      // CLEANUP: Delete existing relational data for this course to avoid duplicates
      const existingLessons = await Lesson.find({ course: rawCourse._id });
      const existingLessonIds = existingLessons.map(l => l._id);
      if (existingLessonIds.length > 0) {
        await Content.deleteMany({ lesson: { $in: existingLessonIds } });
      }
      await Lesson.deleteMany({ course: rawCourse._id });
      await Chapter.deleteMany({ course: rawCourse._id });
      await Enrollment.deleteMany({ course: rawCourse._id });
      console.log('Cleaned up existing relational data.');

      let chapterOrder = 1;
      // 1. Migrate Chapters & Lessons
      if (rawCourse.chapters && rawCourse.chapters.length > 0) {
        console.log(`  Found ${rawCourse.chapters.length} embedded chapters.`);
        
        for (const [cIndex, rawChapter] of rawCourse.chapters.entries()) {
           // Create Chapter Document
           let chapter = await Chapter.findOne({ title: rawChapter.title, course: rawCourse._id });
           
           if (!chapter) {
             chapter = await Chapter.create({
               title: rawChapter.title,
               description: rawChapter.description,
               course: rawCourse._id,
               order: rawChapter.order || cIndex + 1,
               isPublished: true,
               createdBy: rawCourse.instructor, // Default to course instructor
               isActive: true
             });
             console.log(`    Created Chapter: ${chapter.title}`);
           }

           // Migrate Lessons
           if (rawChapter.lessons && rawChapter.lessons.length > 0) {
             for (const [lIndex, rawLesson] of rawChapter.lessons.entries()) {
               let lesson = await Lesson.findOne({ title: rawLesson.title, chapter: chapter._id });
               
               if (!lesson) {
                 // Determine content type
                 let type = rawLesson.videoUrl ? 'video' : 'text';
                 if (rawLesson.quiz) type = 'quiz';
                 if (rawLesson.assignment) type = 'assignment';

                 lesson = await Lesson.create({
                   title: rawLesson.title,
                   description: rawLesson.description,
                   content: rawLesson.content,
                   type: type,
                   videoUrl: rawLesson.videoUrl,
                   duration: rawLesson.duration || 0,
                   module: chapter._id, // Link to new Chapter (Module)
                   course: rawCourse._id,
                   order: rawLesson.order || lIndex + 1,
                   isPublished: true,
                   createdBy: rawCourse.instructor,
                   chapter: chapter._id // Backwards compatibility field
                 });

            // CREATE LEGACY CONTENT
            if (lesson.content) {
              await Content.create({
                title: 'Lesson Content',
                type: 'text',
                data: { text: lesson.content },
                lesson: lesson._id,
                order: 1,
                isPublished: true,
                createdBy: rawCourse.instructor || rawCourse.createdBy // Fallback
              });
            }
                 console.log(`      Created Lesson: ${lesson.title}`);
               }
             }
           }
        }
      }

      // 2. Migrate Enrollments
      if (rawCourse.enrollments && rawCourse.enrollments.length > 0) {
        console.log(`  Found ${rawCourse.enrollments.length} embedded enrollments.`);
        
        for (const rawEnroll of rawCourse.enrollments) {
          // Check if user exists (User ID might be embedded object or ID)
          const userId = rawEnroll.student || rawEnroll.user; 
          if (!userId) continue;

          let enrollment = await Enrollment.findOne({ user: userId, course: rawCourse._id });
          
          if (!enrollment) {
             enrollment = await Enrollment.create({
               user: userId,
               course: rawCourse._id,
               enrolledAt: rawEnroll.enrolledAt || new Date(),
               progress: {
                 completionPercentage: rawEnroll.progress || 0,
                 completedLessons: rawEnroll.completedLessons || []
               },
               status: rawEnroll.status || 'active'
             });
             console.log(`    Created Enrollment for User: ${userId}`);
          }
        }
      }

      // 3. Clean up Course Document (Unset raw fields)
      // await mongoose.connection.db.collection('courses').updateOne(
      //   { _id: rawCourse._id },
      //   { $unset: { chapters: "", enrollments: "" } }
      // );
      // NOTE: Commented out to be SAFE. User can uncomment if verification passes.
    }

    console.log('Migration Complete.');
    process.exit();
  } catch (err) {
    console.error('Migration Failed:', err);
    process.exit(1);
  }
};

migrate();
