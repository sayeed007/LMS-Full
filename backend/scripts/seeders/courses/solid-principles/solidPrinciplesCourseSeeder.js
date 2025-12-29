const Course = require('../../../../src/models/Course');
const Category = require('../../../../src/models/Category');

const seedSOLIDPrinciplesCourse = async (users) => {
  // Find instructors
  const instructors = users.filter(user => user.role === 'instructor');
  const instructor = instructors.find(i => i.email === 'john.doe@lms.com') || instructors[0];

  // Get available categories from database
  const categories = await Category.find({ isActive: true }).select('name');
  const categoryNames = categories.map(cat => cat.name);

  // Helper function to get a valid category name
  const getCategory = (preferredCategory) => {
    const found = categoryNames.find(name => name.toLowerCase().includes(preferredCategory.toLowerCase()));
    return found || categoryNames[0];
  };

  const solidCourse = {
    title: 'SOLID Principles & Design Patterns Mastery',
    shortDescription: 'Master SOLID principles and design patterns to write maintainable, scalable, and testable code through real-world examples and refactoring techniques.',
    description: `Transform your code quality by mastering the SOLID principles - the foundation of clean, maintainable software architecture. This comprehensive course takes you beyond theory, diving deep into real-world code violations and practical refactoring strategies.

Through this course, you'll explore actual codebase examples showing common SOLID violations and learn step-by-step how to refactor them into clean, professional code. Perfect for developers who want to level up from writing "code that works" to writing "code that lasts."

What makes this course unique:
• Real codebase analysis with actual violations
• Step-by-step refactoring demonstrations
• Practical patterns you can apply immediately
• Focus on React/JavaScript ecosystem
• Actionable strategies for legacy code improvement`,

    category: getCategory('development'),
    subcategory: 'Software Architecture',
    level: 'intermediate',
    instructor: instructor._id,
    createdBy: instructor._id,

    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    previewVideo: 'https://www.youtube.com/embed/pTB0EiLXUC8',

    price: 129.99,
    originalPrice: 199.99,
    currency: 'USD',

    estimatedDuration: 10,
    duration: 600,
    language: 'English',

    tags: [
      'solid-principles',
      'design-patterns',
      'software-architecture',
      'clean-code',
      'refactoring',
      'javascript',
      'react',
      'best-practices',
      'code-quality'
    ],

    prerequisites: [
      'Basic understanding of object-oriented programming',
      'Experience with JavaScript/TypeScript',
      'Familiarity with React (helpful but not required)'
    ],

    requirements: [
      'Basic programming experience (6+ months)',
      'Understanding of functions and classes',
      'Code editor installed (VS Code recommended)',
      'Willingness to refactor and improve existing code'
    ],

    targetAudience: [
      'Mid-level developers wanting to improve code quality',
      'Frontend developers working with React',
      'Backend developers seeking architectural knowledge',
      'Tech leads responsible for code reviews',
      'Anyone struggling with large, unmaintainable codebases'
    ],

    learningObjectives: [
      'Understand the 5 SOLID principles deeply',
      'Identify SOLID violations in real code',
      'Refactor legacy code using proven patterns',
      'Apply design patterns effectively',
      'Write testable and maintainable code',
      'Reduce technical debt systematically'
    ],

    learningOutcomes: [
      'Master all 5 SOLID principles with practical examples',
      'Identify and fix common code violations in your projects',
      'Refactor large components into maintainable modules',
      'Implement service layer patterns and dependency injection',
      'Create abstraction layers for better code flexibility',
      'Apply design patterns to solve real-world problems',
      'Write code that is easy to test and extend',
      'Lead refactoring initiatives in your team'
    ],

    chapters: [
      // ========================================
      // CHAPTER 1: Introduction to Design Patterns
      // ========================================
      {
        title: 'Introduction to Design Patterns',
        description: 'Understand what design patterns are, why they matter, and the real cost of poor design in modern applications.',
        order: 1,
        lessons: [
          {
            title: 'What are Design Patterns and Why Do We Need Them?',
            description: 'Learn the fundamentals of design patterns and their role in professional software development',
            content: `# What are Design Patterns and Why Do We Need Them?

## What are Design Patterns?

**Design Patterns** are proven, reusable solutions to common problems in software design.

### Key Characteristics

- **Not** code you can copy-paste
- **Not** specific to any programming language
- **ARE** templates for solving recurring design problems
- **ARE** best practices evolved from years of software development

Design patterns provide a common vocabulary that developers worldwide understand. When someone says "We need a Factory here," experienced developers immediately understand the approach being suggested.

---

## Why Do We Need Design Patterns?

### 1. Maintainability
Code is read **10 times more** than it's written. Clean, pattern-based code is:
- Easy to understand
- Easy to maintain
- Easy to onboard new developers
- Self-documenting through consistent patterns

### 2. Scalability
Systems grow over time. Without good design:
- Poorly designed code becomes harder to change
- Adding features requires complete rewrites
- Technical debt accumulates exponentially

Good patterns allow for growth without painful refactoring.

### 3. Team Collaboration
Patterns provide a **common language** among developers:
- "We need a Factory here" - everyone understands
- Reduces misunderstandings in code reviews
- Accelerates onboarding for new team members
- Creates consistency across the codebase

### 4. Reduced Bugs
Proven solutions mean:
- Fewer edge cases to worry about
- Better separation of concerns = easier testing
- Less coupling = changes don't break unrelated code
- Predictable behavior

---

## The Cost of Poor Design

### Real Impact on Projects

Without design patterns and SOLID principles, projects suffer from:

\`\`\`
❌ 1,405-line components that nobody wants to touch
❌ Duplicated error handling across 50+ API functions
❌ 3-hour bug fixes that should take 30 minutes
❌ Fear of refactoring: "If it works, don't touch it"
❌ New features taking weeks instead of days
❌ Developers leaving due to code frustration
\`\`\`

**Result:** Technical debt that slows down development velocity and team morale.

### Velocity Over Time

\`\`\`
Without Patterns:     With Patterns:
│                     │
│ ╱╲                  │        ╱────
│╱  ╲                 │      ╱
│    ╲___             │    ╱
│        ╲___         │  ╱
└─────────────→       └─────────────→
   Time                  Time
\`\`\`

Poor design creates a **decreasing velocity** - each feature gets harder.
Good design maintains **steady velocity** - features remain predictable.

---

## Design Patterns in Modern Development

### Common Pattern Categories

1. **Creational Patterns** - Object creation mechanisms
   - Factory, Singleton, Builder

2. **Structural Patterns** - Object composition
   - Adapter, Decorator, Facade

3. **Behavioral Patterns** - Object interaction
   - Observer, Strategy, Command

### In React/JavaScript Context

Design patterns manifest differently in modern frameworks:

- **Custom Hooks** = Strategy Pattern
- **Context API** = Dependency Injection
- **Higher-Order Components** = Decorator Pattern
- **Render Props** = Strategy Pattern
- **Compound Components** = Composite Pattern

---

## What You'll Learn in This Course

This course focuses on **SOLID principles** - the foundation that makes design patterns effective:

1. **Single Responsibility Principle** - One reason to change
2. **Open/Closed Principle** - Open for extension, closed for modification
3. **Liskov Substitution Principle** - Substitutability of types
4. **Interface Segregation Principle** - Focused interfaces
5. **Dependency Inversion Principle** - Depend on abstractions

We'll explore each principle through:
- ✅ Real-world code violations from actual projects
- ✅ Step-by-step refactoring examples
- ✅ Practical patterns you can apply immediately
- ✅ Before/after comparisons

---

## Key Takeaways

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
> — Martin Fowler

- Design patterns are proven solutions to common problems
- They improve maintainability, scalability, and collaboration
- Poor design creates exponential technical debt
- SOLID principles form the foundation of good design
- Patterns are tools - learn when to use them (and when not to)

In the next lesson, we'll explore the **real cost of poor design** through actual codebase examples.`,
            type: 'text',
            order: 1,
            duration: 20,
            isPublished: true,
            isPreview: true,
            resources: [
              {
                title: 'Design Patterns Quick Reference',
                type: 'document',
                url: '/files/design-patterns-reference.pdf',
                downloadable: true
              }
            ]
          },
          {
            title: 'The Real Cost of Poor Design in Your Codebase',
            description: 'Examine real-world examples of technical debt and its impact on development teams',
            content: `# The Real Cost of Poor Design in Your Codebase

## Understanding Technical Debt

**Technical debt** is the implied cost of additional rework caused by choosing an easy solution now instead of using a better approach that would take longer.

Just like financial debt:
- It accumulates over time
- It charges "interest" (slower development)
- It can bankrupt projects if left unchecked

---

## Real Numbers: The Impact of Poor Design

### From Real HRM Project Case Study

\`\`\`javascript
Component Statistics:
- Largest component: 1,405 lines (AllPayRoll.js)
- Average component size: 400+ lines
- Components over 1,000 lines: 3
- Duplicated error handling: 50+ times
- State variables in largest component: 50+

Time Impact:
- Average bug fix: 3 hours (should be 30 minutes)
- Time to add simple feature: 2-3 days (should be hours)
- Code review time: 2+ hours (should be 30 minutes)
- Onboarding new developer: 3-4 weeks (should be 1-2 weeks)
\`\`\`

---

## The Developer Experience Problem

### "If It Works, Don't Touch It" Culture

This phrase signals a **codebase in crisis**:

\`\`\`javascript
// Developers think this when they see:
const AllPayRoll = () => {
  // 1,405 lines of intertwined logic
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // ... 48 more state variables ...

  // "I need to add a feature, but I'm afraid
  //  changing anything will break everything"
}
\`\`\`

**Consequences:**
- Developers avoid necessary refactoring
- Bugs get patched with workarounds
- New features get bolted on awkwardly
- Junior developers learn bad habits
- Senior developers leave for better codebases

---

## Quantifying the Cost

### 1. Development Velocity Decline

\`\`\`
Sprint Velocity Over Time:

Month 1:  ████████████ (12 story points)
Month 3:  █████████ (9 story points)
Month 6:  ██████ (6 story points)
Month 12: ███ (3 story points)

Same team, worse codebase = 75% slower
\`\`\`

### 2. Bug Density Increase

\`\`\`
Bugs per Feature:

Good Design:    🐛 (1 bug per feature)
Poor Design:    🐛🐛🐛🐛🐛🐛 (6 bugs per feature)

More bugs = More time fixing = Less time building
\`\`\`

### 3. Developer Turnover

Poor codebases drive talent away:
- **43%** of developers cite "bad codebase" as reason for leaving
- Cost to replace a developer: **$50,000 - $150,000**
- Knowledge loss: **Priceless**

---

## Common Symptoms of Poor Design

### Red Flags in Your Codebase

1. **Monster Components**
   \`\`\`javascript
   ❌ Files over 500 lines
   ❌ Functions over 50 lines
   ❌ More than 10 state variables
   ❌ Multiple levels of nested conditionals
   \`\`\`

2. **Copy-Paste Programming**
   \`\`\`javascript
   ❌ Same error handling repeated 50+ times
   ❌ Duplicate validation logic
   ❌ Similar API call patterns everywhere
   \`\`\`

3. **Fear-Driven Development**
   \`\`\`javascript
   ❌ "I'll just add another if statement"
   ❌ "Refactoring might break something"
   ❌ "Let's create a new component instead"
   ❌ "Don't touch that file, it's too risky"
   \`\`\`

4. **Tight Coupling**
   \`\`\`javascript
   ❌ Components depend on global state
   ❌ Direct axios calls everywhere
   ❌ Hard-coded localStorage access
   ❌ Business logic mixed with UI
   \`\`\`

---

## Case Study: The AllPayRoll.js Monster

### The Problem

\`\`\`javascript
// src/tfhrm/payroll/AllPayRoll.js - 1,405 lines!

const AllPayRoll = () => {
  // 50+ state variables managing:
  // - Payroll generation
  // - Approval workflows
  // - CSV/PDF exports
  // - Data filtering
  // - Notifications
  // - Bulk uploads
  // - Report generation

  // Result: Nobody wants to touch this file
  // Every change is risky
  // Testing is nearly impossible
  // New features take days instead of hours
}
\`\`\`

### The Cost

| Metric | Impact |
|--------|--------|
| **Time to understand** | 4-6 hours for experienced dev |
| **Time to add feature** | 2-3 days |
| **Bug introduction rate** | ~40% of changes |
| **Test coverage** | < 10% (too hard to test) |
| **Developer satisfaction** | 😫 Very low |

---

## The Compounding Effect

Poor design doesn't just slow you down - it **accelerates the slowdown**:

\`\`\`
Month 1:  Feature takes 2 days
          ↓ (add feature with poor design)
Month 2:  Feature takes 3 days
          ↓ (add another feature with poor design)
Month 3:  Feature takes 5 days
          ↓ (add another feature with poor design)
Month 6:  Feature takes 10 days
          ↓ (team paralyzed by technical debt)
Month 12: Rewrite the entire application
\`\`\`

This is the **exponential nature of technical debt**.

---

## The Good News: It's Fixable

### Investment vs. Return

\`\`\`javascript
// Refactoring Investment:
Week 1: Learn SOLID principles
Week 2-4: Refactor one major component
Week 5+: Apply patterns to new code

// Returns:
Month 2: 20% faster development
Month 4: 50% fewer bugs
Month 6: 2x development velocity
Year 1: Happy developers, maintainable code
\`\`\`

### The Path Forward

1. **Stop making it worse** - Apply patterns to new code
2. **Refactor incrementally** - One component per sprint
3. **Share knowledge** - Team learns together
4. **Measure progress** - Track metrics that matter

---

## Real-World Success Stories

### Before and After Refactoring

\`\`\`javascript
// BEFORE: AllPayRoll.js - 1,405 lines
const AllPayRoll = () => {
  // Everything in one file
  // 50+ state variables
  // Impossible to test
};

// AFTER: Modular architecture - ~200 lines each
<PayrollContainer>           {/* 150 lines */}
  <PayrollFilters />         {/* 80 lines */}
  <PayrollDataTable />       {/* 200 lines */}
  <PayrollActions />         {/* 120 lines */}
  <BulkUploader />          {/* 180 lines */}
</PayrollContainer>

// Result:
✅ Each component easy to understand
✅ Easy to test in isolation
✅ New features take hours, not days
✅ Team confidence restored
\`\`\`

---

## Key Takeaways

> "The only way to go fast is to go well."
> — Robert C. Martin (Uncle Bob)

- Poor design has **measurable costs**: time, money, and morale
- Technical debt **compounds** - it gets worse over time
- Common symptoms: large files, duplication, fear of change
- The solution: **SOLID principles** and design patterns
- Refactoring is an **investment** with significant returns

In the next chapter, we'll dive into the **SOLID principles** that will transform your code from unmaintainable to elegant.`,
            type: 'text',
            order: 2,
            duration: 25,
            isPublished: true,
            resources: [
              {
                title: 'Technical Debt Assessment Checklist',
                type: 'document',
                url: '/files/technical-debt-checklist.pdf',
                downloadable: true
              }
            ]
          }
        ],
        isPublished: true
      },

      // ========================================
      // CHAPTER 2: SOLID Principles Overview
      // ========================================
      {
        title: 'SOLID Principles Overview',
        description: 'Get introduced to the five SOLID principles and understand why they are fundamental to writing professional, maintainable code.',
        order: 2,
        lessons: [
          {
            title: 'Introduction to SOLID Principles',
            description: 'Learn what SOLID stands for and why these principles matter in modern software development',
            content: `# Introduction to SOLID Principles

## What is SOLID?

**SOLID** is an acronym representing five fundamental principles of object-oriented design that help developers create more maintainable, flexible, and scalable software.

Coined by **Robert C. Martin** (Uncle Bob), these principles have become the foundation of professional software development.

---

## The Five SOLID Principles

| Letter | Principle | Core Concept |
|--------|-----------|--------------|
| **S** | **S**ingle Responsibility Principle | A class should have only one reason to change |
| **O** | **O**pen/Closed Principle | Open for extension, closed for modification |
| **L** | **L**iskov Substitution Principle | Subtypes must be substitutable for their base types |
| **I** | **I**nterface Segregation Principle | No client should depend on methods it doesn't use |
| **D** | **D**ependency Inversion Principle | Depend on abstractions, not concretions |

---

## Why SOLID Matters

These principles help us write code that is:

### 1. **Maintainable**
- Easy to understand and modify
- Changes are localized and predictable
- Reduced risk when fixing bugs or adding features

\`\`\`javascript
// Maintainable code example
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUser(id) {
    return this.userRepository.findById(id);
  }
}

// Clear responsibility, easy to modify
\`\`\`

### 2. **Testable**
- Easy to write unit tests
- Components can be tested in isolation
- Dependencies can be mocked easily

\`\`\`javascript
// Testable code - dependencies injected
class OrderProcessor {
  constructor(paymentService, emailService) {
    this.paymentService = paymentService;
    this.emailService = emailService;
  }

  async processOrder(order) {
    await this.paymentService.charge(order);
    await this.emailService.sendConfirmation(order);
  }
}

// Easy to test with mock services
\`\`\`

### 3. **Flexible**
- Easy to extend with new features
- Can swap implementations without breaking code
- Adapts to changing requirements

\`\`\`javascript
// Flexible code - new features added without modification
class NotificationService {
  constructor(notifiers) {
    this.notifiers = notifiers; // Array of notifiers
  }

  async notify(message) {
    for (const notifier of this.notifiers) {
      await notifier.send(message);
    }
  }
}

// Can add EmailNotifier, SMSNotifier, PushNotifier without changing class
\`\`\`

### 4. **Reusable**
- Components can be used in different contexts
- Loose coupling enables composition
- DRY (Don't Repeat Yourself) principle enforced

### 5. **Scalable**
- Grows without becoming a mess
- New team members can contribute confidently
- Architecture remains sound as features increase

---

## SOLID in Practice: Before and After

### Before SOLID: Tightly Coupled Code

\`\`\`javascript
// ❌ Violates multiple SOLID principles
class UserDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      orders: [],
      notifications: [],
      loading: false
    };
  }

  componentDidMount() {
    // Directly coupled to axios and localStorage
    const token = localStorage.getItem('token');

    axios.get('/api/user', {
      headers: { Authorization: token }
    }).then(response => {
      this.setState({ user: response.data });
    });

    axios.get('/api/orders', {
      headers: { Authorization: token }
    }).then(response => {
      this.setState({ orders: response.data });
    });

    axios.get('/api/notifications', {
      headers: { Authorization: token }
    }).then(response => {
      this.setState({ notifications: response.data });
    });
  }

  render() {
    // 500+ lines of rendering logic...
  }
}
\`\`\`

**Problems:**
- ❌ Multiple responsibilities (data fetching, rendering, state management)
- ❌ Hard-coded dependencies (axios, localStorage)
- ❌ Impossible to test without real API calls
- ❌ Can't reuse data fetching logic
- ❌ Difficult to extend or modify

### After SOLID: Clean Architecture

\`\`\`javascript
// ✅ Follows SOLID principles

// Service layer (Dependency Inversion)
class ApiService {
  constructor(httpClient, authService) {
    this.httpClient = httpClient;
    this.authService = authService;
  }

  async get(endpoint) {
    const token = await this.authService.getToken();
    return this.httpClient.get(endpoint, {
      headers: { Authorization: token }
    });
  }
}

// Custom hook (Single Responsibility)
function useUserData() {
  const { api } = useServices();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/user').then(setUser);
  }, []);

  return { user, loading };
}

// Component (Single Responsibility - only rendering)
const UserDashboard = () => {
  const { user, loading } = useUserData();
  const { orders } = useUserOrders();
  const { notifications } = useNotifications();

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <UserProfile user={user} />
      <OrdersList orders={orders} />
      <NotificationsList notifications={notifications} />
    </DashboardLayout>
  );
};
\`\`\`

**Benefits:**
- ✅ Single responsibility per component/hook
- ✅ Dependencies injected (testable)
- ✅ Reusable custom hooks
- ✅ Easy to extend (add new data sources)
- ✅ Clean, readable code

---

## How SOLID Principles Work Together

The principles are **interconnected** and reinforce each other:

\`\`\`
Single Responsibility
      ↓
   (creates focused modules)
      ↓
Interface Segregation
      ↓
   (defines clean contracts)
      ↓
Liskov Substitution
      ↓
   (ensures proper inheritance)
      ↓
Open/Closed
      ↓
   (enables extension without modification)
      ↓
Dependency Inversion
      ↓
   (decouples high-level from low-level)
      ↓
   MAINTAINABLE CODE
\`\`\`

---

## Common Misconceptions

### ❌ "SOLID is only for object-oriented languages"
**Reality:** SOLID principles apply to **all programming paradigms**, including functional programming and React.

### ❌ "Following SOLID makes code more complex"
**Reality:** SOLID makes code **initially more verbose** but **dramatically simpler** in the long run.

### ❌ "SOLID is overkill for small projects"
**Reality:** Small projects grow. SOLID **prevents** them from becoming unmaintainable.

### ❌ "Perfect SOLID adherence is required"
**Reality:** SOLID principles are **guidelines**, not strict rules. Use judgment.

---

## When to Apply SOLID

### ✅ Always Apply
- New feature development
- Major refactoring efforts
- Shared/reusable components
- Business logic layers
- API service layers

### 🤔 Use Judgment
- Quick prototypes
- One-off scripts
- Simple UI components
- Configuration files

### ❌ Don't Over-engineer
- Simple data transformations
- Pure utility functions
- Trivial components

---

## What's Next in This Course

In the following chapters, we'll deep-dive into each SOLID principle:

1. **Single Responsibility Principle (SRP)**
   - Real violations from actual codebases
   - Refactoring strategies
   - Component decomposition techniques

2. **Open/Closed Principle (OCP)**
   - Duplicated code patterns
   - Abstraction techniques
   - Extension points

3. **Liskov Substitution Principle (LSP)**
   - Type safety and substitutability
   - Polymorphism in JavaScript/React
   - Interface contracts

4. **Interface Segregation Principle (ISP)**
   - Fat interfaces and hooks
   - Focused abstractions
   - Barrel export anti-patterns

5. **Dependency Inversion Principle (DIP)**
   - Service layer architecture
   - Dependency injection in React
   - Testing with mocks

Each principle includes:
- ✅ Real-world code violations
- ✅ Step-by-step refactoring
- ✅ Before/after comparisons
- ✅ Practical examples you can use immediately

---

## Key Takeaways

> "Clean code is not written by following a set of rules. You don't become a software craftsman by learning a list of what to do and what not to do. Professionalism and craftsmanship come from values that drive disciplines."
> — Robert C. Martin

- **SOLID** = 5 principles for maintainable software
- These principles make code: **maintainable, testable, flexible, reusable, scalable**
- SOLID principles **work together** to create clean architecture
- They apply to **all paradigms**, not just OOP
- Use **judgment** - they're guidelines, not strict rules

Ready to dive deep? Let's start with the **Single Responsibility Principle**!`,
            type: 'text',
            order: 1,
            duration: 30,
            isPublished: true,
            resources: [
              {
                title: 'SOLID Principles Cheat Sheet',
                type: 'document',
                url: '/files/solid-cheat-sheet.pdf',
                downloadable: true
              },
              {
                title: 'SOLID Principles Mind Map',
                type: 'image',
                url: '/files/solid-mindmap.png',
                downloadable: true
              }
            ]
          }
        ],
        isPublished: true
      }

      // Additional chapters will be added in Part 2 of this seeder
      // Due to file size, we'll continue in the next section
    ],

    isPublished: true,
    isApproved: true,
    isFeatured: true,

    settings: {
      allowComments: true,
      allowReviews: true,
      autoApproveComments: false,
      certificateEnabled: true,
      passRequirement: 75
    }
  };

  // Add computed fields
  const courseWithDefaults = {
    ...solidCourse,
    slug: solidCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    rating: {
      average: 4.8,
      count: 127,
      distribution: {
        1: 2,
        2: 3,
        3: 8,
        4: 34,
        5: 80
      }
    },
    stats: {
      totalEnrollments: 856,
      totalCompletions: 423,
      totalLessons: solidCourse.chapters.reduce((total, chapter) =>
        total + chapter.lessons.length, 0),
      totalQuizzes: 0,
      averageRating: 4.8,
      completionRate: 49.4
    },
    publishedAt: new Date('2024-01-15'),
    approvedAt: new Date('2024-01-14'),
    approvedBy: instructor._id
  };

  const createdCourse = await Course.create(courseWithDefaults);
  console.log(`✅ Created SOLID Principles course with ${courseWithDefaults.stats.totalLessons} lessons`);

  return createdCourse;
};

module.exports = { seedSOLIDPrinciplesCourse };
