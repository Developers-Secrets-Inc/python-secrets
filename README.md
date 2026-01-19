# Python Secrets

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4-black)
![Payload](https://img.shields.io/badge/Payload-3.69-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Status](https://img.shields.io/badge/status-active--development-yellow)

An interactive Python learning platform that enables users to master Python through structured courses, real-time code execution, and comprehensive progress tracking.

## Overview

Python Secrets is a web-based educational platform designed to teach Python programming through interactive lessons, coding challenges, and quizzes. Users can write and execute Python code directly in their browser using two compilation engines (Pyodide for client-side execution and E2B for server-side execution), providing immediate feedback and a hands-on learning experience.

Built for learners at all levels, from beginners discovering Python basics to advanced users exploring complex topics like distributed systems.

## Features

### 🎓 Learning Management System
- **Structured Curriculum**: Multi-level courses organized into chapters and lessons (Beginner, Intermediate, Advanced)
- **Progress Tracking**: Real-time monitoring of lesson completion and overall course progress
- **Solution Unlocking**: Users can unlock official solutions after completing lessons
- **Persistent State**: Code snapshots and quiz answers are saved automatically

### 💻 Interactive Code Execution
- **Dual Compiler System**:
  - **Pyodide**: Client-side Python execution (runs directly in browser, fast for simple code)
  - **E2B**: Server-side Python execution (isolated environment, supports full Python ecosystem)
- **Multi-file Support**: Execute projects with multiple files and dependencies
- **Real-time Output**: stdout, stderr, and error handling displayed immediately
- **Monaco Editor**: Professional code editing experience with syntax highlighting

### 📚 Content Types
- **Lessons**: Text-based tutorials with code examples and descriptions
- **Quizzes**: Multiple-choice questions to test understanding
- **Challenges**: Coding exercises with automated test cases and validation
- **Articles & Tutorials**: Supplementary learning materials and blog content

### 👥 User Engagement
- **Rating System**: 1-5 star ratings for lessons
- **Like/Dislike**: Quick feedback mechanism on content
- **Completion Tracking**: Visual progress indicators for courses and lessons
- **Optimistic UI**: Immediate feedback with background synchronization

### ⚙️ Content Management
- **Payload CMS Admin**: Full CRUD operations for all content
- **Rich Text Editor**: Create and edit lessons, quizzes, and articles
- **Media Management**: Upload and manage images, files, and resources
- **User Management**: Track user progress and engagement

## Tech Stack

### Frontend
- **Next.js 15.4** - React framework with App Router and Server Components
- **React 19.2** - UI library
- **TypeScript 5.7** - Type safety and better developer experience
- **Tailwind CSS v4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Monaco Editor** - Professional code editor
- **Recharts** - Data visualization

### Backend & Database
- **Payload CMS 3.69** - Headless CMS for content management
- **PostgreSQL** - Primary database (via Supabase)
- **Better Auth 1.4** - Authentication system

### Python Execution
- **E2B Code Interpreter 2.3** - Server-side Python execution
- **Pyodide** - Client-side Python execution using WebAssembly

### State Management
- **TanStack Query 5.90** - Server state management
- **Zustand 5.0** - Client state management

## Project Status

**Current Version**: 1.0.0

**Status**: Active Development

The platform is currently in active development with core features implemented including course management, progress tracking, and the dual Python execution system.

### Recent Updates
- ✅ Payload CMS 3.69 integration
- ✅ Dual Python compiler system (E2B + Pyodide)
- ✅ Course and chapter structure
- ✅ Progress tracking and engagement system
- ✅ Optimistic UI updates
- 🔄 Playground (development-only, to be removed in production)

## For Contributors

### Prerequisites

- **Node.js**: `^18.20.2 || >=20.9.0`
- **pnpm**: `^9 || ^10` (required - do not use npm or yarn)
- **Git**

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd python-secrets-2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Generate Payload types**
   ```bash
   pnpm payload generate:types
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (see below)
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Payload Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

### Environment Variables

For detailed setup instructions including external accounts (Supabase, E2B), see the [complete setup guide](./docs/SETUP.md).

**Required variables**:
- `DATABASE_URL` - PostgreSQL connection string (Supabase)
- `PAYLOAD_SECRET` - Payload CMS secret key
- `E2B_API_KEY` - E2B API key for Python execution
- `NEXT_PUBLIC_APP_URL` - Application base URL

## Documentation

For detailed information about the project, refer to the documentation in the `docs/` folder:

- **[README](./docs/README.md)** - Project overview and features
- **[SETUP](./docs/SETUP.md)** - Complete development setup guide
- **[ARCHITECTURE](./docs/ARCHITECTURE.md)** - Architecture patterns and data flow
- **[TECH_STACK](./docs/TECH_STACK.md)** - Complete technology stack
- **[PROJECT_STRUCTURE](./docs/PROJECT_STRUCTURE.md)** - Directory organization
- **[COLLECTIONS](./docs/COLLECTIONS.md)** - Database schema
- **[API](./docs/API.md)** - API routes and endpoints
- **[COMPILERS](./docs/COMPILERS.md)** - Python execution system
- **[AUTH](./docs/AUTH.md)** - Authentication system
- **[STATE_MANAGEMENT](./docs/STATE_MANAGEMENT.md)** - State management patterns
- **[CONVENTIONS](./docs/CONVENTIONS.md)** - Code style and conventions

## Development Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm devsafe          # Start fresh (clears .next cache)
pnpm build            # Build for production
pnpm start            # Start production server

# Payload
pnpm payload generate:types     # Generate TypeScript types
pnpm payload generate:importmap # Generate import map

# Testing & Linting
pnpm test             # Run all tests
pnpm test:int         # Integration tests (Vitest)
pnpm test:e2e         # End-to-end tests (Playwright)
pnpm lint             # Lint code
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

Built with:
- [Payload CMS](https://payloadcms.com) - Headless CMS
- [Next.js](https://nextjs.org) - React framework
- [E2B](https://e2b.dev) - Code execution
- [Pyodide](https://pyodide.org) - Python in browser

## Support

For detailed documentation, see the [docs folder](./docs/).

For specific issues or questions about dependencies:
- **Payload CMS**: [payloadcms.com/docs](https://payloadcms.com/docs)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **E2B**: [e2b.dev/docs](https://e2b.dev/docs)
