# Architecture & Code Organization Guide

## Overview

This document outlines the target architecture for the Python Secrets platform. The goal is to achieve a clean, maintainable, and scalable codebase through strict separation of concerns, consistent patterns, and a tRPC-like API structure.

## Table of Contents

- [Core Principles](#core-principles)
- [Directory Structure](#directory-structure)
- [API Architecture (tRPC-like)](#api-architecture-trpc-like)
- [Data Layer (Queries & Mutations)](#data-layer-queries--mutations)
- [Component Organization](#component-organization)
- [Type System](#type-system)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## Core Principles

### 1. **Separation of Concerns**
- **Server Actions** (`src/api/`): Backend logic only
- **Queries** (`src/queries/`): Read operations with TanStack Query
- **Mutations** (`src/mutations/`): Write operations with TanStack Query
- **Hooks** (`src/hooks/`): UI-only logic (no data fetching)
- **Components** (`src/components/`): Presentation and feature logic

### 2. **tRPC-like API Structure**
All server actions are organized by domain with namespaced imports:

```typescript
// Clean, autocomplete-friendly API calls
api.courses.lessons.get({ courseSlug, chapterSlug, lessonSlug })
api.courses.progress.unlock({ userId, lessonId, courseId })
api.articles.getBySlug('my-article')
```

### 3. **Feature-based Organization**
Components are organized by feature, not by type:

```
features/
├── courses/     # All course-related components
├── articles/    # All article-related components
├── auth/        # All auth-related components
└── layout/      # Layout components
```

### 4. **Type Safety First**
All types are centralized and inferred from the API layer.

---

## Directory Structure

```
src/
├── api/                          # Server Actions (Backend Logic)
│   ├── index.ts                  # Main export with namespaces
│   ├── _types/                   # Shared API types
│   │   ├── common.ts             # Common types (ProgressStatus, etc.)
│   │   ├── courses.ts            # Course-related types
│   │   ├── articles.ts           # Article-related types
│   │   └── index.ts
│   │
│   ├── courses/                  # Namespace: courses
│   │   ├── index.ts              # Courses router (getAll, getBySlug)
│   │   ├── lessons.ts            # courses.lessons.*
│   │   ├── progress.ts           # courses.progress.*
│   │   ├── quizzes.ts            # courses.quizzes.*
│   │   └── engagement.ts         # courses.engagement.*
│   │
│   ├── articles/                 # Namespace: articles
│   │   ├── index.ts              # Articles router
│   │   └── ...
│   │
│   ├── blog/                     # Namespace: blog
│   │   ├── index.ts
│   │   └── ...
│   │
│   ├── users/                    # Namespace: users
│   │   ├── index.ts
│   │   └── ...
│   │
│   └── compiler/                 # Namespace: compiler
│       ├── index.ts
│       └── ...
│
├── queries/                      # TanStack Query Hooks (Read)
│   ├── index.ts
│   ├── courses/
│   │   ├── index.ts
│   │   ├── use-lesson-query.ts
│   │   ├── use-progress-query.ts
│   │   ├── use-engagement-query.ts
│   │   └── use-quiz-query.ts
│   ├── articles/
│   │   ├── index.ts
│   │   └── use-article-query.ts
│   └── users/
│       ├── index.ts
│       └── use-session-query.ts
│
├── mutations/                    # TanStack Query Hooks (Write)
│   ├── index.ts
│   ├── courses/
│   │   ├── index.ts
│   │   ├── use-progress-mutation.ts
│   │   ├── use-engagement-mutation.ts
│   │   └── use-quiz-mutation.ts
│   └── ...
│
├── hooks/                        # UI-only Hooks (No data fetching)
│   ├── use-mobile.ts
│   ├── use-theme.ts
│   └── use-media-query.ts
│
├── components/                   # UI Components
│   ├── _shared/                  # Globally shared components
│   │   ├── button/
│   │   │   ├── button.tsx
│   │   │   ├── button.test.tsx
│   │   │   └── index.ts
│   │   ├── input/
│   │   ├── card/
│   │   └── ...
│   │
│   ├── features/                 # Feature-specific components
│   │   ├── courses/
│   │   │   ├── course-card/
│   │   │   │   ├── course-card.tsx
│   │   │   │   ├── course-card.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── lesson-navigation/
│   │   │   ├── quiz/
│   │   │   ├── ide/
│   │   │   └── index.ts
│   │   │
│   │   ├── articles/
│   │   │   ├── article-list/
│   │   │   ├── article-viewer/
│   │   │   ├── table-of-contents/
│   │   │   └── index.ts
│   │   │
│   │   ├── blog/
│   │   │   └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── login-form/
│   │   │   ├── signup-form/
│   │   │   └── index.ts
│   │   │
│   │   └── layout/
│   │       ├── app-header/
│   │       ├── sidebar/
│   │       └── index.ts
│   │
│   └── ui/                       # Base UI components (shadcn)
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       └── ...
│
├── lib/                          # Utilities & Config
│   ├── api-client.ts             # API client helpers
│   ├── auth.ts                   # Auth configuration
│   └── utils.ts                  # General utilities
│
├── core/                         # Core functionality
│   ├── compiler/                 # Python execution
│   └── ide/                      # IDE logic & stores
│
├── collections/                  # Payload CMS collections
│   ├── Courses.ts
│   ├── Lessons.ts
│   └── ...
│
└── styles/                       # Global styles
    └── globals.css
```

---

## API Architecture (tRPC-like)

### Structure

All server actions follow a consistent namespaced structure:

```typescript
// src/api/index.ts
export * as api from './index'

// Export namespaces for autocomplete
export { courses } from './courses'
export { articles } from './articles'
export { blog } from './blog'
export { users } from './users'
export { compiler } from './compiler'
```

### Example: Courses Namespace

```typescript
// src/api/courses/index.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

// Export sub-resources
export * as lessons from './lessons'
export * as progress from './progress'
export * as quizzes from './quizzes'
export * as engagement from './engagement'

// Course-level operations
export async function getAll() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'courses',
    where: { status: { equals: 'available' } }
  })
  return result.docs
}

export async function getBySlug(slug: string) {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'courses',
    where: { slug: { equals: slug } },
    depth: 1
  })
  return result.docs[0] || null
}

export async function getProgress(userId: string, courseId: number) {
  const payload = await getPayload({ config })
  // ... implementation
}
```

### Sub-resources

```typescript
// src/api/courses/lessons.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Lesson, Course, Chapter } from '@/api/_types/common'

interface GetLessonInput {
  courseSlug: string
  chapterSlug: string
  lessonSlug: string
}

interface GetLessonOutput {
  lesson: Lesson
  chapter: Chapter
  course: Course
  navigation: {
    prev: string | null
    next: string | null
    currentIndex: number
    totalLessons: number
  }
}

export async function get(input: GetLessonInput): Promise<GetLessonOutput | null> {
  const payload = await getPayload({ config })

  // Optimized query with defaultPopulate
  const courseQuery = await payload.find({
    collection: 'courses',
    where: { slug: { equals: input.courseSlug } },
    depth: 1,
  })

  const course = courseQuery.docs[0]
  if (!course) return null

  const chapter = course.modules?.find((m) => m.slug === input.chapterSlug)
  if (!chapter) return null

  const lessonMetadata = chapter.lessons?.find((l: any) => l.slug === input.lessonSlug)
  if (!lessonMetadata) return null

  // Fetch full lesson content
  const fullLesson = await payload.findByID({
    collection: 'lessons',
    id: lessonMetadata.id,
    depth: 2,
  })

  // Build navigation
  const allLessons = course.modules?.flatMap((m) =>
    (m.lessons || []).map((l: any) => ({ ...l, moduleSlug: m.slug }))
  ) || []

  const currentIndex = allLessons.findIndex((l) => l.id === fullLesson.id)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return {
    lesson: fullLesson,
    chapter: {
      title: chapter.moduleTitle,
      slug: chapter.slug,
    },
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      level: course.level,
    },
    navigation: {
      prev: prevLesson ? `/courses/${input.courseSlug}/${prevLesson.moduleSlug}/${prevLesson.slug}` : null,
      next: nextLesson ? `/courses/${input.courseSlug}/${nextLesson.moduleSlug}/${nextLesson.slug}` : null,
      currentIndex,
      totalLessons: allLessons.length,
    },
  }
}

export async function getById(id: number) {
  const payload = await getPayload({ config })
  return await payload.findByID({
    collection: 'lessons',
    id,
    depth: 2,
  })
}
```

### Progress Operations

```typescript
// src/api/courses/progress.ts
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { ProgressStatus } from '@/api/_types/common'

interface GetInput {
  userId: string
  lessonId: number
}

interface UpdateInput {
  userId: string
  lessonId: number
  courseId: number
  updates: {
    solutionUnlocked?: boolean
    status?: ProgressStatus
    codeSnapshot?: any
  }
}

export async function get({ userId, lessonId }: GetInput) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'user-progress',
    where: {
      and: [
        { userId: { equals: userId } },
        { lesson: { equals: lessonId } }
      ]
    }
  })

  return result.docs[0] || {
    status: 'not_started' as ProgressStatus,
    solutionUnlocked: false
  }
}

export async function update({ userId, lessonId, courseId, updates }: UpdateInput) {
  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'user-progress',
    where: {
      and: [
        { userId: { equals: userId } },
        { lesson: { equals: lessonId } }
      ]
    }
  })

  if (existing.docs.length > 0) {
    return await payload.update({
      collection: 'user-progress',
      id: existing.docs[0].id,
      data: updates,
    })
  }

  return await payload.create({
    collection: 'user-progress',
    data: {
      userId,
      lesson: lessonId,
      course: courseId,
      ...updates
    }
  })
}

// Convenience methods
export async function unlock({ userId, lessonId, courseId }: Omit<UpdateInput, 'updates'>) {
  return update({
    userId,
    lessonId,
    courseId,
    updates: { solutionUnlocked: true }
  })
}

export async function complete({ userId, lessonId, courseId }: Omit<UpdateInput, 'updates'>) {
  return update({
    userId,
    lessonId,
    courseId,
    updates: { status: 'completed' }
  })
}
```

---

## Data Layer (Queries & Mutations)

### Queries (Read Operations)

Queries are **always** used with TanStack Query for data fetching:

```typescript
// src/queries/courses/index.ts
export * from './use-lesson-query'
export * from './use-progress-query'
export * from './use-engagement-query'
export * from './use-quiz-query'
export * from './use-course-list-query'
```

```typescript
// src/queries/courses/use-lesson-query.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

type UseLessonQueryInput = Parameters<typeof api.courses.lessons.get>[0]

export function useLessonQuery(input: UseLessonQueryInput) {
  return useQuery({
    queryKey: ['courses', 'lessons', input],
    queryFn: () => api.courses.lessons.get(input),
    enabled: !!input.courseSlug && !!input.chapterSlug && !!input.lessonSlug,
  })
}

export function useLessonByIdQuery(lessonId: number) {
  return useQuery({
    queryKey: ['courses', 'lessons', lessonId],
    queryFn: () => api.courses.lessons.getById(lessonId),
    enabled: !!lessonId,
  })
}
```

```typescript
// src/queries/courses/use-progress-query.ts
'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/api'

export function useProgressQuery(userId: string, lessonId: number) {
  return useQuery({
    queryKey: ['courses', 'progress', userId, lessonId],
    queryFn: () => api.courses.progress.get({ userId, lessonId }),
    enabled: !!userId && !!lessonId,
  })
}

export function useCourseProgressQuery(userId: string, courseId: number) {
  return useQuery({
    queryKey: ['courses', 'progress', userId, courseId],
    queryFn: () => api.courses.getProgress(userId, courseId),
    enabled: !!userId && !!courseId,
  })
}
```

### Mutations (Write Operations)

Mutations handle all write operations with TanStack Query:

```typescript
// src/mutations/courses/use-progress-mutation.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

interface UseProgressMutationInput {
  userId: string
  lessonId: number
  courseId: number
}

export function useProgressMutation(input: UseProgressMutationInput) {
  const queryClient = useQueryClient()
  const queryKey = ['courses', 'progress', input.userId, input.lessonId]

  const mutation = useMutation({
    mutationFn: (updates: Parameters<typeof api.courses.progress.update>[0]['updates']) =>
      api.courses.progress.update({ ...input, updates }),

    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData(queryKey, data)
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    update: mutation.mutate,
    updateAsync: mutation.mutateAsync,
    unlock: () => mutation.mutate({ solutionUnlocked: true }),
    unlockAsync: () => mutation.mutateAsync({ solutionUnlocked: true }),
    complete: () => mutation.mutate({ status: 'completed' }),
    completeAsync: () => mutation.mutateAsync({ status: 'completed' }),
    isPending: mutation.isPending,
  }
}
```

```typescript
// src/mutations/courses/use-engagement-mutation.ts
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

interface UseEngagementMutationInput {
  userId: string
  lessonId: number
}

export function useEngagementMutation(input: UseEngagementMutationInput) {
  const queryClient = useQueryClient()
  const queryKey = ['courses', 'engagement', input.userId, input.lessonId]

  const mutation = useMutation({
    mutationFn: (engagementType: 'like' | 'dislike' | null) =>
      api.courses.engagement.toggle({ ...input, engagementType }),

    onMutate: async (newType) => {
      await queryClient.cancelQueries({ queryKey })

      const previousValue = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, newType)

      return { previousValue }
    },

    onError: (err, newType, context) => {
      queryClient.setQueryData(queryKey, context?.previousValue)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  return {
    toggleLike: () => mutation.mutate('like'),
    toggleDislike: () => mutation.mutate('dislike'),
    remove: () => mutation.mutate(null),
    isPending: mutation.isPending,
  }
}
```

---

## Component Organization

### Feature-based Structure

Components are organized by **feature**, not by type:

```
features/
├── courses/              # All course-related components
│   ├── course-card/
│   ├── course-list/
│   ├── lesson-navigation/
│   ├── quiz/
│   ├── ide/
│   └── index.ts          # Barrel export
├── articles/
├── blog/
├── auth/
└── layout/
```

### Component Template

Each component has its own folder with:

```
component-name/
├── component-name.tsx        # Main component
├── component-name.test.tsx   # Tests
└── index.ts                  # Export
```

### Example: Lesson Navigation Component

```typescript
// src/components/features/courses/lesson-navigation/lesson-navigation.tsx
'use client'

import { useLessonQuery } from '@/queries/courses'
import { useProgressMutation } from '@/mutations/courses'
import { useLessonStatus } from '@/hooks/use-lesson-status'
import { useSession } from '@/queries/users'

interface LessonNavigationProps {
  courseSlug: string
  chapterSlug: string
  lessonSlug: string
}

export function LessonNavigation({
  courseSlug,
  chapterSlug,
  lessonSlug
}: LessonNavigationProps) {
  // Get current user
  const { data: session } = useSession()
  const userId = session?.user?.id

  // Fetch lesson data
  const { data: lessonData, isLoading } = useLessonQuery({
    courseSlug,
    chapterSlug,
    lessonSlug
  })

  // Progress mutations
  const { unlock, unlockAsync, complete, completeAsync, isPending } =
    useProgressMutation({
      userId,
      lessonId: lessonData?.lesson.id,
      courseId: lessonData?.course.id,
    })

  // Computed status
  const status = useLessonStatus({
    progress: lessonData?.progress,
    isLoading
  })

  if (isLoading) return <LessonNavigationSkeleton />
  if (!lessonData) return <LessonNavigationNotFound />

  return (
    <NavigationTabs
      prev={lessonData.navigation.prev}
      next={lessonData.navigation.next}
      currentIndex={lessonData.navigation.currentIndex}
      totalLessons={lessonData.navigation.totalLessons}
      status={status}
      onUnlock={unlock}
      onComplete={complete}
      isPending={isPending}
    />
  )
}
```

```typescript
// src/components/features/courses/lesson-navigation/index.ts
export { LessonNavigation } from './lesson-navigation'
```

### Shared Components

Globally shared components live in `_shared/`:

```
_shared/
├── button/
│   ├── button.tsx
│   ├── button.test.tsx
│   └── index.ts
├── input/
├── card/
└── ...
```

---

## Type System

### Centralized Types

All types are centralized in `src/api/_types/`:

```typescript
// src/api/_types/common.ts
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface User {
  id: string
  email: string
  name?: string
}

export interface Lesson {
  id: number
  title: string
  slug: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  description?: string
}

export interface Course {
  id: number
  title: string
  slug: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

export interface Chapter {
  title: string
  slug: string
}
```

```typescript
// src/api/_types/courses.ts
export interface CourseWithModules extends Course {
  modules: CourseModule[]
}

export interface CourseModule {
  moduleTitle: string
  slug: string
  lessons: LessonMetadata[]
}

export interface LessonMetadata {
  id: number
  title: string
  slug: string
  difficulty: Lesson['difficulty']
}
```

```typescript
// src/api/_types/index.ts
export * from './common'
export * from './courses'
export * from './articles'
```

### Type Inference

Types are inferred from the API layer:

```typescript
// Import types from API
import type { Lesson, Course, ProgressStatus } from '@/api/_types'

// Or infer from function signatures
type LessonInput = Parameters<typeof api.courses.lessons.get>[0]
type LessonOutput = Awaited<ReturnType<typeof api.courses.lessons.get>>
```

---

## Migration Guide

### Before (Current Structure)

**Imports:**
```typescript
// ❌ Scattered imports
import { getLesson, getProgress, updateProgress } from '@/api/courses'
import { useLessonProgress } from '@/hooks/courses/lessons/use-lesson-progress'
import { useLessonLike } from '@/hooks/courses/lessons/use-lesson-like'
```

**API calls:**
```typescript
// ❌ Direct function calls
const lesson = await getLesson({ courseSlug, chapterSlug, lessonSlug })
const progress = await getProgress(userId, lessonId)
```

**Component structure:**
```typescript
// ❌ Components organized by type
src/components/courses/course-card.tsx
src/components/forms/login-form.tsx
src/components/headers/app-header.tsx
```

### After (Target Structure)

**Imports:**
```typescript
// ✅ Namespaced imports
import { api } from '@/api'
import { useLessonQuery, useProgressQuery } from '@/queries/courses'
import { useProgressMutation, useEngagementMutation } from '@/mutations/courses'
```

**API calls:**
```typescript
// ✅ Namespaced API calls with autocomplete
const lesson = await api.courses.lessons.get({ courseSlug, chapterSlug, lessonSlug })
const progress = await api.courses.progress.get({ userId, lessonId })

// ✅ Convenience methods
await api.courses.progress.unlock({ userId, lessonId, courseId })
await api.courses.progress.complete({ userId, lessonId, courseId })
```

**Component structure:**
```typescript
// ✅ Components organized by feature
src/components/features/courses/course-card/
src/components/features/auth/login-form/
src/components/features/layout/app-header/
```

### Migration Steps

1. **Create the new folder structure**
   ```bash
   mkdir -p src/api/_types
   mkdir -p src/queries/courses
   mkdir -p src/mutations/courses
   mkdir -p src/components/features/courses
   ```

2. **Migrate API functions to namespaces**
   - Move `src/api/courses/index.ts` functions to appropriate files
   - Create sub-resource files (lessons.ts, progress.ts, etc.)
   - Export from `src/api/courses/index.ts`

3. **Create query hooks**
   - Move data fetching logic from `src/hooks/` to `src/queries/`
   - Use TanStack Query exclusively
   - Follow naming convention: `use-[resource]-query.ts`

4. **Create mutation hooks**
   - Extract mutations from query hooks
   - Place in `src/mutations/`
   - Follow naming convention: `use-[resource]-mutation.ts`

5. **Reorganize components**
   - Move components to `src/components/features/`
   - Group by feature, not by type
   - Create barrel exports (`index.ts`)

6. **Update imports throughout the codebase**
   - Replace old imports with new namespaced imports
   - Use autocomplete to discover available functions

7. **Delete old structure**
   - Remove old hook files
   - Remove old component folders
   - Clean up unused exports

---

## Best Practices

### 1. API Design

**Do:**
```typescript
// ✅ Namespaced, descriptive
api.courses.lessons.get({ courseSlug, chapterSlug, lessonSlug })
api.courses.progress.unlock({ userId, lessonId, courseId })
```

**Don't:**
```typescript
// ❌ Flat, unclear naming
getLesson({ courseSlug, chapterSlug, lessonSlug })
unlockProgress({ userId, lessonId, courseId })
```

### 2. Query Keys

**Do:**
```typescript
// ✅ Hierarchical query keys
queryKey: ['courses', 'lessons', input]
queryKey: ['courses', 'progress', userId, lessonId]
```

**Don't:**
```typescript
// ❌ Flat or unclear query keys
queryKey: ['lesson', lessonId]
queryKey: ['progress']
```

### 3. Component Organization

**Do:**
```typescript
// ✅ Feature-based with barrel exports
src/components/features/courses/lesson-navigation/
├── lesson-navigation.tsx
└── index.ts

// Import
import { LessonNavigation } from '@/components/features/courses'
```

**Don't:**
```typescript
// ❌ Type-based scattered
src/components/courses/lessons/lesson-navigation.tsx

// Import
import { LessonNavigation } from '@/components/courses/lessons/nav/lesson-navigation'
```

### 4. Type Imports

**Do:**
```typescript
// ✅ Import from centralized types
import type { Lesson, Course, ProgressStatus } from '@/api/_types'
```

**Don't:**
```typescript
// ❌ Duplicate types inline
interface Lesson {
  id: number
  title: string
  // ...
}
```

### 5. Hook Usage

**Do:**
```typescript
// ✅ Use queries for data fetching
const { data: lesson, isLoading } = useLessonQuery({ courseSlug, chapterSlug, lessonSlug })

// ✅ Use mutations for writes
const { unlockAsync, isPending } = useProgressMutation({ userId, lessonId, courseId })

// ✅ Use UI hooks for logic only
const isMobile = useMobile()
```

**Don't:**
```typescript
// ❌ Don't mix data fetching in UI hooks
const [lesson, setLesson] = useState() // Should be useQuery
const [isMobile, setIsMobile] = useState(false) // OK for UI state
```

### 6. Error Handling

**Do:**
```typescript
// ✅ Handle errors in components
const { data, error, isLoading } = useLessonQuery(input)

if (error) return <ErrorMessage error={error} />
if (isLoading) return <LoadingSkeleton />
```

**Don't:**
```typescript
// ❌ Throw errors from server actions without context
export async function getLesson(input) {
  if (!lesson) throw new Error('Not found') // ❌
  return lesson
}

// ✅ Return null or handle gracefully
export async function getLesson(input) {
  const lesson = await payload.findByID(...)
  return lesson || null  // ✅
}
```

---

## Summary

This architecture provides:

- ✅ **Autocomplete-friendly API** with tRPC-like namespaces
- ✅ **Strict separation of concerns** (API, Queries, Mutations, Hooks, Components)
- ✅ **Feature-based component organization**
- ✅ **Centralized type system**
- ✅ **Easy testing** with isolated, mockable units
- ✅ **Scalable codebase** that grows cleanly
- ✅ **Developer experience** with clear patterns

### Key Benefits

1. **Maintainability**: Clear structure makes it easy to find and modify code
2. **Type Safety**: Types flow from API to components
3. **Testability**: Isolated units are easy to test
4. **Scalability**: Adding features follows established patterns
5. **Developer Experience**: Autocomplete and clear naming reduce cognitive load

---

## Appendix: Quick Reference

### Import Patterns

```typescript
// API
import { api } from '@/api'
await api.courses.lessons.get({ ... })

// Queries
import { useLessonQuery } from '@/queries/courses'
const { data } = useLessonQuery({ ... })

// Mutations
import { useProgressMutation } from '@/mutations/courses'
const { unlockAsync } = useProgressMutation({ ... })

// Hooks (UI only)
import { useMobile } from '@/hooks'
const isMobile = useMobile()

// Components
import { LessonNavigation } from '@/components/features/courses'
```

### File Naming

```
API:         [resource].ts (lessons.ts, progress.ts)
Queries:     use-[resource]-query.ts
Mutations:   use-[resource]-mutation.ts
Hooks:       use-[purpose].ts
Components:  [component-name].tsx
```

### Folder Structure

```
api/          → Server actions
queries/      → Data fetching (read)
mutations/    → Data updates (write)
hooks/        → UI logic
components/   → UI components
```

---

**Last Updated:** 2026-01-24
**Status:** Proposed Architecture (Target)
**Version:** 1.0.0
