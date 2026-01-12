
require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Lesson = require('../../../../src/models/Lesson');

async function getLessonId() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const lesson = await Lesson.findOne({ course: '6964b6407fb5200f542206f2' });
    if (lesson) {
      console.log(`LESSON_ID: ${lesson._id}`);
    } else {
      console.log('No lesson found');
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
  }
}

getLessonId();
