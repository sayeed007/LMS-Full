const Question = require('../models/Question');
const QuestionBank = require('../models/QuestionBank');
const { Quiz } = require('../models/Quiz');

const seedQuestionBanks = async (users, courses) => {
  // Get instructors for question bank creation
  const instructors = users.filter(user => user.role === 'instructor');
  const john = instructors.find(i => i.email === 'john.doe@lms.com');
  const sarah = instructors.find(i => i.email === 'sarah.wilson@lms.com');
  const michael = instructors.find(i => i.email === 'michael.chen@lms.com');
  const emily = instructors.find(i => i.email === 'emily.rodriguez@lms.com');

  // Get courses for each instructor
  const jsCourse = courses.find(c => c.title.includes('JavaScript Mastery'));
  const mlCourse = courses.find(c => c.title.includes('Machine Learning'));
  const designCourse = courses.find(c => c.title.includes('UI/UX Design'));
  const cyberCourse = courses.find(c => c.title.includes('Ethical Hacking'));

  const questionBanks = [
    {
      name: 'JavaScript Fundamentals',
      description: 'Basic JavaScript concepts and syntax questions',
      course: jsCourse._id,
      category: 'Programming',
      tags: ['javascript', 'fundamentals', 'syntax', 'variables'],
      difficulty: 'beginner',
      isPublic: true,
      createdBy: john._id,
      collaborators: [],
      settings: {
        allowQuestionReuse: true,
        requireApproval: false,
        allowContributions: true
      }
    },
    {
      name: 'DOM Manipulation',
      description: 'Questions about Document Object Model and browser APIs',
      course: jsCourse._id,
      category: 'Web Development',
      tags: ['dom', 'browser', 'api', 'manipulation'],
      difficulty: 'intermediate',
      isPublic: true,
      createdBy: john._id
    },
    {
      name: 'Machine Learning Basics',
      description: 'Fundamental concepts in machine learning and data science',
      course: mlCourse._id,
      category: 'Data Science',
      tags: ['machine-learning', 'algorithms', 'statistics'],
      difficulty: 'intermediate',
      isPublic: true,
      createdBy: sarah._id
    },
    {
      name: 'Python for Data Science',
      description: 'Python programming questions for data analysis',
      course: mlCourse._id,
      category: 'Programming',
      tags: ['python', 'data-science', 'pandas', 'numpy'],
      difficulty: 'beginner',
      isPublic: true,
      createdBy: sarah._id
    },
    {
      name: 'UI/UX Design Principles',
      description: 'Design theory and user experience concepts',
      course: designCourse._id,
      category: 'Design',
      tags: ['design', 'ux', 'ui', 'principles'],
      difficulty: 'beginner',
      isPublic: true,
      createdBy: michael._id
    },
    {
      name: 'Cybersecurity Fundamentals',
      description: 'Basic security concepts and ethical hacking principles',
      course: cyberCourse._id,
      category: 'Security',
      tags: ['security', 'hacking', 'penetration-testing'],
      difficulty: 'advanced',
      isPublic: true,
      createdBy: emily._id
    }
  ];

  const createdQuestionBanks = await QuestionBank.insertMany(questionBanks);
  return createdQuestionBanks;
};

const seedQuestions = async (questionBanks, users) => {
  const instructors = users.filter(user => user.role === 'instructor');
  const john = instructors.find(i => i.email === 'john.doe@lms.com');
  const sarah = instructors.find(i => i.email === 'sarah.wilson@lms.com');
  const michael = instructors.find(i => i.email === 'michael.chen@lms.com');
  const emily = instructors.find(i => i.email === 'emily.rodriguez@lms.com');

  const questions = [];

  // JavaScript Fundamentals Questions
  const jsFundamentalsBank = questionBanks.find(qb => qb.name === 'JavaScript Fundamentals');
  questions.push(
    {
      text: 'Which of the following is the correct way to declare a variable in modern JavaScript?',
      type: 'single-choice',
      choices: [
        { text: 'var name = "John";', isCorrect: false },
        { text: 'let name = "John";', isCorrect: false },
        { text: 'const name = "John";', isCorrect: false },
        { text: 'Both let and const are correct', isCorrect: true }
      ],
      points: 5,
      difficulty: 'easy',
      explanation: 'Both let and const are modern ways to declare variables in ES6+. Use const for values that won\'t change, and let for values that will change.',
      category: 'Variables',
      tags: ['variables', 'es6', 'declaration'],
      questionBank: jsFundamentalsBank._id,
      course: jsFundamentalsBank.course,
      createdBy: john._id
    },
    {
      text: 'JavaScript is a dynamically typed language.',
      type: 'true-false',
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ],
      points: 3,
      difficulty: 'easy',
      explanation: 'JavaScript is dynamically typed, meaning variables can hold values of any type and the type is determined at runtime.',
      category: 'Language Features',
      tags: ['dynamic-typing', 'language-features'],
      questionBank: jsFundamentalsBank._id,
      course: jsFundamentalsBank.course,
      createdBy: john._id
    }
  );

  // Let's add just one more simple question for now
  questions.push(
    {
      text: 'What does DOM stand for?',
      type: 'descriptive',
      points: 5,
      difficulty: 'easy',
      explanation: 'DOM stands for Document Object Model.',
      category: 'DOM',
      tags: ['dom', 'basics'],
      questionBank: jsFundamentalsBank._id,
      course: jsFundamentalsBank.course,
      createdBy: john._id
    }
  );

  const createdQuestions = await Question.insertMany(questions);

  // Update question banks with question counts
  for (const bank of questionBanks) {
    const questionCount = createdQuestions.filter(q =>
      q.questionBank.toString() === bank._id.toString()
    ).length;

    await QuestionBank.findByIdAndUpdate(bank._id, {
      totalQuestions: questionCount,
      lastUpdated: new Date()
    });
  }

  return createdQuestions;
};

const seedQuizzes = async (courses, questions, users) => {
  const instructors = users.filter(user => user.role === 'instructor');
  const john = instructors.find(i => i.email === 'john.doe@lms.com');
  const sarah = instructors.find(i => i.email === 'sarah.wilson@lms.com');
  const michael = instructors.find(i => i.email === 'michael.chen@lms.com');
  const emily = instructors.find(i => i.email === 'emily.rodriguez@lms.com');

  const quizzes = [];

  // JavaScript Course Quizzes
  const jsCourse = courses.find(c => c.title.includes('JavaScript Mastery'));
  const jsQuestions = questions.filter(q =>
    q.category === 'Variables' || q.category === 'Data Types' || q.category === 'Language Features'
  );

  if (jsCourse && jsQuestions.length > 0) {
    quizzes.push({
      title: 'JavaScript Fundamentals Quiz',
      description: 'Test your understanding of JavaScript basics including variables, data types, and core concepts.',
      instructions: `
**Instructions:**
- This quiz contains ${Math.min(jsQuestions.length, 4)} questions
- You have 30 minutes to complete the quiz
- Each question has different point values
- You need 70% to pass
- You can retake this quiz up to 3 times
- Read each question carefully before answering

**Good luck!**
      `,
      course: jsCourse._id,
      questions: jsQuestions.slice(0, 4).map(q => q._id),
      settings: {
        timeLimit: 30,
        maxAttempts: 3,
        allowRetakes: true,
        passingScore: 70,
        gradingMethod: 'highest',
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: true,
        randomizeQuestions: false,
        randomizeChoices: true,
        questionsPerPage: 1,
        requirePassword: false,
        enableProctoring: false,
        preventCopyPaste: true,
        fullScreenRequired: false
      },
      status: 'published',
      isActive: true,
      createdBy: john._id
    });
  }

  // DOM Manipulation Quiz
  const domQuestions = questions.filter(q => q.category === 'Element Selection');
  if (jsCourse && domQuestions.length > 0) {
    quizzes.push({
      title: 'DOM Manipulation Assessment',
      description: 'Evaluate your knowledge of DOM manipulation and browser APIs.',
      instructions: `
**Assessment Guidelines:**
- Focus on DOM selection methods and manipulation techniques
- Practical questions about real-world scenarios
- Time limit: 20 minutes
- Passing score: 75%

**Tips:**
- Think about which method is most appropriate for each scenario
- Consider performance implications of your choices
      `,
      course: jsCourse._id,
      questions: domQuestions.map(q => q._id),
      settings: {
        timeLimit: 20,
        maxAttempts: 2,
        allowRetakes: true,
        passingScore: 75,
        gradingMethod: 'latest',
        showCorrectAnswers: false,
        showExplanations: true,
        showScoreImmediately: false,
        randomizeQuestions: true,
        randomizeChoices: true,
        questionsPerPage: 2,
        requirePassword: false
      },
      status: 'published',
      isActive: true,
      createdBy: john._id
    });
  }

  // Machine Learning Course Quiz
  const mlCourse = courses.find(c => c.title.includes('Machine Learning'));
  const mlQuestions = questions.filter(q =>
    q.category === 'ML Types' || q.category === 'Algorithms' || q.category === 'Model Performance'
  );

  if (mlCourse && mlQuestions.length > 0) {
    quizzes.push({
      title: 'Machine Learning Concepts Quiz',
      description: 'Comprehensive assessment of machine learning fundamentals and algorithms.',
      instructions: `
**Quiz Overview:**
- Covers supervised/unsupervised learning, algorithms, and model evaluation
- Mix of multiple choice and essay questions
- Essay questions require detailed explanations
- Time limit: 45 minutes
- Minimum score: 80% to pass

**Essay Question Tips:**
- Provide specific examples
- Explain the reasoning behind your answers
- Discuss advantages and disadvantages where applicable
      `,
      course: mlCourse._id,
      questions: mlQuestions.map(q => q._id),
      settings: {
        timeLimit: 45,
        maxAttempts: 2,
        allowRetakes: true,
        passingScore: 80,
        gradingMethod: 'highest',
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: false,
        randomizeQuestions: false,
        randomizeChoices: false,
        questionsPerPage: 1,
        requirePassword: false,
        enableProctoring: true,
        preventCopyPaste: true,
        fullScreenRequired: true
      },
      status: 'published',
      isActive: true,
      createdBy: sarah._id
    });
  }

  // Design Course Quiz
  const designCourse = courses.find(c => c.title.includes('UI/UX Design'));
  const designQuestions = questions.filter(q => q.category === 'Design Principles');

  if (designCourse && designQuestions.length > 0) {
    quizzes.push({
      title: 'Design Principles Assessment',
      description: 'Test your understanding of fundamental design principles and their application.',
      course: designCourse._id,
      questions: designQuestions.map(q => q._id),
      settings: {
        timeLimit: 25,
        maxAttempts: 3,
        allowRetakes: true,
        passingScore: 70,
        gradingMethod: 'average',
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: true,
        randomizeQuestions: false,
        randomizeChoices: false,
        questionsPerPage: 1,
        requirePassword: false
      },
      status: 'published',
      isActive: true,
      createdBy: michael._id
    });
  }

  // Cybersecurity Course Quiz
  const cyberCourse = courses.find(c => c.title.includes('Ethical Hacking'));
  const cyberQuestions = questions.filter(q =>
    q.category === 'Ethics' || q.category === 'Methodology'
  );

  if (cyberCourse && cyberQuestions.length > 0) {
    quizzes.push({
      title: 'Ethical Hacking Fundamentals Exam',
      description: 'Rigorous assessment of ethical hacking principles, methodology, and legal considerations.',
      instructions: `
**IMPORTANT - Certification Exam:**
- This is a proctored examination
- Full-screen mode required
- Copy/paste disabled for security
- You have ONE attempt only
- 90% required to pass
- Questions cover ethics, methodology, and legal aspects

**Exam Rules:**
- No external resources allowed
- Answer all questions completely
- Review your answers before submission
- Exam will auto-submit when time expires

**This exam determines your eligibility for the ethical hacking certificate.**
      `,
      course: cyberCourse._id,
      questions: cyberQuestions.map(q => q._id),
      settings: {
        timeLimit: 60,
        maxAttempts: 1,
        allowRetakes: false,
        passingScore: 90,
        gradingMethod: 'latest',
        showCorrectAnswers: false,
        showExplanations: false,
        showScoreImmediately: false,
        randomizeQuestions: true,
        randomizeChoices: true,
        questionsPerPage: 1,
        requirePassword: true,
        password: 'ETHICS2024',
        availableFrom: new Date(),
        availableUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        enableProctoring: true,
        preventCopyPaste: true,
        fullScreenRequired: true
      },
      status: 'published',
      isActive: true,
      createdBy: emily._id
    });
  }

  // Add some quiz analytics
  const quizzesWithDefaults = quizzes.map(quiz => ({
    ...quiz,
    totalAttempts: Math.floor(Math.random() * 50) + 10,
    averageScore: Math.random() * 30 + 60, // 60-90%
    passRate: Math.random() * 40 + 50, // 50-90%
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const createdQuizzes = await Quiz.insertMany(quizzesWithDefaults);

  // Update course stats with quiz counts
  const Course = require('../models/Course');
  for (const course of courses) {
    const quizCount = createdQuizzes.filter(quiz =>
      quiz.course.toString() === course._id.toString()
    ).length;

    await Course.findByIdAndUpdate(course._id, {
      'stats.totalQuizzes': quizCount
    });
  }

  return createdQuizzes;
};

module.exports = { seedQuestionBanks, seedQuestions, seedQuizzes };