# Testing Strategy with Functional Programming

## Overview

This document defines the comprehensive testing strategy for the Python Secrets platform using functional programming patterns. We test **algebraic data types** (Maybe, Result, Try), functional error handling, and React components with predictable outcomes.

## Table of Contents

- [Current State](#current-state)
- [Testing Philosophy](#testing-philosophy)
- [Testing Functional Types](#testing-functional-types)
- [Testing Server Actions](#testing-server-actions)
- [Testing TanStack Query](#testing-tanstack-query)
- [Testing React Components](#testing-react-components)
- [Testing Error Scenarios](#testing-error-scenarios)
- [Property-Based Testing](#property-based-testing)
- [Mocking Strategy](#mocking-strategy)
- [Anti-Patterns](#anti-patterns)
- [Test Coverage](#test-coverage)

---

## Current State

### Existing Test Infrastructure

**Vitest** (Integration/Unit)
- Config: `vitest.config.mts`
- Environment: jsdom
- Setup: `vitest.setup.ts`
- **Current Coverage**: ~5% (Critical gap)

**Playwright** (E2E)
- Config: `playwright.config.ts`
- Browser: Chromium
- **Current Coverage**: 1 smoke test only

**Testing Library**
- Installed: `@testing-library/react@16.3.0`
- **Current Usage**: Not used

### Existing Tests

**Integration Test** (`tests/int/api.int.spec.ts`)
```typescript
// ❌ Current: Single test, minimal coverage
it('fetches users', async () => {
  const users = await payload.find({ collection: 'users' })
  expect(users).toBeDefined()
})
```

**Issues:**
- No Result type testing
- No error scenarios
- No data validation
- No edge cases

**E2E Test** (`tests/e2e/frontend.e2e.spec.ts`)
```typescript
// ❌ Current: Basic smoke test only
test('can go on homepage', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/Payload Blank Template/)
})
```

**Issues:**
- No user flows
- No authentication
- No course navigation
- No code execution
- No quiz submission

---

## Testing Philosophy

### Core Principles

#### 1. **Test Outcomes, Not Implementation**

```typescript
// ✅ GOOD: Test the Result type
it('returns NotFoundError when lesson does not exist', async () => {
  const result = await api.courses.lessons.getById(999)

  expect(Result.isErr(result)).toBe(true)
  match(result, {
    ok: () => fail('Should have errored'),
    err: (error) => {
      expect(error._tag).toBe('NotFound')
      expect(error.resource).toBe('lesson')
      expect(error.id).toBe('999')
    }
  })
})

// ❌ BAD: Test implementation details
it('calls payload.findByID with correct id', async () => {
  const spy = vi.spyOn(payload, 'findByID')
  await api.courses.lessons.getById(123)
  expect(spy).toHaveBeenCalledWith({ collection: 'lessons', id: 123 })
})
```

---

#### 2. **Test All Branches**

```typescript
// ✅ GOOD: Test both Ok and Err paths
describe('getLesson', () => {
  it('returns Ok when lesson exists', async () => {
    const result = await getLesson(1)
    expect(Result.isOk(result)).toBe(true)
  })

  it('returns NotFoundError when lesson does not exist', async () => {
    const result = await getLesson(999)
    expect(Result.isErr(result)).toBe(true)
  })
})

// ❌ BAD: Only test happy path
it('returns lesson', async () => {
  const result = await getLesson(1)
  expect(result).toBeTruthy() // What if it errors?
})
```

---

#### 3. **Use Type Guards and Matchers**

```typescript
// ✅ GOOD: Use type-safe helpers
import { isOk, isErr, isNotFound } from '@/core/result'
import { isSome, isNothing } from '@/core/maybe'

it('returns NotFoundError', async () => {
  const result = await getLesson(999)

  expect(isErr(result)).toBe(true)
  if (isErr(result)) {
    expect(isNotFound(result.error)).toBe(true)
  }
})
```

---

#### 4. **Test Async Errors Properly**

```typescript
// ✅ GOOD: Test async Result
it('handles database errors', async () => {
  // Mock database failure
  mockPayloadFind.mockRejectedValue(new Error('DB connection lost'))

  const result = await api.courses.getAll()

  expect(Result.isErr(result)).toBe(true)
  match(result, {
    ok: () => fail('Should have errored'),
    err: (error) => {
      expect(error._tag).toBe('DatabaseError')
      expect(error.operation).toBe('find')
    }
  })
})
```

---

## Testing Functional Types

### Testing Maybe

#### Basic Maybe Tests

```typescript
import * as Maybe from '@/core/maybe'
import { some, nothing } from '@/core/maybe'

describe('findFirst', () => {
  describe('when element exists', () => {
    it('returns Some with the element', () => {
      const users = [
        { id: '1', name: 'Alice', email: 'alice@example.com' },
        { id: '2', name: 'Bob', email: 'bob@example.com' }
      ]

      const result = findFirst(u => u.id === '1')(users)

      expect(Maybe.isSome(result)).toBe(true)

      Maybe.match(result, {
        some: (user) => {
          expect(user.id).toBe('1')
          expect(user.name).toBe('Alice')
        },
        nothing: () => fail('Should be Some')
      })
    })
  })

  describe('when element does not exist', () => {
    it('returns Nothing', () => {
      const users = [
        { id: '1', name: 'Alice', email: 'alice@example.com' }
      ]

      const result = findFirst(u => u.id === '999')(users)

      expect(Maybe.isNothing(result)).toBe(true)
    })
  })
})
```

---

#### Maybe Transformations

```typescript
describe('Maybe transformations', () => {
  it('maps over Some value', () => {
    const result = pipe(
      some(5),
      Maybe.map(n => n * 2)
    )

    Maybe.match(result, {
      some: (value) => expect(value).toBe(10),
      nothing: () => fail('Should be Some')
    })
  })

  it('skips map over Nothing', () => {
    const result = pipe(
      nothing,
      Maybe.map(n => n * 2)
    )

    expect(Maybe.isNothing(result)).toBe(true)
  })

  it('flatMaps chain Maybe-returning functions', () => {
    const result = pipe(
      some(5),
      Maybe.flatMap(n => n > 3 ? some(n * 2) : nothing)
    )

    Maybe.match(result, {
      some: (value) => expect(value).toBe(10),
      nothing: () => fail('Should be Some')
    })
  })

  it('short-circuits on Nothing in flatMap', () => {
    const result = pipe(
      nothing as Maybe<number>,
      Maybe.flatMap(n => some(n * 2))
    )

    expect(Maybe.isNothing(result)).toBe(true)
  })

  it('filters Some values', () => {
    const result = pipe(
      some(5),
      Maybe.filter(n => n > 3)
    )

    Maybe.match(result, {
      some: (value) => expect(value).toBe(5),
      nothing: () => fail('Should be Some')
    })
  })

  it('converts Some to Nothing on failed predicate', () => {
    const result = pipe(
      some(2),
      Maybe.filter(n => n > 3)
    )

    expect(Maybe.isNothing(result)).toBe(true)
  })
})
```

---

#### Nullable Conversion

```typescript
describe('fromNullable', () => {
  it('converts null to Nothing', () => {
    const result = Maybe.fromNullable(null)
    expect(Maybe.isNothing(result)).toBe(true)
  })

  it('converts undefined to Nothing', () => {
    const result = Maybe.fromNullable(undefined)
    expect(Maybe.isNothing(result)).toBe(true)
  })

  it('converts value to Some', () => {
    const result = Maybe.fromNullable('hello')
    expect(Maybe.isSome(result)).toBe(true)
  })

  it('handles 0 as Some (not falsy)', () => {
    const result = Maybe.fromNullable(0)
    expect(Maybe.isSome(result)).toBe(true)
    Maybe.match(result, {
      some: (value) => expect(value).toBe(0),
      nothing: () => fail('0 should be Some')
    })
  })

  it('handles false as Some (not falsy)', () => {
    const result = Maybe.fromNullable(false)
    expect(Maybe.isSome(result)).toBe(true)
    Maybe.match(result, {
      some: (value) => expect(value).toBe(false),
      nothing: () => fail('false should be Some')
    })
  })
})
```

---

### Testing Result

#### Basic Result Tests

```typescript
import * as Result from '@/core/result'
import { ok, err } from '@/core/result'

describe('divide', () => {
  it('returns Ok when division succeeds', () => {
    const result = divide(10, 2)

    expect(Result.isOk(result)).toBe(true)

    Result.match(result, {
      ok: (value) => expect(value).toBe(5),
      err: () => fail('Should be Ok')
    })
  })

  it('returns Err when dividing by zero', () => {
    const result = divide(10, 0)

    expect(Result.isErr(result)).toBe(true)

    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('ValidationError')
        expect(error.message).toContain('division')
      }
    })
  })
})
```

---

#### Result Transformations

```typescript
describe('Result transformations', () => {
  it('maps over Ok value', () => {
    const result = pipe(
      ok(5),
      Result.map(n => n * 2)
    )

    Result.match(result, {
      ok: (value) => expect(value).toBe(10),
      err: () => fail('Should be Ok')
    })
  })

  it('skips map over Err', () => {
    const error = validationError('test', 'bad', 'BAD')
    const result = pipe(
      err(error),
      Result.map(n => n * 2)
    )

    expect(Result.isErr(result)).toBe(true)
  })

  it('mapError transforms error', () => {
    const error = notFound('lesson', '123')
    const result = pipe(
      err(error),
      Result.mapError(e => ({
        ...e,
        timestamp: Date.now()
      }))
    )

    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (transformed) => {
        expect(transformed._tag).toBe('NotFound')
        expect(transformed.timestamp).toBeDefined()
      }
    })
  })

  it('flatMaps chain Result-returning functions', () => {
    const result = pipe(
      ok('user-123'),
      Result.flatMap(id => getUser(id)),
      Result.flatMap(user => getCourse(user.courseId))
    )

    Result.match(result, {
      ok: (course) => expect(course).toBeDefined(),
      err: () => fail('Should be Ok')
    })
  })

  it('short-circuits on first Err in flatMap', () => {
    const getUser = vi.fn().mockResolvedValue(ok({ id: '1' }))
    const getCourse = vi.fn().mockResolvedValue(ok({ id: 'course-1' }))

    const result = pipe(
      err(notFound('user', '999')),
      Result.flatMap(id => getUser(id)),
      Result.flatMap(user => getCourse(user.id))
    )

    expect(Result.isErr(result)).toBe(true)
    expect(getUser).not.toHaveBeenCalled()
    expect(getCourse).not.toHaveBeenCalled()
  })
})
```

---

#### Result Combinators

```typescript
describe('all combinator', () => {
  it('returns Ok with array when all Results are Ok', () => {
    const results = [
      ok(1),
      ok(2),
      ok(3)
    ]

    const combined = Result.all(results)

    Result.match(combined, {
      ok: (values) => expect(values).toEqual([1, 2, 3]),
      err: () => fail('Should be Ok')
    })
  })

  it('returns first Err when any Result is Err', () => {
    const results = [
      ok(1),
      err(validationError('test', 'bad', 'BAD')),
      ok(3)
    ]

    const combined = Result.all(results)

    Result.match(combined, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('ValidationError')
      }
    })
  })

  it('returns empty array for empty input', () => {
    const result = Result.all([])

    Result.match(result, {
      ok: (values) => expect(values).toEqual([]),
      err: () => fail('Should be Ok')
    })
  })
})
```

---

### Testing Try

#### Try Catch Tests

```typescript
import * as Try from '@/core/try'

describe('tryCatch', () => {
  it('returns Ok when function succeeds', () => {
    const result = Try.tryCatch(() => {
      return 42
    })

    expect(Result.isOk(result)).toBe(true)
    Result.match(result, {
      ok: (value) => expect(value).toBe(42),
      err: () => fail('Should be Ok')
    })
  })

  it('returns Err when function throws', () => {
    const result = Try.tryCatch(() => {
      throw new Error('Test error')
    })

    expect(Result.isErr(result)).toBe(true)
    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('NetworkError')
        expect(error.cause).toBe('Test error')
      }
    })
  })

  it('converts non-Error throws to NetworkError', () => {
    const result = Try.tryCatch(() => {
      throw 'string error'
    })

    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('NetworkError')
        expect(error.cause).toBe('string error')
      }
    })
  })
})
```

---

#### Async Try Catch

```typescript
describe('tryCatchAsync', () => {
  it('returns Ok when async function succeeds', async () => {
    const result = await Try.tryCatchAsync(async () => {
      return await Promise.resolve(42)
    })

    expect(Result.isOk(result)).toBe(true)
    Result.match(result, {
      ok: (value) => expect(value).toBe(42),
      err: () => fail('Should be Ok')
    })
  })

  it('returns Err when async function throws', async () => {
    const result = await Try.tryCatchAsync(async () => {
      throw new Error('Async error')
    })

    expect(Result.isErr(result)).toBe(true)
  })

  it('returns Err when Promise rejects', async () => {
    const result = await Try.tryCatchAsync(async () => {
      return Promise.reject(new Error('Rejection'))
    })

    expect(Result.isErr(result)).toBe(true)
  })
})
```

---

## Testing Server Actions

### Mocking Payload CMS

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/api'
import * as Result from '@/core/result'

describe('api.courses.lessons.getById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Ok when lesson exists', async () => {
    // Mock Payload findByID
    const mockLesson = {
      id: 1,
      title: 'Introduction to Python',
      slug: 'intro',
      difficulty: 'BEGINNER',
      description: 'Learn Python basics'
    }

    vi.mocked(payload.findByID).mockResolvedValue(mockLesson)

    const result = await api.courses.lessons.getById(1)

    expect(Result.isOk(result)).toBe(true)
    Result.match(result, {
      ok: (lesson) => {
        expect(lesson.id).toBe(1)
        expect(lesson.title).toBe('Introduction to Python')
      },
      err: () => fail('Should be Ok')
    })
  })

  it('returns NotFoundError when lesson does not exist', async () => {
    // Mock Payload to return null
    vi.mocked(payload.findByID).mockResolvedValue(null)

    const result = await api.courses.lessons.getById(999)

    expect(Result.isErr(result)).toBe(true)
    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('NotFound')
        expect(error.resource).toBe('lesson')
        expect(error.id).toBe('999')
      }
    })
  })

  it('returns DatabaseError when Payload throws', async () => {
    // Mock Payload to throw
    vi.mocked(payload.findByID).mockRejectedValue(
      new Error('Database connection lost')
    )

    const result = await api.courses.lessons.getById(1)

    expect(Result.isErr(result)).toBe(true)
    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('DatabaseError')
        expect(error.operation).toBe('findByID')
      }
    })
  })
})
```

---

### Testing Server Actions with Result Chain

```typescript
describe('getLessonWithNavigation', () => {
  it('returns Ok with full lesson data', async () => {
    const mockCourse = {
      id: 1,
      title: 'Python Basics',
      slug: 'python-basics',
      modules: [
        {
          moduleTitle: 'Chapter 1',
          slug: 'chapter-1',
          lessons: [
            { id: 1, title: 'Lesson 1', slug: 'lesson-1' },
            { id: 2, title: 'Lesson 2', slug: 'lesson-2' }
          ]
        }
      ]
    }

    mockPayloadFind.mockResolvedValue({
      docs: [mockCourse]
    })

    const result = await api.courses.lessons.get({
      courseSlug: 'python-basics',
      chapterSlug: 'chapter-1',
      lessonSlug: 'lesson-1'
    })

    Result.match(result, {
      ok: (data) => {
        expect(data.lesson).toBeDefined()
        expect(data.navigation.prev).toBeNull()
        expect(data.navigation.next).toBeDefined()
        expect(data.navigation.currentIndex).toBe(0)
        expect(data.navigation.totalLessons).toBe(2)
      },
      err: () => fail('Should be Ok')
    })
  })

  it('returns NotFoundError when course does not exist', async () => {
    mockPayloadFind.mockResolvedValue({ docs: [] })

    const result = await api.courses.lessons.get({
      courseSlug: 'nonexistent',
      chapterSlug: 'chapter-1',
      lessonSlug: 'lesson-1'
    })

    expect(Result.isErr(result)).toBe(true)
    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('NotFound')
        expect(error.resource).toBe('course')
      }
    })
  })

  it('provides correct navigation for first lesson', async () => {
    const mockCourse = {
      modules: [{
        lessons: [
          { id: 1, slug: 'first-lesson' },
          { id: 2, slug: 'second-lesson' }
        ]
      }]
    }

    mockPayloadFind.mockResolvedValue({ docs: [mockCourse] })

    const result = await api.courses.lessons.get({
      courseSlug: 'test',
      chapterSlug: 'chapter-1',
      lessonSlug: 'first-lesson'
    })

    Result.match(result, {
      ok: (data) => {
        expect(data.navigation.prev).toBeNull()
        expect(data.navigation.next).not.toBeNull()
      },
      err: () => fail('Should be Ok')
    })
  })

  it('provides correct navigation for last lesson', async () => {
    const mockCourse = {
      modules: [{
        lessons: [
          { id: 1, slug: 'first-lesson' },
          { id: 2, slug: 'last-lesson' }
        ]
      }]
    }

    mockPayloadFind.mockResolvedValue({ docs: [mockCourse] })

    const result = await api.courses.lessons.get({
      courseSlug: 'test',
      chapterSlug: 'chapter-1',
      lessonSlug: 'last-lesson'
    })

    Result.match(result, {
      ok: (data) => {
        expect(data.navigation.prev).not.toBeNull()
        expect(data.navigation.next).toBeNull()
      },
      err: () => fail('Should be Ok')
    })
  })
})
```

---

## Testing TanStack Query

### Testing Query Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLessonQuery } from '@/queries/courses'

describe('useLessonQuery', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retry for tests
        },
      },
    })
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('returns lesson data on success', async () => {
    const mockLesson = {
      id: 1,
      title: 'Test Lesson',
      slug: 'test-lesson'
    }

    // Mock the server action
    vi.mocked(api.courses.lessons.get).mockResolvedValue(
      ok(mockLesson)
    )

    const { result } = renderHook(
      () => useLessonQuery({
        courseSlug: 'test',
        chapterSlug: 'chapter-1',
        lessonSlug: 'test-lesson'
      }),
      { wrapper }
    )

    // Initially loading
    expect(result.current.isLoading).toBe(true)

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check result
    expect(Result.isOk(result.current.data)).toBe(true)
    Result.match(result.current.data!, {
      ok: (lesson) => {
        expect(lesson.title).toBe('Test Lesson')
      },
      err: () => fail('Should be Ok')
    })
  })

  it('returns error on failure', async () => {
    // Mock to return error
    vi.mocked(api.courses.lessons.get).mockResolvedValue(
      err(notFound('lesson', '999'))
    )

    const { result } = renderHook(
      () => useLessonQuery({
        courseSlug: 'test',
        chapterSlug: 'chapter-1',
        lessonSlug: 'nonexistent'
      }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(Result.isErr(result.current.data)).toBe(true)
  })

  it('does not fetch when disabled', () => {
    const { result } = renderHook(
      () => useLessonQuery({
        courseSlug: '',
        chapterSlug: '',
        lessonSlug: ''
      }),
      { wrapper }
    )

    // Should not fetch when slugs are empty
    expect(api.courses.lessons.get).not.toHaveBeenCalled()
  })
})
```

---

### Testing Mutation Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useProgressMutation } from '@/mutations/courses'

describe('useProgressMutation', () => {
  it('calls updateProgress on mutate', async () => {
    const mockProgress = {
      status: 'in_progress',
      solutionUnlocked: false
    }

    vi.mocked(api.courses.progress.update).mockResolvedValue(
      ok(mockProgress)
    )

    const { result } = renderHook(
      () => useProgressMutation({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1
      })
    )

    // Trigger mutation
    result.current.update({ status: 'in_progress' })

    await waitFor(() => {
      expect(api.courses.progress.update).toHaveBeenCalledWith({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1,
        updates: { status: 'in_progress' }
      })
    })
  })

  it('optimistically updates query cache', async () => {
    const queryClient = new QueryClient()

    // Set initial data
    queryClient.setQueryData(
      ['progress', 'user-1', 1],
      { status: 'not_started', solutionUnlocked: false }
    )

    const { result } = renderHook(
      () => useProgressMutation({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1
      }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      }
    )

    // Trigger mutation with optimistic update
    result.current.update({ status: 'completed' })

    // Check optimistic update
    await waitFor(() => {
      const cached = queryClient.getQueryData(['progress', 'user-1', 1])
      expect(cached).toEqual({
        status: 'completed',
        solutionUnlocked: false
      })
    })
  })

  it('rolls back on error', async () => {
    const queryClient = new QueryClient()
    const previousData = { status: 'not_started' }

    queryClient.setQueryData(['progress', 'user-1', 1], previousData)

    // Mock to reject
    vi.mocked(api.courses.progress.update).mockRejectedValue(
      new Error('Network error')
    )

    const { result } = renderHook(
      () => useProgressMutation({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1
      }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      }
    )

    await result.current.update({ status: 'completed' })

    await waitFor(() => {
      // Should roll back to previous data
      const cached = queryClient.getQueryData(['progress', 'user-1', 1])
      expect(cached).toEqual(previousData)
    })
  })

  it('provides convenience methods', async () => {
    vi.mocked(api.courses.progress.update).mockResolvedValue(
      ok({ status: 'completed' })
    )

    const { result } = renderHook(
      () => useProgressMutation({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1
      })
    )

    // Test unlock
    result.current.unlock()
    await waitFor(() => {
      expect(api.courses.progress.update).toHaveBeenCalledWith({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1,
        updates: { solutionUnlocked: true }
      })
    })

    // Test complete
    result.current.complete()
    await waitFor(() => {
      expect(api.courses.progress.update).toHaveBeenCalledWith({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1,
        updates: { status: 'completed' }
      })
    })
  })
})
```

---

### Testing Query Invalidation

```typescript
describe('Query invalidation', () => {
  it('invalidates progress query after mutation', async () => {
    const queryClient = new QueryClient()
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    // Set up initial data
    queryClient.setQueryData(['progress', 'user-1', 1], {
      status: 'not_started'
    })

    const { result } = renderHook(
      () => useProgressMutation({
        userId: 'user-1',
        lessonId: 1,
        courseId: 1
      }),
      {
        wrapper: ({ children }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        )
      }
    )

    await result.current.update({ status: 'completed' })

    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['progress', 'user-1', 1]
      })
    })
  })
})
```

---

## Testing React Components

### Testing Component with Maybe

```typescript
import { render, screen } from '@testing-library/react'
import { UserAvatar } from '@/components/user/user-avatar'

describe('UserAvatar', () => {
  it('renders avatar when user is Some', () => {
    const user = some({
      id: '1',
      name: 'Alice',
      avatar: '/avatar.jpg'
    })

    render(<UserAvatar user={user} />)

    expect(screen.getByAltText('Alice')).toBeInTheDocument()
    expect(screen.getByAltText('Alice')).toHaveAttribute('src', '/avatar.jpg')
  })

  it('renders fallback when user is Nothing', () => {
    const user = nothing

    render(<UserAvatar user={user} />)

    expect(screen.getByText('Unknown user')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders loading state when isLoading is true', () => {
    const user = nothing

    render(<UserAvatar user={user} isLoading={true} />)

    expect(screen.getByTestId('avatar-skeleton')).toBeInTheDocument()
  })
})
```

---

### Testing Component with Result

```typescript
import { render, screen } from '@testing-library/react'
import { LessonContent } from '@/components/courses/lessons/lesson-content'

describe('LessonContent', () => {
  it('renders lesson when Result is Ok', () => {
    const lesson = ok({
      id: 1,
      title: 'Introduction',
      content: 'Learn Python'
    })

    render(<LessonContent lessonResult={lesson} />)

    expect(screen.getByText('Introduction')).toBeInTheDocument()
    expect(screen.getByText('Learn Python')).toBeInTheDocument()
  })

  it('renders error when Result is Err with NotFoundError', () => {
    const lesson = err(notFound('lesson', '999'))

    render(<LessonContent lessonResult={lesson} />)

    expect(screen.getByText('Lesson not found')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument()
  })

  it('renders error when Result is Err with ValidationError', () => {
    const lesson = err(validationError('quiz', 'Invalid answer', 'BAD_ANSWER'))

    render(<LessonContent lessonResult={lesson} />)

    expect(screen.getByText('Validation failed')).toBeInTheDocument()
    expect(screen.getByText(/quiz.*Invalid answer/i)).toBeInTheDocument()
  })

  it('renders loading when Result is loading', () => {
    const lesson = 'loading' as any

    render(<LessonContent lessonResult={lesson} />)

    expect(screen.getByTestId('lesson-skeleton')).toBeInTheDocument()
  })
})
```

---

### Testing User Interactions

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizExercise } from '@/components/courses/lessons/quiz-exercise'

describe('QuizExercise', () => {
  it('submits selected answers', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({
      success: true,
      score: 100,
      correct: 5,
      total: 5
    })

    render(<QuizExercise quizId={1} submitQuiz={mockSubmit} />)

    // Select answer for first question
    const firstAnswer = screen.getByLabelText('Answer 1')
    await userEvent.click(firstAnswer)

    // Click submit
    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    // Wait for submission
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          '1': expect.any(String)
        })
      )
    })

    // Check results displayed
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('5/5 correct')).toBeInTheDocument()
  })

  it('shows retry option on incorrect answer', async () => {
    const mockSubmit = vi.fn().mockResolvedValue({
      success: true,
      score: 60,
      correct: 3,
      total: 5
    })

    render(<QuizExercise quizId={1} submitQuiz={mockSubmit} />)

    // Submit and get results
    await waitFor(() => {
      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    // Click retry on question
    const retryButton = screen.getByLabelText(/retry question 1/i)
    await userEvent.click(retryButton)

    // Verify retry function called
    await waitFor(() => {
      expect(mockRetryQuestion).toHaveBeenCalledWith('q1')
    })
  })
})
```

---

## Testing Error Scenarios

### Testing Error Type Guards

```typescript
import { isNotFound, isValidationError, isUnauthorized } from '@/core/errors'

describe('Error type guards', () => {
  it('correctly identifies NotFoundError', () => {
    const error = notFound('lesson', '123')
    const appError = error as AppError

    expect(isNotFound(appError)).toBe(true)
    expect(isValidationError(appError)).toBe(false)
    expect(isUnauthorized(appError)).toBe(false)
  })

  it('narrows type with type guard', () => {
    const error = notFound('lesson', '123')
    const appError = error as AppError

    if (isNotFound(appError)) {
      // TypeScript knows appError is NotFoundError here
      expect(appError.resource).toBe('lesson')
      expect(appError.id).toBe('123')
      // TypeScript would error if accessing error.field
    }
  })
})
```

---

### Testing Error Recovery

```typescript
import { retryWithBackoff } from '@/core/retry'

describe('retryWithBackoff', () => {
  it('retries failed requests with exponential backoff', async () => {
    let attempts = 0
    const mockFn = vi.fn().mockImplementation(() => {
      attempts++
      if (attempts < 3) {
        return Promise.resolve(
          err(networkError('test', 'Service unavailable'))
        )
      }
      return Promise.resolve(ok({ success: true }))
    })

    const result = await retryWithBackoff(mockFn, {
      maxRetries: 3,
      baseDelay: 100
    })

    // Should have tried 3 times
    expect(attempts).toBe(3)

    // Should succeed
    expect(Result.isOk(result)).toBe(true)
  })

  it('does not retry non-retryable errors', async () => {
    const notFoundError = notFound('lesson', '999')
    const mockFn = vi.fn().mockResolvedValue(err(notFoundError))

    const result = await retryWithBackoff(mockFn, {
      maxRetries: 3,
      shouldRetry: (error) => isNetworkError(error) // Only retry network errors
    })

    // Should only try once
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(Result.isErr(result)).toBe(true)
  })

  it('delays between retries with exponential backoff', async () => {
    const delays: number[] = []
    const mockSleep = vi.fn().mockImplementation((ms) => {
      delays.push(ms)
      return Promise.resolve()
    })

    // Mock sleep (you'd need to inject this)
    vi.doMock('@/core/retry', () => ({
      retryWithBackoff: async (fn, opts) => {
        // Implementation with mocked sleep
      }
    }))

    const result = await retryWithBackoff(mockFn, {
      maxRetries: 3,
      baseDelay: 100
    })

    // Verify exponential backoff: 100ms, 200ms, 400ms
    expect(delays).toEqual([100, 200, 400])
  })
})
```

---

### Testing Circuit Breaker

```typescript
import { CircuitBreaker } from '@/core/circuit-breaker'

describe('CircuitBreaker', () => {
  it('opens circuit after threshold failures', async () => {
    const mockFn = vi.fn().mockResolvedValue(
      err(serviceUnavailable('test'))
    )

    const breaker = new CircuitBreaker(mockFn, {
      failureThreshold: 3,
      resetTimeout: 60000
    })

    // First 3 failures
    for (let i = 0; i < 3; i++) {
      const result = await breaker.execute()
      expect(Result.isErr(result)).toBe(true)
    }

    // Circuit should now be open
    expect(breaker.getState()).toBe('open')

    // Next call should fail immediately without executing function
    const result = await breaker.execute()
    expect(Result.isErr(result)).toBe(true)
    expect(mockFn).toHaveBeenCalledTimes(3) // Not called again
  })

  it('transitions to half-open after timeout', async () => {
    vi.useFakeTimers()

    const mockFn = vi.fn()
      .mockResolvedValueOnce(err(serviceUnavailable('test')))
      .mockResolvedValueOnce(ok({ success: true }))

    const breaker = new CircuitBreaker(mockFn, {
      failureThreshold: 1,
      resetTimeout: 1000
    })

    // First failure opens circuit
    await breaker.execute()
    expect(breaker.getState()).toBe('open')

    // Advance time past reset timeout
    vi.advanceTimersByTime(1001)

    // Next call should transition to half-open and execute
    const result = await breaker.execute()
    expect(breaker.getState()).toBe('half-open')
    expect(Result.isOk(result)).toBe(true)

    vi.useRealTimers()
  })

  it('closes circuit after successful half-open calls', async () => {
    const mockFn = vi.fn().mockResolvedValue(ok({ success: true }))

    const breaker = new CircuitBreaker(mockFn, {
      failureThreshold: 1,
      resetTimeout: 1000
    })

    // Open circuit
    breaker.getState = () => 'half-open'

    // Successful execution should close circuit
    const result = await breaker.execute()
    expect(Result.isOk(result)).toBe(true)
    expect(breaker.getState()).toBe('closed')
  })
})
```

---

## Property-Based Testing

### Introduction to Property-Based Testing

Traditional example-based testing tests specific inputs:

```typescript
// ❌ Example-based
it('adds numbers', () => {
  expect(add(2, 3)).toBe(5)
  expect(add(0, 5)).toBe(5)
  expect(add(-1, 1)).toBe(0)
})
```

Property-based testing tests **properties** that should hold for **ALL** inputs:

```typescript
// ✅ Property-based
it('addition is commutative', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    expect(add(a, b)).toBe(add(b, a))
  }))
})
```

---

### Testing Maybe Properties

```typescript
import fc from 'fast-check'

describe('Maybe properties', () => {
  it('map identity: map(id) = id', () => {
    fc.assert(fc.property(fc.any(), (value) => {
      const maybe = some(value)
      const mapped = pipe(maybe, Maybe.map((x) => x))

      expect(mapped).toEqual(maybe)
    }))
  })

  it('map composition: map(g)∘map(f) = map(g∘f)', () => {
    const f = (n: number) => n * 2
    const g = (n: number) => n + 1

    fc.assert(fc.property(fc.integer(), (value) => {
      const maybe = some(value)

      const composed = pipe(maybe, Maybe.map(f), Maybe.map(g))
      const combined = pipe(maybe, Maybe.map(x => g(f(x))))

      expect(composed).toEqual(combined)
    }))
  })

  it('flatMap binds correctly: flatMap(f) applied twice = f(value)', () => {
    const f = (n: number) => some(n * 2)

    fc.assert(fc.property(fc.integer(), (value) => {
      const maybe = some(value)

      const bound = pipe(maybe, Maybe.flatMap(f), Maybe.flatMap(f))
      const direct = pipe(maybe, Maybe.flatMap(x => f(f(x))))

      expect(bound).toEqual(direct)
    }))
  })

  it('getOrElse returns value for Some, default for Nothing', () => {
    const defaultVal = -1
    const getOrDefault = Maybe.getOrElse(defaultVal)

    fc.assert(fc.property(fc.any(), (value) => {
      const someVal = some(value)
      expect(getOrDefault(someVal)).toBe(value)
    }))

    expect(getOrDefault(nothing)).toBe(defaultVal)
  })
})
```

---

### Testing Result Properties

```typescript
describe('Result properties', () => {
  it('map identity: map(id) = id', () => {
    fc.assert(fc.property(fc.any(), (value) => {
      const result = ok(value)
      const mapped = pipe(result, Result.map((x) => x))

      expect(mapped).toEqual(result)
    }))
  })

  it('all preserves order', () => {
    fc.assert(fc.property(fc.array(fc.integer(), { minLength: 1 }), (values) => {
      const results = values.map(v => ok(v))
      const combined = Result.all(results)

      Result.match(combined, {
        ok: (combinedValues) => {
          expect(combinedValues).toEqual(values)
        },
        err: () => fail('Should be Ok')
      })
    }))
  })

  it('all returns first Err when any fail', () => {
    fc.assert(fc.property(fc.array(fc.integer(), { minLength: 2, maxLength: 10 }), (values) => {
      const results = values.map((v, i) =>
        i === 2 ? err(notFound('test', String(i))) : ok(v)
      )
      const combined = Result.all(results)

      Result.match(combined, {
        ok: () => fail('Should be Err'),
        err: (error) => {
          expect(error._tag).toBe('NotFound')
          expect(error.id).toBe('2')
        }
      })
    }))
  })
})
```

---

## Mocking Strategy

### Functional Mocking

**Principle:** Mock functions should return `Result` types, not throw exceptions.

```typescript
// ✅ GOOD: Mock returns Result
const mockGetLesson = vi.fn().mockResolvedValue(
  ok({ id: 1, title: 'Test' })
)

// ❌ BAD: Mock throws
const mockGetLesson = vi.fn().mockRejectedValue(
  new Error('Not found')
)
```

---

### Mocking Payload CMS

```typescript
import { payload } from '@/payload-config'

describe('with mocked Payload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mocks findByID to return data', async () => {
    const mockLesson = {
      id: 1,
      title: 'Test Lesson'
    }

    vi.spyOn(payload, 'findByID').mockResolvedValue(
      ok(mockLesson) as any
    )

    const result = await api.courses.lessons.getById(1)

    expect(Result.isOk(result)).toBe(true)
  })

  it('mocks findByID to return null', async () => {
    vi.spyOn(payload, 'findByID').mockResolvedValue(
      null
    )

    const result = await api.courses.lessons.getById(1)

    expect(Result.isErr(result)).toBe(true)
  })

  it('mocks findByID to throw', async () => {
    vi.spyOn(payload, 'findByID').mockRejectedValue(
      new Error('Database error')
    )

    const result = await api.courses.lessons.getById(1)

    expect(Result.isErr(result)).toBe(true)
    Result.match(result, {
      ok: () => fail('Should be Err'),
      err: (error) => {
        expect(error._tag).toBe('DatabaseError')
      }
    })
  })
})
```

---

### Mocking Server Actions

```typescript
// Mock server action that returns Result
vi.mock('@/api/courses', () => ({
  courses: {
    lessons: {
      get: vi.fn()
    }
  }
}))

import { api } from '@/api'

describe('with mocked API', () => {
  it('mocks successful lesson fetch', async () => {
    vi.mocked(api.courses.lessons.get).mockResolvedValue(
      ok({ id: 1, title: 'Test' })
    )

    const result = await api.courses.lessons.get({
      courseSlug: 'test',
      chapterSlug: 'test',
      lessonSlug: 'test'
    })

    expect(Result.isOk(result)).toBe(true)
  })
})
```

---

### Testing with Custom Matchers

```typescript
// tests/setup.ts

import { expect } from 'vitest'
import * as Result from '@/core/result'
import * as Maybe from '@/core/maybe'

// Custom matcher for Ok
expect.extend({
  toBeOk(received: unknown) {
    const pass = Result.isOk(received)
    return {
      pass,
      message: () =>
        pass
          ? `Expected Result not to be Ok`
          : `Expected Result to be Ok, got Err`
    }
  }
})

// Custom matcher for Err
expect.extend({
  toBeErr(received: unknown) {
    const pass = Result.isErr(received)
    return {
      pass,
      message: () =>
        pass
          ? `Expected Result not to be Err`
          : `Expected Result to be Err, got Ok`
    }
  }
})

// Custom matcher for specific error type
expect.extend({
  toBeErrorWithTag(received: unknown, tag: string) {
    if (!Result.isErr(received)) {
      return {
        pass: false,
        message: () => `Expected Result to be Err, got Ok`
      }
    }

    const pass = received.error._tag === tag
    return {
      pass,
      message: () =>
        pass
          ? `Expected error not to have tag "${tag}"`
          : `Expected error to have tag "${tag}", got "${received.error._tag}"`
    }
  }
})

// Usage in tests
it('returns NotFoundError', async () => {
  const result = await getLesson(999)

  expect(result).toBeErr()
  expect(result).toBeErrorWithTag('NotFound')
})
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Not Testing Err Branches

```typescript
// ❌ BAD: Only tests Ok path
it('returns lesson', async () => {
  const result = await getLesson(1)
  expect(Result.isOk(result)).toBe(true)
  // What about when it errors?
})

// ✅ GOOD: Tests both Ok and Err
describe('getLesson', () => {
  it('returns Ok when lesson exists', async () => {
    const result = await getLesson(1)
    expect(result).toBeOk()
  })

  it('returns NotFoundError when lesson does not exist', async () => {
    const result = await getLesson(999)
    expect(result).toBeErr()
    expect(result).toBeErrorWithTag('NotFound')
  })
})
```

---

### ❌ Anti-Pattern 2: Using try/catch in Tests

```typescript
// ❌ BAD: Tests expect throws
it('throws when lesson not found', async () => {
  await expect(async () => {
    await getLesson(999)
  }).rejects.toThrow('Not found')
})

// ✅ GOOD: Tests return Result
it('returns NotFoundError when lesson not found', async () => {
  const result = await getLesson(999)

  expect(result).toBeErr()
  match(result, {
    ok: () => fail('Should be Err'),
    err: (error) => {
      expect(error._tag).toBe('NotFound')
    }
  })
})
```

---

### ❌ Anti-Pattern 3: Mocking Implementation Details

```typescript
// ❌ BAD: Tests how code works
it('calls payload.findByID with correct id', async () => {
  const spy = vi.spyOn(payload, 'findByID')
  await getLesson(123)
  expect(spy).toHaveBeenCalledWith({ collection: 'lessons', id: 123 })
})

// ✅ GOOD: Tests what code does
it('returns lesson data', async () => {
  const result = await getLesson(123)

  match(result, {
    ok: (lesson) => {
      expect(lesson.title).toBe('Introduction to Python')
    },
    err: () => fail('Should be Ok')
  })
})
```

---

### ❌ Anti-Pattern 4: Not Using match()

```typescript
// ❌ BAD: Manual type checking
it('returns NotFoundError', async () => {
  const result = await getLesson(999)

  if (Result.isErr(result)) {
    if (result.error._tag === 'NotFound') {
      expect(result.error.resource).toBe('lesson')
    } else {
      fail('Wrong error type')
    }
  } else {
    fail('Should be Err')
  }
})

// ✅ GOOD: Using match with exhaustiveness
it('returns NotFoundError', async () => {
  const result = await getLesson(999)

  match(result, {
    ok: () => fail('Should be Err'),
    err: (error) => match(error, {
      NotFound: ({ resource, id }) => {
        expect(resource).toBe('lesson')
        expect(id).toBe('999')
      },
      // TypeScript errors if we forget other error types
    })
  })
})
```

---

### ❌ Anti-Pattern 5: Testing String Messages

```typescript
// ❌ BAD: Tests error messages (brittle)
it('returns NotFoundError', async () => {
  const result = await getLesson(999)

  if (Result.isErr(result)) {
    expect(result.error.message).toBe('Lesson not found')
    // Breaks if message changes
  }
})

// ✅ GOOD: Tests error structure
it('returns NotFoundError', async () => {
  const result = await getLesson(999)

  match(result, {
    ok: () => fail('Should be Err'),
    err: (error) => {
      expect(error._tag).toBe('NotFound')
      expect(error.resource).toBe('lesson')
      // Message can change without breaking test
    }
  })
})
```

---

## Test Coverage

### Coverage Targets

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],

      // Targets
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,

      // Exclude generated files
      exclude: [
        'node_modules/',
        'src/payload-types.ts',
        'src/core/ide/stores/',
      ]
    }
  }
})
```

---

### Critical Path Coverage

**Priority 1: Must Have 100% Coverage**
- Functional type utilities (`src/core/types/`)
- Result/Maybe/Try combinators (`src/core/`)
- Error constructors (`src/core/errors/`)

**Priority 2: 80%+ Coverage**
- Server actions (`src/api/`)
- Queries (`src/queries/`)
- Mutations (`src/mutations/`)
- Compiler (`src/core/compiler/`)

**Priority 3: 60%+ Coverage**
- Components (`src/components/`)
- Hooks (`src/hooks/`)
- Utils (`src/lib/`)

---

### Coverage by Feature

```
src/
├── core/
│   ├── types/        ✅ 100% (simple, critical)
│   ├── maybe.ts      ✅ 100%
│   ├── result.ts     ✅ 100%
│   ├── try.ts        ✅ 100%
│   ├── errors/       ✅ 100%
│   └── retry.ts      ✅ 80% (complex)
│
├── api/              ✅ 90% (critical paths)
├── queries/          ✅ 85%
├── mutations/        ✅ 85%
├── components/       ✅ 70% (presentational)
└── hooks/            ✅ 75%
```

---

## Summary

### Testing Principles

1. **Test Outcomes, Not Implementation**: Test Result types, not internal details
2. **Test All Branches**: Both Ok and Err paths
3. **Use Type Guards**: Leverage TypeScript for type-safe tests
4. **Mock with Result**: Mocked functions return Result, not throw
5. **Property-Based Tests**: Test universal properties, not specific examples

---

### Testing Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TESTING PYRAMID                           │
└─────────────────────────────────────────────────────────────┘

                E2E Tests (Playwright)
                    Few, critical user flows
                  ↓
            Integration Tests (Vitest)
                API, Server Actions
              ↓
          Unit Tests (Vitest)
        Pure functions, Result types
      ↓
    Property-Based Tests (fast-check)
  Universal properties, edge cases
```

---

### Key Differences from Traditional Testing

| Aspect | Traditional | Functional |
|--------|-----------|-------------|
| **Error testing** | try/catch, `toThrow()` | Test Result types |
| **Mocking** | Mock implementations | Mock Result returns |
| **Async testing** | `rejects.toThrow()` | Test Result<T, E> |
| **Coverage** | Lines of code | Branch coverage (Ok/Err) |
| **Properties** | Example-based | Property-based |

---

### Benefits of Functional Testing

1. **Type Safety**: Compiler verifies all cases are handled
2. **Predictable**: No surprise exceptions in tests
3. **Composable**: Easy to test complex chains
4. **Fast**: Pure functions, no mocking complexity
5. **Maintainable**: Tests don't break when implementation changes

---

**Last Updated:** 2026-01-24
**Status:** Final
**Version:** 1.0.0
