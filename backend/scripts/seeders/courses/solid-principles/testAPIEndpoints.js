/**
 * Test API Endpoints for SOLID Course
 *
 * Tests if chapters and lessons endpoints work without authentication
 */

const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1';

async function testEndpoints() {
  try {
    console.log('🧪 Testing API Endpoints for SOLID Course\n');

    // First, get all courses to find the SOLID course ID
    console.log('1. Fetching all courses...');
    const coursesResponse = await axios.get(`${API_BASE_URL}/courses`);
    const courses = coursesResponse.data.data.courses;

    const solidCourse = courses.find(c => c.title.includes('SOLID'));

    if (!solidCourse) {
      console.log('❌ SOLID course not found');
      return;
    }

    console.log(`✅ Found SOLID course: ${solidCourse.title}`);
    console.log(`   ID: ${solidCourse._id}\n`);

    // Test chapters endpoint
    console.log('2. Testing GET /courses/:id/chapters (unauthenticated)...');
    try {
      const chaptersResponse = await axios.get(`${API_BASE_URL}/courses/${solidCourse._id}/chapters`);
      const chapters = chaptersResponse.data.data.chapters;

      console.log(`✅ Success! Found ${chapters.length} chapters`);
      chapters.forEach((ch, idx) => {
        console.log(`   ${idx + 1}. ${ch.title}`);
      });
      console.log('');
    } catch (error) {
      console.log('❌ Chapters endpoint failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    // Test lessons endpoint
    console.log('3. Testing GET /courses/:id/lessons (unauthenticated)...');
    try {
      const lessonsResponse = await axios.get(`${API_BASE_URL}/courses/${solidCourse._id}/lessons`);
      const lessons = lessonsResponse.data.data.lessons;

      console.log(`✅ Success! Found ${lessons.length} lessons`);
      lessons.slice(0, 5).forEach((lesson, idx) => {
        console.log(`   ${idx + 1}. ${lesson.title} (${lesson.estimatedDuration || 0}min)`);
      });
      if (lessons.length > 5) {
        console.log(`   ... and ${lessons.length - 5} more lessons`);
      }
      console.log('');
    } catch (error) {
      console.log('❌ Lessons endpoint failed:', error.response?.data?.message || error.message);
      console.log('');
    }

    console.log('🎉 API endpoint tests complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testEndpoints();
