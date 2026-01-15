const Category = require('../../../src/models/Category');

const categories = [
  {
    name: 'Programming',
    description: 'Learn programming languages and coding fundamentals',
    slug: 'programming',
    isActive: true
  },
  {
    name: 'Software Engineering',
    description: 'Software design patterns, architecture, and best practices',
    slug: 'software-engineering',
    isActive: true
  },
  {
    name: 'Web Development',
    description: 'Frontend and backend web development technologies',
    slug: 'web-development',
    isActive: true
  },
  {
    name: 'Database',
    description: 'Database design, SQL, NoSQL, and data management',
    slug: 'database',
    isActive: true
  },
  {
    name: 'DevOps',
    description: 'CI/CD, containerization, cloud platforms, and automation',
    slug: 'devops',
    isActive: true
  },
  {
    name: 'Mobile Development',
    description: 'iOS, Android, and cross-platform mobile app development',
    slug: 'mobile-development',
    isActive: true
  }
];

async function seedCategories(users) {
  console.log('📂 Seeding categories...');
  
  try {
    const admin = users.find(u => u.role === 'super_admin');
    
    const categoriesWithCreator = categories.map(cat => ({
      ...cat,
      createdBy: admin._id
    }));
    
    const createdCategories = await Category.insertMany(categoriesWithCreator);
    console.log(`✅ Created ${createdCategories.length} categories`);
    return createdCategories;
  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
    throw error;
  }
}

module.exports = { seedCategories, categories };
