require('dotenv').config({ path: '../../../../.env' });
const mongoose = require('mongoose');
const Lesson = require('../../../../src/models/Lesson');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Get a few recent lessons
    const lessons = await Lesson.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title duration content chapter');

    console.log('Recent Lessons:\n');
    lessons.forEach(lesson => {
      console.log('Title:', lesson.title);
      console.log('Duration:', lesson.duration);
      console.log('Content length:', lesson.content?.length || 0);
      console.log('Content preview:', lesson.content?.substring(0, 100) || 'NO CONTENT');
      console.log('---\n');
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
