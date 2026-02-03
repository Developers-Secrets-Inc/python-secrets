# Error Handling Strategy

## Overview

This document defines the comprehensive error handling strategy for the Python Secrets platform. We use a **100% functional approach** with explicit error handling using algebraic data types (Result, Try), structured error taxonomy, and recovery patterns.

## Table of Contents

- [Current State Analysis](#current-state-analysis)
- [Problems Identified](#problems-identified)
- [Error Taxonomy](#error-taxonomy)
- [Functional Error Handling](#functional-error-handling)
- [Recovery Patterns](#recovery-patterns)
- [User Communication](#user-communication)
- [Logging & Monitoring](#logging--monitoring)
- [Testing Strategy](#testing-strategy)
- [Migration Guide](#migration-guide)

---

## Current State Analysis

### Existing Error Patterns

**❌ Direct Exceptions (3 types identified)**

```typescript
// 1. Server Actions - throw new Error()
src/api/courses/quizzes.ts:41: throw new Error('Lesson or exercise not found')
src/api/courses/quizzes.ts:46: throw new Error('Exercise is not a quiz')
src/api/courses/quizzes.ts:51: throw new Error('Quiz data not found')

// 2. Client Hooks - throw new Error()
src/hooks/courses/lessons/use-quiz-submit.ts:34: throw new Error('User not authenticated')

// 3. UI Components - throw new Error()
src/components/ui/sidebar.tsx:50: throw new Error("useSidebar must be used within a SidebarProvider.")
src/components/ui/form.tsx:53: throw new Error("useFormField should be used within <FormField>")
```

**⚠️ Basic try/catch Without Structure**

```typescript
// Python Compiler - simple return
src/core/compiler/server/index.ts:27-32: catch (error) {
  return {
    stdout: '',
    stderr: '',
    error: error instanceof Error ? error.message : 'Unknown error',
  }
}

// Components - console.error only
src/components/courses/lessons/quiz-exercise.tsx:98-102: catch (error) {
  console.error('Failed to submit quiz:', error)
  setShowResults(true) // Continue anyway
}

src/components/courses/lessons/nav/lesson-navigation.tsx:92-94: catch (error) {
  console.error("Failed to unlock:", error)
  // No corrective action
}
```

**🔵 TanStack Query - Basic Callbacks**

```typescript
// onSuccess used but no clear strategy
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['progress', userId, lessonId] })
}

// onError used for alert() or console.error
onError: (ctx) => {
  alert(ctx.error.message) // ❌ Blocking alert, poor UX
  setIsLoading(false)
}

// onSettled used in only one hook
onSettled: () => {
  queryClient.invalidateQueries({ queryKey })
}
```

---

## Problems Identified

### 1. **No Error Taxonomy**
- ❌ No custom error types
- ❌ Vanilla JavaScript `Error` used everywhere
- ❌ Cannot distinguish error types
- ❌ No structured error codes

### 2. **Inconsistent Error Handling**
- ❌ Server Actions → `throw new Error()`
- ❌ Compiler → `return { error: string }`
- ❌ Hooks → `throw new Error()` + `onError` callback
- ❌ Components → `console.error()` + continue
- ❌ Auth → `alert(ctx.error.message)` (blocking!)

### 3. **No Traceability**
- ❌ No stack traces captured
- ❌ No context (userId, lessonId, etc.)
- ❌ No correlation IDs
- ❌ No error tracking service (Sentry, Bugsnag, etc.)

### 4. **Poor User Communication**
- ❌ Blocking `alert()` in login form
- ❌ `console.error()` only (user sees nothing)
- ❌ Error messages not actionable
- ❌ No internationalization

### 5. **No Recovery Patterns**
- ❌ No retry logic
- ❌ No fallback strategies
- ❌ No circuit breaker
- ❌ No graceful degradation

### 6. **Installed Tools Not Used**
- ✅ **Sonner** (toast notifications) - installed, wrapper created, **not used**
- ✅ **Zod** (validation) - installed, **not used**
- ❌ No error tracking (Sentry, etc.)

---

## Error Taxonomy

### 1. Domain Errors (Business Logic)

Errors that occur during normal business operations:

```typescript
// src/core/errors/domain.ts

export type DomainError =
  // Resource not found
  | NotFoundError
  // Validation failed
  | ValidationError
  // User not authenticated
  | UnauthorizedError
  // User lacks permission
  | ForbiddenError
  // Data conflict
  | ConflictError
  // Service temporarily unavailable
  | ServiceUnavailableError

// NotFoundError
export interface NotFoundError {
  _tag: 'NotFound'
  resource: string
  id: string
  timestamp: number
}

export const notFound = (resource: string, id: string): NotFoundError => ({
  _tag: 'NotFound',
  resource,
  id,
  timestamp: Date.now()
})

// ValidationError
export interface ValidationError {
  _tag: 'ValidationError'
  field: string
  message: string
  code: string
  value?: unknown
}

export const validationError = (
  field: string,
  message: string,
  code: string,
  value?: unknown
): ValidationError => ({
  _tag: 'ValidationError',
  field,
  message,
  code,
  value
})

// UnauthorizedError
export interface UnauthorizedError {
  _tag: 'Unauthorized'
  reason: 'no_session' | 'invalid_token' | 'expired_token'
}

export const unauthorized = (reason: UnauthorizedError['reason']): UnauthorizedError => ({
  _tag: 'Unauthorized',
  reason
})

// ForbiddenError
export interface ForbiddenError {
  _tag: 'Forbidden'
  resource: string
  action: string
  requiredRole: string
}

export const forbidden = (
  resource: string,
  action: string,
  requiredRole: string
): ForbiddenError => ({
  _tag: 'Forbidden',
  resource,
  action,
  requiredRole
})

// ConflictError
export interface ConflictError {
  _tag: 'Conflict'
  resource: string
  details: string
}

export const conflict = (resource: string, details: string): ConflictError => ({
  _tag: 'Conflict',
  resource,
  details
})

// ServiceUnavailableError
export interface ServiceUnavailableError {
  _tag: 'ServiceUnavailable'
  service: string
  retryAfter?: number // milliseconds
}

export const serviceUnavailable = (
  service: string,
  retryAfter?: number
): ServiceUnavailableError => ({
  _tag: 'ServiceUnavailable',
  service,
  retryAfter
})
```

### 2. Infrastructure Errors (System)

Errors related to external systems:

```typescript
// src/core/errors/infrastructure.ts

export type InfrastructureError =
  // Database errors
  | DatabaseError
  // Network errors
  | NetworkError
  // Compilation errors
  | CompilationError
  // File system errors
  | FileSystemError

// DatabaseError
export interface DatabaseError {
  _tag: 'DatabaseError'
  operation: string
  query?: string
  cause: string
}

export const databaseError = (
  operation: string,
  cause: string,
  query?: string
): DatabaseError => ({
  _tag: 'DatabaseError',
  operation,
  cause,
  query
})

// NetworkError
export interface NetworkError {
  _tag: 'NetworkError'
  url: string
  status?: number
  timeout?: number
  cause: string
}

export const networkError = (
  url: string,
  cause: string,
  status?: number,
  timeout?: number
): NetworkError => ({
  _tag: 'NetworkError',
  url,
  cause,
  status,
  timeout
})

// CompilationError
export interface CompilationError {
  _tag: 'CompilationError'
  language: 'python'
  type: 'syntax' | 'runtime' | 'timeout' | 'memory'
  line?: number
  column?: number
  message: string
}

export const compilationError = (
  language: 'python',
  type: CompilationError['type'],
  message: string,
  line?: number,
  column?: number
): CompilationError => ({
  _tag: 'CompilationError',
  language,
  type,
  line,
  column,
  message
})

// FileSystemError
export interface FileSystemError {
  _tag: 'FileSystemError'
  operation: 'read' | 'write' | 'delete'
  path: string
  reason: string
}

export const fileSystemError = (
  operation: FileSystemError['operation'],
  path: string,
  reason: string
): FileSystemError => ({
  _tag: 'FileSystemError',
  operation,
  path,
  reason
})
```

### 3. User Errors (Input)

Errors caused by invalid user input:

```typescript
// src/core/errors/user.ts

export type UserError =
  // Invalid input
  | InvalidInputError
  // Quota exceeded
  | QuotaExceededError
  // Unsupported action
  | UnsupportedActionError

// InvalidInputError
export interface InvalidInputError {
  _tag: 'InvalidInput'
  field: string
  value: unknown
  constraint: string
}

export const invalidInput = (
  field: string,
  value: unknown,
  constraint: string
): InvalidInputError => ({
  _tag: 'InvalidInput',
  field,
  value,
  constraint
})

// QuotaExceededError
export interface QuotaExceededError {
  _tag: 'QuotaExceeded'
  quota: string
  current: number
  limit: number
}

export const quotaExceeded = (
  quota: string,
  current: number,
  limit: number
): QuotaExceededError => ({
  _tag: 'QuotaExceeded',
  quota,
  current,
  limit
})

// UnsupportedActionError
export interface UnsupportedActionError {
  _tag: 'UnsupportedAction'
  action: string
  reason: string
}

export const unsupportedAction = (
  action: string,
  reason: string
): UnsupportedActionError => ({
  _tag: 'UnsupportedAction',
  action,
  reason
})
```

### 4. Combined Error Type

```typescript
// src/core/errors/index.ts

export type AppError = DomainError | InfrastructureError | UserError

// Type guards for all error types
export const isNotFoundError = (error: AppError): error is NotFoundError =>
  error._tag === 'NotFound'

export const isValidationError = (error: AppError): error is ValidationError =>
  error._tag === 'ValidationError'

export const isUnauthorizedError = (error: AppError): error is UnauthorizedError =>
  error._tag === 'Unauthorized'

export const isForbiddenError = (error: AppError): error is ForbiddenError =>
  error._tag === 'Forbidden'

export const isConflictError = (error: AppError): error is ConflictError =>
  error._tag === 'Conflict'

export const isServiceUnavailableError = (error: AppError): error is ServiceUnavailableError =>
  error._tag === 'ServiceUnavailable'

export const isDatabaseError = (error: AppError): error is DatabaseError =>
  error._tag === 'DatabaseError'

export const isNetworkError = (error: AppError): error is NetworkError =>
  error._tag === 'NetworkError'

export const isCompilationError = (error: AppError): error is CompilationError =>
  error._tag === 'CompilationError'

export const isFileSystemError = (error: AppError): error is FileSystemError =>
  error._tag === 'FileSystemError'

export const isInvalidInputError = (error: AppError): error is InvalidInputError =>
  error._tag === 'InvalidInput'

export const isQuotaExceededError = (error: AppError): error is QuotaExceededError =>
  error._tag === 'QuotaExceeded'

export const isUnsupportedActionError = (error: AppError): error is UnsupportedActionError =>
  error._tag === 'UnsupportedAction'
```

---

## Functional Error Handling

### Using Result Types

All server actions return `Result<T, E>` instead of throwing:

```typescript
// ❌ BEFORE: Throwing exceptions
export async function getLesson(id: number) {
  const lesson = await payload.findByID({ collection: 'lessons', id })
  if (!lesson) throw new Error('Lesson not found')
  return lesson
}

// ✅ AFTER: Returning Result
export async function getLesson(id: number): Promise<Result<Lesson, NotFoundError>> {
  const result = await tryCatchAsync(() =>
    payload.findByID({ collection: 'lessons', id })
  )

  if (isErr(result)) {
    return err(databaseError('findByID', result.error.message))
  }

  const lesson = result.value

  if (!lesson) {
    return err(notFound('lesson', String(id)))
  }

  return ok(lesson)
}
```

### Using Try for Exception Wrapping

Wrap any code that might throw:

```typescript
// src/core/try.ts

import * as Result from './result'
import type { Result } from './result'
import { databaseError, networkError } from './errors'

export async function tryCatchAsync<T>(
  fn: () => Promise<T>
): Promise<Result<T, InfrastructureError>> {
  try {
    return await fn()
      .then(data => Result.ok(data))
      .catch(error => {
        if (error instanceof Error) {
          return Result.err(networkError('unknown', error.message))
        }
        return Result.err(networkError('unknown', String(error)))
      })
  } catch (error) {
    if (error instanceof Error) {
      return Result.err(networkError('unknown', error.message))
    }
    return Result.err(networkError('unknown', String(error)))
  }
}

// Usage
const result = await tryCatchAsync(() =>
  payload.find({ collection: 'courses' })
)
```

### Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     ERROR FLOW                               │
└─────────────────────────────────────────────────────────────┘

1. SERVER ACTIONS (src/api/)
   ↓
   Try<T> wrap → Result<T, AppError>
   ↓
2. QUERIES/MUTATIONS (src/queries/, src/mutations/)
   ↓
   TanStack Query callbacks → Error transformation
   ↓
3. COMPONENTS (src/components/)
   ↓
   Error Boundaries + Toast notifications
   ↓
4. USER
   ↓
   Actionable error messages + recovery options
```

---

## Recovery Patterns

### 1. Retry with Exponential Backoff

```typescript
// src/core/retry.ts

import * as Result from './result'
import type { Result } from './result'
import { networkError, serviceUnavailable } from './errors'

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  shouldRetry?: (error: AppError) => boolean
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<Result<T, AppError>>,
  options: RetryOptions = {}
): Promise<Result<T, AppError>> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => isNetworkError(error) || isServiceUnavailableError(error)
  } = options

  let lastError: AppError | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await fn()

    if (Result.isOk(result)) {
      return result
    }

    lastError = result.error

    // Don't retry if error type doesn't match
    if (!shouldRetry(lastError)) {
      return Result.err(lastError)
    }

    // Don't sleep after last attempt
    if (attempt < maxRetries - 1) {
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay)
      await sleep(delay)
    }
  }

  return Result.err(lastError!)
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Usage
const result = await retryWithBackoff(
  () => api.courses.getBySlug(slug),
  { maxRetries: 3, baseDelay: 1000 }
)
```

### 2. Circuit Breaker

```typescript
// src/core/circuit-breaker.ts

import * as Result from './result'
import type { Result } from './result'
import { serviceUnavailable } from './errors'

type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerOptions {
  failureThreshold?: number
  resetTimeout?: number // milliseconds
  monitoringPeriod?: number // milliseconds
}

export class CircuitBreaker<T> {
  private failures = 0
  private lastFailureTime = 0
  private successCount = 0
  private state: CircuitState = 'closed'

  constructor(
    private fn: () => Promise<Result<T, AppError>>,
    private options: CircuitBreakerOptions = {}
  ) {
    const {
      failureThreshold = 5,
      resetTimeout = 60000,
      monitoringPeriod = 10000
    } = options
  }

  async execute(): Promise<Result<T, AppError>> {
    // If circuit is open, check if we should transition to half-open
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout!) {
        this.state = 'half-open'
        this.successCount = 0
      } else {
        return Result.err(
          serviceUnavailable(
            'circuit-breaker',
            this.options.resetTimeout! - (Date.now() - this.lastFailureTime)
          )
        )
      }
    }

    try {
      const result = await this.fn()

      if (Result.isOk(result)) {
        this.onSuccess()
        return result
      } else {
        this.onFailure()
        return Result.err(result.error)
      }
    } catch (error) {
      this.onFailure()
      return Result.err(
        serviceUnavailable('circuit-breaker', this.options.resetTimeout)
      )
    }
  }

  private onSuccess() {
    this.failures = 0

    if (this.state === 'half-open') {
      this.successCount++

      // Transition back to closed after threshold successes
      if (this.successCount >= 3) {
        this.state = 'closed'
      }
    }
  }

  private onFailure() {
    this.failures++
    this.lastFailureTime = Date.now()

    if (this.failures >= this.options.failureThreshold!) {
      this.state = 'open'
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// Usage
const breaker = new CircuitBreaker(
  () => api.compiler.compileCode(code),
  { failureThreshold: 5, resetTimeout: 60000 }
)

const result = await breaker.execute()
```

### 3. Fallback Strategies

```typescript
// src/core/fallback.ts

import * as Result from './result'
import type { Result } from './result'

export const withFallback = async <T>(
  primary: () => Promise<Result<T, AppError>>,
  fallback: () => Result<T, AppError>
): Promise<Result<T, AppError>> => {
  try {
    const result = await primary()
    return Result.isOk(result) ? result : fallback()
  } catch (error) {
    console.warn('Primary failed, using fallback', error)
    return fallback()
  }
}

// Usage
const result = await withFallback(
  // Primary: E2B server-side compilation
  () => api.compiler.compileCode(code, 'server'),

  // Fallback: Pyodide client-side compilation
  () => api.compiler.compileCode(code, 'client')
)
```

### 4. Graceful Degradation

```typescript
// src/core/degradation.ts

import * as Result from './result'
import type { Result } from './result'
import { some, nothing, type Maybe } from './types/maybe'

export const degradeToDefault = <T>(
  defaultValue: T
) => (result: Result<T, AppError>): T => {
  return Result.match({
    ok: (value) => value,
    err: (error) => {
      console.warn('Degrading to default due to error:', error)
      return defaultValue
    }
  })(result)
}

export const degradeToMaybe = <T>(
  result: Result<T, AppError>
): Maybe<T> => {
  return Result.match({
    ok: (value) => some(value),
    err: (error) => {
      console.warn('Degrading to Maybe due to error:', error)
      return nothing
    }
  })(result)
}

// Usage
const courseList = await pipe(
  api.courses.getAll(),
  degradeToDefault([]) // Return empty array on error
)

const featuredCourse = await pipe(
  api.courses.getFeatured(),
  degradeToMaybe // Return Nothing on error
)
```

---

## User Communication

### Toast Notifications with Actions

```typescript
// src/core/toast.ts

import { toast } from 'sonner'
import type { AppError } from './errors'
import * as E from './errors'

interface ToastOptions {
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export const showErrorToast = (error: AppError, options?: ToastOptions) => {
  return E.match(error, {
    // NotFound
    NotFound: ({ resource, id }) =>
      toast.error(`${resource} not found`, {
        description: `ID: ${id}`,
        action: options?.action || {
          label: 'Go Back',
          onClick: () => window.history.back()
        }
      }),

    // ValidationError
    ValidationError: ({ field, message }) =>
      toast.error('Validation failed', {
        description: `${field}: ${message}`,
        action: options?.action || {
          label: 'Fix',
          onClick: () => {
            const el = document.getElementById(field)
            if (el) el.focus()
          }
        }
      }),

    // Unauthorized
    Unauthorized: ({ reason }) =>
      toast.error('Authentication required', {
        description: getAuthReasonMessage(reason),
        action: {
          label: 'Sign In',
          onClick: () => window.location.href = '/login'
        }
      }),

    // Forbidden
    Forbidden: ({ resource, action }) =>
      toast.error('Access denied', {
        description: `You don't have permission to ${action} this ${resource}`
      }),

    // Conflict
    Conflict: ({ resource, details }) =>
      toast.error('Conflict detected', {
        description: `${resource}: ${details}`
      }),

    // ServiceUnavailable
    ServiceUnavailable: ({ retryAfter }) =>
      toast.error('Service temporarily unavailable', {
        description: retryAfter
          ? `Retry in ${Math.ceil(retryAfter / 1000)} seconds`
          : 'Please try again later',
        action: options?.action || {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }),

    // DatabaseError
    DatabaseError: ({ operation }) =>
      toast.error('Database error', {
        description: `Failed to ${operation}. Please try again.`
      }),

    // NetworkError
    NetworkError: ({ status, timeout }) =>
      toast.error('Network error', {
        description: status
          ? `Server returned ${status}`
          : timeout
          ? `Request timeout after ${timeout}ms`
          : 'Failed to connect to server',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      }),

    // CompilationError
    CompilationError: ({ type, message, line }) =>
      toast.error('Compilation error', {
        description: line
          ? `${type} error at line ${line}: ${message}`
          : `${type}: ${message}`
      }),

    // FileSystemError
    FileSystemError: ({ operation, path }) =>
      toast.error('File system error', {
        description: `Failed to ${operation}: ${path}`
      }),

    // InvalidInput
    InvalidInput: ({ field, constraint }) =>
      toast.error('Invalid input', {
        description: `${field}: ${constraint}`
      }),

    // QuotaExceeded
    QuotaExceeded: ({ quota, current, limit }) =>
      toast.error('Quota exceeded', {
        description: `You've used ${current}/${limit} ${quota}`
      }),

    // UnsupportedAction
    UnsupportedAction: ({ action, reason }) =>
      toast.error('Action not supported', {
        description: `${action}: ${reason}`
      })
  })
}

const getAuthReasonMessage = (reason: UnauthorizedError['reason']) => {
  switch (reason) {
    case 'no_session':
      return 'You need to be signed in'
    case 'invalid_token':
      return 'Your session is invalid'
    case 'expired_token':
      return 'Your session has expired'
  }
}

export const showSuccessToast = (message: string, options?: ToastOptions) => {
  toast.success(message, options)
}

export const showInfoToast = (message: string, options?: ToastOptions) => {
  toast.info(message, options)
}
```

### React Error Boundaries

```typescript
// src/components/error-boundary.tsx

'use client'

import React from 'react'
import { AlertTriangle, RefreshCcw, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<FallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface FallbackProps {
  error: Error
  resetError: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)

    // Log to error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent =
        this.props.fallback || DefaultErrorFallback

      return (
        <FallbackComponent
          error={this.state.error!}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      )
    }

    return this.props.children
  }
}

const DefaultErrorFallback: React.FC<FallbackProps> = ({
  error,
  resetError
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle>Something went wrong</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {error.message || 'An unexpected error occurred'}
          </p>

          <div className="flex gap-2">
            <Button onClick={resetError} className="flex-1">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook version for functional components
export const useErrorHandler = () => {
  return React.useCallback((error: Error) => {
    throw error
  }, [])
}
```

### Async Error Boundary

```typescript
// src/components/async-error-boundary.tsx

'use client'

import React, { ComponentType } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AsyncErrorBoundaryProps {
  children: React.ReactNode
  fallback?: ComponentType<{ error: Error; retry: () => void }>
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback: Fallback = DefaultAsyncFallback
}) => {
  return (
    <ErrorBoundary fallback={Fallback}>
      {children}
    </ErrorBoundary>
  )
}

const DefaultAsyncFallback: React.FC<{
  error: Error
  resetError: () => void
}> = ({ error, resetError }) => {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold">Loading failed</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error.message}
          </p>
        </div>
        <Button onClick={resetError}>Retry</Button>
      </div>
    </Card>
  )
}
```

---

## Logging & Monitoring

### Structured Logging

```typescript
// src/core/logging.ts

export interface LogContext {
  userId?: string
  sessionId: string
  correlationId: string
  timestamp: number
  level: 'debug' | 'info' | 'warn' | 'error'
  event: string
  data?: Record<string, unknown>
}

export const generateCorrelationId = (): string => {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }
  return `server_${Date.now()}`
}

export const logError = (
  error: AppError,
  context: Partial<LogContext> = {}
): void => {
  const logEntry: LogContext = {
    sessionId: getSessionId(),
    correlationId: generateCorrelationId(),
    timestamp: Date.now(),
    level: 'error',
    event: error._tag,
    data: error,
    ...context
  }

  // Send to logging service in production
  if (process.env.NODE_ENV === 'production') {
    if (typeof window !== 'undefined') {
      // Client-side
      sendToDatadog(logEntry)
      sendToSentry(logEntry)
    } else {
      // Server-side
      sendToDatadogServer(logEntry)
      sendToSentryServer(logEntry)
    }
  } else {
    // Development
    console.error('[ERROR]', logEntry)
  }
}

export const logInfo = (
  event: string,
  data?: Record<string, unknown>
): void => {
  const logEntry: LogContext = {
    sessionId: getSessionId(),
    correlationId: generateCorrelationId(),
    timestamp: Date.now(),
    level: 'info',
    event,
    data
  }

  if (process.env.NODE_ENV === 'production') {
    sendToDatadog(logEntry)
  } else {
    console.log('[INFO]', logEntry)
  }
}

// Placeholder implementations - replace with actual logging services
const sendToDatadog = (logEntry: LogContext) => {
  // TODO: Implement Datadog logging
}

const sendToSentry = (logEntry: LogContext) => {
  // TODO: Implement Sentry logging
}

const sendToDatadogServer = (logEntry: LogContext) => {
  // TODO: Implement server-side Datadog logging
}

const sendToSentryServer = (logEntry: LogContext) => {
  // TODO: Implement server-side Sentry logging
}
```

### Error Tracking (Sentry Integration)

```typescript
// src/core/sentry.ts

import * as Sentry from '@sentry/nextjs'
import type { AppError } from './errors'
import { isValidationError } from './errors'

export const initSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1, // 10% of transactions
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of errors

      beforeSend(event, hint) {
        // Filter out client-side errors we don't want to track
        if (event.exception) {
          const error = hint.originalException as AppError

          // Don't send validation errors to Sentry
          if (error && isValidationError(error)) {
            return null
          }

          // Don't send compilation errors from user code
          if (error && isCompilationError(error)) {
            return null
          }
        }
        return event
      }
    })
  }
}

export const captureError = (
  error: AppError,
  context: {
    userId?: string
    sessionId?: string
    correlationId?: string
    tags?: Record<string, string>
    extra?: Record<string, unknown>
  }
): void => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  Sentry.captureException(error, {
    tags: {
      errorType: error._tag,
      userId: context.userId || 'anonymous',
      sessionId: context.sessionId || 'unknown',
      ...context.tags
    },
    extra: {
      correlationId: context.correlationId,
      error: error,
      ...context.extra
    }
  })
}

export const captureMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void => {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    return
  }

  Sentry.captureMessage(message, {
    level,
    extra: context
  })
}

// User tracking
export const setSentryUser = (userId: string, email?: string) => {
  Sentry.setUser({
    id: userId,
    email
  })
}

export const clearSentryUser = () => {
  Sentry.setUser(null)
}
```

---

## Testing Strategy

### Unit Tests for Error Handling

```typescript
// tests/core/errors.test.ts

import { describe, it, expect } from 'vitest'
import * as E from '@/core/errors'

describe('Error Constructors', () => {
  describe('notFound', () => {
    it('should create NotFoundError', () => {
      const error = E.notFound('lesson', '123')

      expect(error._tag).toBe('NotFound')
      expect(error.resource).toBe('lesson')
      expect(error.id).toBe('123')
      expect(error.timestamp).toBeLessThanOrEqual(Date.now())
    })
  })

  describe('validationError', () => {
    it('should create ValidationError', () => {
      const error = E.validationError('email', 'Invalid format', 'INVALID_EMAIL', 'test')

      expect(error._tag).toBe('ValidationError')
      expect(error.field).toBe('email')
      expect(error.message).toBe('Invalid format')
      expect(error.code).toBe('INVALID_EMAIL')
      expect(error.value).toBe('test')
    })
  })
})

describe('Type Guards', () => {
  const notFoundError = E.notFound('course', '456')
  const validationError = E.validationError('name', 'Required', 'REQUIRED')

  it('should correctly identify NotFoundError', () => {
    expect(E.isNotFoundError(notFoundError)).toBe(true)
    expect(E.isNotFoundError(validationError)).toBe(false)
  })

  it('should correctly identify ValidationError', () => {
    expect(E.isValidationError(validationError)).toBe(true)
    expect(E.isValidationError(notFoundError)).toBe(false)
  })
})
```

### Integration Tests for Error Scenarios

```typescript
// tests/integration/errors.int.spec.ts

import { describe, it, expect } from 'vitest'
import { api } from '@/api'

describe('Error Handling Integration', () => {
  describe('NotFound', () => {
    it('should return NotFoundError when lesson does not exist', async () => {
      const result = await api.courses.lessons.getById(99999)

      expect(Result.isErr(result)).toBe(true)

      Result.match({
        ok: () => fail('Should have errored'),
        err: (error) => {
          expect(E.isNotFoundError(error)).toBe(true)
          if (E.isNotFoundError(error)) {
            expect(error.resource).toBe('lesson')
            expect(error.id).toBe('99999')
          }
        }
      })(result)
    })
  })

  describe('Unauthorized', () => {
    it('should return UnauthorizedError when not authenticated', async () => {
      const result = await api.courses.progress.update({
        userId: undefined as any,
        lessonId: 1,
        courseId: 1,
        updates: { status: 'completed' }
      })

      expect(Result.isErr(result)).toBe(true)

      Result.match({
        ok: () => fail('Should have errored'),
        err: (error) => {
          expect(E.isUnauthorizedError(error)).toBe(true)
        }
      })(result)
    })
  })

  describe('ValidationError', () => {
    it('should return ValidationError with field details', async () => {
      const result = await api.users.update({
        userId: 'user-1',
        data: { email: 'invalid-email' }
      })

      expect(Result.isErr(result)).toBe(true)

      Result.match({
        ok: () => fail('Should have errored'),
        err: (error) => {
          expect(E.isValidationError(error)).toBe(true)
          if (E.isValidationError(error)) {
            expect(error.field).toBe('email')
            expect(error.code).toBe('INVALID_EMAIL')
          }
        }
      })(result)
    })
  })
})
```

### Error Recovery Tests

```typescript
// tests/core/recovery.test.ts

import { describe, it, expect, vi } from 'vitest'
import { retryWithBackoff } from '@/core/retry'
import { networkError } from '@/core/errors'
import * as Result from '@/core/result'

describe('Error Recovery', () => {
  it('should retry failed requests with exponential backoff', async () => {
    let attempts = 0
    const mockFn = vi.fn().mockImplementation(() => {
      attempts++
      if (attempts < 3) {
        return Promise.resolve(Result.err(networkError('test', 'Service unavailable')))
      }
      return Promise.resolve(Result.ok({ success: true }))
    })

    const result = await retryWithBackoff(mockFn, {
      maxRetries: 3,
      baseDelay: 100
    })

    expect(attempts).toBe(3)
    expect(Result.isOk(result)).toBe(true)

    Result.match({
      ok: (value) => expect(value).toEqual({ success: true }),
      err: () => fail('Should have succeeded')
    })(result)
  })

  it('should not retry non-retryable errors', async () => {
    const notFoundError = E.notFound('lesson', '999')
    const mockFn = vi.fn().mockResolvedValue(Result.err(notFoundError))

    const result = await retryWithBackoff(mockFn, {
      maxRetries: 3,
      shouldRetry: (error) => E.isNetworkError(error) // Only retry network errors
    })

    expect(mockFn).toHaveBeenCalledTimes(1) // Should not retry
    expect(Result.isErr(result)).toBe(true)
  })
})
```

---

## Migration Guide

### Phase 1: Foundation (1-2 weeks)

**Step 1: Create Error Types**

```bash
mkdir -p src/core/errors
```

Create files:
- `src/core/errors/domain.ts`
- `src/core/errors/infrastructure.ts`
- `src/core/errors/user.ts`
- `src/core/errors/index.ts`

**Step 2: Create Utilities**

```bash
mkdir -p src/core
```

Create files:
- `src/core/try.ts`
- `src/core/retry.ts`
- `src/core/circuit-breaker.ts`
- `src/core/fallback.ts`
- `src/core/toast.ts`
- `src/core/logging.ts`

**Step 3: Setup Error Boundaries**

Create files:
- `src/components/error-boundary.tsx`
- `src/components/async-error-boundary.tsx`

**Step 4: Configure Sentry**

```bash
pnpm add @sentry/nextjs
```

Create: `src/core/sentry.ts`

---

### Phase 2: Server Actions Migration (2-3 weeks)

**Pattern for Migration:**

**BEFORE:**
```typescript
export async function getLesson(id: number) {
  const lesson = await payload.findByID({ collection: 'lessons', id })
  if (!lesson) throw new Error('Lesson not found')
  return lesson
}
```

**AFTER:**
```typescript
export async function getLesson(id: number): Promise<Result<Lesson, NotFoundError | DatabaseError>> {
  const result = await tryCatchAsync(() =>
    payload.findByID({ collection: 'lessons', id })
  )

  if (isErr(result)) {
    return err(databaseError('findByID', result.error.message))
  }

  if (!result.value) {
    return err(notFound('lesson', String(id)))
  }

  return ok(result.value)
}
```

**Checklist:**
- [ ] Migrate `src/api/courses/lessons.ts`
- [ ] Migrate `src/api/courses/progress.ts`
- [ ] Migrate `src/api/courses/quizzes.ts`
- [ ] Migrate `src/api/courses/engagement/`
- [ ] Migrate `src/api/articles/`
- [ ] Migrate `src/api/blog/`
- [ ] Migrate `src/api/compiler/`

---

### Phase 3: Client Migration (2-3 weeks)

**Step 1: Migrate TanStack Query Callbacks**

**BEFORE:**
```typescript
const mutation = useMutation({
  mutationFn: updateProgress,
  onError: (err) => {
    console.error('Failed to update:', err)
  }
})
```

**AFTER:**
```typescript
const mutation = useMutation({
  mutationFn: updateProgress,
  onSuccess: (data) => {
    queryClient.setQueryData(queryKey, data)
  },
  onError: (error) => {
    showErrorToast(error)
  }
})
```

**Step 2: Remove try/catch from Components**

**BEFORE:**
```typescript
const handleSubmit = async () => {
  try {
    await submitQuiz(answers)
  } catch (error) {
    console.error('Failed:', error)
  }
}
```

**AFTER:**
```typescript
const { submitQuiz, error } = useQuizSubmit({ userId, lessonId, courseId, quizData })

// Error handling is in the hook
useEffect(() => {
  if (error) {
    showErrorToast(error)
  }
}, [error])
```

**Checklist:**
- [ ] Migrate all `src/hooks/courses/`
- [ ] Migrate all `src/queries/`
- [ ] Migrate all `src/mutations/`
- [ ] Remove try/catch from components
- [ ] Add error boundaries to layouts

---

### Phase 4: Observability (1 week)

**Tasks:**
- [ ] Implement structured logging
- [ ] Setup error tracking (Sentry)
- [ ] Create error dashboards
- [ ] Setup alerting rules
- [ ] Document error response procedures

---

## Summary

### Before vs After

| Aspect | Before ❌ | After ✅ |
|--------|-----------|----------|
| **Error Types** | Vanilla `Error` | Structured `DomainError`, `InfrastructureError`, `UserError` |
| **Server Actions** | `throw new Error()` | `Result<T, E>` |
| **Client** | `alert()`, `console.error()` | Toast notifications with actions |
| **Recovery** | None | Retry, circuit breaker, fallback |
| **Logging** | `console.error()` | Structured logging + Sentry |
| **Traceability** | None | Correlation IDs, context |
| **Testing** | No error tests | Comprehensive error tests |
| **UX** | Blocking alerts | Non-blocking toasts with actions |

### Benefits

1. **Type Safety**: All errors are typed and predictable
2. **No Exceptions**: 100% explicit error handling
3. **Better UX**: Actionable error messages with recovery options
4. **Observability**: Complete traceability and monitoring
5. **Testability**: Error scenarios are easily testable
6. **Maintainability**: Consistent patterns across codebase

### Key Takeaways

- **Never throw exceptions**: Always return `Result<T, E>`
- **Structured errors**: Use typed error constructors
- **User communication**: Use toast notifications with actions
- **Recovery patterns**: Implement retry, circuit breaker, fallback
- **Observability**: Log everything, track important errors
- **Test thoroughly**: Unit and integration tests for error scenarios

---

**Last Updated:** 2026-01-24
**Status:** Proposed
**Version:** 1.0.0
