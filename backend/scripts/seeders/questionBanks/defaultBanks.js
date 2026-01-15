const QuestionBank = require('../../../src/models/QuestionBank');

async function seedQuestionBanks(courses, users) {
  console.log('📝 Seeding question banks...');
  
  try {
    const questionBanks = [];
    
    // Create a question bank for each course
    for (const course of courses) {
      const instructor = users.find(u => u.role === 'instructor');
      
      const bank = await QuestionBank.create({
        name: `${course.title} - Question Bank`,
        description: `Default question bank for ${course.title}`,
        course: course._id,
        createdBy: instructor._id,
        isPublic: false,
        sections: [
          {
            name: 'General Questions',
            description: 'General course questions',
            order: 1
          },
          {
            name: 'Advanced Topics',
            description: 'Advanced level questions',
            order: 2
          }
        ]
      });
      
      questionBanks.push(bank);
    }
    
    console.log(`✅ Created ${questionBanks.length} question banks`);
    return questionBanks;
  } catch (error) {
    console.error('❌ Error seeding question banks:', error.message);
    throw error;
  }
}

module.exports = { seedQuestionBanks };
