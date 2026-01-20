# Testing Strategy for Python Secrets Platform

## Executive Summary

The Python Secrets platform is in **active development** with **minimal test coverage**. The codebase consists of **163 TypeScript/TSX files** but currently has only **2 test files** - one basic integration test and one basic E2E test. This represents a critical gap in quality assurance for a production educational platform.

**Current Test Coverage:** ~5% (Critical)

**Target Coverage:**
- MVP: 60% coverage on critical code
- Production Ready: 80%+ overall coverage

---

## Table of Contents

1. [Current Testing Infrastructure](#current-testing-infrastructure)
2. [Critical Code Analysis](#critical-code-analysis)
3. [Testing Gaps](#testing-gaps)
4. [Recommended Testing Strategy](#recommended-testing-strategy)
5. [Test Structure](#test-structure)
6. [Priority Matrix](#priority-matrix)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Tools and Setup](#tools-and-setup)
9. [Success Metrics](#success-metrics)

---

## Current Testing Infrastructure

### Testing Frameworks Configured

#### Vitest (Integration & Unit Tests)
- **Config:** `vitest.config.mts`
- **Environment:** jsdom
- **Setup:** `vitest.setup.ts` (loads env variables)
- **Test Pattern:** `tests/int/**/*.int.spec.ts`
- **Status:** ✅ Configured but underutilized

#### Playwright (E2E Tests)
- **Config:** `playwright.config.ts`
- **Browser:** Chromium
- **Reporter:** HTML
- **Auto-start:** Dev server on localhost:3000
- **Status:** ✅ Configured but minimal tests

#### Testing Library
- **Installed:** `@testing-library/react@16.3.0`
- **Status:** ⚠️ Installed but not used in any tests

### Existing Test Files

#### Integration Tests (`tests/int/api.int.spec.ts`)
```typescript
// Single test case: "fetches users"
// Verifies Payload CMS can query the users collection
// Coverage: Minimal - only tests Payload initialization
```

**Issues:**
- ❌ No data validation
- ❌ No edge cases
- ❌ No error handling
- ❌ Doesn't test actual API routes

#### E2E Tests (`tests/e2e/frontend.e2e.spec.ts`)
```typescript
// Single test case: "can go on homepage"
// Checks if homepage loads with expected title
// Coverage: Extremely basic smoke test
```

**Issues:**
- ❌ No user flows tested
- ❌ No authentication testing
- ❌ No course navigation
- ❌ No code execution testing
- ❌ No quiz submission
- ❌ No progress tracking verification

---

## Critical Code Analysis

### 1. Python Compiler System (326 lines total)

**This is the MOST CRITICAL system to test** - it's the core differentiator of the platform and carries the highest risk.

#### Server-side Compiler (`src/core/compiler/server/index.ts` - 89 lines)
- **Function:** Uses E2B Code Interpreter sandbox for server-side Python execution
- **Complexity:** Medium
- **Key Functions:**
  - `compileCode()`: Executes single Python snippets
  - `compileProject()`: Executes multi-file projects with custom entry points

**Testing Needs:** 🔴 CRITICAL
- ✅ Sandbox initialization
- ✅ Error handling (sandbox creation failures, execution errors)
- ✅ File system operations
- ✅ stdout/stderr capturing
- ✅ Timeout scenarios
- ✅ Resource cleanup (sandbox killing)

#### Client-side Compiler Worker (`src/core/compiler/client/worker.ts` - 156 lines)
- **Function:** Uses Pyodide (WebAssembly Python) in a Web Worker
- **Complexity:** High
- **Key Functions:**
  - `getPyodide()`: Lazy initialization with loading state
  - `runCode()`: Single file execution with output redirection
  - `runProject()`: Multi-file project execution with virtual filesystem

**Testing Needs:** 🔴 CRITICAL
- ✅ Pyodide loading states
- ✅ Concurrent initialization handling
- ✅ Virtual filesystem operations
- ✅ stdout/stderr redirection
- ✅ Memory management (file cleanup)
- ✅ Worker message passing
- ✅ Timeout handling (30s timeout implemented)

#### Client Compiler Interface (`src/core/compiler/client/index.ts` - 81 lines)
- **Function:** Manages Worker communication and message routing
- **Complexity:** Medium

**Testing Needs:** 🔴 HIGH
- ✅ Worker creation and lifecycle
- ✅ Message ID generation and collision handling
- ✅ Promise resolution for async operations
- ✅ Timeout scenarios
- ✅ Browser environment detection

### 2. Quiz System

#### Quiz Component (`src/components/courses/lessons/quiz-exercise.tsx` - 458 lines)
- **Complexity:** Very High
- **Features:** Multi-question quiz, answer selection, progress tracking, retry logic, results view

**Testing Needs:** 🔴 CRITICAL
- ✅ Question navigation
- ✅ Answer selection state
- ✅ Submit flow
- ✅ Score calculation
- ✅ Retry functionality
- ✅ Progress restoration
- ✅ Error handling

#### Quiz API (`src/api/courses/quizzes.ts` - 206 lines)
- **Functions:**
  - `submitQuizAnswers()`: Validates and scores quiz submissions
  - `getQuizProgress()`: Retrieves saved answers
  - `retryQuizQuestion()`: Removes specific answer for retry

**Testing Needs:** 🔴 CRITICAL
- ✅ Answer validation logic
- ✅ Scoring calculations (0-100 scale)
- ✅ Status determination (completed vs in_progress)
- ✅ JSON data handling (quizAnswers field)
- ✅ Edge cases (empty quizzes, missing questions)

### 3. Authentication System

#### Better Auth Configuration (`src/lib/auth.ts` - 16 lines)
- **Function:** Configures email/password authentication with PostgreSQL

**Testing Needs:** 🔴 HIGH
- ✅ Authentication flows (signup, login, logout)
- ✅ Session management
- ✅ Password hashing
- ✅ Token generation/validation
- ✅ Failed login attempts

### 4. Course API (`src/api/courses/index.ts` - 231 lines)

**Functions:**
- `getLesson()`: Fetches lesson with navigation (optimized query pattern)
- `getProgress()`: User lesson progress
- `updateProgress()`: Creates/updates progress records
- `getCourseProgress()`: Aggregated course progress

**Testing Needs:** 🟠 HIGH
- ✅ Query optimization verification (depth levels, populate patterns)
- ✅ Navigation logic (prev/next lesson calculations)
- ✅ Progress CRUD operations
- ✅ Edge cases (missing lessons, orphaned progress)
- ✅ Performance testing for nested queries

### 5. Database Collections (Payload CMS)

#### UserProgress Collection
- **Fields:** userId, course, lesson, status, solutionUnlocked, codeSnapshot, quizAnswers, lastViewedAt
- **Unique Index:** [userId, lesson]

**Testing Needs:** 🟠 HIGH
- ✅ Unique constraint enforcement
- ✅ JSON field validation (codeSnapshot, quizAnswers)
- ✅ Status transitions
- ✅ Cascade deletion rules

#### LessonEngagement Collection
- **Fields:** userId, lesson, engagementType (like/dislike), rating (1-5)
- **Unique Index:** [userId, lesson]

**Testing Needs:** 🟠 HIGH
- ✅ Independent rating and engagement tracking
- ✅ Rating range validation
- ✅ Null handling

### 6. Custom React Hooks

#### useQuizSubmit (`src/hooks/courses/lessons/use-quiz-submit.ts` - 128 lines)
- **Features:** Quiz submission, progress loading, question retry

**Testing Needs:** 🔴 CRITICAL
- ✅ Submit flow with error handling
- ✅ Answer map conversion
- ✅ Saved progress restoration
- ✅ Loading states
- ✅ Cache invalidation

#### useLessonProgress (`src/hooks/courses/lessons/use-lesson-progress.ts` - 43 lines)
- **Features:** Query lesson progress, update progress, optimistic UI updates

**Testing Needs:** 🟠 HIGH
- ✅ Query caching
- ✅ Mutation behavior
- ✅ Optimistic updates
- ✅ Cache invalidation

---

## Testing Gaps

### What's NOT Tested (Critical Gaps)

#### Authentication & Authorization
- ❌ User registration flow
- ❌ Login/logout functionality
- ❌ Protected route access control
- ❌ Session persistence
- ❌ Password reset flow
- ❌ Email verification

#### Course Management
- ❌ Course enrollment
- ❌ Lesson navigation (previous/next)
- ❌ Chapter progression
- ❌ Course completion tracking
- ❌ Prerequisites validation

#### Code Execution (CRITICAL)
- ❌ Server-side Python execution (E2B)
- ❌ Client-side Python execution (Pyodide)
- ❌ Error output display
- ❌ Timeout handling
- ❌ Multi-file project execution
- ❌ File system operations in IDE

#### Quiz System (CRITICAL)
- ❌ Quiz submission and validation
- ❌ Score calculation
- ❌ Answer persistence
- ❌ Retry functionality
- ❌ Progress restoration

#### Progress Tracking
- ❌ Lesson status updates
- ❌ Solution unlocking
- ❌ Progress percentage calculation
- ❌ Code snapshot saving
- ❌ Last viewed timestamp

#### User Engagement
- ❌ Rating submission (1-5 stars)
- ❌ Like/dislike toggling
- ❌ Engagement persistence

#### Database Operations
- ❌ Collection CRUD operations
- ❌ Relationship population
- ❌ Unique constraint enforcement
- ❌ Cascade deletion
- ❌ Query optimization verification

#### API Routes
- ❌ Server action error handling
- ❌ Request validation
- ❌ Response formatting
- ❌ Rate limiting
- ❌ Authorization checks

#### UI/UX Flows
- ❌ Complete user journey (signup → course → lesson → completion)
- ❌ Responsive design
- ❌ Accessibility (WCAG compliance)
- ❌ Loading states
- ❌ Error boundaries

---

## Recommended Testing Strategy

### Testing Philosophy

**"Test the critical paths first, then expand coverage"**

Given the current state (~5% coverage), we need a focused approach:

1. **Priority 1:** Test code that executes user code (Python compiler)
2. **Priority 2:** Test user-facing features (Quizzes, Progress)
3. **Priority 3:** Test security boundaries (Authentication)
4. **Priority 4:** Test integration points (API, Database)
5. **Priority 5:** Test UI components and user flows

### Test Coverage Goals

#### Minimum Viable Coverage (MVP) - 6-8 weeks
- **Unit Tests:** 60% coverage target
  - All compiler functions
  - All server actions
  - All custom hooks
  - Complex utility functions

- **Integration Tests:** Key user flows
  - Authentication (signup, login, logout)
  - Course navigation
  - Quiz submission
  - Progress tracking
  - Code execution (basic)

- **E2E Tests:** Critical paths
  - New user signup → first lesson
  - Complete lesson flow
  - Quiz submission and retry
  - Code execution and error handling

#### Ideal Coverage (Production Ready) - 12+ weeks
- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All API routes and server actions
- **E2E Tests:** All major user journeys
- **Performance Tests:** Database queries, compiler execution
- **Security Tests:** Input validation, authorization
- **Accessibility Tests:** WCAG 2.1 AA compliance

---

## Test Structure

### Recommended Directory Structure

```
tests/
├── unit/                           # Unit tests
│   ├── compiler/
│   │   ├── server.test.ts          # E2B compiler tests
│   │   ├── client-worker.test.ts   # Pyodide worker tests
│   │   └── client-interface.test.ts # Client interface tests
│   ├── api/
│   │   ├── courses.test.ts         # Course API tests
│   │   ├── quizzes.test.ts         # Quiz API tests
│   │   └── engagement.test.ts      # Engagement API tests
│   ├── hooks/
│   │   ├── use-lesson-progress.test.ts
│   │   ├── use-quiz-submit.test.ts
│   │   └── use-lesson-rating.test.ts
│   ├── utils/
│   │   ├── scoring.test.ts         # Quiz scoring logic
│   │   ├── progress.test.ts        # Progress calculation
│   │   └── navigation.test.ts      # Navigation logic
│   └── setup/
│       ├── mocks.ts                # Global mocks (E2B, Pyodide, Payload)
│       ├── fixtures.ts             # Test data fixtures
│       └── helpers.ts              # Test helper functions
│
├── integration/                    # Integration tests
│   ├── api/
│   │   ├── lessons.int.spec.ts     # Lesson API integration
│   │   ├── progress.int.spec.ts    # Progress CRUD integration
│   │   ├── quizzes.int.spec.ts     # Quiz integration
│   │   └── auth.int.spec.ts        # Auth integration
│   ├── compiler/
│   │   └── execution.int.spec.ts   # End-to-end compilation
│   └── database/
│       ├── collections.int.spec.ts # Collection CRUD
│       └── relations.int.spec.ts   # Relationships & population
│
├── e2e/                            # End-to-end tests (Playwright)
│   ├── auth/
│   │   ├── signup.e2e.spec.ts
│   │   ├── login.e2e.spec.ts
│   │   └── session.e2e.spec.ts
│   ├── learning/
│   │   ├── lesson-complete.e2e.spec.ts
│   │   ├── quiz-submit.e2e.spec.ts
│   │   ├── code-execution.e2e.spec.ts
│   │   └── progress-tracking.e2e.spec.ts
│   └── flows/
│       ├── new-user-journey.e2e.spec.ts
│       └── complete-course.e2e.spec.ts
│
└── performance/                    # Performance tests (future)
    ├── compiler.perf.spec.ts       # Compiler performance
    └── database.perf.spec.ts       # Query performance
```

---

## Priority Matrix

### 🔴 CRITICAL Priority (Start Immediately)

| Component | Risk | Impact | Estimated Effort |
|-----------|------|--------|------------------|
| **Pyodide Worker** | Very High | Platform broken | 2 weeks |
| **Quiz Scoring** | High | User trust | 3 days |
| **Authentication** | Very High | Security breach | 1 week |
| **E2B Compiler** | High | Platform broken | 1 week |
| **Quiz Component** | High | User experience | 1 week |

**Total: ~5-6 weeks**

### 🟠 HIGH Priority (Phase 2)

| Component | Risk | Impact | Estimated Effort |
|-----------|------|--------|------------------|
| **Course API** | Medium | User experience | 1 week |
| **Progress API** | Medium | Data loss | 1 week |
| **Custom Hooks** | Medium | Bugs | 1 week |
| **Database Collections** | Medium | Data corruption | 1 week |

**Total: ~4 weeks**

### 🟡 MEDIUM Priority (Phase 3)

| Component | Risk | Impact | Estimated Effort |
|-----------|------|--------|------------------|
| **IDE Component** | Low | User experience | 3 days |
| **Navigation** | Low | Broken links | 2 days |
| **User Engagement** | Low | Minor bugs | 2 days |
| **State Management** | Low | UI glitches | 2 days |

**Total: ~1-2 weeks**

---

## Implementation Roadmap

### Phase 1: Foundation & Critical Tests (Weeks 1-6)

#### Week 1-2: Test Setup & Utilities
- [ ] Set up test database (separate from dev)
- [ ] Create mock utilities (E2B, Pyodide, Payload)
- [ ] Create test fixtures for common scenarios
- [ ] Set up test helpers (authentication, data generation)
- [ ] Configure coverage reporting

#### Week 3-4: Python Compiler Tests
- [ ] Unit tests for E2B compiler
  - Valid Python execution
  - Error handling (syntax, runtime)
  - Timeouts and cleanup
  - Multi-file projects
- [ ] Unit tests for Pyodide worker
  - Initialization states
  - Concurrent initialization
  - Memory cleanup
  - Virtual filesystem
- [ ] Integration tests for compiler switching

#### Week 5-6: Quiz System Tests
- [ ] Unit tests for scoring logic
- [ ] Component tests for QuizExercise
- [ ] Integration tests for quiz API
- [ ] E2E tests for quiz submission flow

### Phase 2: Authentication & API (Weeks 7-10)

#### Week 7-8: Authentication
- [ ] Integration tests for signup
- [ ] Integration tests for login/logout
- [ ] Session management tests
- [ ] Protected route tests
- [ ] E2E tests for auth flows

#### Week 9-10: API & Database
- [ ] Integration tests for Course API
- [ ] Integration tests for Progress API
- [ ] Database collection tests
- [ ] Query optimization verification

### Phase 3: User Flows & E2E (Weeks 11-14)

#### Week 11-12: Custom Hooks
- [ ] Tests for useLessonProgress
- [ ] Tests for useQuizSubmit
- [ ] Tests for useLessonRating
- [ ] Tests for all other hooks

#### Week 13-14: E2E User Journeys
- [ ] New user signup → first lesson
- [ ] Complete lesson with code execution
- [ ] Quiz submission and retry
- [ ] Progress tracking across sessions
- [ ] Complete course flow

### Phase 4: Advanced Testing (Weeks 15-16)

#### Week 15-16: Advanced Tests
- [ ] Performance tests (compiler, database)
- [ ] Security tests (input validation, auth)
- [ ] Accessibility tests (WCAG compliance)
- [ ] Load testing (concurrent users)

---

## Tools and Setup

### Current Tools

**Already Installed:**
```json
{
  "vitest": "^2.1.8",
  "@playwright/test": "^1.49.1",
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.6.3"
}
```

### Recommended Additions

#### Testing Utilities
```bash
pnpm add -D msw                    # Mock Service Worker for API mocking
pnpm add -D @faker-js/faker        # Test data generation
pnpm add -D @vitest/ui             # Visual test runner
pnpm add -D @vitest/coverage-v8    # Coverage reporting
```

#### Component Testing
```bash
pnpm add -D @playwright/experimental # Component testing with Playwright
pnpm add -D storybook              # Component documentation & testing
```

### Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "pnpm run test:unit && pnpm run test:int && pnpm run test:e2e",
    "test:unit": "vitest run --config ./vitest.config.mts",
    "test:int": "vitest run --config ./vitest.config.mts",
    "test:e2e": "playwright test",
    "test:watch": "vitest --config ./vitest.config.mts",
    "test:ui": "vitest --ui --config ./vitest.config.mts",
    "test:coverage": "vitest run --coverage --config ./vitest.config.mts",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Continuous Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run linters
        run: pnpm lint

      - name: Type check
        run: pnpm tsc --noEmit

      - name: Run unit tests
        run: pnpm test:unit --coverage

      - name: Run integration tests
        run: pnpm test:int

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E tests
        run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Success Metrics

### Testing KPIs to Track

#### Coverage Metrics
- **Unit Test Coverage:** Target 70%+ overall, 80%+ on critical code
- **Integration Test Coverage:** All API routes and server actions
- **E2E Test Coverage:** All major user journeys

#### Quality Metrics
- **Test Pass Rate:** Maintain 100% in CI/CD
- **Test Execution Time:**
  - Unit tests: < 2 minutes
  - Integration tests: < 5 minutes
  - E2E tests: < 15 minutes
- **Bug Detection Rate:** Measure % of bugs caught by tests before production

#### Developer Metrics
- **Time to Deploy:** Reduced with confidence from automated tests
- **Test Maintenance Time:** < 10% of development time
- **Developer Adoption:** All new features include tests

### Coverage Targets by Module

| Module | MVP Target | Production Target |
|--------|-----------|-------------------|
| Compiler (client) | 90% | 95% |
| Compiler (server) | 80% | 90% |
| Quiz Logic | 90% | 95% |
| Authentication | 80% | 90% |
| API Routes | 70% | 85% |
| Database Collections | 70% | 85% |
| Custom Hooks | 80% | 90% |
| Components | 50% | 70% |
| **Overall** | **60%** | **80%** |

---

## Best Practices

### Writing Tests

#### Unit Tests
```typescript
// ✅ Good: Clear, focused, descriptive
describe('Quiz Scoring', () => {
  it('should calculate 100% score for all correct answers', () => {
    const answers = { q1: 'a', q2: 'b', q3: 'c' }
    const correct = { q1: 'a', q2: 'b', q3: 'c' }
    expect(calculateScore(answers, correct)).toBe(100)
  })

  it('should handle empty answers gracefully', () => {
    expect(calculateScore({}, {})).toBe(0)
  })
})

// ❌ Bad: Vague, testing implementation
describe('Quiz', () => {
  it('should work', () => {
    // What does "work" mean?
  })
})
```

#### Integration Tests
```typescript
// ✅ Good: Tests the flow, not implementation
describe('Quiz Submission Flow', () => {
  it('should save answers and update progress', async () => {
    const result = await submitQuizAnswers(quizId, answers)
    expect(result.status).toBe('completed')
    expect(result.score).toBeGreaterThan(0)

    const progress = await getQuizProgress(quizId)
    expect(progress.quizAnswers).toEqual(answers)
  })
})
```

#### E2E Tests
```typescript
// ✅ Good: Tests user journey, resilient to UI changes
test('complete lesson with quiz', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')

  // Navigate to lesson
  await page.goto('/courses/python-basics/variables/lesson-1')
  await expect(page.locator('h1')).toContainText('Variables')

  // Complete quiz
  await page.click('[data-testid="quiz-option-a"]')
  await page.click('[data-testid="quiz-submit"]')

  // Verify success
  await expect(page.locator('[data-testid="quiz-results"]')).toBeVisible()
  await expect(page.locator('[data-testid="progress-complete"]')).toBeVisible()
})
```

### Test Data Management

#### Fixtures
```typescript
// tests/setup/fixtures.ts
export const testFixtures = {
  user: {
    email: 'test@example.com',
    password: 'securePassword123',
    name: 'Test User'
  },
  course: {
    slug: 'python-basics',
    title: 'Python Basics'
  },
  quiz: {
    id: 'quiz-1',
    questions: [
      {
        id: 'q1',
        question: 'What is 2+2?',
        answers: ['3', '4', '5'],
        correct: '4'
      }
    ]
  }
}
```

#### Test Helpers
```typescript
// tests/setup/helpers.ts
export async function createTestUser(overrides = {}) {
  return await payload.create({
    collection: 'users',
    data: { ...testFixtures.user, ...overrides }
  })
}

export async function authenticateUser(page: Page) {
  const user = await createTestUser()
  await page.goto('/login')
  await page.fill('[name="email"]', user.email)
  await page.fill('[name="password"]', user.password)
  await page.click('button[type="submit"]')
  await page.waitForURL('/courses')
  return user
}
```

### Mock Strategy

#### Mock E2B Compiler
```typescript
// tests/setup/mocks/compiler.ts
vi.mock('@/core/compiler/server', () => ({
  compileCode: vi.fn().mockImplementation(async (code) => {
    if (code.includes('error')) {
      return { stdout: '', stderr: 'Error: Test error', error: 'Test error' }
    }
    return { stdout: 'Test output', stderr: '', error: undefined }
  })
}))
```

#### Mock Pyodide Worker
```typescript
// tests/setup/mocks/pyodide.ts
global.Worker = class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(url: string) {
    // Simulate Pyodide loading
    setTimeout(() => {
      this.postMessage({ type: 'loaded' })
    }, 100)
  }

  postMessage(message: any) {
    // Simulate response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: { id: message.id, result: { stdout: 'test' } }
        }))
      }
    }, 50)
  }

  terminate() {
    // Cleanup
  }
}
```

---

## Common Testing Scenarios

### Compiler Testing

#### Valid Code Execution
```typescript
it('should execute valid Python code', async () => {
  const code = 'print("Hello, World!")'
  const result = await compileCode(code, 'client')

  expect(result.stdout).toContain('Hello, World!')
  expect(result.error).toBeUndefined()
})
```

#### Error Handling
```typescript
it('should handle syntax errors gracefully', async () => {
  const code = 'print("Unclosed string'
  const result = await compileCode(code, 'client')

  expect(result.error).toBeDefined()
  expect(result.stderr).toContain('SyntaxError')
})
```

#### Timeout Handling
```typescript
it('should timeout on infinite loops', async () => {
  const code = 'while True: pass'
  const startTime = Date.now()

  const result = await compileCode(code, 'client')
  const duration = Date.now() - startTime

  expect(result.error).toContain('timeout')
  expect(duration).toBeLessThan(35000) // 30s timeout + 5s grace
})
```

### Quiz Testing

#### Score Calculation
```typescript
it('should calculate correct score percentage', () => {
  const answers = { q1: 'a', q2: 'b', q3: 'c' }
  const correct = { q1: 'a', q2: 'x', q3: 'c' }

  const score = calculateScore(answers, correct)

  expect(score).toBe(66.67) // 2 out of 3 correct
})
```

#### Progress Restoration
```typescript
it('should restore saved quiz progress', async () => {
  const quizId = 'quiz-1'
  const savedAnswers = { q1: 'a', q2: 'b' }

  await saveQuizProgress(quizId, savedAnswers)
  const progress = await getQuizProgress(quizId)

  expect(progress.quizAnswers).toEqual(savedAnswers)
})
```

### Authentication Testing

#### Signup Flow
```typescript
it('should create new user account', async () => {
  const userData = {
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    name: 'New User'
  }

  const result = await signUp(userData)

  expect(result.success).toBe(true)
  expect(result.user.email).toBe(userData.email)
})
```

#### Protected Route
```typescript
it('should redirect unauthenticated users from protected routes', async ({ page }) => {
  await page.goto('/courses/python-basics/lesson-1')

  await expect(page).toHaveURL('/login')
})
```

---

## Quick Wins (1-2 Weeks)

If you want to start seeing value immediately, here are high-impact tests that can be written quickly:

### Day 1-2: Quiz Scoring Tests (5 hours)
```typescript
// tests/unit/utils/scoring.test.ts
describe('Quiz Scoring', () => {
  it('calculates 100% for all correct')
  it('calculates 0% for all wrong')
  it('calculates partial score correctly')
  it('handles empty answers')
  it('handles extra answers')
})
```

### Day 3-4: Progress Calculation (3 hours)
```typescript
// tests/unit/utils/progress.test.ts
describe('Progress Calculation', () => {
  it('calculates 0% for no lessons completed')
  it('calculates 100% for all lessons completed')
  it('calculates partial progress correctly')
})
```

### Day 5-7: Auth Flow Integration (10 hours)
```typescript
// tests/integration/auth.int.spec.ts
describe('Authentication Flow', () => {
  it('signs up new user')
  it('logs in with valid credentials')
  it('rejects invalid credentials')
  it('maintains session across page refresh')
  it('logs out successfully')
})
```

### Day 8-10: Compiler Error Handling (8 hours)
```typescript
// tests/unit/compiler/server.test.ts
describe('Server Compiler Error Handling', () => {
  it('handles syntax errors')
  it('handles runtime errors')
  it('handles timeout')
  it('handles sandbox creation failure')
})
```

### Day 11-14: Basic E2E Tests (10 hours)
```typescript
// tests/e2e/flows/quick-smoke.e2e.spec.ts
test('smoke test: basic user journey', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Get Started')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page.locator('text=Welcome')).toBeVisible()
})
```

**Total: ~36 hours (1 week)** for immediate, high-value tests

---

## Maintenance and Evolution

### Keeping Tests Healthy

#### Regular Maintenance
- **Weekly:** Review and fix flaky tests
- **Monthly:** Update test data and fixtures
- **Quarterly:** Review test coverage and add tests for new features
- **Annually:** Major test suite refactoring

#### Test Debt
If you need to skip tests temporarily:
```typescript
// ✅ Good: Explain why and when to fix
it.skip('should handle concurrent compilation', () => {
  // TODO: Unskip when E2B supports concurrent sandboxes
  // Tracking: https://github.com/org/repo/issues/123
})

// ❌ Bad: Unexplained skip
it.skip('should handle concurrent compilation', () => {})
```

### Evolving the Test Suite

#### When Features Change
1. Update tests first (TDD approach)
2. Ensure all tests pass
3. Update documentation
4. Remove obsolete tests

#### When Coverage Increases
1. Celebrate milestones! 🎉
2. Update coverage targets
3. Adjust CI/CD thresholds
4. Document new patterns

---

## Conclusion

### Current State Summary

The Python Secrets platform has a **solid technical foundation** but **critical testing gaps**:

- ✅ Modern testing tools configured (Vitest, Playwright)
- ✅ Clean codebase architecture
- ❌ Only ~5% test coverage
- ❌ No tests for core functionality (compiler, quizzes, auth)
- ❌ No safety net for refactoring

### Immediate Actions Required

1. **Start with Python Compiler tests** - Highest risk, highest value
2. **Add Quiz system tests** - User-facing, complex logic
3. **Implement Authentication tests** - Security critical
4. **Expand to API and Database** - Integration points
5. **Build E2E test suite** - User journey validation

### Long-term Vision

Build a **testing culture** where:
- Tests are mandatory for new features
- Test-Driven Development (TDD) is used for complex logic
- Automated tests run in CI/CD on every commit
- Developers have confidence to refactor
- Production deployments are stress-free

### Success Criteria

The testing strategy is successful when:
- ✅ All critical code paths are tested
- ✅ No code is deployed without tests
- ✅ Tests catch bugs before production
- ✅ Developers trust the test suite
- ✅ Releases are frequent and confident

**Remember:** Tests are not just about quality - they're about **developer confidence** and **development velocity**. A well-tested codebase is easier to modify, faster to develop, and safer to deploy.

---

## Appendix

### Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Templates

See the following files for implementation examples:
- `tests/int/api.int.spec.ts` - Existing integration test
- `tests/e2e/frontend.e2e.spec.ts` - Existing E2E test
- `vitest.config.mts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration

---

**Last Updated:** 2025-01-20
**Maintained By:** Development Team
**Version:** 1.0.0
