# Functional Programming Guidelines

## Overview

This document defines the functional programming approach used throughout the Python Secrets platform. We use a **100% functional approach** with no classes, no enums, only functions and types.

## Table of Contents

- [Core Principles](#core-principles)
- [Algebraic Data Types](#algebraic-data-types)
- [Type Definitions](#type-definitions)
- [Utilities & Combinators](#utilities--combinators)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Real-world Examples](#real-world-examples)
- [Testing](#testing)
- [Migration Guide](#migration-guide)

---

## Core Principles

### 1. **Pure Functions**
All functions must be pure: same input → same output, no side effects.

```typescript
// ✅ Pure
const add = (a: number, b: number): number => a + b

// ❌ Impure (depends on external state)
let counter = 0
const increment = (): number => ++counter
```

### 2. **Immutable Data**
Never mutate data, always create new copies.

```typescript
// ✅ Immutable
const addUser = (users: User[], user: User): User[] => [...users, user]

// ❌ Mutable
const addUser = (users: User[], user: User): void => {
  users.push(user)
}
```

### 3. **Composable Functions**
Small functions that compose together.

```typescript
// ✅ Composable
const double = (n: number): number => n * 2
const increment = (n: number): number => n + 1
const transform = pipe(double, increment) // (n) => (n * 2) + 1

// ❌ Monolithic
const transform = (n: number): number => {
  const doubled = n * 2
  return doubled + 1
}
```

### 4. **Explicit Error Handling**
No exceptions, use Result types for operations that can fail.

```typescript
// ✅ Explicit errors
const divide = (a: number, b: number): Result<number, Error> =>
  b === 0 ? err(new Error('Division by zero')) : ok(a / b)

// ❌ Exceptions
const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}
```

### 5. **No Classes, No Enums**
Only functions and types.

```typescript
// ✅ Functions and types
type Status = 'not_started' | 'in_progress' | 'completed'
const getStatus = (status: Status): string => status

// ❌ Enums
enum Status {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed'
}

// ❌ Classes
class User {
  constructor(public id: string, public name: string) {}
}
```

---

## Algebraic Data Types

We use four core algebraic data types:

### 1. **Maybe<T>**
Represents an optional value. Either `Some<T>` (exists) or `Nothing` (doesn't exist).

### 2. **Result<T, E>**
Represents a computation that can fail. Either `Ok<T>` (success) or `Err<E>` (failure).

### 3. **Try<T>**
Represents a computation that might throw. Wraps exceptions in a Result.

### 4. **Unit**
Represents a function with no meaningful return value (like `void` but functional).

---

## Type Definitions

### Maybe<T>

```typescript
// src/core/types/maybe.ts

export type Maybe<T> = Some<T> | Nothing

export interface Some<T> {
  _tag: 'Some'
  value: T
}

export interface Nothing {
  _tag: 'Nothing'
}

// Constructors
export const some = <T>(value: T): Some<T> => ({ _tag: 'Some', value })
export const nothing: Nothing = { _tag: 'Nothing' }

// Type guards
export const isSome = <T>(maybe: Maybe<T>): maybe is Some<T> => maybe._tag === 'Some'
export const isNothing = <T>(maybe: Maybe<T>): maybe is Nothing => maybe._tag === 'Nothing'
```

### Result<T, E>

```typescript
// src/core/types/result.ts

export type Result<T, E> = Ok<T> | Err<E>

export interface Ok<T> {
  _tag: 'Ok'
  value: T
}

export interface Err<E> {
  _tag: 'Err'
  error: E
}

// Constructors
export const ok = <T>(value: T): Ok<T> => ({ _tag: 'Ok', value })
export const err = <E>(error: E): Err<E> => ({ _tag: 'Err', error })

// Type guards
export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result._tag === 'Ok'
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result._tag === 'Err'
```

### Try<T>

```typescript
// src/core/types/try.ts

import type { Result } from './result'
import { ok, err } from './result'

export type Try<T> = Result<T, Error>

// Wrap a function that might throw
export const tryCatch = <T>(fn: () => T): Try<T> => {
  try {
    return ok(fn())
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}

// Wrap an async function that might throw
export const tryCatchAsync = async <T>(fn: () => Promise<T>): Promise<Try<T>> => {
  try {
    return ok(await fn())
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)))
  }
}
```

### Unit

```typescript
// src/core/types/unit.ts

export type Unit = void

// Constructor (useful for chaining)
export const unit: Unit = undefined

// Use for functions with no return value
export const asUnit = <T>(_value: T): Unit => undefined
```

---

## Utilities & Combinators

### Maybe Utilities

```typescript
// src/core/maybe.ts

import type { Maybe } from './types/maybe'
import { some, nothing, isSome } from './types/maybe'

/**
 * Get the value or return a default
 */
export const getOrElse = <T>(defaultValue: T) => (maybe: Maybe<T>): T =>
  isSome(maybe) ? maybe.value : defaultValue

/**
 * Transform the value if it exists
 */
export const map = <A, B>(fn: (value: A) => B) => (maybe: Maybe<A>): Maybe<B> =>
  isSome(maybe) ? some(fn(maybe.value)) : nothing

/**
 * Chain Maybe-returning functions
 */
export const flatMap = <A, B>(fn: (value: A) => Maybe<B>) => (maybe: Maybe<A>): Maybe<B> =>
  isSome(maybe) ? fn(maybe.value) : nothing

/**
 * Filter with a predicate
 */
export const filter = <T>(predicate: (value: T) => boolean) => (maybe: Maybe<T>): Maybe<T> =>
  isSome(maybe) && predicate(maybe.value) ? maybe : nothing

/**
 * Convert from nullable
 */
export const fromNullable = <T>(value: T | null | undefined): Maybe<T> =>
  value === null || value === undefined ? nothing : some(value)

/**
 * Convert to nullable
 */
export const toNullable = <T>(maybe: Maybe<T>): T | null =>
  isSome(maybe) ? maybe.value : null

/**
 * Match both cases
 */
export const match = <A, B>(callbacks: {
  some: (value: A) => B
  nothing: () => B
}) => (maybe: Maybe<A>): B =>
  isSome(maybe) ? callbacks.some(maybe.value) : callbacks.nothing()
```

### Result Utilities

```typescript
// src/core/result.ts

import type { Result } from './types/result'
import { ok, err, isOk } from './types/result'

/**
 * Transform the success value
 */
export const map = <T, U, E>(fn: (value: T) => U) => (result: Result<T, E>): Result<U, E> =>
  isOk(result) ? ok(fn(result.value)) : err(result.error)

/**
 * Transform the error
 */
export const mapError = <T, E, F>(fn: (error: E) => F) => (result: Result<T, E>): Result<T, F> =>
  isOk(result) ? ok(result.value) : err(fn(result.error))

/**
 * Chain Result-returning functions
 */
export const flatMap = <T, U, E>(fn: (value: T) => Result<U, E>) => (result: Result<T, E>): Result<U, E> =>
  isOk(result) ? fn(result.value) : err(result.error)

/**
 * Get the value or return a default
 */
export const getOrElse = <T, E>(defaultValue: T) => (result: Result<T, E>): T =>
  isOk(result) ? result.value : defaultValue

/**
 * Combine multiple Results
 */
export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const values: T[] = []
  for (const result of results) {
    if (isOk(result)) {
      values.push(result.value)
    } else {
      return err(result.error)
    }
  }
  return ok(values)
}

/**
 * Convert from nullable (null = error)
 */
export const fromNullable = <T, E>(error: E) => (value: T | null | undefined): Result<T, E> =>
  value === null || value === undefined ? err(error) : ok(value)

/**
 * Convert to Maybe
 */
export const toMaybe = <T, E>(result: Result<T, E>): Maybe<T> =>
  isOk(result) ? some(result.value) : nothing

/**
 * Match both cases
 */
export const match = <T, E, U>(callbacks: {
  ok: (value: T) => U
  err: (error: E) => U
}) => (result: Result<T, E>): U =>
  isOk(result) ? callbacks.ok(result.value) : callbacks.err(result.error)
```

### Function Composition

```typescript
// src/core/function.ts

/**
 * Compose two functions: f(g(x))
 */
export const compose = <A, B, C>(
  f: (b: B) => C,
  g: (a: A) => B
): ((a: A) => C) => (a) => f(g(a))

/**
 * Pipe functions left to right: g(f(x))
 */
export const pipe = <A, B>(f: (a: A) => B): ((a: A) => B) => f

export const pipe2 = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
): ((a: A) => C) => (a) => g(f(a))

export const pipe3 = <A, B, C, D>(
  f: (a: A) => B,
  g: (b: B) => C,
  h: (c: C) => D
): ((a: A) => D) => (a) => h(g(f(a)))

export const pipe4 = <A, B, C, D, E>(
  f: (a: A) => B,
  g: (b: B) => C,
  h: (c: C) => D,
  i: (d: D) => E
): ((a: A) => E) => (a) => i(h(g(f(a))))

/**
 * Curry a function
 */
export const curry = <T extends (...args: any[]) => any>(fn: T): Curried<T> =>
  ((...args: any[]) =>
    args.length >= fn.length
      ? fn(...args)
      : curry((...more: any[]) => fn(...args, ...more))) as Curried<T>

type Curried<T> = T extends (...args: infer A) => infer R
  ? A extends [infer First, ...infer Rest]
    ? Rest['length'] extends 0
      ? (arg: First) => R
      : (arg: First) => Curried<(...args: Rest) => R>
    : () => R
  : never

/**
 * Flip the first two arguments
 */
export const flip =
  <A, B, C>(fn: (a: A, b: B) => C) =>
  (b: B, a: A): C =>
    fn(a, b)

/**
 * Apply a function to a value
 */
export const apply = <A, B>(fn: (a: A) => B) => (a: A): B => fn(a)
```

### Array Utilities (Functional)

```typescript
// src/core/array.ts

/**
 * Filter and map in one pass
 */
export const filterMap = <A, B>(
  fn: (value: A, index: number) => Maybe<B>
): ((array: A[]) => B[]) => (array) => {
  const result: B[] = []
  for (let i = 0; i < array.length; i++) {
    const mapped = fn(array[i], i)
    if (isSome(mapped)) {
      result.push(mapped.value)
    }
  }
  return result
}

/**
 * Find first element matching predicate
 */
export const findFirst = <T>(
  predicate: (value: T) => boolean
): ((array: T[]) => Maybe<T>) => (array) => {
  for (const item of array) {
    if (predicate(item)) return some(item)
  }
  return nothing
}

/**
 * Group by key
 */
export const groupBy = <T, K extends string | number>(
  fn: (value: T) => K
): ((array: T[]) => Record<K, T[]>) => (array) =>
  array.reduce((groups, item) => {
    const key = fn(item)
    return { ...groups, [key]: [...(groups[key] || []), item] }
  }, {} as Record<K, T[]>)

/**
 * Unique by key
 */
export const uniqueBy = <T, K extends string | number>(
  fn: (value: T) => K
): ((array: T[]) => T[]) => (array) => {
  const seen = new Set<K>()
  return array.filter((item) => {
    const key = fn(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
```

---

## Common Patterns

### 1. Chaining Maybe Operations

```typescript
import * as Maybe from '@/core/maybe'

const findUserByEmail = (email: string, users: User[]): Maybe<User> =>
  pipe(
    users,
    Maybe.findFirst(user => user.email === email),
    Maybe.filter(user => user.isActive),
    Maybe.map(user => ({ ...user, displayName: `${user.firstName} ${user.lastName}` }))
  )
```

### 2. Chaining Result Operations

```typescript
import * as Result from '@/core/result'

const processPayment = async (paymentId: string): Result<Receipt, PaymentError> =>
  pipe(
    await Result.tryCatchAsync(() => fetchPayment(paymentId)),
    Result.flatMap(payment => validatePayment(payment)),
    Result.flatMap(payment => Result.tryCatchAsync(() => chargePayment(payment))),
    Result.flatMap(receipt => sendReceipt(receipt))
  )
```

### 3. Converting Between Types

```typescript
import * as Maybe from '@/core/maybe'
import * as Result from '@/core/result'

// Result to Maybe
const resultToMaybe = <T, E>(result: Result<T, E>): Maybe<T> =>
  Result.match({
    ok: (value) => Maybe.some(value),
    err: () => Maybe.nothing
  })(result)

// Maybe to Result
const maybeToResult = <T, E>(onNothing: () => E) => (maybe: Maybe<T>): Result<T, E> =>
  Maybe.match({
    some: (value) => Result.ok(value),
    nothing: onNothing
  })(maybe)

// Nullable to Maybe
const findCourse = async (slug: string): Promise<Maybe<Course>> =>
  pipe(
    await payload.find({ collection: 'courses', where: { slug: { equals: slug } } }),
    (result) => Maybe.fromNullable(result.docs[0])
  )

// Nullable to Result
const findCourseOrFail = async (slug: string): Promise<Result<Course, Error>> =>
  pipe(
    await payload.find({ collection: 'courses', where: { slug: { equals: slug } } }),
    (result) => Result.fromNullable(new Error('Course not found'))(result.docs[0])
  )
```

### 4. Async Operations with Try

```typescript
import * as Try from '@/core/try'
import * as Result from '@/core/result'

const executeCode = async (code: string, compiler: 'server' | 'client'): Result<Output, Error> =>
  pipe(
    await Try.tryCatchAsync(() => compileCode(code, compiler)),
    Result.flatMap(output => validateOutput(output))
  )
```

---

## Error Handling

### No Exceptions, Only Results

```typescript
// ❌ Bad: throws exceptions
async function getLesson(id: number) {
  const lesson = await payload.findByID({ collection: 'lessons', id })
  if (!lesson) throw new Error('Lesson not found')
  return lesson
}

// ✅ Good: returns Result
async function getLesson(id: number): Promise<Result<Lesson, Error>> {
  const lesson = await Try.tryCatchAsync(() =>
    payload.findByID({ collection: 'lessons', id })
  )

  return Result.flatMap(
    Result.fromNullable(new Error('Lesson not found'))
  )(lesson)
}
```

### Error Types

```typescript
// src/core/errors.ts

export type DomainError =
  | { _tag: 'NotFound'; resource: string; id: string }
  | { _tag: 'ValidationError'; errors: ValidationError[] }
  | { _tag: 'Unauthorized'; reason: string }
  | { _tag: 'Conflict'; resource: string; details: string }

export const notFound = (resource: string, id: string): DomainError => ({
  _tag: 'NotFound',
  resource,
  id
})

export const validationError = (errors: ValidationError[]): DomainError => ({
  _tag: 'ValidationError',
  errors
})

export const unauthorized = (reason: string): DomainError => ({
  _tag: 'Unauthorized',
  reason
})

export const conflict = (resource: string, details: string): DomainError => ({
  _tag: 'Conflict',
  resource,
  details
})

// Type guards
export const isNotFound = (error: DomainError): error is Extract<DomainError, { _tag: 'NotFound' }> =>
  error._tag === 'NotFound'

export const isValidationError = (error: DomainError): error is Extract<DomainError, { _tag: 'ValidationError' }> =>
  error._tag === 'ValidationError'
```

### Error Handling Pattern

```typescript
import * as Result from '@/core/result'
import { notFound, validationError, isNotFound, isValidationError } from '@/core/errors'

const updateProgress = async ({
  userId,
  lessonId,
  courseId,
  updates
}: UpdateProgressInput): Promise<Result<UserProgress, DomainError>> => {
  // Validate input
  const validated = validateProgressInput(updates)
  if (!validated.valid) {
    return err(validationError(validated.errors))
  }

  // Check if lesson exists
  const lesson = await findLessonById(lessonId)
  if (isErr(lesson)) {
    return err(notFound('lesson', String(lessonId)))
  }

  // Update progress
  const result = await Try.tryCatchAsync(() =>
    payload.update({
      collection: 'user-progress',
      id: existing.id,
      data: updates
    })
  )

  return Result.mapErr((error) =>
    notFound('user-progress', userId)
  )(result)
}

// Usage
const result = await updateProgress({ userId, lessonId, courseId, updates })

Result.match({
  ok: (progress) => console.log('Progress updated', progress),
  err: (error) => {
    if (isNotFound(error)) {
      console.error(`Resource not found: ${error.resource}`)
    } else if (isValidationError(error)) {
      console.error('Validation failed:', error.errors)
    }
  }
})(result)
```

---

## Real-world Examples

### Example 1: Course Service

```typescript
// src/api/courses/service.ts

import * as Result from '@/core/result'
import * as Maybe from '@/core/maybe'
import * as Try from '@/core/try'
import { notFound } from '@/core/errors'

type CourseServiceError = DomainError | { _tag: 'DatabaseError'; message: string }

/**
 * Get course by slug with all lessons
 */
export const getCourseBySlug = async (
  slug: string
): Promise<Result<CourseWithLessons, CourseServiceError>> => {
  // Fetch from database
  const dbResult = await Try.tryCatchAsync(() =>
    payload.find({
      collection: 'courses',
      where: { slug: { equals: slug } },
      depth: 1
    })
  )

  const course = pipe(
    dbResult,
    Result.flatMap(query =>
      pipe(
        query.docs[0],
        Maybe.fromNullable(new Error('Course not found'))
      )
    )
  )

  return course
}

/**
 * Get lesson with navigation
 */
export const getLessonWithNavigation = async ({
  courseSlug,
  chapterSlug,
  lessonSlug
}: GetLessonInput): Promise<Result<LessonWithNavigation, CourseServiceError>> => {
  // Get course
  const courseResult = await getCourseBySlug(courseSlug)
  if (isErr(courseResult)) {
    return err(courseResult.error)
  }

  const course = courseResult.value

  // Find chapter
  const chapter = pipe(
    course.modules,
    Maybe.findFirst(m => m.slug === chapterSlug),
    Maybe.getOrElse(() => {
      throw new Error('Chapter not found')
    })
  )

  // Find lesson
  const lesson = pipe(
    chapter.lessons,
    Maybe.findFirst(l => l.slug === lessonSlug),
    Maybe.getOrElse(() => {
      throw new Error('Lesson not found')
    })
  )

  // Build navigation
  const allLessons = course.modules.flatMap(m =>
    m.lessons.map(l => ({ ...l, moduleSlug: m.slug }))
  )

  const currentIndex = allLessons.findIndex(l => l.id === lesson.id)
  const navigation = {
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null,
    currentIndex,
    totalLessons: allLessons.length
  }

  return ok({
    lesson,
    chapter: { title: chapter.moduleTitle, slug: chapter.slug },
    course: { id: course.id, title: course.title, slug: course.slug },
    navigation
  })
}
```

### Example 2: Progress Service

```typescript
// src/api/courses/progress/service.ts

import * as Result from '@/core/result'
import * as Try from '@/core/try'

/**
 * Get user progress for a lesson
 */
export const getProgress = async ({
  userId,
  lessonId
}: GetProgressInput): Promise<Result<UserProgress, Error>> => {
  const result = await Try.tryCatchAsync(() =>
    payload.find({
      collection: 'user-progress',
      where: {
        and: [
          { userId: { equals: userId } },
          { lesson: { equals: lessonId } }
        ]
      }
    })
  )

  return pipe(
    result,
    Result.map(query =>
      pipe(
        query.docs[0],
        Maybe.getOrElse(() => ({
          status: 'not_started' as const,
          solutionUnlocked: false
        }))
      )
    )
  )
}

/**
 * Update progress (create if not exists)
 */
export const updateProgress = async ({
  userId,
  lessonId,
  courseId,
  updates
}: UpdateProgressInput): Promise<Result<UserProgress, Error>> => {
  // Check if exists
  const existing = await Try.tryCatchAsync(() =>
    payload.find({
      collection: 'user-progress',
      where: {
        and: [
          { userId: { equals: userId } },
          { lesson: { equals: lessonId } }
        ]
      }
    })
  )

  // Update or create
  return pipe(
    existing,
    Result.flatMap(async (query) => {
      if (query.docs.length > 0) {
        return Try.tryCatchAsync(() =>
          payload.update({
            collection: 'user-progress',
            id: query.docs[0].id,
            data: updates
          })
        )
      } else {
        return Try.tryCatchAsync(() =>
          payload.create({
            collection: 'user-progress',
            data: {
              userId,
              lesson: lessonId,
              course: courseId,
              ...updates
            }
          })
        )
      }
    })
  )
}
```

### Example 3: Query Hook with Result

```typescript
// src/queries/courses/use-lesson-query.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'
import * as Result from '@/core/result'

export function useLessonQuery(input: GetLessonInput) {
  return useQuery({
    queryKey: ['courses', 'lessons', input],
    queryFn: () => api.courses.lessons.get(input),
    enabled: !!input.courseSlug && !!input.chapterSlug && !!input.lessonSlug,
  })
}

export function useLessonResult(input: GetLessonInput) {
  const query = useLessonQuery(input)

  return {
    lesson: pipe(
      query.data,
      Maybe.fromNullable,
      Maybe.flatMap(data => Result.toMaybe(data))
    ),
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  }
}
```

---

## Testing

### Testing Maybe

```typescript
import * as Maybe from '@/core/maybe'
import { some, nothing } from '@/core/maybe'

describe('findUserByEmail', () => {
  it('should return Some(user) when user exists', () => {
    const users = [
      { id: '1', email: 'test@example.com', isActive: true }
    ]

    const result = findUserByEmail('test@example.com', users)

    expect(Maybe.isSome(result)).toBe(true)
    expect(Maybe.getOrElse(null)(result)).toEqual(users[0])
  })

  it('should return Nothing when user not found', () => {
    const users = [
      { id: '1', email: 'test@example.com', isActive: true }
    ]

    const result = findUserByEmail('notfound@example.com', users)

    expect(Maybe.isNothing(result)).toBe(true)
  })
})
```

### Testing Result

```typescript
import * as Result from '@/core/result'
import { ok, err } from '@/core/result'

describe('updateProgress', () => {
  it('should return Ok(progress) on success', async () => {
    const result = await updateProgress({
      userId: 'user-1',
      lessonId: 1,
      courseId: 1,
      updates: { status: 'completed' }
    })

    expect(Result.isOk(result)).toBe(true)
    expect(Result.getOrElse(null)(result)).toMatchObject({
      status: 'completed'
    })
  })

  it('should return Err(error) on failure', async () => {
    const result = await updateProgress({
      userId: 'invalid-user',
      lessonId: 999,
      courseId: 999,
      updates: { status: 'completed' }
    })

    expect(Result.isErr(result)).toBe(true)
  })
})
```

---

## Migration Guide

### Step 1: Replace Optional Chaining with Maybe

**Before:**
```typescript
const user = course?.author
if (user) {
  console.log(user.name)
}
```

**After:**
```typescript
import * as Maybe from '@/core/maybe'

const user = Maybe.fromNullable(course?.author)

Maybe.match({
  some: (user) => console.log(user.name),
  nothing: () => console.log('No author')
})(user)
```

### Step 2: Replace Throw with Result

**Before:**
```typescript
async function getLesson(id: number) {
  const lesson = await payload.findByID({ collection: 'lessons', id })
  if (!lesson) throw new Error('Lesson not found')
  return lesson
}
```

**After:**
```typescript
import * as Result from '@/core/result'
import * as Try from '@/core/try'

async function getLesson(id: number): Promise<Result<Lesson, Error>> {
  const result = await Try.tryCatchAsync(() =>
    payload.findByID({ collection: 'lessons', id })
  )

  return Result.flatMap(
    Result.fromNullable(new Error('Lesson not found'))
  )(result)
}
```

### Step 3: Replace Classes with Functions

**Before:**
```typescript
class UserService {
  constructor(private db: Database) {}

  async findById(id: string) {
    return this.db.findUser(id)
  }
}

const service = new UserService(db)
const user = await service.findById('user-1')
```

**After:**
```typescript
import * as Result from '@/core/result'

const findById = (db: Database) => async (id: string): Promise<Result<User, Error>> => {
  return Try.tryCatchAsync(() => db.findUser(id))
}

const user = await findById(db)('user-1')
```

### Step 4: Replace Enums with String Unions

**Before:**
```typescript
enum ProgressStatus {
  NotStarted = 'not_started',
  InProgress = 'in_progress',
  Completed = 'completed'
}
```

**After:**
```typescript
type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

// Constants for type-safe values
const ProgressStatus = {
  notStarted: 'not_started' as const,
  inProgress: 'in_progress' as const,
  completed: 'completed' as const
}
```

---

## Summary

### Key Types

| Type | Purpose | Usage |
|------|---------|-------|
| **Maybe\<T\>** | Optional values | `some(value)` or `nothing` |
| **Result\<T, E\>** | Fallible operations | `ok(value)` or `err(error)` |
| **Try\<T\>** | Exception handling | `tryCatch(() => ...)` |
| **Unit** | No return value | `unit` |

### Key Functions

| Function | Purpose | Module |
|----------|---------|--------|
| `pipe`, `compose` | Function composition | `core/function` |
| `map`, `flatMap` | Transform values | `core/maybe`, `core/result` |
| `getOrElse` | Default values | `core/maybe`, `core/result` |
| `match` | Pattern matching | `core/maybe`, `core/result` |
| `tryCatch` | Wrap exceptions | `core/types/try` |

### Benefits

- ✅ **No exceptions**: Explicit error handling with Result
- ✅ **No null errors**: Safe optionals with Maybe
- ✅ **Type-safe**: Full type inference
- ✅ **Composable**: Everything can be chained
- ✅ **Testable**: Pure functions are easy to test
- ✅ **Predictable**: No side effects, no mutations

---

**Last Updated:** 2026-01-24
**Status:** Proposed
**Version:** 1.0.0
