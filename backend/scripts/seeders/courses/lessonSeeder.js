const Lesson = require('../../../src/models/Lesson');

const seedLessons = async (courses, users) => {
  // Get instructors for content creation
  const instructors = users.filter(user => user.role === 'instructor');

  const lessons = [];

  // JavaScript Course Lessons (Course 1)
  const jsCourse = courses[0];
  const johnInstructor = instructors.find(i => i.email === 'john.doe@lms.com');

  // Chapter 1: JavaScript Fundamentals
  lessons.push(
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
      course: jsCourse._id,
      chapter: jsCourse.chapters[0]._id,
      createdBy: johnInstructor._id,
      order: 1,
      duration: 15,
      isPublished: true,
      resources: [
        {
          title: 'JavaScript Documentation',
          type: 'link',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
          description: 'Official MDN JavaScript documentation'
        },
        {
          title: 'Course Slides',
          type: 'document',
          url: '/files/js-intro-slides.pdf',
          description: 'Introduction slides in PDF format'
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
      course: jsCourse._id,
      chapter: jsCourse.chapters[0]._id,
      createdBy: johnInstructor._id,
      order: 2,
      duration: 20,
      isPublished: true
    },
    {
      title: 'JavaScript Fundamentals Practice',
      description: 'Test your understanding of JavaScript basics',
      content: 'This lesson contains a quiz to test your understanding of JavaScript fundamentals including variables, data types, and basic syntax.',
      type: 'quiz',
      course: jsCourse._id,
      chapter: jsCourse.chapters[0]._id,
      createdBy: johnInstructor._id,
      order: 3,
      duration: 15,
      isPublished: true
    },

    // Chapter 2: DOM Manipulation
    {
      title: 'Introduction to the DOM',
      description: 'Understanding the Document Object Model',
      content: `# Document Object Model (DOM)

The DOM is a programming interface for HTML documents. It represents the page structure as a tree of objects that can be manipulated with JavaScript.

## What is the DOM?
- Tree-like representation of HTML elements
- Interface between JavaScript and HTML
- Allows dynamic content manipulation

## DOM Tree Structure
\`\`\`
Document
  └── html
      ├── head
      │   ├── title
      │   └── meta
      └── body
          ├── header
          ├── main
          └── footer
\`\`\`

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
      course: jsCourse._id,
      chapter: jsCourse.chapters[1]._id,
      createdBy: johnInstructor._id,
      order: 4,
      duration: 25,
      isPublished: true
    },
    {
      title: 'DOM Manipulation Techniques',
      description: 'Learn to modify HTML elements with JavaScript',
      content: 'In this video lesson, you will learn various techniques for manipulating HTML elements using JavaScript, including changing content, styles, and attributes.',
      videoUrl: 'https://www.youtube.com/embed/y17RuWkWdn8',
      type: 'video',
      course: jsCourse._id,
      chapter: jsCourse.chapters[1]._id,
      createdBy: johnInstructor._id,
      order: 5,
      duration: 30,
      isPublished: true,
      resources: [
        {
          title: 'DOM Practice Examples',
          type: 'document',
          url: '/files/dom-examples.zip',
          description: 'Downloadable code examples for practice'
        }
      ]
    }
  );

  // Machine Learning Course Lessons (Course 3)
  const mlCourse = courses[2];
  const sarahInstructor = instructors.find(i => i.email === 'sarah.wilson@lms.com');

  lessons.push(
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
- **Transportation**: Autonomous vehicles, route optimization

## Getting Started
We'll use Python with popular libraries:
- **Scikit-learn**: General-purpose ML library
- **Pandas**: Data manipulation
- **NumPy**: Numerical computing
- **Matplotlib**: Data visualization`,
      type: 'text',
      course: mlCourse._id,
      chapter: mlCourse.chapters[0]._id,
      createdBy: sarahInstructor._id,
      order: 1,
      duration: 20,
      isPublished: true
    },
    {
      title: 'Python for Machine Learning Setup',
      description: 'Setting up your development environment',
      videoUrl: 'https://www.youtube.com/embed/HW29067qVWk',
      type: 'video',
      course: mlCourse._id,
      chapter: mlCourse.chapters[0]._id,
      createdBy: sarahInstructor._id,
      order: 2,
      duration: 25,
      isPublished: true,
      resources: [
        {
          title: 'Installation Guide',
          type: 'document',
          url: '/files/ml-setup-guide.pdf',
          description: 'Step-by-step installation instructions'
        },
        {
          title: 'Environment Setup Script',
          type: 'document',
          url: '/files/setup-environment.py',
          description: 'Python script to set up ML environment'
        }
      ]
    }
  );

  // UI/UX Design Course Lessons (Course 4)
  const designCourse = courses[3];
  const michaelInstructor = instructors.find(i => i.email === 'michael.chen@lms.com');

  lessons.push(
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
- Prevents cluttered, overwhelming designs

## Practical Application
These principles work together to create designs that are:
- **Functional**: Serves its purpose effectively
- **Aesthetic**: Visually pleasing
- **Accessible**: Usable by diverse audiences
- **Memorable**: Creates lasting impression`,
      type: 'text',
      course: designCourse._id,
      chapter: designCourse.chapters[0]._id,
      createdBy: michaelInstructor._id,
      order: 1,
      duration: 30,
      isPublished: true,
      resources: [
        {
          title: 'Design Principles Cheat Sheet',
          type: 'document',
          url: '/files/design-principles-cheatsheet.pdf',
          description: 'Quick reference guide for design principles'
        }
      ]
    },
    {
      title: 'Color Theory in Design',
      description: 'Understanding color psychology and application',
      videoUrl: 'https://www.youtube.com/embed/Qj1FK8n7WgY',
      type: 'video',
      course: designCourse._id,
      chapter: designCourse.chapters[0]._id,
      createdBy: michaelInstructor._id,
      order: 2,
      duration: 35,
      isPublished: true
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
- **Creativity** (20%): Original and innovative approach

## Submission
Upload your design and documentation to the course platform by the deadline.`,
      type: 'assignment',
      course: designCourse._id,
      chapter: designCourse.chapters[0]._id,
      createdBy: michaelInstructor._id,
      order: 3,
      duration: 120,
      isPublished: true,
      assignments: [{
        title: 'Design Principles Poster',
        description: 'Create a poster demonstrating the 7 core design principles',
        instructions: 'Follow the assignment requirements and submit both the design and process documentation.',
        maxPoints: 100,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        submissions: {
          allowedTypes: ['pdf', 'png', 'jpg', 'zip'],
          maxFileSize: 10, // MB
          maxFiles: 3
        }
      }]
    }
  );

  // Cybersecurity Course Lessons (Course 5)
  const cyberCourse = courses[4];
  const emilyInstructor = instructors.find(i => i.email === 'emily.rodriguez@lms.com');

  lessons.push(
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

## Ethical Hacking Methodology

1. **Reconnaissance**: Information gathering
2. **Scanning**: Identifying live systems and services
3. **Enumeration**: Extracting detailed information
4. **Vulnerability Assessment**: Identifying security weaknesses
5. **Exploitation**: Attempting to compromise systems
6. **Reporting**: Documenting findings and recommendations

## Legal Considerations
- **Computer Fraud and Abuse Act (CFAA)**
- **Digital Millennium Copyright Act (DMCA)**
- **State and local laws**
- **International regulations**

Always ensure you have proper authorization before conducting any security testing!`,
      type: 'text',
      course: cyberCourse._id,
      chapter: cyberCourse.chapters[0]._id,
      createdBy: emilyInstructor._id,
      order: 1,
      duration: 25,
      isPublished: true,
      resources: [
        {
          title: 'Ethical Hacking Guidelines',
          type: 'document',
          url: '/files/ethical-hacking-guidelines.pdf',
          description: 'Professional guidelines for ethical hacking'
        },
        {
          title: 'Legal Framework Reference',
          type: 'link',
          url: 'https://www.sans.org/white-papers/legal-issues/',
          description: 'SANS legal issues in penetration testing'
        }
      ]
    },
    {
      title: 'Reconnaissance Techniques',
      description: 'Information gathering methods for security assessment',
      videoUrl: 'https://www.youtube.com/embed/l0YsEk_59fQ',
      type: 'video',
      course: cyberCourse._id,
      chapter: cyberCourse.chapters[1]._id,
      createdBy: emilyInstructor._id,
      order: 2,
      duration: 40,
      isPublished: true
    }
  );

  // Add some lessons for other courses as well
  const reactCourse = courses.find(c => c.title.includes('React.js'));
  if (reactCourse) {
    lessons.push({
      title: 'React Components and JSX',
      description: 'Understanding React components and JSX syntax',
      content: `# React Components and JSX

React components are the building blocks of React applications. JSX is a syntax extension that allows you to write HTML-like code in JavaScript.

## What are Components?

Components are **reusable pieces of UI** that can be composed together to build complex interfaces.

\`\`\`javascript
// Functional Component
function Welcome(props) {
  return <h1>Hello, {props.name}!</h1>;
}

// Arrow Function Component
const Welcome = (props) => {
  return <h1>Hello, {props.name}!</h1>;
};
\`\`\`

## JSX Fundamentals

JSX looks like HTML but is actually JavaScript:

\`\`\`javascript
const element = <h1>Hello, World!</h1>;
\`\`\`

### JSX Rules
1. **Single Parent Element**: Wrap multiple elements in a parent
2. **Self-Closing Tags**: All tags must be closed
3. **camelCase**: HTML attributes use camelCase (className, onClick)
4. **JavaScript Expressions**: Use {} for dynamic content

## Props (Properties)

Props are how data flows from parent to child components:

\`\`\`javascript
// Parent Component
function App() {
  return <Welcome name="Alice" age={25} />;
}

// Child Component
function Welcome(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>You are {props.age} years old.</p>
    </div>
  );
}
\`\`\`

## Component Composition

Build complex UIs by combining simple components:

\`\`\`javascript
function Header() {
  return <header><h1>My App</h1></header>;
}

function Main() {
  return <main><p>Welcome to my app!</p></main>;
}

function Footer() {
  return <footer><p>&copy; 2024</p></footer>;
}

function App() {
  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
\`\`\``,
      type: 'text',
      course: reactCourse._id,
      chapter: reactCourse.chapters[0]._id,
      createdBy: michaelInstructor._id,
      order: 1,
      duration: 35,
      isPublished: true
    });
  }

  // Add timestamps and defaults to all lessons
  const lessonsWithDefaults = lessons.map(lesson => ({
    ...lesson,
    // Ensure all lessons have content
    content: lesson.content || `This lesson covers ${lesson.title}. ${lesson.description || 'Content will be added soon.'}`,
    slug: lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    views: Math.floor(Math.random() * 100) + 10,
    completions: Math.floor(Math.random() * 80) + 5,
    averageRating: Math.random() * 2 + 3,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const createdLessons = await Lesson.insertMany(lessonsWithDefaults);

  // Update course stats with lesson counts
  const Course = require('../../../src/models/Course');
  for (const course of courses) {
    const lessonCount = createdLessons.filter(lesson =>
      lesson.course.toString() === course._id.toString()
    ).length;

    await Course.findByIdAndUpdate(course._id, {
      'stats.totalLessons': lessonCount
    });
  }

  return createdLessons;
};

module.exports = { seedLessons };