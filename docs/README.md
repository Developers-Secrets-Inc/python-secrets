# Python Secrets

An interactive Python learning platform that enables users to master Python through structured courses, real-time code execution, and progress tracking.

## What is Python Secrets?

Python Secrets is a web-based learning platform designed to teach Python programming through interactive lessons, coding challenges, and quizzes. The platform allows users to write and execute Python code directly in their browser using two compilation engines (Pyodide for client-side execution and E2B for server-side execution), providing immediate feedback and hands-on learning experience.

The platform is built for learners at all levels, from beginners discovering Python basics to advanced users exploring complex topics like distributed systems.

## Key Features

### Learning Management System
- **Structured Curriculum**: Multi-level courses organized into chapters and lessons (Beginner, Intermediate, Advanced)
- **Progress Tracking**: Real-time monitoring of lesson completion and overall course progress
- **Solution Unlocking**: Users can unlock official solutions after completing lessons
- **Persistent State**: Code snapshots and quiz answers are saved automatically

### Interactive Code Execution
- **Dual Compiler System**:
  - **Pyodide**: Client-side Python execution (runs directly in browser, fast for simple code)
  - **E2B**: Server-side Python execution (isolated environment, supports full Python ecosystem)
- **Multi-file Support**: Execute projects with multiple files and dependencies
- **Real-time Output**: stdout, stderr, and error handling displayed immediately
- **Monaco Editor**: Professional code editing experience with syntax highlighting

### Content Types
- **Lessons**: Text-based tutorials with code examples and descriptions
- **Quizzes**: Multiple-choice questions to test understanding
- **Challenges**: Coding exercises with automated test cases and validation
- **Articles & Tutorials**: Supplementary learning materials and blog content
- **Courses**: Structured learning paths combining multiple content types

### User Engagement
- **Rating System**: 1-5 star ratings for lessons
- **Like/Dislike**: Quick feedback mechanism on content
- **Completion Tracking**: Visual progress indicators for courses and lessons
- **Optimistic UI**: Immediate feedback with background synchronization

### Content Management
- **Payload CMS Admin**: Full CRUD operations for all content
- **Rich Text Editor**: Create and edit lessons, quizzes, and articles
- **Media Management**: Upload and manage images, files, and resources
- **User Management**: Track user progress and engagement

## Tech Stack

### Frontend
- **Next.js 15.4** - React framework with App Router and Server Components
- **React 19.2** - UI library
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Monaco Editor** - Code editor component
- **Recharts** - Data visualization for progress tracking

### Backend & Database
- **Payload CMS 3.69** - Headless CMS for content management
- **PostgreSQL** - Primary database (via Supabase in production)
- **MongoDB** - Alternative database option for development
- **Better Auth 1.4** - Authentication system with email/password

### Python Execution
- **E2B Code Interpreter 2.3** - Server-side Python execution in isolated environments
- **Pyodide** - Client-side Python execution using WebAssembly

### State Management & Data Fetching
- **TanStack Query 5.90** - Server state management with caching and synchronization
- **Zustand 5.0** - Client state management
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Development & Testing
- **pnpm** - Fast, disk space efficient package manager
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint & Prettier** - Code linting and formatting

## Architecture Overview

Python Secrets follows a modern web architecture pattern:

- **Next.js App Router**: The application uses Next.js 15 with the App Router pattern, providing server components, streaming, and optimized performance
- **Route Groups**: Frontend routes are organized into `(unprotected)` and `(protected)` groups for access control, while Payload CMS resides in the `(payload)` group
- **Payload CMS**: Serves as the backend API and content management system, providing a GraphQL API and REST-like endpoints
- **Server Actions**: Custom API routes handle specific operations like progress tracking, lesson fetching, and engagement metrics
- **Dual Execution Engine**: The compiler system abstracts Pyodide and E2B behind a unified interface, allowing seamless switching between client-side and server-side execution
- **Optimistic Updates**: TanStack Query manages server state with optimistic updates, providing instant UI feedback while synchronizing with the backend

## Documentation

For detailed information about specific aspects of the project, refer to:

- **[SETUP.md](./SETUP.md)** - Development environment setup and installation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture patterns and data flow
- **[TECH_STACK.md](./TECH_STACK.md)** - Complete technology stack with version details
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - Directory structure and file organization
- **[COLLECTIONS.md](./COLLECTIONS.md)** - Database schema and Payload CMS collections
- **[API.md](./API.md)** - API routes and endpoints documentation
- **[AUTH.md](./AUTH.md)** - Authentication and authorization system
- **[COMPILERS.md](./COMPILERS.md)** - Python execution engine architecture
- **[STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)** - State management patterns with TanStack Query and Zustand
- **[CONVENTIONS.md](./CONVENTIONS.md)** - Code style and development conventions
