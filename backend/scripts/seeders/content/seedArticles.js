const mongoose = require('mongoose');
const User = require('../../../src/models/User');
const Article = require('../../../src/models/Article');

// Sample articles data
const sampleArticles = [
  {
    title: "Mastering Human-Centered Design: A Guide for Developers",
    content: `
      <p>Human-Centered Design (HCD) focuses on creating solutions that prioritize user needs. This article explores the principles of HCD and how developers can integrate them into their workflows.</p>
      <h3>Key Principles of HCD</h3>
      <ul>
        <li><strong>Empathy:</strong> Understand user pain points through research.</li>
        <li><strong>Iteration:</strong> Build, test, and refine prototypes.</li>
        <li><strong>Collaboration:</strong> Work with designers and stakeholders.</li>
      </ul>
      <h3>Applying HCD in Development</h3>
      <p>Use tools like Figma for prototyping and conduct user testing to validate designs. HCD ensures your applications are intuitive and user-friendly.</p>
    `,
    category: "Design",
    tags: ["design", "ux", "development"],
    thumbnail: "https://picsum.photos/300/200?random=1",
    authorName: "Sufain Huzaif",
    status: "published",
    views: 125,
    likes: 25
  },
  {
    title: "Building Scalable APIs with Node.js and Express",
    content: `
      <p>Learn how to build robust and scalable APIs using Node.js and Express framework. This comprehensive guide covers best practices and advanced techniques.</p>
      <h3>Key Topics Covered</h3>
      <ul>
        <li><strong>Middleware:</strong> Understanding Express middleware patterns</li>
        <li><strong>Authentication:</strong> Implementing JWT-based auth</li>
        <li><strong>Database Integration:</strong> Working with MongoDB and Mongoose</li>
        <li><strong>Error Handling:</strong> Centralized error management</li>
      </ul>
      <h3>Performance Optimization</h3>
      <p>Implement caching, rate limiting, and proper database indexing for optimal performance.</p>
    `,
    category: "Backend Development",
    tags: ["nodejs", "express", "api", "backend"],
    thumbnail: "https://picsum.photos/300/200?random=2",
    authorName: "Alex Johnson",
    status: "published",
    views: 89,
    likes: 18
  },
  {
    title: "React State Management: Redux vs Context API",
    content: `
      <p>Compare different state management solutions in React applications and learn when to use each approach.</p>
      <h3>Redux Toolkit</h3>
      <p>Modern Redux with simplified configuration and better developer experience.</p>
      <h3>Context API</h3>
      <p>Built-in React solution for simple to medium complexity state management.</p>
      <h3>When to Use What</h3>
      <ul>
        <li>Use Context API for simple, localized state</li>
        <li>Use Redux for complex, global state management</li>
        <li>Consider Zustand or Jotai for lightweight alternatives</li>
      </ul>
    `,
    category: "Frontend Development",
    tags: ["react", "redux", "state-management", "frontend"],
    thumbnail: "https://picsum.photos/300/200?random=3",
    authorName: "Sarah Chen",
    status: "published",
    views: 156,
    likes: 32
  },
  {
    title: "Database Design Principles for Modern Applications",
    content: `
      <p>Understand the fundamental principles of database design that will make your applications more efficient and maintainable.</p>
      <h3>Normalization</h3>
      <p>Learn about the different normal forms and when to apply them.</p>
      <h3>Indexing Strategies</h3>
      <p>Optimize query performance with proper indexing techniques.</p>
      <h3>NoSQL vs SQL</h3>
      <p>Choose the right database type for your specific use case and data patterns.</p>
    `,
    category: "Database",
    tags: ["database", "sql", "nosql", "design"],
    thumbnail: "https://picsum.photos/300/200?random=4",
    authorName: "Michael Rodriguez",
    status: "published",
    views: 67,
    likes: 12
  },
  {
    title: "Introduction to Machine Learning for Web Developers",
    content: `
      <p>Getting started with machine learning concepts and how to integrate ML models into web applications.</p>
      <h3>Core ML Concepts</h3>
      <ul>
        <li>Supervised vs Unsupervised Learning</li>
        <li>Training and Validation</li>
        <li>Common Algorithms</li>
      </ul>
      <h3>Web Integration</h3>
      <p>Use TensorFlow.js to run models directly in the browser or integrate with ML APIs.</p>
    `,
    category: "Machine Learning",
    tags: ["ml", "javascript", "tensorflow", "ai"],
    thumbnail: "https://picsum.photos/300/200?random=5",
    authorName: "Dr. Emily Watson",
    status: "published",
    views: 203,
    likes: 45
  },
  {
    title: "DevOps Best Practices for Small Teams",
    content: `
      <p>Implement DevOps practices even with limited resources and small development teams.</p>
      <h3>CI/CD Pipeline</h3>
      <p>Set up automated testing and deployment using GitHub Actions or GitLab CI.</p>
      <h3>Infrastructure as Code</h3>
      <p>Use tools like Docker and terraform for reproducible environments.</p>
      <h3>Monitoring</h3>
      <p>Implement logging and monitoring to catch issues before they affect users.</p>
    `,
    category: "DevOps",
    tags: ["devops", "cicd", "docker", "monitoring"],
    thumbnail: "https://picsum.photos/300/200?random=6",
    authorName: "James Wilson",
    status: "published",
    views: 91,
    likes: 19
  }
];

// Sample authors
const sampleAuthors = [
  { name: "Sufain Huzaif", email: "sufain@example.com", role: "instructor" },
  { name: "Alex Johnson", email: "alex@example.com", role: "instructor" },
  { name: "Sarah Chen", email: "sarah@example.com", role: "instructor" },
  { name: "Michael Rodriguez", email: "michael@example.com", role: "instructor" },
  { name: "Dr. Emily Watson", email: "emily@example.com", role: "instructor" },
  { name: "James Wilson", email: "james@example.com", role: "instructor" }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create authors if they don't exist
    const authorMap = new Map();

    for (const authorData of sampleAuthors) {
      let author = await User.findOne({ email: authorData.email });

      if (!author) {
        author = await User.create({
          ...authorData,
          password: 'password123', // Default password
          emailVerified: true
        });
        console.log(`✅ Created author: ${author.name}`);
      } else {
        console.log(`👤 Author already exists: ${author.name}`);
      }

      authorMap.set(authorData.name, author._id);
    }

    // Create articles
    let createdCount = 0;
    let existingCount = 0;

    for (const articleData of sampleArticles) {
      const existingArticle = await Article.findOne({
        title: articleData.title
      });

      if (!existingArticle) {
        const authorId = authorMap.get(articleData.authorName);

        if (authorId) {
          await Article.create({
            title: articleData.title,
            content: articleData.content,
            category: articleData.category,
            tags: articleData.tags,
            thumbnail: articleData.thumbnail,
            author: authorId,
            status: articleData.status,
            visibility: 'public',
            views: articleData.views,
            likes: articleData.likes,
            publishedAt: new Date()
          });

          createdCount++;
          console.log(`📄 Created article: ${articleData.title}`);
        } else {
          console.log(`⚠️  Author not found for article: ${articleData.title}`);
        }
      } else {
        existingCount++;
        console.log(`📄 Article already exists: ${articleData.title}`);
      }
    }

    console.log('\n🎉 Database seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Authors created: ${sampleAuthors.length - existingCount}`);
    console.log(`   - Articles created: ${createdCount}`);
    console.log(`   - Articles already existed: ${existingCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Only run if called directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();

  // Connect to MongoDB
  const connectDB = async () => {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
      }
      await mongoose.connect(mongoUri);
      console.log('🔗 Connected to MongoDB');

      await seedDatabase();

      console.log('✅ Seeding completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      process.exit(1);
    }
  };

  connectDB();
}

module.exports = { seedDatabase };