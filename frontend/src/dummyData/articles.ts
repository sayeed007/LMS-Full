// lib/data/articles.ts
import { getInitials } from "@/lib/utils"; // From your previous request
import { Article } from "@/types";

const placeholderImageURL = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL || "https://picsum.photos/300/200?random=";


// Generate 10 realistic articles
export const dummyArticles: Article[] = [
  {
    id: "1",
    title: "Mastering Human-Centered Design: A Guide for Developers",
    category: "Design",
    author: {
      name: "Sufain Huzaif",
      avatar: `${placeholderImageURL}1`,
      initials: getInitials("Sufain Huzaif"),
    },
    publishDate: "2025-04-11",
    publishTime: "10:49 AM",
    views: 125,
    thumbnail: `https://picsum.photos/300/200?random=1`,
    myArticle: true,
    isPublished: true,
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
    votes: { yes: 25, no: 2 },
    comments: [
      {
        id: 1,
        author: {
          name: "James P. Chandra",
          avatar: `${placeholderImageURL}James_P_Chandra`,
          initials: getInitials("James P. Chandra"),
        },
        date: "2025-04-12",
        time: "04:25 PM",
        content: "Great breakdown of HCD principles! The iteration section was particularly helpful.",
      },
    ],
  },
  {
    id: "2",
    title: "Database for Software Developers: SQL vs NoSQL",
    category: "SQL",
    author: {
      name: "Aisha Khan",
      avatar: `${placeholderImageURL}2`,
      initials: getInitials("Aisha Khan"),
    },
    publishDate: "2025-05-15",
    publishTime: "02:30 PM",
    views: 180,
    thumbnail: `https://picsum.photos/300/200?random=2`,
    myArticle: false,
    isPublished: false,
    content: `
      <p>Databases are the backbone of modern applications. This article compares SQL and NoSQL databases to help developers choose the right one.</p>
      <h3>SQL Databases</h3>
      <ul>
        <li><strong>Examples:</strong> PostgreSQL, MySQL</li>
        <li><strong>Best for:</strong> Structured data, complex queries.</li>
      </ul>
      <h3>NoSQL Databases</h3>
      <ul>
        <li><strong>Examples:</strong> MongoDB, Redis</li>
        <li><strong>Best for:</strong> Unstructured data, scalability.</li>
      </ul>
    `,
    votes: { yes: 30, no: 5 },
    comments: [
      {
        id: 1,
        author: {
          name: "Franklin Benjamin",
          avatar: `${placeholderImageURL}Franklin_Benjamin`,
          initials: getInitials("Franklin Benjamin"),
        },
        date: "2025-05-16",
        time: "09:15 AM",
        content: "Would love a follow-up on database security practices!",
      },
    ],
  },
  {
    id: "3",
    title: "Building Scalable APIs with TypeScript",
    category: "API Development",
    author: {
      name: "Sufain Huzaif",
      avatar: `${placeholderImageURL}3`,
      initials: getInitials("Sufain Huzaif"),
    },
    publishDate: "2025-06-01",
    publishTime: "11:00 AM",
    views: 200,
    thumbnail: `https://picsum.photos/300/200?random=3`,
    myArticle: true,
    isPublished: true,
    content: `
      <p>TypeScript enhances API development with type safety. This article covers best practices for building scalable APIs.</p>
      <h3>Key Practices</h3>
      <ul>
        <li><strong>Type Safety:</strong> Use interfaces for request/response models.</li>
        <li><strong>Middleware:</strong> Implement authentication and logging.</li>
        <li><strong>Versioning:</strong> Support API versioning for scalability.</li>
      </ul>
    `,
    votes: { yes: 40, no: 3 },
    comments: [],
  },
  {
    id: "4",
    title: "Introduction to GraphQL for Beginners",
    category: "GraphQL",
    author: {
      name: "Maria Lopez",
      avatar: `${placeholderImageURL}4`,
      initials: getInitials("Maria Lopez"),
    },
    publishDate: "2025-03-20",
    publishTime: "09:45 AM",
    views: 90,
    thumbnail: `https://picsum.photos/300/200?random=4`,
    myArticle: false,
    isPublished: true,
    content: `
      <p>GraphQL offers a flexible alternative to REST APIs. Learn how to get started with GraphQL in this beginner's guide.</p>
      <h3>Why GraphQL?</h3>
      <ul>
        <li><strong>Flexibility:</strong> Fetch only the data you need.</li>
        <li><strong>Single Endpoint:</strong> Simplifies API interactions.</li>
      </ul>
    `,
    votes: { yes: 15, no: 1 },
    comments: [
      {
        id: 1,
        author: {
          name: "Sufain Huzaif",
          avatar: `${placeholderImageURL}Sufain_Huzaif`,
          initials: getInitials("Sufain Huzaif"),
        },
        date: "2025-03-21",
        time: "03:10 PM",
        content: "Clear and concise intro to GraphQL!",
      },
    ],
  },
  {
    id: "5",
    title: "Optimizing Front-End Performance",
    category: "Web Development",
    author: {
      name: "James P. Chandra",
      avatar: `${placeholderImageURL}5`,
      initials: getInitials("James P. Chandra"),
    },
    publishDate: "2025-07-10",
    publishTime: "01:20 PM",
    views: 150,
    thumbnail: `https://picsum.photos/300/200?random=5`,
    myArticle: false,
    isPublished: true,
    content: `
      <p>Fast websites improve user experience. This article discusses techniques to optimize front-end performance.</p>
      <h3>Techniques</h3>
      <ul>
        <li><strong>Lazy Loading:</strong> Load images only when needed.</li>
        <li><strong>Minification:</strong> Reduce CSS and JS file sizes.</li>
        <li><strong>CDN Usage:</strong> Serve assets faster with a CDN.</li>
      </ul>
    `,
    votes: { yes: 35, no: 4 },
    comments: [],
  },
  {
    id: "6",
    title: "Microservices Architecture Explained",
    category: "Architecture",
    author: {
      name: "Sufain Huzaif",
      avatar: `${placeholderImageURL}6`,
      initials: getInitials("Sufain Huzaif"),
    },
    publishDate: "2025-02-15",
    publishTime: "08:30 AM",
    views: 110,
    thumbnail: `https://picsum.photos/300/200?random=6`,
    myArticle: true,
    isPublished: false,
    content: `
      <p>Microservices break applications into smaller, independent services. Learn the basics of microservices architecture.</p>
      <h3>Benefits</h3>
      <ul>
        <li><strong>Scalability:</strong> Scale individual services.</li>
        <li><strong>Flexibility:</strong> Use different tech stacks.</li>
      </ul>
    `,
    votes: { yes: 20, no: 0 },
    comments: [
      {
        id: 1,
        author: {
          name: "Aisha Khan",
          avatar: `${placeholderImageURL}Aisha_Khan`,
          initials: getInitials("Aisha Khan"),
        },
        date: "2025-02-16",
        time: "10:00 AM",
        content: "Great overview of microservices!",
      },
    ],
  },
  {
    id: "7",
    title: "Getting Started with React 18",
    category: "React",
    author: {
      name: "Franklin Benjamin",
      avatar: `${placeholderImageURL}7`,
      initials: getInitials("Franklin Benjamin"),
    },
    publishDate: "2025-01-30",
    publishTime: "04:15 PM",
    views: 220,
    thumbnail: `https://picsum.photos/300/200?random=7`,
    myArticle: false,
    isPublished: true,
    content: `
      <p>React 18 introduces new features like concurrent rendering. This guide helps you get started.</p>
      <h3>New Features</h3>
      <ul>
        <li><strong>Concurrent Rendering:</strong> Improves performance.</li>
        <li><strong>Automatic Batching:</strong> Reduces re-renders.</li>
      </ul>
    `,
    votes: { yes: 45, no: 2 },
    comments: [],
  },
  {
    id: "8",
    title: "Cloud Computing for Developers",
    category: "Cloud",
    author: {
      name: "Sufain Huzaif",
      avatar: `${placeholderImageURL}8`,
      initials: getInitials("Sufain Huzaif"),
    },
    publishDate: "2025-06-25",
    publishTime: "11:30 AM",
    views: 130,
    thumbnail: `https://picsum.photos/300/200?random=8`,
    myArticle: true,
    isPublished: true,
    content: `
      <p>Cloud computing powers modern apps. Learn how developers can leverage cloud services.</p>
      <h3>Popular Providers</h3>
      <ul>
        <li><strong>AWS:</strong> Comprehensive cloud services.</li>
        <li><strong>Azure:</strong> Strong enterprise support.</li>
        <li><strong>GCP:</strong> Great for ML workloads.</li>
      </ul>
    `,
    votes: { yes: 28, no: 3 },
    comments: [
      {
        id: 1,
        author: {
          name: "Maria Lopez",
          avatar: `${placeholderImageURL}Maria_Lopez`,
          initials: getInitials("Maria Lopez"),
        },
        date: "2025-06-26",
        time: "02:45 PM",
        content: "Thanks for covering cloud providers!",
      },
    ],
  },
  {
    id: "9",
    title: "Testing Strategies for Web Apps",
    category: "Testing",
    author: {
      name: "Aisha Khan",
      avatar: `${placeholderImageURL}9`,
      initials: getInitials("Aisha Khan"),
    },
    publishDate: "2025-04-05",
    publishTime: "03:00 PM",
    views: 95,
    thumbnail: `https://picsum.photos/300/200?random=9`,
    myArticle: false,
    isPublished: true,
    content: `
      <p>Testing ensures reliable web apps. This article covers unit, integration, and end-to-end testing.</p>
      <h3>Testing Types</h3>
      <ul>
        <li><strong>Unit Testing:</strong> Test individual components.</li>
        <li><strong>Integration Testing:</strong> Test module interactions.</li>
        <li><strong>E2E Testing:</strong> Simulate user flows.</li>
      </ul>
    `,
    votes: { yes: 22, no: 1 },
    comments: [],
  },
  {
    id: "10",
    title: "Introduction to DevOps Practices",
    category: "DevOps",
    author: {
      name: "James P. Chandra",
      avatar: `${placeholderImageURL}10`,
      initials: getInitials("James P. Chandra"),
    },
    publishDate: "2025-07-20",
    publishTime: "09:00 AM",
    views: 170,
    thumbnail: `https://picsum.photos/300/200?random=10`,
    myArticle: false,
    isPublished: true,
    content: `
      <p>DevOps bridges development and operations. Learn key practices for CI/CD and automation.</p>
      <h3>Core Practices</h3>
      <ul>
        <li><strong>CI/CD:</strong> Automate builds and deployments.</li>
        <li><strong>Monitoring:</strong> Track app performance.</li>
      </ul>
    `,
    votes: { yes: 33, no: 4 },
    comments: [
      {
        id: 1,
        author: {
          name: "Sufain Huzaif",
          avatar: `${placeholderImageURL}Sufain_Huzaif`,
          initials: getInitials("Sufain Huzaif"),
        },
        date: "2025-07-21",
        time: "11:20 AM",
        content: "Really helpful intro to DevOps!",
      },
    ],
  },
];