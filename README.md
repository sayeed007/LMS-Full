# 🎓 Learning Management System (LMS)

A comprehensive, full-stack Learning Management System built with modern technologies for educational institutions, corporate training, and online learning platforms.

## 🌟 Features

### 🎯 Core Functionality
- **User Management**: Role-based access control (Student, Instructor, Admin, Super Admin)
- **Course Management**: Create, organize, and manage courses with multimedia content
- **Article System**: Knowledge base and blog-style content management
- **Question Bank**: Comprehensive assessment and quiz management
- **Analytics & Reporting**: Detailed insights and progress tracking
- **Real-time Dashboard**: Interactive analytics and performance metrics

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **OAuth Integration**: Google Sign-in support
- **Multi-layer Security**: Rate limiting, XSS protection, CORS, data sanitization
- **Role-based Permissions**: Granular access control system

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Design System**: Consistent UI components and patterns
- **Dark/Light Mode**: User preference support (ready)
- **Intuitive Navigation**: Clean and user-friendly interface

## 🏗️ Architecture

```
LMS/
├── frontend/          # Next.js 15 + TypeScript + Tailwind CSS
│   ├── src/app/       # App Router pages
│   ├── src/components # Reusable UI components
│   ├── src/store/     # Redux Toolkit + RTK Query
│   └── src/types/     # TypeScript definitions
├── backend/           # Node.js + Express + MongoDB
│   ├── src/controllers # API request handlers
│   ├── src/models/    # MongoDB/Mongoose models
│   ├── src/routes/    # API routes
│   └── src/middleware # Custom middleware
└── docs/             # Comprehensive documentation
```

## 🚀 Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **UI Components**: Custom Design System + Shadcn/ui
- **Authentication**: JWT with Redux Persist

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + Passport.js (Google OAuth)
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Documentation**: Swagger/OpenAPI 3.0
- **File Storage**: Cloudinary integration

### Development & Deployment
- **Version Control**: Git
- **Package Management**: npm
- **Development**: Hot reload, TypeScript checking
- **Testing**: Jest + Supertest (configured)
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400/4f46e5/ffffff?text=LMS+Dashboard)
*Real-time analytics and course progress tracking*

### Course Management
![Courses](https://via.placeholder.com/800x400/059669/ffffff?text=Course+Management)
*Intuitive course creation and management interface*

### Responsive Design
![Mobile](https://via.placeholder.com/400x600/dc2626/ffffff?text=Mobile+Responsive)
*Fully responsive design for all device sizes*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/sayeed007/LMS-Full.git
cd LMS-Full
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Configure your environment variables in .env.local
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api-docs

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 Project Setup Guide](./PROJECT_SETUP.md) | Complete setup instructions with environment configuration |
| [🎨 Frontend Documentation](./frontend/README.md) | Frontend architecture, components, and development guide |
| [⚙️ Backend Documentation](./backend/README.md) | API documentation, security, and backend architecture |

## 🔧 Environment Configuration

### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/lms_development

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user

### Course Management
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/:id` - Get course details
- `PUT /api/v1/courses/:id` - Update course

### User Management
- `GET /api/v1/users` - List users (admin)
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

> 📘 **Full API Documentation**: Available at `/api-docs` when running the backend

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm run test        # Run tests
npm run build       # Production build test
npm run lint        # Code linting
```

## 🚀 Deployment

### Option 1: Vercel + Railway
```bash
# Frontend to Vercel
npx vercel --prod

# Backend to Railway
# Connect GitHub repository to Railway dashboard
```

### Option 2: Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Option 3: Traditional Server
```bash
# Install PM2
npm install -g pm2

# Deploy backend
cd backend && pm2 start src/app.js --name lms-backend

# Deploy frontend
cd frontend && npm run build && pm2 start npm --name lms-frontend -- start
```

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication and authorization
- [x] Course management system
- [x] Article management
- [x] Basic reporting and analytics
- [x] Responsive design implementation

### Phase 2: Enhanced Features 🚧
- [ ] Real-time messaging and notifications
- [ ] Advanced analytics and insights
- [ ] Payment integration (Stripe/PayPal)
- [ ] Certificate generation
- [ ] Mobile app (React Native)

### Phase 3: Enterprise Features 🔄
- [ ] Multi-tenancy support
- [ ] Advanced RBAC
- [ ] API rate limiting per user
- [ ] Microservices architecture
- [ ] Advanced caching (Redis)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Update documentation for new features
- Follow conventional commit messages

## 🐛 Bug Reports & Feature Requests

Please use [GitHub Issues](https://github.com/sayeed007/LMS-Full/issues) to:
- 🐛 Report bugs
- 💡 Request features
- 📖 Improve documentation
- ❓ Ask questions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For excellent deployment platform
- **MongoDB** - For the flexible database solution
- **Tailwind CSS** - For the utility-first CSS framework
- **Open Source Community** - For the incredible tools and libraries

## 👨‍💻 Authors

- **[Sayeed](https://github.com/sayeed007)** - *Project Creator & Lead Developer*

## 📞 Support

- 📧 **Email**: [support@lms.com](mailto:support@lms.com)
- 💬 **Discord**: [Join our community](https://discord.gg/lms)
- 📚 **Documentation**: [Full Documentation](./PROJECT_SETUP.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/sayeed007/LMS-Full/issues)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sayeed007/LMS-Full&type=Date)](https://star-history.com/#sayeed007/LMS-Full&Date)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Sayeed](https://github.com/sayeed007)

[🔗 Live Demo](https://lms-demo.vercel.app) • [📖 Documentation](./PROJECT_SETUP.md) • [🐛 Report Bug](https://github.com/sayeed007/LMS-Full/issues) • [💡 Request Feature](https://github.com/sayeed007/LMS-Full/issues)

</div>