const Course = require('../models/Course');
const Category = require('../models/Category');

const seedCoursesWithLessons = async (users) => {
  // Find instructors
  const instructors = users.filter(user => user.role === 'instructor');
  const john = instructors.find(i => i.email === 'john.doe@lms.com');
  const sarah = instructors.find(i => i.email === 'sarah.wilson@lms.com');
  const michael = instructors.find(i => i.email === 'michael.chen@lms.com');
  const emily = instructors.find(i => i.email === 'emily.rodriguez@lms.com');

  // Get available categories from database
  const categories = await Category.find({ isActive: true }).select('name');
  const categoryNames = categories.map(cat => cat.name);

  // Helper function to get a valid category name
  const getCategory = (preferredCategory) => {
    const found = categoryNames.find(name => name.toLowerCase().includes(preferredCategory.toLowerCase()));
    return found || categoryNames[0]; // fallback to first category if not found
  };

  const courses = [
    // JavaScript Course with Complete Structure
    {
      title: 'Complete JavaScript Mastery: From Beginner to Advanced',
      description: 'Master JavaScript from fundamentals to advanced concepts. Learn ES6+, async programming, DOM manipulation, and modern JavaScript frameworks. Perfect for beginners and intermediate developers.',
      category: getCategory('development'),
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
          lessons: [
            {
              title: 'Introduction to JavaScript',
              description: 'Welcome to the world of JavaScript programming',
              content: `# Introduction to JavaScript

JavaScript is a versatile, high-level programming language that powers the modern web. Originally created to make web pages interactive, JavaScript has evolved into a full-stack development language.

## What You'll Learn
- JavaScript syntax and fundamentals
- Variables and data types
- Functions and scope
- Object-oriented programming concepts

## Why JavaScript?
- **Versatility**: Frontend, backend, mobile, and desktop development
- **Large Community**: Extensive ecosystem and resources
- **Easy to Learn**: Beginner-friendly syntax
- **Industry Demand**: High job market demand

Let's start your JavaScript journey!`,
              type: 'text',
              order: 1,
              duration: 15,
              isPublished: true,
              resources: [
                {
                  title: 'JavaScript Documentation',
                  type: 'link',
                  url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript'
                }
              ]
            },
            {
              title: 'Variables and Data Types',
              description: 'Understanding JavaScript variables and primitive data types',
              content: `# Variables and Data Types

Learn how to store and manipulate data in JavaScript using variables and understand the different data types available.

## Variable Declarations
\`\`\`javascript
// ES6+ preferred syntax
let name = "John";
const age = 25;

// Older syntax (avoid in modern code)
var city = "New York";
\`\`\`

## Primitive Data Types
1. **String**: Text data
2. **Number**: Numeric values
3. **Boolean**: true/false values
4. **Undefined**: Variable declared but not assigned
5. **Null**: Intentional absence of value
6. **Symbol**: Unique identifier (ES6+)
7. **BigInt**: Large integers (ES2020+)

## Examples
\`\`\`javascript
let firstName = "Alice";           // String
let score = 95.5;                 // Number
let isStudent = true;             // Boolean
let middleName;                   // Undefined
let nickname = null;              // Null
\`\`\``,
              type: 'text',
              order: 2,
              duration: 20,
              isPublished: true
            },
            {
              title: 'Functions and Scope',
              description: 'Learn about JavaScript functions and variable scope',
              content: `# Functions and Scope

Functions are reusable blocks of code that perform specific tasks. Understanding scope is crucial for managing variables effectively.

## Function Declaration
\`\`\`javascript
function greet(name) {
  return "Hello, " + name + "!";
}
\`\`\`

## Arrow Functions
\`\`\`javascript
const greet = (name) => {
  return \`Hello, \${name}!\`;
};

// Short form
const greet = name => \`Hello, \${name}!\`;
\`\`\`

## Scope Types
- **Global Scope**: Variables accessible everywhere
- **Function Scope**: Variables accessible within function
- **Block Scope**: Variables accessible within block (let/const)`,
              type: 'text',
              order: 3,
              duration: 25,
              isPublished: true
            }
          ],
          isPublished: true
        },
        {
          title: 'DOM Manipulation and Events',
          description: 'Interact with web pages using JavaScript',
          order: 2,
          lessons: [
            {
              title: 'Introduction to the DOM',
              description: 'Understanding the Document Object Model',
              content: `# Document Object Model (DOM)

The DOM is a programming interface for HTML documents. It represents the page structure as a tree of objects that can be manipulated with JavaScript.

## What is the DOM?
- Tree-like representation of HTML elements
- Interface between JavaScript and HTML
- Allows dynamic content manipulation

## Selecting Elements
\`\`\`javascript
// By ID
const title = document.getElementById('main-title');

// By class
const buttons = document.getElementsByClassName('btn');

// Modern selectors
const firstButton = document.querySelector('.btn');
const allButtons = document.querySelectorAll('.btn');
\`\`\``,
              type: 'text',
              order: 1,
              duration: 25,
              isPublished: true
            },
            {
              title: 'DOM Manipulation Techniques',
              description: 'Learn to modify HTML elements with JavaScript',
              content: 'In this video lesson, you will learn various techniques for manipulating HTML elements using JavaScript, including changing content, styles, and attributes.',
              videoUrl: 'https://www.youtube.com/embed/y17RuWkWdn8',
              type: 'video',
              order: 2,
              duration: 30,
              isPublished: true,
              resources: [
                {
                  title: 'DOM Practice Examples',
                  type: 'document',
                  url: '/files/dom-examples.zip'
                }
              ]
            },
            {
              title: 'Event Handling',
              description: 'Learn to handle user interactions with events',
              content: `# Event Handling

Events allow you to respond to user interactions like clicks, key presses, and form submissions.

## Adding Event Listeners
\`\`\`javascript
// Method 1: addEventListener
button.addEventListener('click', function() {
  console.log('Button clicked!');
});

// Method 2: Arrow function
button.addEventListener('click', () => {
  console.log('Button clicked!');
});
\`\`\`

## Common Events
- **click**: Mouse click
- **keydown**: Key pressed down
- **submit**: Form submitted
- **load**: Page finished loading
- **scroll**: Page scrolled

## Event Object
\`\`\`javascript
button.addEventListener('click', function(event) {
  event.preventDefault(); // Prevent default behavior
  console.log('Event type:', event.type);
  console.log('Target element:', event.target);
});
\`\`\``,
              type: 'text',
              order: 3,
              duration: 35,
              isPublished: true
            }
          ],
          isPublished: true
        },
        {
          title: 'Asynchronous JavaScript',
          description: 'Master promises, async/await, and API calls',
          order: 3,
          lessons: [
            {
              title: 'Understanding Asynchronous Programming',
              description: 'Learn the concepts of synchronous vs asynchronous code',
              content: `# Asynchronous Programming

JavaScript is single-threaded but can handle asynchronous operations efficiently using the event loop.

## Synchronous vs Asynchronous

### Synchronous Code
- Executes line by line
- Blocks further execution until complete
- Can cause UI freezing

### Asynchronous Code
- Doesn't block execution
- Allows other code to run while waiting
- Essential for web development

## The Event Loop
JavaScript uses an event loop to manage asynchronous operations:
1. **Call Stack**: Currently executing functions
2. **Web APIs**: Browser APIs (setTimeout, fetch, etc.)
3. **Callback Queue**: Completed async operations
4. **Event Loop**: Moves callbacks to call stack when ready`,
              type: 'text',
              order: 1,
              duration: 30,
              isPublished: true
            },
            {
              title: 'Promises and Async/Await',
              description: 'Modern approaches to handling asynchronous code',
              content: `# Promises and Async/Await

Modern JavaScript provides elegant ways to handle asynchronous operations.

## Promises
\`\`\`javascript
const promise = new Promise((resolve, reject) => {
  // Async operation
  if (success) {
    resolve(data);
  } else {
    reject(error);
  }
});

promise
  .then(data => console.log(data))
  .catch(error => console.error(error));
\`\`\`

## Async/Await
\`\`\`javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
\`\`\`

## Error Handling
Always handle errors in async code:
\`\`\`javascript
try {
  const result = await asyncOperation();
  console.log(result);
} catch (error) {
  console.error('Something went wrong:', error);
}
\`\`\``,
              type: 'video',
              videoUrl: 'https://www.youtube.com/embed/PoRJizFvM7s',
              order: 2,
              duration: 40,
              isPublished: true
            }
          ],
          isPublished: true
        }
      ],
      isPublished: true,
      isApproved: true,
      settings: {
        allowComments: true,
        allowReviews: true,
        certificateEnabled: true,
        passRequirement: 70
      }
    },

    // Machine Learning Course
    {
      title: 'Machine Learning with Python: Complete Practical Course',
      description: 'Learn machine learning from scratch using Python. Cover supervised and unsupervised learning, neural networks, and real-world projects with scikit-learn and TensorFlow.',
      category: getCategory('data'),
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
          lessons: [
            {
              title: 'What is Machine Learning?',
              description: 'Introduction to machine learning concepts and applications',
              content: `# What is Machine Learning?

Machine Learning (ML) is a subset of artificial intelligence that enables computers to learn and improve from experience without being explicitly programmed.

## Types of Machine Learning

### 1. Supervised Learning
- Uses labeled training data
- Learns from input-output pairs
- Examples: Classification, Regression

### 2. Unsupervised Learning
- Finds patterns in data without labels
- Discovers hidden structures
- Examples: Clustering, Dimensionality Reduction

### 3. Reinforcement Learning
- Learns through interaction with environment
- Rewards and penalties guide learning
- Examples: Game playing, Robotics

## Real-World Applications
- **Healthcare**: Disease diagnosis, drug discovery
- **Finance**: Fraud detection, algorithmic trading
- **Technology**: Recommendation systems, image recognition
- **Transportation**: Autonomous vehicles, route optimization`,
              type: 'text',
              order: 1,
              duration: 20,
              isPublished: true
            },
            {
              title: 'Python for Machine Learning Setup',
              description: 'Setting up your development environment',
              content: 'Learn how to set up your Python environment for machine learning with Anaconda, Jupyter notebooks, and essential libraries.',
              videoUrl: 'https://www.youtube.com/embed/HW29067qVWk',
              type: 'video',
              order: 2,
              duration: 25,
              isPublished: true,
              resources: [
                {
                  title: 'Installation Guide',
                  type: 'document',
                  url: '/files/ml-setup-guide.pdf'
                }
              ]
            }
          ],
          isPublished: true
        }
      ],
      isPublished: true,
      isApproved: true
    },

    // UI/UX Design Course
    {
      title: 'Modern UI/UX Design: Complete Design System Course',
      description: 'Learn modern UI/UX design principles, create design systems, and build beautiful user interfaces. Master Figma, prototyping, and user research.',
      category: getCategory('design'),
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
          lessons: [
            {
              title: 'Design Principles Fundamentals',
              description: 'Core principles that guide effective design',
              content: `# Design Principles Fundamentals

Great design follows fundamental principles that create visual harmony and effective communication.

## The 7 Core Design Principles

### 1. Balance
- **Visual weight** distribution in design
- **Symmetrical**: Mirror-like balance
- **Asymmetrical**: Different elements with equal visual weight

### 2. Contrast
- Difference between design elements
- Creates **visual interest** and **hierarchy**
- Examples: Light vs dark, large vs small, thick vs thin

### 3. Emphasis
- Drawing attention to important elements
- Created through contrast, color, size, or position
- **Focal point** guides user's eye

### 4. Proportion
- Relationship between element sizes
- **Golden ratio** (1:1.618) creates pleasing proportions
- Consistency in sizing creates harmony

### 5. Hierarchy
- Order of importance in design elements
- Guides user through content flow
- Achieved through size, color, typography, spacing

### 6. Repetition
- Consistent use of design elements
- Creates **unity** and **brand recognition**
- Applies to colors, fonts, spacing, shapes

### 7. White Space (Negative Space)
- Empty areas around design elements
- Improves **readability** and **focus**
- Prevents cluttered, overwhelming designs`,
              type: 'text',
              order: 1,
              duration: 30,
              isPublished: true,
              resources: [
                {
                  title: 'Design Principles Cheat Sheet',
                  type: 'document',
                  url: '/files/design-principles-cheatsheet.pdf'
                }
              ]
            },
            {
              title: 'Design Principles Assignment',
              description: 'Apply design principles to create a poster design',
              content: `# Design Principles Assignment

## Objective
Create a poster design that demonstrates understanding of the 7 core design principles.

## Requirements
1. Choose a topic: Event, product, or cause
2. Include: Title, subtitle, date/location, visual elements
3. Apply all 7 design principles
4. Use color theory concepts
5. Create in digital format (Figma, Adobe, etc.)

## Deliverables
- Final poster design (PDF or PNG)
- Process documentation explaining how you applied each principle
- Color palette with justification

## Evaluation Criteria
- **Clarity** (25%): Message is clear and readable
- **Principle Application** (35%): Effective use of design principles
- **Visual Appeal** (20%): Aesthetically pleasing design
- **Creativity** (20%): Original and innovative approach`,
              type: 'assignment',
              order: 2,
              duration: 120,
              isPublished: true,
              assignmentDetails: {
                title: 'Design Principles Poster',
                description: 'Create a poster demonstrating the 7 core design principles',
                instructions: 'Follow the assignment requirements and submit both the design and process documentation.',
                maxScore: 100,
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
                submissionType: 'file',
                maxFileSize: 10, // MB
                allowedFileTypes: ['pdf', 'png', 'jpg'],
                maxFiles: 3
              }
            }
          ],
          isPublished: true
        }
      ],
      isPublished: true,
      isApproved: true
    },

    // Cybersecurity Course
    {
      title: 'Ethical Hacking and Penetration Testing Complete Course',
      description: 'Learn ethical hacking techniques, penetration testing methodologies, and cybersecurity best practices. Includes hands-on labs and real-world scenarios.',
      category: getCategory('cybersecurity'),
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
          lessons: [
            {
              title: 'Introduction to Ethical Hacking',
              description: 'Understanding ethical hacking principles and methodology',
              content: `# Introduction to Ethical Hacking

Ethical hacking involves authorized attempts to gain unauthorized access to computer systems to identify security vulnerabilities.

## What is Ethical Hacking?

**Ethical hacking** (also known as penetration testing or white-hat hacking) is the practice of intentionally probing systems for vulnerabilities in a legal and authorized manner.

## Key Principles

### 1. Authorization
- **Always** obtain written permission
- Define scope and boundaries clearly
- Respect legal and ethical guidelines

### 2. Minimize Impact
- Avoid causing system damage or downtime
- Document findings professionally
- Maintain confidentiality

### 3. Responsible Disclosure
- Report vulnerabilities to system owners
- Allow reasonable time for fixes
- Follow coordinated disclosure practices

## Types of Hackers

### White Hat (Ethical Hackers)
- Authorized security professionals
- Help organizations improve security
- Follow legal and ethical guidelines

### Black Hat (Malicious Hackers)
- Unauthorized access for personal gain
- Cause damage or steal information
- Engage in illegal activities

### Gray Hat
- Between white and black hat
- May find vulnerabilities without permission
- Usually don't have malicious intent

## Legal Considerations
- **Computer Fraud and Abuse Act (CFAA)**
- **Digital Millennium Copyright Act (DMCA)**
- **State and local laws**
- **International regulations**

Always ensure you have proper authorization before conducting any security testing!`,
              type: 'text',
              order: 1,
              duration: 25,
              isPublished: true,
              resources: [
                {
                  title: 'Ethical Hacking Guidelines',
                  type: 'document',
                  url: '/files/ethical-hacking-guidelines.pdf'
                }
              ]
            }
          ],
          isPublished: true
        }
      ],
      isPublished: true,
      isApproved: true
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
      totalLessons: course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0),
      totalQuizzes: 0,
      averageRating: Math.random() * 2 + 3
    }
  }));

  const createdCourses = await Course.insertMany(coursesWithDefaults);
  return createdCourses;
};

module.exports = { seedCoursesWithLessons };