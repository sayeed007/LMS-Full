const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const QuestionBank = require('../../../src/models/QuestionBank');
const Question = require('../../../src/models/Question');
const Course = require('../../../src/models/Course');
const User = require('../../../src/models/User');

// Sample question bank data
const questionBanksData = [
  {
    name: "UI/UX Design Fundamentals",
    description: "Comprehensive question bank covering basic UI/UX design principles, typography, color theory, and user experience concepts.",
    sections: [
      { name: "Typography", description: "Questions about fonts, text hierarchy, and readability", order: 0 },
      { name: "Color Psychology", description: "Understanding color theory and emotional impact", order: 1 },
      { name: "Layout & Spacing", description: "Grid systems, whitespace, and visual hierarchy", order: 2 },
      { name: "User Experience", description: "User research, wireframing, and usability principles", order: 3 }
    ],
    settings: {
      randomizeQuestions: false,
      randomizeChoices: true,
      defaultPointsPerQuestion: 1,
      passingScore: 75,
      defaultTimeLimit: 30,
      allowRetakes: true,
      maxAttempts: 3,
      showCorrectAnswers: true,
      showExplanations: true,
      showScoreImmediately: true
    },
    status: "active",
    visibility: "public",
    tags: ["design", "ui", "ux", "fundamentals"],
    color: "#3B82F6",
    questions: [
      // Typography Section
      {
        text: "What is the most important factor when choosing typography for a mobile app?",
        type: "single-choice",
        choices: [
          { text: "Font color", isCorrect: false },
          { text: "Font size and readability", isCorrect: true },
          { text: "Font style", isCorrect: false },
          { text: "Font weight", isCorrect: false }
        ],
        explanation: "Font size and readability are crucial for mobile apps due to smaller screen sizes and varying viewing conditions.",
        difficulty: "easy",
        points: 1,
        tags: ["typography", "mobile", "readability"]
      },
      {
        text: "Which of the following are key principles of good typography? (Select all that apply)",
        type: "multiple-choice",
        choices: [
          { text: "Hierarchy", isCorrect: true },
          { text: "Contrast", isCorrect: true },
          { text: "Alignment", isCorrect: true },
          { text: "Using as many fonts as possible", isCorrect: false }
        ],
        explanation: "Good typography relies on hierarchy, contrast, and alignment to create clear and readable text layouts.",
        difficulty: "medium",
        points: 2,
        tags: ["typography", "principles", "hierarchy"]
      },

      // Color Psychology Section
      {
        text: "What emotion is typically associated with the color blue in UI design?",
        type: "single-choice",
        choices: [
          { text: "Excitement and energy", isCorrect: false },
          { text: "Trust and professionalism", isCorrect: true },
          { text: "Danger and warning", isCorrect: false },
          { text: "Nature and growth", isCorrect: false }
        ],
        explanation: "Blue is commonly associated with trust, reliability, and professionalism, making it popular for business and financial applications.",
        difficulty: "easy",
        points: 1,
        tags: ["color", "psychology", "emotions"]
      },
      {
        text: "True or False: High contrast between text and background always improves readability.",
        type: "true-false",
        choices: [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: true }
        ],
        explanation: "While contrast is important, extremely high contrast can cause eye strain. The key is finding the right balance for comfortable reading.",
        difficulty: "medium",
        points: 1,
        tags: ["color", "contrast", "accessibility"]
      },

      // Layout & Spacing Section
      {
        text: "Explain the importance of whitespace in UI design.",
        type: "descriptive",
        correctAnswer: "Whitespace improves readability, creates visual hierarchy, reduces cognitive load, guides user attention, and makes interfaces feel less cluttered and more professional.",
        explanation: "Whitespace is crucial for creating breathing room, improving focus, and enhancing the overall user experience.",
        difficulty: "medium",
        points: 3,
        tags: ["layout", "whitespace", "design-principles"]
      },

      // User Experience Section
      {
        text: "What is the primary goal of user experience (UX) design?",
        type: "single-choice",
        choices: [
          { text: "Making interfaces look beautiful", isCorrect: false },
          { text: "Solving user problems effectively", isCorrect: true },
          { text: "Following design trends", isCorrect: false },
          { text: "Using the latest technology", isCorrect: false }
        ],
        explanation: "UX design focuses on understanding and solving user problems to create meaningful and effective experiences.",
        difficulty: "easy",
        points: 1,
        tags: ["ux", "user-centered-design", "problem-solving"]
      }
    ]
  },

  {
    name: "JavaScript Programming Basics",
    description: "Essential JavaScript concepts including variables, functions, objects, and modern ES6+ features.",
    sections: [
      { name: "Variables & Data Types", description: "Understanding JavaScript data types and variable declarations", order: 0 },
      { name: "Functions & Scope", description: "Function declarations, expressions, and scoping rules", order: 1 },
      { name: "Objects & Arrays", description: "Working with complex data structures", order: 2 },
      { name: "ES6+ Features", description: "Modern JavaScript features and syntax", order: 3 }
    ],
    settings: {
      randomizeQuestions: true,
      randomizeChoices: true,
      defaultPointsPerQuestion: 1,
      passingScore: 70,
      defaultTimeLimit: 45,
      allowRetakes: true,
      maxAttempts: 5,
      showCorrectAnswers: true,
      showExplanations: true,
      showScoreImmediately: true
    },
    status: "active",
    visibility: "public",
    tags: ["javascript", "programming", "web-development"],
    color: "#F59E0B",
    questions: [
      {
        text: "Which of the following is the correct way to declare a variable in modern JavaScript?",
        type: "single-choice",
        choices: [
          { text: "var myVariable = 'value';", isCorrect: false },
          { text: "let myVariable = 'value';", isCorrect: true },
          { text: "variable myVariable = 'value';", isCorrect: false },
          { text: "const myVariable;", isCorrect: false }
        ],
        explanation: "'let' is the preferred way to declare variables in modern JavaScript as it has block scope and prevents hoisting issues.",
        difficulty: "easy",
        points: 1,
        tags: ["variables", "let", "declarations"]
      },
      {
        text: "What will be the output of: console.log(typeof null)?",
        type: "single-choice",
        choices: [
          { text: "null", isCorrect: false },
          { text: "undefined", isCorrect: false },
          { text: "object", isCorrect: true },
          { text: "string", isCorrect: false }
        ],
        explanation: "This is a well-known JavaScript quirk. typeof null returns 'object' due to a bug in the original JavaScript implementation.",
        difficulty: "medium",
        points: 1,
        tags: ["data-types", "null", "typeof"]
      },
      {
        text: "What is the difference between 'let' and 'const' in JavaScript?",
        type: "descriptive",
        correctAnswer: "'let' allows reassignment of values and is block-scoped, while 'const' creates immutable bindings (cannot be reassigned) and is also block-scoped. However, objects and arrays declared with 'const' can still be mutated.",
        explanation: "Understanding the difference between let and const is crucial for writing predictable JavaScript code.",
        difficulty: "medium",
        points: 2,
        tags: ["variables", "let", "const", "scope"]
      },
      {
        text: "Which ES6 feature allows you to extract values from arrays or objects?",
        type: "single-choice",
        choices: [
          { text: "Spread operator", isCorrect: false },
          { text: "Destructuring", isCorrect: true },
          { text: "Template literals", isCorrect: false },
          { text: "Arrow functions", isCorrect: false }
        ],
        explanation: "Destructuring assignment allows you to unpack values from arrays or properties from objects into distinct variables.",
        difficulty: "easy",
        points: 1,
        tags: ["es6", "destructuring", "arrays", "objects"]
      }
    ]
  },

  {
    name: "React Development Concepts",
    description: "Core React concepts including components, state management, hooks, and best practices.",
    sections: [
      { name: "Components & JSX", description: "Understanding React components and JSX syntax", order: 0 },
      { name: "State & Props", description: "Managing component state and passing data", order: 1 },
      { name: "Hooks", description: "Using React hooks for state and lifecycle management", order: 2 },
      { name: "Best Practices", description: "Performance optimization and code organization", order: 3 }
    ],
    settings: {
      randomizeQuestions: false,
      randomizeChoices: true,
      defaultPointsPerQuestion: 2,
      passingScore: 80,
      defaultTimeLimit: 60,
      allowRetakes: true,
      maxAttempts: 3,
      showCorrectAnswers: true,
      showExplanations: true,
      showScoreImmediately: false
    },
    status: "active",
    visibility: "organization",
    tags: ["react", "frontend", "javascript", "components"],
    color: "#06B6D4",
    questions: [
      {
        text: "What is JSX in React?",
        type: "single-choice",
        choices: [
          { text: "A new programming language", isCorrect: false },
          { text: "A syntax extension for JavaScript", isCorrect: true },
          { text: "A CSS framework", isCorrect: false },
          { text: "A database query language", isCorrect: false }
        ],
        explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.",
        difficulty: "easy",
        points: 2,
        tags: ["jsx", "react", "syntax"]
      },
      {
        text: "Which hook is used for managing component state in functional components?",
        type: "single-choice",
        choices: [
          { text: "useEffect", isCorrect: false },
          { text: "useState", isCorrect: true },
          { text: "useContext", isCorrect: false },
          { text: "useReducer", isCorrect: false }
        ],
        explanation: "useState is the hook used to add state to functional components in React.",
        difficulty: "easy",
        points: 2,
        tags: ["hooks", "useState", "state"]
      },
      {
        text: "Explain the concept of 'lifting state up' in React.",
        type: "descriptive",
        correctAnswer: "Lifting state up means moving shared state to the closest common ancestor component when multiple components need access to the same data. This allows parent components to pass data down as props and callback functions to update the state.",
        explanation: "This is a fundamental pattern in React for sharing state between components that don't have a direct parent-child relationship.",
        difficulty: "medium",
        points: 3,
        tags: ["state-management", "props", "component-communication"]
      }
    ]
  }
];

async function seedQuestionBanks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing question banks and questions...');
    await QuestionBank.deleteMany({});
    await Question.deleteMany({});

    // Get sample courses and users
    const courses = await Course.find().limit(5);
    const users = await User.find({ role: { $in: ['instructor', 'org_admin', 'super_admin'] } }).limit(3);

    if (courses.length === 0) {
      console.log('No courses found. Please seed courses first.');
      return;
    }

    if (users.length === 0) {
      console.log('No instructor/admin users found. Please seed users first.');
      return;
    }

    console.log(`Found ${courses.length} courses and ${users.length} users`);

    // Create question banks
    for (let i = 0; i < questionBanksData.length && i < courses.length; i++) {
      const questionBankData = questionBanksData[i];
      const course = courses[i];
      const user = users[i % users.length];

      console.log(`Creating question bank: ${questionBankData.name}`);

      // Create question bank
      const questionBank = await QuestionBank.create({
        ...questionBankData,
        course: course._id,
        createdBy: user._id,
        organization: user.organization,
        questions: undefined // Remove questions from questionBank creation
      });

      // Create questions for this question bank
      const questionsData = questionBankData.questions.map((q, index) => ({
        ...q,
        questionBank: questionBank._id,
        course: course._id,
        section: questionBank.sections[Math.floor(index / 2)]?._id, // Distribute questions across sections
        createdBy: user._id,
        organization: user.organization
      }));

      const createdQuestions = await Question.insertMany(questionsData);
      console.log(`Created ${createdQuestions.length} questions for ${questionBank.name}`);

      // Update question bank stats
      await questionBank.updateStats();
      console.log(`Updated stats for ${questionBank.name}`);
    }

    // Create additional question banks for other courses
    const remainingCourses = courses.slice(questionBanksData.length);
    for (const course of remainingCourses) {
      const user = users[Math.floor(Math.random() * users.length)];

      const questionBank = await QuestionBank.create({
        name: `${course.title} - Practice Questions`,
        description: `Practice questions for the ${course.title} course.`,
        course: course._id,
        createdBy: user._id,
        organization: user.organization,
        sections: [
          { name: "General Knowledge", description: "General questions about the course topic", order: 0 },
          { name: "Advanced Concepts", description: "More challenging questions", order: 1 }
        ],
        settings: {
          randomizeQuestions: true,
          randomizeChoices: true,
          defaultPointsPerQuestion: 1,
          passingScore: 70,
          defaultTimeLimit: 30,
          allowRetakes: true,
          maxAttempts: 3,
          showCorrectAnswers: true,
          showExplanations: true,
          showScoreImmediately: true
        },
        status: "draft",
        visibility: "private",
        tags: [course.title.toLowerCase().replace(/\s+/g, '-'), "practice"],
        color: "#8B5CF6"
      });

      console.log(`Created empty question bank for: ${course.title}`);
    }

    console.log('\n=== Question Bank Seeding Completed Successfully ===');

    // Display summary
    const totalQuestionBanks = await QuestionBank.countDocuments();
    const totalQuestions = await Question.countDocuments();

    console.log(`\nSummary:`);
    console.log(`- Total Question Banks: ${totalQuestionBanks}`);
    console.log(`- Total Questions: ${totalQuestions}`);
    console.log(`- Question Banks with Content: ${questionBanksData.length}`);
    console.log(`- Empty Question Banks: ${totalQuestionBanks - questionBanksData.length}`);

    // Group by course
    const questionBanksByCourse = await QuestionBank.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      {
        $unwind: '$courseInfo'
      },
      {
        $group: {
          _id: '$courseInfo.title',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log(`\nQuestion Banks by Course:`);
    questionBanksByCourse.forEach(item => {
      console.log(`- ${item._id}: ${item.count} question bank(s)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding question banks:', error);
    process.exit(1);
  }
}

// Run the seeding function
if (require.main === module) {
  seedQuestionBanks();
}

module.exports = seedQuestionBanks;