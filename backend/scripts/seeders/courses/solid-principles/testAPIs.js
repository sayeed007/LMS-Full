const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const COURSE_ID = '6964d07531858728c0f9eaee';

async function testAPIs() {
  console.log('🧪 Testing Course APIs\n');
  
  try {
    // Test Chapters API
    console.log('1️⃣  Testing GET /courses/{id}/chapters');
    const chaptersResponse = await axios.get(`${BASE_URL}/courses/${COURSE_ID}/chapters`);
    console.log(`   Status: ${chaptersResponse.status}`);
    console.log(`   Chapters returned: ${chaptersResponse.data.data.chapters.length}`);
    
    if (chaptersResponse.data.data.chapters.length > 0) {
      const firstChapter = chaptersResponse.data.data.chapters[0];
      console.log(`   First chapter: "${firstChapter.title}"`);
      console.log(`   Lessons in first chapter: ${firstChapter.lessons ? firstChapter.lessons.length : 0}`);
      
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        console.log(`   ✅ Lessons are populated!`);
        console.log(`   Sample lesson: "${firstChapter.lessons[0].title}"`);
      } else {
        console.log(`   ❌ Lessons NOT populated`);
      }
    }
    
    console.log('\n2️⃣  Testing GET /courses/{id}/lessons');
    const lessonsResponse = await axios.get(`${BASE_URL}/courses/${COURSE_ID}/lessons`);
    console.log(`   Status: ${lessonsResponse.status}`);
    console.log(`   Lessons returned: ${lessonsResponse.data.data.lessons.length}`);
    
    if (lessonsResponse.data.data.lessons.length > 0) {
      const firstLesson = lessonsResponse.data.data.lessons[0];
      console.log(`   First lesson: "${firstLesson.title}"`);
      console.log(`   Has chapter field: ${firstLesson.chapter ? 'Yes' : 'No'}`);
      console.log(`   ✅ Lessons API working!`);
    }
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('\n❌ API Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testAPIs();
