const Article = require('../models/Article');

const seedArticles = async (users) => {
  // Find instructors and admin for article authorship
  const instructors = users.filter(user => user.role === 'instructor');
  const admin = users.find(user => user.role === 'super_admin');
  const allAuthors = [...instructors, admin].filter(Boolean);

  // Comprehensive articles covering various topics
  const articles = [
    {
      title: "Mastering Modern JavaScript: ES6+ Features Every Developer Should Know",
      content: `
        <div class="article-content">
          <p>JavaScript has evolved significantly with ES6+ features that enhance code readability, performance, and maintainability. This comprehensive guide covers the essential features every developer should master.</p>

          <h2>Essential ES6+ Features</h2>

          <h3>1. Arrow Functions</h3>
          <p>Arrow functions provide a concise syntax and lexical scoping of <code>this</code>:</p>
          <pre><code>// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;</code></pre>

          <h3>2. Template Literals</h3>
          <p>Template literals make string interpolation and multiline strings easier:</p>
          <pre><code>const name = "JavaScript";
const version = "ES6+";
const message = \`Learning \${name} \${version} is exciting!\`;</code></pre>

          <h3>3. Destructuring Assignment</h3>
          <p>Extract values from arrays and objects with destructuring:</p>
          <pre><code>// Array destructuring
const [first, second] = [1, 2, 3];

// Object destructuring
const {name, age} = {name: "John", age: 30, city: "NYC"};</code></pre>

          <h3>4. Async/Await</h3>
          <p>Handle asynchronous operations with cleaner syntax:</p>
          <pre><code>async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}</code></pre>

          <h2>Best Practices</h2>
          <ul>
            <li>Use <code>const</code> by default, <code>let</code> when reassignment is needed</li>
            <li>Prefer arrow functions for callbacks and short functions</li>
            <li>Use destructuring for cleaner parameter handling</li>
            <li>Implement proper error handling with async/await</li>
          </ul>

          <p>These modern JavaScript features significantly improve code quality and developer experience. Start incorporating them into your projects today!</p>
        </div>
      `,
      category: "Programming",
      tags: ["javascript", "es6", "modern-js", "programming", "web-development"],
      thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800",
      author: instructors.find(i => i.email === 'john.doe@lms.com')?._id || allAuthors[0]._id,
      status: "published",
      visibility: 'public',
      views: Math.floor(Math.random() * 200) + 50,
      likes: Math.floor(Math.random() * 40) + 10,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      readTime: 8
    },

    {
      title: "Building Scalable Node.js Applications: Architecture and Best Practices",
      content: `
        <div class="article-content">
          <p>Creating scalable Node.js applications requires careful consideration of architecture, design patterns, and best practices. This guide covers essential strategies for building robust server-side applications.</p>

          <h2>Application Architecture</h2>

          <h3>Layered Architecture</h3>
          <p>Organize your application into distinct layers:</p>
          <ul>
            <li><strong>Route Layer:</strong> Handle HTTP requests and responses</li>
            <li><strong>Service Layer:</strong> Business logic implementation</li>
            <li><strong>Data Access Layer:</strong> Database operations and queries</li>
            <li><strong>Model Layer:</strong> Data structure definitions</li>
          </ul>

          <h3>Middleware Pattern</h3>
          <p>Express middleware enables modular request processing:</p>
          <pre><code>// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token logic
  next();
};

// Usage
app.use('/api/protected', authenticate);
app.get('/api/protected/data', (req, res) => {
  res.json({ message: 'Protected data' });
});</code></pre>

          <h2>Performance Optimization</h2>

          <h3>Database Optimization</h3>
          <ul>
            <li>Implement proper indexing strategies</li>
            <li>Use connection pooling</li>
            <li>Implement query result caching</li>
            <li>Consider database sharding for large datasets</li>
          </ul>

          <h3>Caching Strategies</h3>
          <pre><code>const redis = require('redis');
const client = redis.createClient();

// Cache frequently accessed data
const getCachedData = async (key) => {
  const cached = await client.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await fetchFromDatabase(key);
  await client.setex(key, 3600, JSON.stringify(data));
  return data;
};</code></pre>

          <h2>Security Best Practices</h2>
          <ul>
            <li>Input validation and sanitization</li>
            <li>Rate limiting and DDoS protection</li>
            <li>Secure HTTP headers with Helmet</li>
            <li>Environment variable protection</li>
            <li>Regular security audits</li>
          </ul>

          <p>Following these patterns and practices will help you build Node.js applications that can scale efficiently and maintain high performance under load.</p>
        </div>
      `,
      category: "Backend Development",
      tags: ["nodejs", "express", "scalability", "architecture", "backend"],
      thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
      author: instructors.find(i => i.email === 'john.doe@lms.com')?._id || allAuthors[0]._id,
      status: "published",
      visibility: 'public',
      views: Math.floor(Math.random() * 150) + 40,
      likes: Math.floor(Math.random() * 30) + 8,
      publishedAt: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
      readTime: 12
    },

    {
      title: "Machine Learning Fundamentals: Understanding Algorithms and Applications",
      content: `
        <div class="article-content">
          <p>Machine Learning is transforming industries and creating new possibilities in technology. This comprehensive guide introduces fundamental concepts, algorithms, and practical applications.</p>

          <h2>Types of Machine Learning</h2>

          <h3>Supervised Learning</h3>
          <p>Uses labeled training data to make predictions on new data:</p>
          <ul>
            <li><strong>Classification:</strong> Predicting categories (email spam detection)</li>
            <li><strong>Regression:</strong> Predicting continuous values (house prices)</li>
          </ul>

          <h3>Unsupervised Learning</h3>
          <p>Finds patterns in data without labeled examples:</p>
          <ul>
            <li><strong>Clustering:</strong> Grouping similar data points</li>
            <li><strong>Dimensionality Reduction:</strong> Simplifying complex datasets</li>
          </ul>

          <h3>Reinforcement Learning</h3>
          <p>Learns through interaction with an environment using rewards and penalties.</p>

          <h2>Popular Algorithms</h2>

          <h3>Linear Regression</h3>
          <p>Simple yet powerful algorithm for regression tasks:</p>
          <pre><code>from sklearn.linear_model import LinearRegression
import numpy as np

# Training data
X = np.array([[1], [2], [3], [4]])
y = np.array([2, 4, 6, 8])

# Create and train model
model = LinearRegression()
model.fit(X, y)

# Make prediction
prediction = model.predict([[5]])
print(f"Prediction for input 5: {prediction[0]}")  # Output: 10</code></pre>

          <h3>Decision Trees</h3>
          <p>Tree-like models for both classification and regression:</p>
          <pre><code>from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import load_iris

# Load dataset
iris = load_iris()
X, y = iris.data, iris.target

# Train model
clf = DecisionTreeClassifier()
clf.fit(X, y)

# Make predictions
predictions = clf.predict(X[:5])
print(f"Predictions: {predictions}")
print(f"Actual: {y[:5]}")</code></pre>

          <h2>Real-World Applications</h2>

          <table>
            <tr>
              <th>Industry</th>
              <th>Application</th>
              <th>ML Type</th>
            </tr>
            <tr>
              <td>Healthcare</td>
              <td>Disease Diagnosis</td>
              <td>Classification</td>
            </tr>
            <tr>
              <td>Finance</td>
              <td>Fraud Detection</td>
              <td>Anomaly Detection</td>
            </tr>
            <tr>
              <td>E-commerce</td>
              <td>Recommendation Systems</td>
              <td>Collaborative Filtering</td>
            </tr>
            <tr>
              <td>Transportation</td>
              <td>Autonomous Vehicles</td>
              <td>Deep Learning</td>
            </tr>
          </table>

          <h2>Getting Started</h2>
          <ol>
            <li>Learn Python and basic statistics</li>
            <li>Practice with datasets from Kaggle</li>
            <li>Study scikit-learn documentation</li>
            <li>Build projects to gain hands-on experience</li>
            <li>Explore deep learning with TensorFlow or PyTorch</li>
          </ol>

          <p>Machine Learning offers endless possibilities for innovation. Start with simple algorithms and gradually work your way up to more complex models as you gain experience.</p>
        </div>
      `,
      category: "Data Science",
      tags: ["machine-learning", "python", "data-science", "algorithms", "ai"],
      thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800",
      author: instructors.find(i => i.email === 'sarah.wilson@lms.com')?._id || allAuthors[1]._id,
      status: "published",
      visibility: 'public',
      views: Math.floor(Math.random() * 300) + 100,
      likes: Math.floor(Math.random() * 60) + 20,
      publishedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      readTime: 15
    },

    {
      title: "UI/UX Design Principles: Creating Intuitive User Experiences",
      content: `
        <div class="article-content">
          <p>Great design is invisible. It guides users naturally through interfaces while solving their problems efficiently. This guide covers essential principles for creating exceptional user experiences.</p>

          <h2>Fundamental Design Principles</h2>

          <h3>1. Hierarchy and Visual Weight</h3>
          <p>Guide user attention through purposeful arrangement:</p>
          <ul>
            <li><strong>Size:</strong> Larger elements draw more attention</li>
            <li><strong>Color:</strong> High contrast creates emphasis</li>
            <li><strong>Position:</strong> Top-left gets noticed first in Western cultures</li>
            <li><strong>Typography:</strong> Font weight and style indicate importance</li>
          </ul>

          <h3>2. Consistency and Standards</h3>
          <p>Maintain consistency across your interface:</p>
          <ul>
            <li>Use consistent color schemes and typography</li>
            <li>Follow established UI patterns and conventions</li>
            <li>Create and maintain a design system</li>
            <li>Ensure consistent interaction patterns</li>
          </ul>

          <h2>User Experience Principles</h2>

          <h3>User-Centered Design Process</h3>
          <ol>
            <li><strong>Research:</strong> Understand your users' needs and pain points</li>
            <li><strong>Define:</strong> Create user personas and journey maps</li>
            <li><strong>Ideate:</strong> Generate multiple solution concepts</li>
            <li><strong>Prototype:</strong> Build testable versions of your ideas</li>
            <li><strong>Test:</strong> Validate designs with real users</li>
            <li><strong>Iterate:</strong> Refine based on feedback and data</li>
          </ol>

          <h3>Accessibility First</h3>
          <p>Design for all users, including those with disabilities:</p>
          <ul>
            <li>Ensure sufficient color contrast (WCAG guidelines)</li>
            <li>Provide alt text for images and icons</li>
            <li>Design for keyboard navigation</li>
            <li>Use semantic HTML structure</li>
            <li>Test with screen readers</li>
          </ul>

          <h2>Modern Design Trends</h2>

          <h3>Minimalism and White Space</h3>
          <p>Less is more in modern interface design:</p>
          <ul>
            <li>Remove unnecessary elements and clutter</li>
            <li>Use white space to improve readability</li>
            <li>Focus on essential functionality</li>
            <li>Create breathing room around important elements</li>
          </ul>

          <h3>Mobile-First Design</h3>
          <p>Start with mobile constraints, then scale up:</p>
          <pre><code>/* Mobile-first CSS approach */
.container {
  padding: 1rem;
  font-size: 16px;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    font-size: 18px;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    padding: 3rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}</code></pre>

          <h2>Design Tools and Workflow</h2>

          <h3>Essential Tools</h3>
          <ul>
            <li><strong>Figma:</strong> Collaborative interface design</li>
            <li><strong>Adobe XD:</strong> Comprehensive design and prototyping</li>
            <li><strong>Sketch:</strong> Mac-based design tool</li>
            <li><strong>Principle:</strong> Advanced interaction prototyping</li>
          </ul>

          <h3>Design System Components</h3>
          <ul>
            <li>Color palettes and typography scales</li>
            <li>Button states and form elements</li>
            <li>Icon libraries and illustration styles</li>
            <li>Layout grids and spacing systems</li>
          </ul>

          <p>Great design solves problems elegantly while delighting users. Focus on understanding your users, maintaining consistency, and continuously iterating based on feedback and data.</p>
        </div>
      `,
      category: "Design",
      tags: ["ui-design", "ux-design", "design-principles", "user-experience", "interface"],
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
      author: instructors.find(i => i.email === 'michael.chen@lms.com')?._id || allAuthors[2]._id,
      status: "published",
      visibility: 'public',
      views: Math.floor(Math.random() * 180) + 70,
      likes: Math.floor(Math.random() * 35) + 15,
      publishedAt: new Date(Date.now() - Math.random() * 35 * 24 * 60 * 60 * 1000),
      readTime: 10
    },

    {
      title: "Cybersecurity Essentials: Protecting Applications in the Digital Age",
      content: `
        <div class="article-content">
          <p>In today's interconnected world, cybersecurity is not optional—it's essential. This comprehensive guide covers fundamental security principles and practical implementation strategies for developers.</p>

          <h2>Core Security Principles</h2>

          <h3>The CIA Triad</h3>
          <ul>
            <li><strong>Confidentiality:</strong> Information is accessible only to authorized users</li>
            <li><strong>Integrity:</strong> Data remains accurate and unaltered</li>
            <li><strong>Availability:</strong> Systems and data are accessible when needed</li>
          </ul>

          <h3>Defense in Depth</h3>
          <p>Implement multiple layers of security controls:</p>
          <ul>
            <li>Network security (firewalls, IDS/IPS)</li>
            <li>Application security (input validation, authentication)</li>
            <li>Data security (encryption, access controls)</li>
            <li>Physical security (secure facilities, device management)</li>
          </ul>

          <h2>Common Web Application Vulnerabilities</h2>

          <h3>1. SQL Injection</h3>
          <p>Prevent SQL injection with parameterized queries:</p>
          <pre><code>// Vulnerable code
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// Secure code using parameterized queries
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId], (err, results) => {
  // Handle results
});</code></pre>

          <h3>2. Cross-Site Scripting (XSS)</h3>
          <p>Sanitize user input and use Content Security Policy:</p>
          <pre><code>// Server-side input sanitization
const DOMPurify = require('dompurify');
const cleanInput = DOMPurify.sanitize(userInput);

// CSP header
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );
  next();
});</code></pre>

          <h3>3. Authentication and Session Management</h3>
          <p>Implement secure authentication practices:</p>
          <pre><code>const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Password hashing
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// JWT token generation
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};</code></pre>

          <h2>Security Best Practices</h2>

          <h3>Secure Development Lifecycle</h3>
          <ol>
            <li><strong>Planning:</strong> Include security requirements</li>
            <li><strong>Design:</strong> Threat modeling and risk assessment</li>
            <li><strong>Implementation:</strong> Secure coding practices</li>
            <li><strong>Testing:</strong> Security testing and code review</li>
            <li><strong>Deployment:</strong> Secure configuration management</li>
            <li><strong>Maintenance:</strong> Regular updates and monitoring</li>
          </ol>

          <h3>API Security</h3>
          <ul>
            <li>Use HTTPS for all communications</li>
            <li>Implement proper authentication (OAuth 2.0, JWT)</li>
            <li>Rate limiting and throttling</li>
            <li>Input validation and output encoding</li>
            <li>API versioning and deprecation strategies</li>
          </ul>

          <h2>Incident Response and Recovery</h2>

          <h3>Incident Response Plan</h3>
          <ol>
            <li><strong>Preparation:</strong> Establish response team and procedures</li>
            <li><strong>Detection:</strong> Monitor and identify security incidents</li>
            <li><strong>Containment:</strong> Isolate and limit damage</li>
            <li><strong>Eradication:</strong> Remove threats from systems</li>
            <li><strong>Recovery:</strong> Restore normal operations</li>
            <li><strong>Lessons Learned:</strong> Analyze and improve processes</li>
          </ol>

          <h3>Business Continuity</h3>
          <ul>
            <li>Regular data backups and recovery testing</li>
            <li>Redundant systems and failover procedures</li>
            <li>Communication plans for stakeholders</li>
            <li>Regular training and tabletop exercises</li>
          </ul>

          <p>Cybersecurity is an ongoing process, not a one-time implementation. Stay informed about emerging threats, regularly update your defenses, and foster a security-conscious culture within your organization.</p>
        </div>
      `,
      category: "Security",
      tags: ["cybersecurity", "security", "web-security", "ethical-hacking", "data-protection"],
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
      author: instructors.find(i => i.email === 'emily.rodriguez@lms.com')?._id || allAuthors[3]._id,
      status: "published",
      visibility: 'public',
      views: Math.floor(Math.random() * 250) + 80,
      likes: Math.floor(Math.random() * 45) + 18,
      publishedAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
      readTime: 18
    },

    {
      title: "The Future of Web Development: Trends and Technologies to Watch",
      content: `
        <div class="article-content">
          <p>Web development is evolving rapidly with new technologies, frameworks, and paradigms emerging regularly. This article explores current trends and future directions that will shape the industry.</p>

          <h2>Frontend Evolution</h2>

          <h3>Component-Based Architecture</h3>
          <p>Modern frameworks embrace modular, reusable components:</p>
          <ul>
            <li><strong>React:</strong> Virtual DOM and hooks ecosystem</li>
            <li><strong>Vue 3:</strong> Composition API and improved TypeScript support</li>
            <li><strong>Svelte:</strong> Compile-time optimizations</li>
            <li><strong>Web Components:</strong> Native browser support for custom elements</li>
          </ul>

          <h3>JAMstack Architecture</h3>
          <p>JavaScript, APIs, and Markup for faster, more secure sites:</p>
          <pre><code>// Next.js static generation example
export async function getStaticProps() {
  const posts = await fetchPosts();

  return {
    props: { posts },
    revalidate: 60 // ISR: revalidate every 60 seconds
  };
}

export default function Blog({ posts }) {
  return (
    <div>
      {posts.map(post => (
        <BlogPost key={post.id} post={post} />
      ))}
    </div>
  );
}</code></pre>

          <h2>Backend Innovations</h2>

          <h3>Serverless Computing</h3>
          <p>Function-as-a-Service platforms reduce operational overhead:</p>
          <pre><code>// AWS Lambda function example
exports.handler = async (event) => {
  const { name } = JSON.parse(event.body);

  // Process the request
  const result = await processUserData(name);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(result)
  };
};</code></pre>

          <h3>Edge Computing</h3>
          <p>Bring computation closer to users for reduced latency:</p>
          <ul>
            <li>CDN edge functions (Cloudflare Workers, Vercel Edge Functions)</li>
            <li>Edge databases and caching strategies</li>
            <li>Geographic load balancing</li>
            <li>Progressive Web Apps with offline functionality</li>
          </ul>

          <h2>Emerging Technologies</h2>

          <h3>WebAssembly (WASM)</h3>
          <p>Near-native performance in web browsers:</p>
          <ul>
            <li>Port existing C/C++/Rust applications to the web</li>
            <li>CPU-intensive tasks (image processing, games)</li>
            <li>Cryptography and security applications</li>
            <li>Language diversity beyond JavaScript</li>
          </ul>

          <h3>Progressive Web Apps (PWAs)</h3>
          <p>Bridge the gap between web and native apps:</p>
          <pre><code>// Service worker for offline functionality
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});</code></pre>

          <h2>Development Tools and Practices</h2>

          <h3>AI-Assisted Development</h3>
          <ul>
            <li><strong>GitHub Copilot:</strong> AI pair programming</li>
            <li><strong>Code Generation:</strong> Automated boilerplate creation</li>
            <li><strong>Testing:</strong> AI-generated test cases</li>
            <li><strong>Debugging:</strong> Intelligent error diagnosis</li>
          </ul>

          <h3>Low-Code/No-Code Platforms</h3>
          <p>Democratizing application development:</p>
          <ul>
            <li>Visual development environments</li>
            <li>Drag-and-drop interface builders</li>
            <li>Automated deployment and scaling</li>
            <li>Integration with traditional development workflows</li>
          </ul>

          <h2>Performance and Optimization</h2>

          <h3>Core Web Vitals</h3>
          <p>Google's metrics for user experience:</p>
          <ul>
            <li><strong>LCP (Largest Contentful Paint):</strong> Loading performance</li>
            <li><strong>FID (First Input Delay):</strong> Interactivity</li>
            <li><strong>CLS (Cumulative Layout Shift):</strong> Visual stability</li>
          </ul>

          <h3>Modern Build Tools</h3>
          <pre><code>// Vite configuration for fast development
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
});</code></pre>

          <p>The future of web development is exciting and full of opportunities. Stay curious, continue learning, and adapt to new technologies while focusing on creating great user experiences.</p>
        </div>
      `,
      category: "Web Development",
      tags: ["web-development", "frontend", "backend", "trends", "future-tech"],
      thumbnail: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800",
      author: admin?._id || allAuthors[0]._id,
      status: "published",
      visibility: 'public',
      views: Math.floor(Math.random() * 400) + 150,
      likes: Math.floor(Math.random() * 70) + 30,
      publishedAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000),
      readTime: 20,
      featured: true
    },

    // A few draft articles
    {
      title: "Advanced React Patterns: Render Props, HOCs, and Custom Hooks",
      content: `
        <div class="article-content">
          <p>This article is currently being written and will cover advanced React patterns including render props, higher-order components, and custom hooks.</p>
          <p>Coming soon...</p>
        </div>
      `,
      category: "Frontend Development",
      tags: ["react", "patterns", "advanced", "hooks"],
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      author: instructors.find(i => i.email === 'michael.chen@lms.com')?._id || allAuthors[2]._id,
      status: "draft",
      visibility: 'private',
      views: 0,
      likes: 0,
      readTime: 0
    },

    {
      title: "Database Performance Tuning: From Basics to Advanced Techniques",
      content: `
        <div class="article-content">
          <p>This comprehensive guide on database performance optimization is currently in progress.</p>
          <p>Topics to be covered:</p>
          <ul>
            <li>Query optimization strategies</li>
            <li>Index design and maintenance</li>
            <li>Database normalization vs denormalization</li>
            <li>Partitioning and sharding</li>
          </ul>
        </div>
      `,
      category: "Database",
      tags: ["database", "performance", "optimization", "sql"],
      thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
      author: instructors.find(i => i.email === 'john.doe@lms.com')?._id || allAuthors[0]._id,
      status: "draft",
      visibility: 'private',
      views: 0,
      likes: 0,
      readTime: 0
    }
  ];

  // Add metadata to all articles
  const articlesWithDefaults = articles.map(article => ({
    ...article,
    slug: article.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    createdAt: article.publishedAt || new Date(),
    updatedAt: new Date(),
    commentsEnabled: true,
    seoTitle: article.title,
    seoDescription: article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...',
    featured: article.featured || false
  }));

  const createdArticles = await Article.insertMany(articlesWithDefaults);

  // Update user stats for authors
  const User = require('../models/User');
  for (const author of allAuthors) {
    const articleCount = createdArticles.filter(article =>
      article.author.toString() === author._id.toString()
    ).length;

    if (articleCount > 0) {
      await User.findByIdAndUpdate(author._id, {
        $inc: { 'stats.articlesPublished': articleCount }
      });
    }
  }

  return createdArticles;
};

module.exports = { seedArticles };