# LMS Frontend Documentation

## Overview
This is a comprehensive Learning Management System (LMS) frontend built with Next.js 15, React 18, TypeScript, and Tailwind CSS. It features a complete design system, Redux Toolkit for state management, and RTK Query for API integration.

## Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **State Persistence**: Redux Persist
- **UI Components**: Custom Design System + Shadcn/ui base
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── articles/                 # Articles management
│   │   │   └── page.tsx             # Articles listing with tabs
│   │   ├── courses/                  # Course management
│   │   │   ├── [id]/                # Dynamic course detail
│   │   │   │   └── page.tsx         # Course detail page
│   │   │   ├── create/              # Course creation flow
│   │   │   │   ├── courseOutline/   # Course outline builder
│   │   │   │   ├── learner/         # Learner management
│   │   │   │   ├── setting/         # Course settings
│   │   │   │   ├── layout.tsx       # Course creation layout
│   │   │   │   └── page.tsx         # Course creation entry
│   │   │   └── page.tsx             # Courses listing
│   │   ├── dashboard/               
│   │   │   └── page.tsx             # Main dashboard with analytics
│   │   ├── design-system-demo/      
│   │   │   └── page.tsx             # Design system showcase
│   │   ├── profile/                 
│   │   │   └── page.tsx             # User profile management
│   │   ├── question-bank/           # Question management
│   │   │   ├── courses/             # Course-specific questions
│   │   │   ├── create/              # Question creation
│   │   │   └── page.tsx             # Question bank listing
│   │   ├── reports/                 # Analytics and reports
│   │   │   ├── articles/            # Article analytics
│   │   │   ├── individual-course/   # Course reports
│   │   │   ├── individual-learner/  # Learner reports
│   │   │   ├── multiple-course/     # Multi-course reports
│   │   │   ├── multiple-learner/    # Multi-learner reports
│   │   │   ├── my-report/          # User's own reports
│   │   │   └── page.tsx            # Reports overview
│   │   ├── globals.css              # Global styles
│   │   ├── layout.tsx               # Root layout with providers
│   │   └── page.tsx                 # Home page
│   ├── components/                   # Reusable components
│   │   ├── articles/                # Article-specific components
│   │   │   ├── article-header.tsx   # Article page header
│   │   │   ├── articles-grid.tsx    # Article grid display
│   │   │   └── create-article-modal.tsx
│   │   ├── auth/                    # Authentication components
│   │   │   ├── LoginForm.tsx        # Login form with Redux
│   │   │   └── UserProfile.tsx      # User profile display
│   │   ├── examples/                # API usage examples
│   │   │   └── ApiExamples.tsx      # RTK Query examples
│   │   ├── layout/                  # Layout components
│   │   │   ├── header.tsx           # Main navigation header
│   │   │   └── PageLayout.tsx       # Page wrapper component
│   │   ├── profile/                 # Profile-specific components
│   │   │   ├── AuditLogTab.tsx      # Audit log display
│   │   │   ├── LogoutModal.tsx      # Logout confirmation
│   │   │   ├── ManageCategoriesTab.tsx
│   │   │   ├── NotificationSettingTab.tsx
│   │   │   └── ProfileTab.tsx       # Main profile form
│   │   ├── question-bank/           # Question bank components
│   │   │   ├── QuestionBankGrid.tsx
│   │   │   └── QuestionBankHeader.tsx
│   │   └── ui/                      # Design System Components
│   │       ├── avatar.tsx           # User avatar component
│   │       ├── badge.tsx            # Status badges
│   │       ├── button.tsx           # Primary button component
│   │       ├── card.tsx             # Card container
│   │       ├── Container.tsx        # Layout container
│   │       ├── input.tsx            # Form input
│   │       ├── NavigationLink.tsx   # Navigation links
│   │       ├── PageHeader.tsx       # Page title header
│   │       ├── SearchInput.tsx      # Search functionality
│   │       ├── select.tsx           # Dropdown select
│   │       ├── sonner.tsx           # Toast notifications
│   │       ├── TabNav.tsx           # Tab navigation
│   │       ├── textarea.tsx         # Multi-line input
│   │       └── index.ts             # Barrel exports
│   ├── lib/                         # Utility libraries
│   │   └── utils.ts                 # Common utilities (cn function)
│   ├── store/                       # Redux store configuration
│   │   ├── api/                     # RTK Query API definitions
│   │   │   ├── authApi.ts           # Authentication endpoints
│   │   │   ├── baseApi.ts           # Base API configuration
│   │   │   ├── courseApi.ts         # Course management
│   │   │   ├── enrollmentApi.ts     # Course enrollment
│   │   │   ├── organizationApi.ts   # Organization management
│   │   │   ├── uploadApi.ts         # File upload handling
│   │   │   └── userApi.ts           # User management
│   │   ├── slices/                  # Redux slices
│   │   │   └── authSlice.ts         # Authentication state
│   │   └── index.ts                 # Store configuration
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                 # Global type definitions
│   └── providers/                   # React providers
│       └── ReduxProvider.tsx        # Redux store provider
├── public/                          # Static assets
│   ├── icons/                       # Application icons
│   ├── TafuriHR_logo.png           # Company logo
│   └── Dummy_Profile.png           # Default profile image
├── .env.local                       # Environment variables
├── .gitignore                       # Git ignore rules
├── components.json                  # Shadcn/ui config
├── next.config.js                   # Next.js configuration
├── package.json                     # Dependencies
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS config
└── tsconfig.json                   # TypeScript configuration
```

## Key Features

### 1. Design System
Comprehensive component library ensuring consistency across the application:

#### Core Components
- **Container**: Responsive layout container with size variants (`sm`, `md`, `lg`, `xl`)
- **PageLayout**: Complete page wrapper with header, title, and actions
- **PageHeader**: Consistent page titles with optional action buttons
- **TabNav**: Multi-variant tab navigation (underline, pills, contained)
- **NavigationLink**: Standardized navigation links for headers
- **SearchInput**: Reusable search functionality
- **Button**: Consistent button styling with variants
- **Badge**: Status indicators and labels

#### Usage Example
```tsx
import { PageLayout, TabNav, SearchInput } from '@/components/ui';

export default function MyPage() {
  return (
    <PageLayout 
      title="Page Title" 
      actions={<Button>Create New</Button>}
    >
      <TabNav 
        tabs={tabs} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      <SearchInput 
        placeholder="Search..." 
        value={query} 
        onChange={setQuery} 
      />
    </PageLayout>
  );
}
```

### 2. State Management (Redux Toolkit + RTK Query)

#### Store Structure
```typescript
// Store configuration with persistence
const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    api: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
});
```

#### API Services
- **authApi**: Login, register, password management
- **userApi**: User CRUD operations
- **courseApi**: Course management and enrollment
- **organizationApi**: Organization management
- **uploadApi**: File upload handling

#### Usage Example
```tsx
import { useLoginMutation } from '@/store/api/authApi';

export function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  
  const handleSubmit = async (credentials) => {
    try {
      const result = await login(credentials).unwrap();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
}
```

### 3. Authentication System
Complete authentication flow with Redux persistence:

```typescript
// Auth slice with user state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Persistent auth state
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});
```

### 4. Page Implementations

#### Dashboard (`/dashboard`)
- Analytics overview with stats cards
- Course completion progress charts
- Ongoing courses carousel
- Visual data representation using SVG charts

#### Courses (`/courses`)
- Tabbed navigation (My Authoring, Assigned, All)
- Course grid with filtering
- Course creation modal
- Dynamic course details page

#### Articles (`/articles`)
- Article management with tabs
- Grid view with search functionality
- Article creation workflow

#### Question Bank (`/question-bank`)
- Question management system
- Course-specific question organization
- Question creation and editing

#### Reports (`/reports`)
- Multiple report types (individual, multiple, articles)
- Analytics dashboards
- Data visualization components

#### Profile (`/profile`)
- Multi-tab profile management
- Settings and preferences
- Audit log tracking
- Category management

### 5. Responsive Design
All pages are fully responsive with:
- Mobile-first approach
- Flexible grid layouts
- Responsive navigation
- Touch-friendly interfaces

### 6. Type Safety
Comprehensive TypeScript implementation:

```typescript
// Global type definitions
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Course {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  chapters: number;
  lessons: number;
  quizzes: number;
}
```

## Development Workflow

### 1. Adding New Pages
1. Create page in appropriate `/app` directory
2. Use `PageLayout` wrapper for consistency
3. Implement responsive design
4. Add proper TypeScript types

### 2. Creating Components
1. Add to appropriate `/components` directory
2. Follow design system patterns
3. Export from `/components/ui/index.ts` if reusable
4. Include proper TypeScript interfaces

### 3. API Integration
1. Define endpoints in appropriate API service
2. Use RTK Query hooks in components
3. Handle loading and error states
4. Update Redux state as needed

### 4. Styling Guidelines
- Use Tailwind CSS utilities
- Follow design system color palette
- Maintain consistent spacing (using design system)
- Ensure responsive design

## Build and Deployment

### Development
```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run lint     # Run ESLint
npm run type-check # TypeScript checking
```

### Environment Configuration
Key environment variables needed:
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_URL`: Frontend URL
- `NEXTAUTH_SECRET`: Authentication secret

## Performance Optimizations
- Next.js 15 App Router for optimal performance
- Component-level code splitting
- Image optimization with next/image
- Redux state persistence
- Efficient re-rendering with proper memoization

## Testing Strategy
- Component testing with Jest/React Testing Library
- API testing with MSW (Mock Service Worker)
- E2E testing setup ready
- Type checking with TypeScript

## Future Enhancements
- Dark mode support (design system ready)
- Internationalization (i18n)
- Progressive Web App (PWA) features
- Advanced analytics dashboard
- Real-time notifications
- File upload with progress tracking

This frontend provides a solid foundation for a comprehensive LMS with excellent maintainability, scalability, and user experience.