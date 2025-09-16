const Category = require('../models/Category');

// Helper function to create slug
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-');
};

const seedCategories = async (users) => {
  // Get admin user for creating categories
  const adminUser = users.find(user => user.role === 'super_admin' || user.role === 'admin') || users[0];

  const categories = [
    // Main Categories
    {
      name: 'Design & Development',
      description: 'Learn web design, graphic design, and development skills to create stunning websites and applications.',
      icon: 'code',
      color: '#3B82F6',
      createdBy: adminUser._id,
    },
    {
      name: 'Business & Management',
      description: 'Master business strategy, leadership, project management, and entrepreneurship.',
      icon: 'business',
      color: '#10B981',
      createdBy: adminUser._id,
    },
    {
      name: 'Technology & Development',
      description: 'Dive deep into programming, software engineering, and technology solutions.',
      icon: 'code',
      color: '#8B5CF6',
      createdBy: adminUser._id,
    },
    {
      name: 'Personal Development & Learning',
      description: 'Enhance your personal skills, productivity, and lifelong learning abilities.',
      icon: 'book',
      color: '#F59E0B',
      createdBy: adminUser._id,
    },
    {
      name: 'Health & Wellness',
      description: 'Focus on physical health, mental wellness, nutrition, and fitness.',
      icon: 'health',
      color: '#EF4444',
      createdBy: adminUser._id,
    },
    {
      name: 'Data & Analytics',
      description: 'Learn data science, analytics, machine learning, and business intelligence.',
      icon: 'math',
      color: '#06B6D4',
      createdBy: adminUser._id,
    },
    {
      name: 'Design & Creative Arts',
      description: 'Explore creativity through art, design, photography, and multimedia.',
      icon: 'art',
      color: '#EC4899',
      createdBy: adminUser._id,
    },
    {
      name: 'Marketing & Sales',
      description: 'Master digital marketing, sales strategies, and brand development.',
      icon: 'business',
      color: '#84CC16',
      createdBy: adminUser._id,
    },
    {
      name: 'Finance & Accounting',
      description: 'Learn financial management, accounting principles, and investment strategies.',
      icon: 'math',
      color: '#F97316',
      createdBy: adminUser._id,
    },
    {
      name: 'Language & Communication',
      description: 'Improve communication skills and learn new languages.',
      icon: 'language',
      color: '#6B7280',
      createdBy: adminUser._id,
    },
    {
      name: 'Science & Engineering',
      description: 'Explore scientific concepts and engineering principles.',
      icon: 'science',
      color: '#0D9488',
      createdBy: adminUser._id,
    },
    {
      name: 'Music & Audio',
      description: 'Learn music production, audio engineering, and musical instruments.',
      icon: 'music',
      color: '#7C3AED',
      createdBy: adminUser._id,
    },
    {
      name: 'Photography & Video',
      description: 'Master photography techniques and video production skills.',
      icon: 'art',
      color: '#DC2626',
      createdBy: adminUser._id,
    },
    {
      name: 'Sports & Fitness',
      description: 'Learn about sports, fitness training, and physical conditioning.',
      icon: 'sports',
      color: '#059669',
      createdBy: adminUser._id,
    },
    {
      name: 'Lifestyle & Hobbies',
      description: 'Explore personal interests, hobbies, and lifestyle improvements.',
      icon: 'folder',
      color: '#7C2D12',
      createdBy: adminUser._id,
    },
    // Additional specific categories
    {
      name: 'Mobile Development',
      description: 'Build mobile applications for iOS, Android, and cross-platform solutions.',
      icon: 'code',
      color: '#1E40AF',
      createdBy: adminUser._id,
    },
    {
      name: 'Web Development',
      description: 'Create modern websites and web applications using latest technologies.',
      icon: 'code',
      color: '#1F2937',
      createdBy: adminUser._id,
    },
    {
      name: 'Artificial Intelligence',
      description: 'Learn AI, machine learning, deep learning, and neural networks.',
      icon: 'science',
      color: '#6366F1',
      createdBy: adminUser._id,
    },
    {
      name: 'Cybersecurity',
      description: 'Master cybersecurity principles, ethical hacking, and digital security.',
      icon: 'folder',
      color: '#991B1B',
      createdBy: adminUser._id,
    },
    {
      name: 'Cloud Computing',
      description: 'Learn cloud platforms, DevOps, and modern infrastructure management.',
      icon: 'code',
      color: '#0369A1',
      createdBy: adminUser._id,
    },
    {
      name: 'Digital Marketing',
      description: 'Master online marketing, SEO, social media, and content marketing.',
      icon: 'business',
      color: '#BE185D',
      createdBy: adminUser._id,
    },
    {
      name: 'UI/UX Design',
      description: 'Design user-friendly interfaces and exceptional user experiences.',
      icon: 'design',
      color: '#7C3AED',
      createdBy: adminUser._id,
    },
    {
      name: 'Project Management',
      description: 'Learn project management methodologies, tools, and leadership skills.',
      icon: 'business',
      color: '#047857',
      createdBy: adminUser._id,
    },
    {
      name: 'Cryptocurrency & Blockchain',
      description: 'Understand blockchain technology, cryptocurrencies, and DeFi.',
      icon: 'math',
      color: '#F59E0B',
      createdBy: adminUser._id,
    },
    {
      name: 'Game Development',
      description: 'Create games using various engines and programming languages.',
      icon: 'code',
      color: '#DC2626',
      createdBy: adminUser._id,
    },
  ];

  try {
    // Clear existing categories
    await Category.deleteMany({});

    // Add slug to each category and insert them
    const categoriesWithSlug = categories.map(category => ({
      ...category,
      slug: createSlug(category.name)
    }));

    // Insert categories
    const createdCategories = await Category.insertMany(categoriesWithSlug);
    console.log(`   • Created ${createdCategories.length} categories`);

    return createdCategories;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

module.exports = {
  seedCategories
};