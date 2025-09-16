const Course = require('../models/Course');

const seedCourses = async (users) => {
  // Find instructors
  const instructors = users.filter(user => user.role === 'instructor');
  const john = instructors.find(i => i.email === 'john.doe@lms.com');
  const sarah = instructors.find(i => i.email === 'sarah.wilson@lms.com');
  const michael = instructors.find(i => i.email === 'michael.chen@lms.com');
  const emily = instructors.find(i => i.email === 'emily.rodriguez@lms.com');

  const courses = [
    // John Doe's Courses
    {
      title: 'Complete JavaScript Mastery: From Beginner to Advanced',
      description: 'Master JavaScript from fundamentals to advanced concepts. Learn ES6+, async programming, DOM manipulation, and modern JavaScript frameworks. Perfect for beginners and intermediate developers.',
      category: 'programming',
      level: 'beginner',
      instructor: john._id,
      createdBy: john._id,
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=500',
      price: 99.99,
      estimatedDuration: 40, // hours
      language: 'English',
      tags: ['javascript', 'programming', 'web-development', 'frontend'],
      requirements: [
        'Basic computer skills',
        'No prior programming experience required',
        'A computer with internet connection'
      ],
      learningOutcomes: [
        'Master JavaScript fundamentals and advanced concepts',
        'Build interactive web applications',
        'Understand asynchronous programming',
        'Work with APIs and fetch data',
        'Apply modern JavaScript best practices'
      ],
      chapters: [
        {
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript syntax and concepts',
          order: 1,
          lessons: []
        },
        {
          title: 'DOM Manipulation and Events',
          description: 'Interact with web pages using JavaScript',
          order: 2,
          lessons: []
        },
        {
          title: 'Asynchronous JavaScript',
          description: 'Master promises, async/await, and API calls',
          order: 3,
          lessons: []
        },
        {
          title: 'Modern JavaScript (ES6+)',
          description: 'Learn modern JavaScript features and syntax',
          order: 4,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true,
      settings: {
        allowComments: true,
        allowRating: true,
        certificate: true,
        downloadable: false,
        dripContent: false
      }
    },

    {
      title: 'Node.js Backend Development Complete Course',
      description: 'Build scalable backend applications with Node.js, Express, and MongoDB. Learn REST APIs, authentication, middleware, and deployment strategies.',
      category: 'web-development',
      level: 'intermediate',
      instructor: john._id,
      createdBy: john._id,
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
      price: 129.99,
      estimatedDuration: 50,
      language: 'English',
      tags: ['nodejs', 'backend', 'express', 'mongodb', 'api'],
      requirements: [
        'Basic JavaScript knowledge',
        'Understanding of web development concepts',
        'Familiarity with command line'
      ],
      learningOutcomes: [
        'Build REST APIs with Node.js and Express',
        'Implement authentication and authorization',
        'Work with databases (MongoDB)',
        'Deploy applications to cloud platforms',
        'Handle file uploads and email services'
      ],
      chapters: [
        {
          title: 'Node.js Fundamentals',
          description: 'Understanding Node.js runtime and core modules',
          order: 1,
          lessons: []
        },
        {
          title: 'Express.js Framework',
          description: 'Building web servers with Express.js',
          order: 2,
          lessons: []
        },
        {
          title: 'Database Integration',
          description: 'Working with MongoDB and Mongoose',
          order: 3,
          lessons: []
        },
        {
          title: 'Authentication & Security',
          description: 'Implementing secure authentication systems',
          order: 4,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    // Sarah Wilson's Courses
    {
      title: 'Machine Learning with Python: Complete Practical Course',
      description: 'Learn machine learning from scratch using Python. Cover supervised and unsupervised learning, neural networks, and real-world projects with scikit-learn and TensorFlow.',
      category: 'data-science',
      level: 'intermediate',
      instructor: sarah._id,
      createdBy: sarah._id,
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500',
      price: 149.99,
      estimatedDuration: 60,
      language: 'English',
      tags: ['machine-learning', 'python', 'data-science', 'ai', 'tensorflow'],
      requirements: [
        'Basic Python programming knowledge',
        'High school level mathematics',
        'Basic statistics understanding'
      ],
      learningOutcomes: [
        'Understand machine learning algorithms',
        'Build predictive models with scikit-learn',
        'Create neural networks with TensorFlow',
        'Work with real-world datasets',
        'Deploy machine learning models'
      ],
      chapters: [
        {
          title: 'Introduction to Machine Learning',
          description: 'Fundamentals and types of machine learning',
          order: 1,
          lessons: []
        },
        {
          title: 'Supervised Learning',
          description: 'Classification and regression algorithms',
          order: 2,
          lessons: []
        },
        {
          title: 'Unsupervised Learning',
          description: 'Clustering and dimensionality reduction',
          order: 3,
          lessons: []
        },
        {
          title: 'Deep Learning with TensorFlow',
          description: 'Neural networks and deep learning',
          order: 4,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    {
      title: 'Data Analysis with Python and Pandas',
      description: 'Master data analysis using Python, Pandas, NumPy, and Matplotlib. Learn to clean, analyze, and visualize data for business insights.',
      category: 'data-science',
      level: 'beginner',
      instructor: sarah._id,
      createdBy: sarah._id,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
      price: 89.99,
      estimatedDuration: 35,
      language: 'English',
      tags: ['python', 'pandas', 'data-analysis', 'visualization', 'numpy'],
      requirements: [
        'Basic Python knowledge',
        'Basic mathematics and statistics'
      ],
      learningOutcomes: [
        'Clean and prepare data for analysis',
        'Perform exploratory data analysis',
        'Create compelling data visualizations',
        'Extract insights from business data',
        'Build automated reporting systems'
      ],
      chapters: [
        {
          title: 'Python for Data Analysis',
          description: 'Setting up the data analysis environment',
          order: 1,
          lessons: []
        },
        {
          title: 'Data Manipulation with Pandas',
          description: 'Loading, cleaning, and transforming data',
          order: 2,
          lessons: []
        },
        {
          title: 'Data Visualization',
          description: 'Creating charts and graphs with Matplotlib',
          order: 3,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    // Michael Chen's Courses
    {
      title: 'Modern UI/UX Design: Complete Design System Course',
      description: 'Learn modern UI/UX design principles, create design systems, and build beautiful user interfaces. Master Figma, prototyping, and user research.',
      category: 'ui-ux-design',
      level: 'beginner',
      instructor: michael._id,
      createdBy: michael._id,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
      price: 79.99,
      estimatedDuration: 30,
      language: 'English',
      tags: ['ui-design', 'ux-design', 'figma', 'prototyping', 'design-systems'],
      requirements: [
        'No design experience required',
        'Computer with internet connection',
        'Figma account (free)'
      ],
      learningOutcomes: [
        'Design beautiful user interfaces',
        'Create comprehensive design systems',
        'Conduct user research and testing',
        'Build interactive prototypes',
        'Apply design thinking methodology'
      ],
      chapters: [
        {
          title: 'Design Fundamentals',
          description: 'Core principles of good design',
          order: 1,
          lessons: []
        },
        {
          title: 'User Experience Design',
          description: 'Understanding user needs and behaviors',
          order: 2,
          lessons: []
        },
        {
          title: 'Design Systems',
          description: 'Building scalable design systems',
          order: 3,
          lessons: []
        },
        {
          title: 'Prototyping with Figma',
          description: 'Creating interactive prototypes',
          order: 4,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    {
      title: 'React.js Frontend Development Bootcamp',
      description: 'Master React.js from basics to advanced concepts. Learn hooks, context, state management, routing, and build real-world applications.',
      category: 'web-development',
      level: 'intermediate',
      instructor: michael._id,
      createdBy: michael._id,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500',
      price: 119.99,
      estimatedDuration: 45,
      language: 'English',
      tags: ['react', 'frontend', 'javascript', 'hooks', 'spa'],
      requirements: [
        'Solid JavaScript knowledge',
        'Understanding of HTML and CSS',
        'Basic knowledge of ES6+'
      ],
      learningOutcomes: [
        'Build modern React applications',
        'Master React hooks and context',
        'Implement routing and navigation',
        'Manage application state effectively',
        'Deploy React apps to production'
      ],
      chapters: [
        {
          title: 'React Fundamentals',
          description: 'Components, JSX, and props',
          order: 1,
          lessons: []
        },
        {
          title: 'React Hooks',
          description: 'useState, useEffect, and custom hooks',
          order: 2,
          lessons: []
        },
        {
          title: 'State Management',
          description: 'Context API and state management patterns',
          order: 3,
          lessons: []
        },
        {
          title: 'Building Real Applications',
          description: 'Complete project development',
          order: 4,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    // Emily Rodriguez's Courses
    {
      title: 'Ethical Hacking and Penetration Testing Complete Course',
      description: 'Learn ethical hacking techniques, penetration testing methodologies, and cybersecurity best practices. Includes hands-on labs and real-world scenarios.',
      category: 'cybersecurity',
      level: 'advanced',
      instructor: emily._id,
      createdBy: emily._id,
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500',
      price: 199.99,
      estimatedDuration: 80,
      language: 'English',
      tags: ['cybersecurity', 'ethical-hacking', 'penetration-testing', 'security'],
      requirements: [
        'Basic networking knowledge',
        'Understanding of operating systems',
        'Linux command line familiarity'
      ],
      learningOutcomes: [
        'Conduct professional penetration tests',
        'Identify and exploit security vulnerabilities',
        'Use industry-standard security tools',
        'Write comprehensive security reports',
        'Implement security best practices'
      ],
      chapters: [
        {
          title: 'Introduction to Ethical Hacking',
          description: 'Fundamentals and legal considerations',
          order: 1,
          lessons: []
        },
        {
          title: 'Reconnaissance and Scanning',
          description: 'Information gathering techniques',
          order: 2,
          lessons: []
        },
        {
          title: 'Vulnerability Assessment',
          description: 'Identifying security weaknesses',
          order: 3,
          lessons: []
        },
        {
          title: 'Exploitation Techniques',
          description: 'Safely exploiting vulnerabilities',
          order: 4,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    {
      title: 'Network Security Fundamentals',
      description: 'Comprehensive course on network security principles, firewalls, VPNs, and security protocols. Learn to secure network infrastructure.',
      category: 'cybersecurity',
      level: 'intermediate',
      instructor: emily._id,
      createdBy: emily._id,
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500',
      price: 139.99,
      estimatedDuration: 40,
      language: 'English',
      tags: ['network-security', 'firewalls', 'vpn', 'security-protocols'],
      requirements: [
        'Basic networking concepts',
        'Understanding of TCP/IP',
        'Basic security awareness'
      ],
      learningOutcomes: [
        'Design secure network architectures',
        'Configure firewalls and VPNs',
        'Implement security protocols',
        'Monitor network security',
        'Respond to security incidents'
      ],
      chapters: [
        {
          title: 'Network Security Fundamentals',
          description: 'Core concepts and threats',
          order: 1,
          lessons: []
        },
        {
          title: 'Firewalls and Access Control',
          description: 'Network access control mechanisms',
          order: 2,
          lessons: []
        },
        {
          title: 'VPNs and Encryption',
          description: 'Secure remote access solutions',
          order: 3,
          lessons: []
        }
      ],
      isPublished: true,
      isApproved: true
    },

    // Draft course (not published)
    {
      title: 'Advanced Database Design and Optimization',
      description: 'Deep dive into database design patterns, query optimization, indexing strategies, and performance tuning for large-scale applications.',
      category: 'programming',
      level: 'advanced',
      instructor: john._id,
      createdBy: john._id,
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500',
      price: 169.99,
      estimatedDuration: 55,
      language: 'English',
      tags: ['database', 'sql', 'optimization', 'performance'],
      requirements: [
        'Solid SQL knowledge',
        'Database design experience',
        'Understanding of system architecture'
      ],
      learningOutcomes: [
        'Design efficient database schemas',
        'Optimize complex queries',
        'Implement proper indexing strategies',
        'Handle database scalability',
        'Monitor and tune performance'
      ],
      chapters: [
        {
          title: 'Advanced Database Design',
          description: 'Normalization and design patterns',
          order: 1,
          lessons: []
        },
        {
          title: 'Query Optimization',
          description: 'Writing efficient SQL queries',
          order: 2,
          lessons: []
        }
      ],
      isPublished: false, // Draft course
      isApproved: false
    }
  ];

  // Add timestamps and additional fields
  const coursesWithDefaults = courses.map(course => ({
    ...course,
    slug: course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    rating: {
      average: Math.random() * 2 + 3, // Rating between 3-5
      count: Math.floor(Math.random() * 100) + 10 // 10-110 ratings
    },
    stats: {
      totalEnrollments: Math.floor(Math.random() * 500) + 50,
      totalCompletions: Math.floor(Math.random() * 200) + 20,
      totalLessons: 0, // Will be updated when lessons are created
      totalQuizzes: 0,
      averageRating: Math.random() * 2 + 3
    }
  }));

  const createdCourses = await Course.insertMany(coursesWithDefaults);
  return createdCourses;
};

module.exports = { seedCourses };