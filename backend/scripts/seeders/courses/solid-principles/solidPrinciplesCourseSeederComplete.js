const Course = require('../../../../src/models/Course');
const Category = require('../../../../src/models/Category');

/**
 * SOLID Principles & Design Patterns Course Seeder
 *
 * This seeder creates a comprehensive course on SOLID principles
 * based on the SOLID_Principles_Session.md content.
 *
 * Course Structure:
 * - 6 Chapters
 * - 22+ Lessons
 * - Mix of text, video, and quiz content
 * - Real-world examples and refactoring patterns
 */

const seedSOLIDPrinciplesCourse = async (users) => {
  // Find instructors
  const instructors = users.filter(user => user.role === 'instructor');
  const instructor = instructors.find(i => i.email === 'john.doe@lms.com') || instructors[0];

  if (!instructor) {
    throw new Error('No instructor found. Please run user seeder first.');
  }

  // Get available categories
  const categories = await Category.find({ isActive: true }).select('name');
  const categoryNames = categories.map(cat => cat.name);

  const getCategory = (preferredCategory) => {
    const found = categoryNames.find(name =>
      name.toLowerCase().includes(preferredCategory.toLowerCase())
    );
    return found || categoryNames[0];
  };

  const solidCourse = {
    title: 'SOLID Principles & Design Patterns Mastery',
    shortDescription: 'Master SOLID principles and design patterns to write maintainable, scalable, and testable code through real-world examples.',
    description: `Transform your code quality by mastering the SOLID principles - the foundation of clean, maintainable software architecture.

This comprehensive course takes you beyond theory, diving deep into real-world code violations from actual production codebases and teaching you step-by-step refactoring strategies that you can apply immediately.

**What Makes This Course Unique:**
• Real codebase analysis with actual SOLID violations
• Step-by-step refactoring demonstrations
• Practical patterns for React/JavaScript ecosystem
• Before/after code comparisons
• Actionable strategies for legacy code improvement
• Production-grade examples you can use today

**Perfect for developers who want to level up from writing "code that works" to writing "code that lasts."**

By the end of this course, you'll be able to identify SOLID violations in any codebase, refactor legacy code confidently, and write new code that follows industry best practices.`,

    category: getCategory('development'),
    subcategory: 'Software Architecture',
    level: 'intermediate',
    instructor: instructor._id,
    createdBy: instructor._id,

    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
    previewVideo: 'https://www.youtube.com/embed/pTB0EiLXUC8',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800'
    ],

    price: 129.99,
    originalPrice: 199.99,
    discountPrice: 99.99,
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
      'code-quality',
      'software-design'
    ],

    prerequisites: [
      'Basic understanding of object-oriented programming concepts',
      'Experience with JavaScript or TypeScript (6+ months)',
      'Familiarity with React is helpful but not required',
      'Understanding of functions, classes, and modules'
    ],

    requirements: [
      'Basic programming experience (6+ months minimum)',
      'Understanding of functions and classes',
      'Code editor installed (VS Code recommended)',
      'Willingness to refactor and improve existing code',
      'No prior knowledge of design patterns required'
    ],

    targetAudience: [
      'Mid-level developers wanting to improve code quality',
      'Frontend developers working with React or Vue',
      'Backend developers seeking architectural knowledge',
      'Tech leads responsible for code reviews',
      'Anyone struggling with large, unmaintainable codebases',
      'Developers preparing for senior-level interviews'
    ],

    learningObjectives: [
      'Understand all 5 SOLID principles with depth and clarity',
      'Identify SOLID violations in existing codebases',
      'Refactor legacy code using proven refactoring patterns',
      'Apply design patterns effectively in real projects',
      'Write testable and maintainable production code',
      'Reduce technical debt systematically and safely'
    ],

    learningOutcomes: [
      'Master all 5 SOLID principles through practical examples',
      'Identify and fix common code violations in your projects',
      'Refactor large components into maintainable, focused modules',
      'Implement service layer patterns and dependency injection',
      'Create abstraction layers for better code flexibility and testability',
      'Apply proven design patterns to solve real-world software problems',
      'Write code that is easy to test, extend, and maintain',
      'Lead refactoring initiatives and mentor junior developers',
      'Conduct effective code reviews with SOLID principles in mind',
      'Build scalable application architectures from the ground up'
    ],

    chapters: [
      // ==========================================
      // CHAPTER 1: Introduction to Design Patterns
      // ==========================================
      {
        title: 'Introduction to Design Patterns',
        description: 'Understand what design patterns are, why they matter in professional development, and the real, measurable cost of poor design in modern applications.',
        order: 1,
        isPublished: true,
        lessons: [
          {
            title: 'What are Design Patterns and Why Do We Need Them?',
            description: 'Learn the fundamentals of design patterns and their critical role in professional software development',
            type: 'text',
            order: 1,
            duration: 20,
            isPublished: true,
            isPreview: true,
            content: `# What are Design Patterns and Why Do We Need Them?

## Introduction

Welcome to the world of professional software development! In this lesson, we'll explore what design patterns are and why they've become an essential part of writing quality software.

## What are Design Patterns?

**Design Patterns** are proven, reusable solutions to common problems in software design.

Think of them like architectural blueprints - they're not the actual building, but they show you how to construct something that has been proven to work well.

### Key Characteristics

- **NOT** code you can copy-paste directly into your project
- **NOT** specific to any single programming language
- **ARE** templates for solving recurring design problems
- **ARE** best practices evolved from years of collective experience

Design patterns provide a **common vocabulary** that developers worldwide understand. When someone says "We should use a Factory pattern here," experienced developers immediately grasp the approach being suggested.

---

## Why Do We Need Design Patterns?

### 1. Maintainability 🔧

Code is read **10 times more often** than it's written.

**Clean, pattern-based code is:**
- Easy to understand, even months later
- Easy to maintain and modify
- Easy for new team members to learn
- Self-documenting through consistent structure

**Example:**
\`\`\`javascript
// Hard to maintain - unclear structure
function processUser(u, t) {
  if (t === 1) return doThing(u);
  else if (t === 2) return doOther(u);
  // What is this doing?
}

// Easy to maintain - clear pattern
class UserProcessor {
  process(user, processingType) {
    const processor = this.getProcessor(processingType);
    return processor.process(user);
  }
}
\`\`\`

### 2. Scalability 📈

Systems inevitably grow over time. Without good design:
- Features become exponentially harder to add
- Simple changes require touching dozens of files
- Complete rewrites become necessary every 2-3 years

Good patterns allow growth without painful refactoring.

**The Growth Curve:**
\`\`\`
Without Patterns:     With Patterns:
Complexity            Complexity
   ↑                     ↑
   |    ╱╲              |        ╱────
   |  ╱    ╲            |      ╱
   |╱        ╲___       |    ╱
   └─────────────→      └─────────────→
      Time                 Time
\`\`\`

### 3. Team Collaboration 👥

Patterns provide a **common language** among developers:

**Before Patterns:**
"So we need to, like, create a thing that makes other things, but only when we need them, and it should remember if we already made one..."

**With Patterns:**
"We need a Singleton Factory."

**Benefits:**
- Reduces misunderstandings in design discussions
- Accelerates code reviews
- Shortens onboarding time for new developers
- Creates consistency across the entire codebase

### 4. Reduced Bugs 🐛

Proven solutions mean:
- Fewer edge cases to worry about
- Better separation of concerns = easier testing
- Less coupling = changes don't cascade unexpectedly
- Predictable, battle-tested behavior

---

## The Cost of Poor Design

Let's talk real numbers from actual projects.

### Real Example: HRM Project Analysis

\`\`\`
Component Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Largest component: 1,405 lines
• Components over 1,000 lines: 3 files
• Duplicated error handling: 50+ times
• Average component size: 400+ lines
• State variables in largest: 50+

Time Impact:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Bug fix time: 3 hours (should be 30 min)
• Simple feature: 2-3 days (should be hours)
• Code review: 2+ hours (should be 30 min)
• New dev onboarding: 4 weeks (should be 2)
\`\`\`

**The "If It Works, Don't Touch It" Problem:**

This phrase signals a codebase in crisis. When developers are afraid to modify code, you have:
- ❌ No refactoring happening
- ❌ Bugs patched with workarounds
- ❌ Features bolted on awkwardly
- ❌ Junior devs learning bad habits
- ❌ Senior devs leaving for better codebases

---

## Design Patterns in Modern JavaScript/React

Design patterns aren't just for classical OOP languages. They're everywhere in modern JavaScript:

| Pattern | React/JS Implementation |
|---------|------------------------|
| **Strategy** | Custom Hooks |
| **Observer** | useState, Context API |
| **Factory** | Component Factories |
| **Decorator** | Higher-Order Components (HOCs) |
| **Singleton** | Module pattern, Context |
| **Composite** | Component Composition |

**Example: Strategy Pattern as Custom Hook**
\`\`\`javascript
// Strategy pattern in React
function usePaymentMethod(method) {
  const strategies = {
    creditCard: useCreditCardPayment,
    paypal: usePayPalPayment,
    crypto: useCryptoPayment
  };

  return strategies[method]();
}

// Usage - strategy easily swappable
const { processPayment } = usePaymentMethod('creditCard');
\`\`\`

---

## What You'll Learn in This Course

This course focuses on **SOLID principles** - the foundation that makes all design patterns effective:

### The 5 SOLID Principles

1. **S - Single Responsibility Principle**
   One class, one reason to change

2. **O - Open/Closed Principle**
   Open for extension, closed for modification

3. **L - Liskov Substitution Principle**
   Subtypes must be substitutable

4. **I - Interface Segregation Principle**
   No client forced to depend on unused methods

5. **D - Dependency Inversion Principle**
   Depend on abstractions, not concretions

### Our Learning Approach

For each principle, you'll get:
- ✅ Real-world code violations from production codebases
- ✅ Detailed analysis of what's wrong and why
- ✅ Step-by-step refactoring demonstrations
- ✅ Before/after code comparisons
- ✅ Practical patterns you can use immediately
- ✅ Best practices for preventing violations

---

## Key Takeaways

> "Any fool can write code that a computer can understand. Good programmers write code that humans can understand."
> **— Martin Fowler**

**Remember:**
- Design patterns are **proven solutions** to common problems
- They improve **maintainability, scalability, and team collaboration**
- Poor design creates **exponential technical debt**
- SOLID principles are the **foundation** of good design
- Patterns are **tools** - learn when to use them (and when not to)

---

## What's Next?

In the next lesson, we'll examine **The Real Cost of Poor Design** through actual codebase examples, complete with metrics and real-world impact on development teams.

You'll see exactly what happens when SOLID principles are violated and why learning these patterns is one of the best investments you can make in your career.

Ready to dive deeper? Let's go!`,
            resources: [
              {
                title: 'Design Patterns Quick Reference Guide',
                type: 'document',
                url: '/files/design-patterns-reference.pdf',
                downloadable: true
              },
              {
                title: 'Common Design Patterns in JavaScript',
                type: 'link',
                url: 'https://www.patterns.dev/posts/classic-design-patterns'
              }
            ]
          },
          {
            title: 'The Real Cost of Poor Design',
            description: 'Examine real metrics and case studies showing the measurable impact of technical debt on development teams',
            type: 'text',
            order: 2,
            duration: 25,
            isPublished: true,
            isPreview: true,
            content: `# The Real Cost of Poor Design in Your Codebase

## Introduction

In this lesson, we'll look at hard data and real examples showing exactly how poor design impacts projects, teams, and businesses. These aren't hypothetical scenarios - they're measurements from actual production codebases.

## Understanding Technical Debt

**Technical debt** is the implied cost of additional rework caused by choosing an easy solution now instead of a better approach that would take longer.

### The Debt Metaphor

Just like financial debt:
- ✅ Can be useful for short-term gains
- ✅ Must be managed carefully
- ❌ Accumulates "interest" over time
- ❌ Can bankrupt projects if left unchecked

**The Interest Rate:**
Poor code doesn't just stay poor - it makes everything around it worse.

\`\`\`
Month 1:  Add feature in poor design → 2 days
Month 3:  Add similar feature → 3 days (+50%)
Month 6:  Add similar feature → 5 days (+150%)
Month 12: Add similar feature → 10 days (+400%)

This is compound interest on technical debt
\`\`\`

---

## Real Numbers from Real Projects

### Case Study: Enterprise HRM Application

Let's examine actual metrics from a production HR management system:

#### Component Statistics
\`\`\`javascript
File Size Analysis:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• AllPayRoll.js:        1,405 lines  😱
• AddEmployee.js:       1,270 lines  😱
• AdminPanel.js:          631 lines  😰
• AddPromotionModal.js:   892 lines  😰
• Average component:      400+ lines  ⚠️

Components over 1,000 lines: 3 files
Components over 500 lines:  12 files
\`\`\`

#### Code Duplication
\`\`\`javascript
Duplicated Patterns:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Error handling:     Repeated 50+ times
• API call pattern:   Repeated 40+ times
• Form validation:    Repeated 30+ times
• State management:   Repeated 25+ times

Estimated duplicated code: ~15,000 lines
Potential reduction: 70% with abstraction
\`\`\`

#### State Management Explosion
\`\`\`javascript
// AllPayRoll.js - 50+ state variables!
const AllPayRoll = () => {
  const [allEmployee, setAllEmployee] = useState([]);
  const [payrollApproveModal, setPayrollApproveModal] = useState(false);
  const [generateModal, setGenerateModal] = useState(false);
  const [isLoading, setIsLoading] = useState({...});
  const [companyOptions, setCompanyOptions] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [selectedPaySlip, setSelectedPaySlip] = useState([]);
  // ... 43 MORE state variables! 😱

  // What does this component even do?
  // Who knows what changing one state affects?
  // How do you test this?
  // How do you reason about this?
}
\`\`\`

---

## Measuring the Impact

### 1. Development Velocity Decline

**Sprint Velocity Over Time** (same team, same project):

\`\`\`
Month 1:  ████████████ 12 story points/sprint
Month 2:  ██████████   10 story points/sprint
Month 4:  ████████      8 story points/sprint
Month 6:  ██████        6 story points/sprint
Month 9:  ████          4 story points/sprint
Month 12: ██            2 story points/sprint

Result: 83% velocity loss in one year
\`\`\`

**Why does this happen?**
- Changes touch more files
- Fear of breaking things increases
- Testing becomes harder
- Bugs take longer to find
- Context switching overhead increases

### 2. Time-to-Fix Metrics

| Task Type | Well-Designed Code | Poorly-Designed Code | Difference |
|-----------|-------------------|---------------------|------------|
| Simple bug fix | 30 minutes | 3 hours | **6x slower** |
| Add validation | 1 hour | 1 day | **8x slower** |
| New feature | 2 days | 2 weeks | **5x slower** |
| Refactoring | Safe, quick | Risky, avoided | **∞ slower** |

### 3. Bug Density Increase

\`\`\`
Bugs Introduced Per Feature:

Good Architecture:  🐛 (1 bug per feature)
Poor Architecture:  🐛🐛🐛🐛🐛🐛 (6 bugs per feature)

Each bug costs:
• 2-4 hours to fix
• QA time to verify
• Potential customer impact
• Developer context switching
\`\`\`

### 4. The Human Cost

**Developer Experience Metrics:**

\`\`\`
Survey Results (100 developers):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Would work on this codebase again"
  Good design:  ████████░░ 82% Yes
  Poor design:  ██░░░░░░░░ 18% Yes

"Confident making changes"
  Good design:  ████████░░ 79% Yes
  Poor design:  █░░░░░░░░░ 12% Yes

"Would recommend to colleague"
  Good design:  ████████░░ 85% Yes
  Poor design:  █░░░░░░░░░  9% Yes
\`\`\`

**Turnover Impact:**
- 43% of developers cite "unmaintainable codebase" as reason for leaving
- Cost to replace developer: $50,000 - $150,000
- Knowledge loss: Priceless
- Team morale impact: Significant

---

## The "Fear-Driven Development" Syndrome

### Symptoms

When you hear developers say:

\`\`\`
❌ "I'll just add another if statement"
❌ "Refactoring might break something"
❌ "Let's create a new component instead"
❌ "Don't touch that file, it's too risky"
❌ "If it works, don't touch it"
❌ "Only Sarah understands that code"
\`\`\`

**Your codebase has a serious problem.**

### The Cascade Effect

\`\`\`
Poor Design
    ↓
Fear of Change
    ↓
Workarounds Instead of Fixes
    ↓
More Poor Design
    ↓
More Fear
    ↓
...eventually...
    ↓
Complete Rewrite Required
\`\`\`

---

## Case Study: The AllPayRoll.js Monster

### The Problem

\`\`\`javascript
// src/tfhrm/payroll/AllPayRoll.js - 1,405 lines
const AllPayRoll = () => {
  // This component handles:
  // 1. Payroll generation (200 lines)
  // 2. Approval workflows (180 lines)
  // 3. CSV/PDF exports (220 lines)
  // 4. Data filtering (150 lines)
  // 5. Notifications (120 lines)
  // 6. Bulk uploads (200 lines)
  // 7. Report generation (190 lines)
  // 8. UI rendering (145 lines)

  // 50+ state variables managing everything
  // 30+ useEffect hooks with complex dependencies
  // 15+ API calls scattered throughout
  // Zero separation of concerns

  // Result: Development paralysis
}
\`\`\`

### The Cost

| Metric | Value | Impact |
|--------|-------|--------|
| **Understanding time** | 6 hours | New devs need full day |
| **Feature addition** | 2-3 days | Should be hours |
| **Bug introduction** | 40% | Nearly half changes break things |
| **Test coverage** | < 10% | Too complex to test |
| **Developer anxiety** | 😫 High | Nobody wants to touch it |
| **Bus factor** | 1 | Only one person understands it |

### The Compounding Problem

\`\`\`
Week 1:  Add feature → 2 days
         (Component grows to 1,450 lines)

Week 3:  Add feature → 3 days
         (Component grows to 1,520 lines)

Week 6:  Fix bug → 1 day
         (Introduce 2 new bugs)

Week 8:  Add feature → 5 days
         (Component grows to 1,680 lines)

Week 12: Team discusses rewrite
         (6 weeks of work estimated)

Week 16: Continue adding workarounds
         (Rewrite deemed too risky)

Month 6: Component unmaintainable
         (Feature requests pile up)
\`\`\`

---

## The Financial Impact

### Direct Costs

\`\`\`
Cost of Poor Design (Annual):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reduced velocity:          $120,000
  (3 devs × $80k × 50% slower)

Additional bug fixing:      $45,000
  (6x more bugs × time cost)

Developer turnover:         $75,000
  (1 replacement per year)

Delayed features:           $200,000
  (Lost revenue/opportunity)

TOTAL ANNUAL COST:         $440,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For a team of just 3 developers!
\`\`\`

### Opportunity Costs

What could you have built instead?
- ✅ 2-3 major features
- ✅ Complete mobile app
- ✅ Comprehensive test suite
- ✅ Performance optimizations
- ✅ Better UX/UI
- ✅ Technical debt paydown

---

## Red Flags Checklist

### Warning Signs in Your Codebase

**🚨 Critical (Fix Immediately)**
- [ ] Files over 1,000 lines
- [ ] Components with 20+ state variables
- [ ] Developers afraid to refactor
- [ ] "Only X understands this code"

**⚠️ Warning (Plan to Fix)**
- [ ] Files over 500 lines
- [ ] Duplicated code (3+ times)
- [ ] Hard-coded dependencies
- [ ] No separation of concerns

**💡 Improvement Opportunity**
- [ ] Files over 300 lines
- [ ] Mixed concerns in components
- [ ] Difficult to test code
- [ ] Inconsistent patterns

---

## The Good News: It's Fixable

### ROI of Refactoring

\`\`\`javascript
// Investment:
Week 1:   Learn SOLID principles
Week 2-4: Refactor one major component
Week 5+:  Apply patterns to new code

// Returns:
Month 2:  +20% development velocity
Month 4:  -50% bug introduction
Month 6:  +100% development velocity
Year 1:   Happy developers, maintainable code
          Reduced turnover, faster features
\`\`\`

### Success Story

**Before Refactoring:**
- AllPayRoll.js: 1,405 lines
- Development time: 3 days per feature
- Bug rate: 40%
- Developer satisfaction: 😫

**After Refactoring (Using SOLID):**
- Largest component: 220 lines
- Development time: 4 hours per feature
- Bug rate: 8%
- Developer satisfaction: 😊

**Time saved per year:** ~800 hours
**Cost savings:** ~$65,000
**Developer retention:** Improved
**Code quality:** Dramatically better

---

## Key Takeaways

> "The only way to go fast is to go well."
> **— Robert C. Martin (Uncle Bob)**

**Remember:**
- Poor design has **measurable, significant costs**
- Technical debt **compounds exponentially**
- Common symptoms: large files, duplication, fear
- The solution: **SOLID principles** and patterns
- Refactoring is an **investment** with high ROI
- Start small, improve incrementally

---

## What's Next?

Now that you understand the cost of poor design, you're ready to learn the solution: **SOLID Principles**.

In the next chapter, we'll introduce all five SOLID principles and show you how they work together to create maintainable, scalable, and testable code.

The transformation starts here!`,
            resources: [
              {
                title: 'Technical Debt Assessment Checklist',
                type: 'document',
                url: '/files/technical-debt-checklist.pdf',
                downloadable: true
              },
              {
                title: 'Code Quality Metrics Guide',
                type: 'document',
                url: '/files/code-quality-metrics.pdf',
                downloadable: true
              }
            ]
          },
          {
            title: 'Measuring Code Quality',
            description: 'Learn practical techniques for assessing code quality and tracking improvement over time',
            type: 'video',
            order: 3,
            duration: 15,
            isPublished: true,
            content: 'Learn how to measure code quality using tools and metrics like cyclomatic complexity, code coverage, and maintainability index.',
            videoUrl: 'https://www.youtube.com/embed/Qjywrq2gM8o',
            videoProvider: 'youtube',
            resources: [
              {
                title: 'Code Quality Tools List',
                type: 'link',
                url: 'https://github.com/collections/code-quality'
              }
            ]
          }
        ]
      },

      // ==========================================
      // CHAPTER 2: SOLID Principles Overview
      // ==========================================
      {
        title: 'SOLID Principles Overview',
        description: 'Get a comprehensive introduction to all five SOLID principles and understand why they form the foundation of professional software development.',
        order: 2,
        isPublished: true,
        lessons: [
          {
            title: 'Introduction to SOLID Principles',
            description: 'Learn what SOLID stands for and why these five principles are crucial for writing maintainable code',
            type: 'text',
            order: 1,
            duration: 30,
            isPublished: true,
            content: `# Introduction to SOLID Principles

## What is SOLID?

**SOLID** is an acronym representing five fundamental principles of object-oriented design that help developers create software that is maintainable, flexible, and scalable.

These principles were popularized by **Robert C. Martin** (Uncle Bob) and have become the cornerstone of professional software development.

---

## The Five SOLID Principles

| Letter | Principle | Core Concept |
|--------|-----------|--------------|
| **S** | **Single Responsibility Principle** | A class/module should have only one reason to change |
| **O** | **Open/Closed Principle** | Open for extension, closed for modification |
| **L** | **Liskov Substitution Principle** | Subtypes must be substitutable for base types |
| **I** | **Interface Segregation Principle** | No client should depend on unused interfaces |
| **D** | **Dependency Inversion Principle** | Depend on abstractions, not concretions |

---

## Why SOLID Principles Matter

These principles help create code that is:

### 1. Maintainable 🔧

**Easy to understand and modify**

\`\`\`javascript
// Without SOLID - Hard to maintain
function processData(data, type) {
  if (type === 'user') {
    // 50 lines of user processing
  } else if (type === 'order') {
    // 50 lines of order processing
  } else if (type === 'product') {
    // 50 lines of product processing
  }
  // Adding new type requires modifying this function
}

// With SOLID - Easy to maintain
class DataProcessor {
  constructor(strategy) {
    this.strategy = strategy; // Dependency injection
  }

  process(data) {
    return this.strategy.process(data); // Delegation
  }
}

// Adding new type? Just create new strategy class
// No modification of existing code needed!
\`\`\`

### 2. Testable ✅

**Easy to write unit tests**

\`\`\`javascript
// Without SOLID - Hard to test
class UserService {
  saveUser(user) {
    const db = new MySQL(); // Tightly coupled!
    db.connect('localhost');
    db.query('INSERT INTO users...');
    // How do you test without real database?
  }
}

// With SOLID - Easy to test
class UserService {
  constructor(database) {
    this.database = database; // Injected dependency
  }

  saveUser(user) {
    return this.database.save('users', user);
  }
}

// Testing is easy - just inject mock database!
const mockDb = { save: jest.fn() };
const service = new UserService(mockDb);
service.saveUser({name: 'Test'});
expect(mockDb.save).toHaveBeenCalled();
\`\`\`

### 3. Flexible 🔄

**Easy to extend with new features**

\`\`\`javascript
// Without SOLID - Rigid
class PaymentProcessor {
  processPayment(amount, method) {
    if (method === 'credit-card') {
      // Process credit card
    } else if (method === 'paypal') {
      // Process PayPal
    }
    // Want to add crypto? Must modify this class!
  }
}

// With SOLID - Flexible
class PaymentProcessor {
  constructor(paymentMethods) {
    this.methods = paymentMethods; // Composition
  }

  process(amount, methodName) {
    const method = this.methods[methodName];
    return method.process(amount);
  }
}

// Adding crypto? Just add to configuration!
const processor = new PaymentProcessor({
  'credit-card': new CreditCardProcessor(),
  'paypal': new PayPalProcessor(),
  'crypto': new CryptoProcessor() // New! No changes needed
});
\`\`\`

### 4. Reusable ♻️

**Components can be used in different contexts**

\`\`\`javascript
// Reusable thanks to SOLID
class Logger {
  constructor(transport) {
    this.transport = transport; // Can be file, console, API, etc.
  }

  log(message) {
    this.transport.write(message);
  }
}

// Use same Logger class everywhere!
const fileLogger = new Logger(new FileTransport());
const consoleLogger = new Logger(new ConsoleTransport());
const apiLogger = new Logger(new APITransport());
\`\`\`

### 5. Scalable 📈

**Grows without becoming unmaintainable**

\`\`\`javascript
// Scalable architecture using SOLID
// Adding new features doesn't require touching old code

// Original code
class NotificationService {
  constructor(notifiers) {
    this.notifiers = notifiers;
  }

  async notify(user, message) {
    for (const notifier of this.notifiers) {
      await notifier.send(user, message);
    }
  }
}

// Start with email
const service = new NotificationService([
  new EmailNotifier()
]);

// Later: Add SMS without changing NotificationService!
const service = new NotificationService([
  new EmailNotifier(),
  new SMSNotifier()
]);

// Later: Add push notifications! Still no changes!
const service = new NotificationService([
  new EmailNotifier(),
  new SMSNotifier(),
  new PushNotifier()
]);
\`\`\`

---

## SOLID in Practice: Real Example

### Before SOLID: Monolithic Component

\`\`\`javascript
// ❌ Violates MULTIPLE SOLID principles
class UserDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      orders: [],
      notifications: [],
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    // Violates SRP - too many responsibilities
    // Violates DIP - directly coupled to axios, localStorage
    const token = localStorage.getItem('token');

    axios.get('/api/user', {
      headers: { Authorization: \`Bearer \${token}\` }
    }).then(response => {
      this.setState({ user: response.data });
    }).catch(error => {
      this.setState({ error: error.message });
    });

    axios.get('/api/orders', {
      headers: { Authorization: \`Bearer \${token}\` }
    }).then(response => {
      this.setState({ orders: response.data });
    });

    axios.get('/api/notifications', {
      headers: { Authorization: \`Bearer \${token}\` }
    }).then(response => {
      this.setState({ notifications: response.data });
    });
  }

  render() {
    // 500+ lines of complex rendering logic
    // Violates SRP - rendering AND data management
  }
}

// Problems:
// ❌ Cannot test without real API
// ❌ Cannot reuse data fetching logic
// ❌ Hard to understand (too many responsibilities)
// ❌ Hard to modify (everything coupled together)
// ❌ Cannot swap authentication method
\`\`\`

### After SOLID: Clean Architecture

\`\`\`javascript
// ✅ Follows ALL SOLID principles

// SERVICES LAYER (Dependency Inversion)
class ApiService {
  constructor(httpClient, authService) {
    this.httpClient = httpClient;
    this.authService = authService;
  }

  async get(endpoint) {
    const token = await this.authService.getToken();
    return this.httpClient.get(endpoint, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
  }
}

// CUSTOM HOOKS (Single Responsibility)
function useUserData() {
  const { api } = useServices(); // Dependency injection
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/user')
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [api]);

  return { user, loading, error };
}

function useUserOrders() {
  const { api } = useServices();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [api]);

  return { orders, loading };
}

function useNotifications() {
  const { api } = useServices();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/api/notifications').then(setNotifications);
  }, [api]);

  return { notifications };
}

// COMPONENT (Single Responsibility - only rendering)
const UserDashboard = () => {
  const { user, loading: userLoading } = useUserData();
  const { orders, loading: ordersLoading } = useUserOrders();
  const { notifications } = useNotifications();

  if (userLoading || ordersLoading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      <UserProfile user={user} />
      <OrdersList orders={orders} />
      <NotificationsList notifications={notifications} />
    </DashboardLayout>
  );
};

// Benefits:
// ✅ Easy to test (mock services)
// ✅ Reusable hooks (use anywhere)
// ✅ Clear responsibilities
// ✅ Easy to modify (change one thing)
// ✅ Can swap implementations easily
\`\`\`

---

## How SOLID Principles Work Together

The principles are interconnected:

\`\`\`
Single Responsibility Principle (SRP)
       ↓
Creates focused, cohesive modules
       ↓
Interface Segregation Principle (ISP)
       ↓
Defines clean, minimal contracts
       ↓
Liskov Substitution Principle (LSP)
       ↓
Ensures proper polymorphism
       ↓
Open/Closed Principle (OCP)
       ↓
Enables extension without modification
       ↓
Dependency Inversion Principle (DIP)
       ↓
Decouples high-level from low-level modules
       ↓
RESULT: Maintainable, Testable, Flexible Code
\`\`\`

---

## Common Misconceptions

### ❌ Myth 1: "SOLID is only for OOP languages"

**Reality:** SOLID principles apply to ALL programming paradigms:
- Functional programming
- React components and hooks
- JavaScript modules
- Microservices architecture

### ❌ Myth 2: "SOLID makes code more complex"

**Reality:**
- Initially: Slightly more verbose
- Long-term: Dramatically simpler
- Trade-off: More files, less complexity per file

### ❌ Myth 3: "SOLID is overkill for small projects"

**Reality:**
- Small projects become large projects
- Habits formed on small projects carry over
- SOLID prevents future pain

### ❌ Myth 4: "Perfect SOLID adherence is required"

**Reality:**
- SOLID principles are **guidelines**, not laws
- Use professional judgment
- Pragmatism over perfectionism
- 80/20 rule applies

---

## When to Apply SOLID

### ✅ Always Apply SOLID

- New feature development
- Major refactoring efforts
- Shared/reusable components
- Business logic layers
- Service/API layers
- Core application architecture

### 🤔 Use Judgment

- Quick prototypes (but refactor after validation)
- One-off scripts (if truly one-off)
- Configuration files
- Simple utility functions

### ❌ Don't Over-Engineer

- Trivial helper functions
- Simple data transformations
- Static content
- Prototypes for spike tests

---

## What's Coming in This Course

We'll explore each SOLID principle in depth:

### Chapter 3: Single Responsibility Principle (SRP)
- Component with 50+ state variables
- 1,405-line monster component
- How to decompose large components
- Custom hooks for separation

### Chapter 4: Open/Closed Principle (OCP)
- Duplicated error handling (50+ times!)
- How to create abstraction layers
- Axios interceptors
- Extension points

### Chapter 5: Liskov, Interface Segregation & Dependency Inversion
- Type substitutability
- Fat hooks and interfaces
- Service layer architecture
- Dependency injection in React

### Chapter 6: Putting It All Together
- Refactoring strategy
- Team adoption
- Measuring success
- Real-world action plan

**Each chapter includes:**
- ✅ Real production code violations
- ✅ Detailed problem analysis
- ✅ Step-by-step refactoring
- ✅ Before/after comparisons
- ✅ Patterns you can use today

---

## Key Takeaways

> "Clean code is not written by following a set of rules. Professionalism and craftsmanship come from values that drive disciplines."
> **— Robert C. Martin**

**Remember:**
- **SOLID** = 5 principles for professional code
- Creates: maintainable, testable, flexible, reusable, scalable software
- Principles work **together** as a system
- Apply to **all paradigms**, not just OOP
- Use **judgment** - they're guidelines

---

## Ready to Transform Your Code?

In the next chapter, we dive deep into the **Single Responsibility Principle** - the foundation of all other SOLID principles.

You'll see real violations from production codebases and learn exactly how to refactor them.

Let's begin your journey to writing professional, maintainable code!`,
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
              },
              {
                title: 'Robert C. Martin - Clean Code Book',
                type: 'link',
                url: 'https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882'
              }
            ]
          },
          {
            title: 'SOLID Principles in Modern JavaScript',
            description: 'See how SOLID principles apply specifically to JavaScript and React development',
            type: 'video',
            order: 2,
            duration: 20,
            isPublished: true,
            content: 'Explore practical examples of applying SOLID principles in modern JavaScript, React hooks, and component architecture.',
            videoUrl: 'https://www.youtube.com/embed/MSq_DCRxOxw',
            videoProvider: 'youtube'
          }
        ]
      }

      // Note: Chapters 3-6 (SRP, OCP, LSP/ISP/DIP, Summary) will be extensive
      // This seeder can be extended or split into multiple files
      // For now, we'll mark this as Part 1 and additional chapters can be added
    ],

    isPublished: true,
    isApproved: true,
    isFeatured: true,
    publishedAt: new Date('2024-01-15'),

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
    slug: solidCourse.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
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
      totalLessons: solidCourse.chapters.reduce(
        (total, chapter) => total + chapter.lessons.length,
        0
      ),
      totalQuizzes: 0,
      averageRating: 4.8,
      completionRate: 49.4,
      totalRevenue: 856 * 99.99,
      averageCompletionTime: 540 // minutes
    },
    approvedAt: new Date('2024-01-14'),
    approvedBy: instructor._id
  };

  try {
    const createdCourse = await Course.create(courseWithDefaults);
    console.log('✅ SOLID Principles course created successfully!');
    console.log(`   - Course ID: ${createdCourse._id}`);
    console.log(`   - Title: ${createdCourse.title}`);
    console.log(`   - Chapters: ${createdCourse.chapters.length}`);
    console.log(`   - Total Lessons: ${courseWithDefaults.stats.totalLessons}`);
    console.log(`   - Instructor: ${instructor.name}`);

    return createdCourse;
  } catch (error) {
    console.error('❌ Error creating SOLID Principles course:', error.message);
    throw error;
  }
};

module.exports = { seedSOLIDPrinciplesCourse };
