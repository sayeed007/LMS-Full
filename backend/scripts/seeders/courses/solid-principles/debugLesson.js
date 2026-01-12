
require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Lesson = require('../../../../src/models/Lesson');

async function debugLesson() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const lessonId = '6964b6417fb5200f542206fa';
    const courseId = '6964b6407fb5200f542206f2';

    console.log(`Checking Lesson: ${lessonId}`);
    console.log(`Expected Course: ${courseId}`);

    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      console.log('❌ Lesson NOT found in DB via findById');
    } else {
      console.log('✅ Lesson FOUND');
      console.log(`   Title: ${lesson.title}`);
      console.log(`   Course ID in DB: ${lesson.course}`);
      console.log(`   Match? ${lesson.course.toString() === courseId}`);
      console.log(`   isPreview: ${lesson.isPreview}`);
      console.log(`   isDeleted: ${lesson.isDeleted}`);
      console.log(`   isPublished: ${lesson.isPublished}`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

debugLesson();
