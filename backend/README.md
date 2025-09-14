# LMS Backend Documentation

## Overview
This is a comprehensive Learning Management System (LMS) backend API built with Node.js, Express.js, MongoDB, and various security and authentication middleware. It provides a robust RESTful API with JWT authentication, OAuth integration, comprehensive user management, course management, and advanced security features.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js (Google OAuth, Local Strategy)
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Documentation**: Swagger/OpenAPI 3.0
- **File Upload**: Multer, Cloudinary
- **Session Management**: Express Session with MongoDB Store
- **Email**: Nodemailer
- **Testing**: Jest, Supertest

## Project Structure

```
backend/
├── src/
│   ├── app.js                        # Main application file
│   ├── config/
│   │   └── passport.js              # Passport strategies configuration
│   ├── controllers/                 # Request handlers
│   │   ├── authController.js        # Authentication logic
│   │   └── courseController.js      # Course management logic
│   ├── middleware/                  # Custom middleware
│   │   ├── auth.js                  # Authentication middleware
│   │   └── errorHandler.js          # Global error handling
│   ├── models/                      # Mongoose models
│   │   ├── User.js                  # User schema and methods
│   │   ├── Course.js                # Course schema
│   │   └── Organization.js          # Organization schema
│   ├── routes/                      # API routes
│   │   ├── authRoutes.js            # Authentication routes
│   │   ├── courseRoutes.js          # Course management routes
│   │   ├── userRoutes.js            # User management routes
│   │   ├── quizRoutes.js            # Quiz/assessment routes
│   │   ├── articleRoutes.js         # Article management routes
│   │   ├── organizationRoutes.js    # Organization routes
│   │   └── uploadRoutes.js          # File upload routes
│   └── utils/                       # Utility functions
│       ├── appError.js              # Custom error class
│       └── catchAsync.js            # Async error handler
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── package.json                     # Dependencies and scripts
└── README.md                        # This file
```

## Key Features

### 1. Authentication System
Comprehensive authentication with multiple strategies:

#### JWT-based Authentication
```javascript
// Token generation with refresh token support
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Refresh token for extended sessions
const signRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};
```

#### OAuth Integration
- **Google OAuth 2.0**: Complete Google sign-in flow
- **Passport.js Strategies**: Local and Google authentication
- **Session Management**: MongoDB-backed sessions

#### Security Features
- Password hashing with bcrypt (configurable salt rounds)
- Account lockout after failed login attempts
- Email verification tokens
- Password reset functionality (placeholder implementation)
- Two-factor authentication support (schema ready)

### 2. User Management System

#### Comprehensive User Model
```javascript
// User roles and permissions
role: {
  type: String,
  enum: ['student', 'instructor', 'org_admin', 'super_admin'],
  default: 'student'
}

// Subscription management
subscription: {
  plan: { enum: ['free', 'basic', 'premium', 'enterprise'] },
  features: {
    maxCourses: Number,
    maxStudents: Number,
    maxStorage: Number,
    analyticsAccess: Boolean,
    customBranding: Boolean,
    prioritySupport: Boolean
  }
}
```

#### Learning Progress Tracking
```javascript
// Detailed progress tracking per course
learningProgress: [{
  courseId: ObjectId,
  completedLessons: [{
    lessonId: ObjectId,
    completedAt: Date,
    timeSpent: Number
  }],
  progressPercentage: Number,
  totalTimeSpent: Number,
  certificateIssued: Boolean,
  grade: Number,
  status: ['enrolled', 'in-progress', 'completed', 'dropped']
}]
```

#### User Features
- Profile management with social links
- Skills and interests tracking
- Address and contact information
- Notification preferences
- Theme and language preferences
- Activity tracking and analytics

### 3. Security Implementation

#### Multiple Security Layers
```javascript
// Rate limiting
const limiter = rateLimit({
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again later.',
});

// Security middleware stack
app.use(helmet());                    // Security headers
app.use(mongoSanitize());            // NoSQL injection prevention
app.use(xss());                      // XSS protection
app.use(hpp({ whitelist: [...] }));  // Parameter pollution prevention
```

#### CORS Configuration
```javascript
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
```

### 4. API Architecture

#### RESTful API Design
- **Versioned APIs**: `/api/v1/` structure
- **Consistent Response Format**: Standardized JSON responses
- **Error Handling**: Centralized error management
- **Validation**: Express-validator for input validation

#### API Endpoints Structure
```
/api/v1/
├── auth/                    # Authentication endpoints
│   ├── POST /signup         # User registration
│   ├── POST /login          # User login
│   ├── POST /logout         # User logout
│   ├── POST /refresh        # Token refresh
│   ├── GET /me             # Get current user
│   ├── PATCH /profile      # Update profile
│   ├── PATCH /password     # Change password
│   └── GET /google         # Google OAuth
├── courses/                # Course management
├── users/                  # User administration
├── quizzes/               # Assessment system
├── articles/              # Article management
├── organizations/         # Organization management
└── upload/                # File upload handling
```

#### Response Format
```javascript
// Success response
{
  "status": "success",
  "data": {
    "user": { ... }
  },
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here"
}

// Error response
{
  "status": "error",
  "message": "Detailed error message",
  "stack": "Error stack trace (development only)"
}
```

### 5. Database Design

#### MongoDB with Mongoose
- **Schema Validation**: Comprehensive data validation
- **Indexes**: Optimized queries with strategic indexing
- **Relationships**: Proper referencing between collections
- **Virtuals**: Computed properties and relationships

#### Key Models
```javascript
// User Model Features
- Authentication (local + OAuth)
- Profile management
- Learning progress tracking
- Subscription management
- Activity monitoring
- Security features (account locking, 2FA ready)

// Course Model (placeholder for future implementation)
// Organization Model (multi-tenancy support)
```

### 6. Middleware System

#### Authentication Middleware
```javascript
// JWT verification middleware
const protect = catchAsync(async (req, res, next) => {
  // Extract and verify JWT token
  // Attach user to request object
  // Handle expired/invalid tokens
});
```

#### Error Handling
```javascript
// Global error handler with environment-aware responses
const globalErrorHandler = (err, req, res, next) => {
  // Production vs Development error responses
  // Proper HTTP status codes
  // Detailed logging for debugging
};
```

### 7. File Upload & Cloud Storage

#### Multer + Cloudinary Integration
- Secure file upload handling
- Cloud storage with Cloudinary
- Image optimization and transformation
- File type and size validation

### 8. API Documentation

#### Swagger/OpenAPI 3.0
```javascript
// Automatic API documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS API Documentation',
      version: '1.0.0',
      description: 'Comprehensive API documentation for Learning Management System',
    },
    servers: [{ url: '/api/v1', description: 'Development server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/models/*.js'],
};
```

Access documentation at: `http://localhost:5000/api-docs`

## Environment Configuration

### Required Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/lms_development
MONGODB_TEST_URI=mongodb://localhost:27017/lms_test

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=development
API_VERSION=v1

# CORS & Frontend
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=12
SESSION_SECRET=your_session_secret_here
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# OAuth (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Swagger Documentation
SWAGGER_TITLE=LMS API Documentation
SWAGGER_VERSION=1.0.0
SWAGGER_DESCRIPTION=Comprehensive API documentation for Learning Management System
```

## API Usage Examples

### Authentication Flow
```javascript
// 1. User Registration
POST /api/v1/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "confirmPassword": "securePassword123",
  "role": "student"
}

// 2. User Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

// 3. Access Protected Routes
GET /api/v1/auth/me
Authorization: Bearer your_jwt_token_here

// 4. Refresh Token
POST /api/v1/auth/refresh
{
  "refreshToken": "your_refresh_token_here"
}
```

### Profile Management
```javascript
// Update User Profile
PATCH /api/v1/auth/profile
Authorization: Bearer your_jwt_token_here
{
  "name": "John Smith",
  "bio": "Passionate learner and educator",
  "skills": ["JavaScript", "Python", "Teaching"],
  "socialLinks": {
    "linkedin": "https://linkedin.com/in/johnsmith",
    "twitter": "https://twitter.com/johnsmith"
  }
}

// Change Password
PATCH /api/v1/auth/password
Authorization: Bearer your_jwt_token_here
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456",
  "confirmPassword": "newSecurePassword456"
}
```

## Development Workflow

### 1. Development Setup
```bash
npm install              # Install dependencies
npm run dev             # Start development server with nodemon
npm test               # Run test suite
npm run seed           # Seed database with sample data
```

### 2. Database Management
```javascript
// Database connection with error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.NODE_ENV === 'test'
      ? process.env.MONGODB_TEST_URI
      : process.env.MONGODB_URI;

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};
```

### 3. Error Handling Strategy
```javascript
// Custom error handling with proper HTTP status codes
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
```

## Testing Strategy

### Test Configuration
- **Framework**: Jest for unit and integration testing
- **API Testing**: Supertest for HTTP endpoint testing
- **Database**: Separate test database for isolated testing
- **Coverage**: Comprehensive test coverage tracking

### Testing Examples
```javascript
// Example test structure
describe('Authentication', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/signup', () => {
    test('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.user.email).toBe(userData.email);
    });
  });
});
```

## Performance Optimizations

### 1. Database Optimization
- Strategic indexing on frequently queried fields
- Efficient query patterns with proper population
- Connection pooling and management

### 2. Security Performance
- Rate limiting to prevent abuse
- Efficient session storage with MongoDB
- Optimized JWT token validation

### 3. API Performance
- Response compression
- Request/response size limits
- Efficient error handling without stack traces in production

## Deployment Considerations

### Production Configuration
```javascript
// Environment-specific configurations
if (process.env.NODE_ENV === 'production') {
  // Enable trust proxy for load balancers
  app.set('trust proxy', 1);
  
  // Secure cookie settings
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict'
  }
  
  // Disable detailed error messages
  // Enable comprehensive logging
}
```

### Health Monitoring
```javascript
// Health check endpoint for monitoring
GET /health
{
  "status": "success",
  "message": "Server is running smoothly",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production",
  "version": "v1"
}
```

## Future Enhancements

### Planned Features
1. **Real-time Features**: Socket.io integration for live messaging
2. **Advanced Analytics**: Detailed learning analytics and reporting
3. **Payment Integration**: Stripe/PayPal for course purchases
4. **Email Templates**: Rich HTML email templates
5. **Advanced Search**: Elasticsearch integration
6. **Caching Layer**: Redis for performance optimization
7. **Microservices**: Service-oriented architecture migration
8. **GraphQL**: Alternative API query language support

### Security Enhancements
1. **Advanced 2FA**: TOTP and SMS-based authentication
2. **API Rate Limiting**: More sophisticated rate limiting strategies
3. **Audit Logging**: Comprehensive activity logging
4. **RBAC**: Advanced role-based access control

This backend provides a solid, secure, and scalable foundation for a comprehensive Learning Management System with excellent maintainability and extensibility.