const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('Testing API endpoint: http://localhost:5000/api/v1/courses?page=1&limit=50&sort=newest\n');
    
    const response = await axios.get('http://localhost:5000/api/v1/courses', {
      params: {
        page: 1,
        limit: 50,
        sort: 'newest'
      }
    });

    console.log('Status:', response.status);
    console.log('Results:', response.data.results);
    console.log('Total:', response.data.pagination?.totalResults);
    console.log('\nCourses returned:');
    
    if (response.data.data && response.data.data.length > 0) {
      response.data.data.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Published: ${course.isPublished}, Approved: ${course.isApproved}, Deleted: ${course.isDeleted}`);
      });
    } else {
      console.log('No courses returned');
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testAPI();
