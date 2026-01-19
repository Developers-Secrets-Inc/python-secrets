# Error Handling

## What

User-friendly error messages and graceful error handling throughout the submission system.

## Why

- **Better UX**: Users understand what went wrong
- **Faster Debugging**: Clear error messages help users fix issues
- **Professional**: Polished error handling improves perceived quality

## How

### Error Categories

| Category | Example | HTTP Status | User Message |
|----------|---------|-------------|--------------|
| **Validation** | Missing challengeId | 400 | "Please select a challenge" |
| **Not Found** | Challenge doesn't exist | 404 | "Challenge not found" |
| **Execution** | Syntax error in code | 200 (with error) | "SyntaxError: invalid syntax" |
| **Test Error** | Test assertion failed | 200 (with error) | "Expected 5, got 7" |
| **Timeout** | Code took too long | 408 | "Execution timeout (10s)" |
| **Server** | Database error | 500 | "Server error. Please try again" |
| **Network** | Request failed | 0/Failed | "Connection error. Check your internet" |

### Client-Side Errors

#### Hook Error Handling

**File:** `src/hooks/api/challenges/use-submit-challenge.ts`

```typescript
export function useSubmitChallenge() {
  const mutation = useMutation({
    mutationFn: async (params: Omit<SubmitChallengeParams, 'files'>) => {
      // Validation
      if (!params.challengeId) {
        throw new Error('No challenge selected')
      }

      if (!params.userId) {
        throw new Error('Not authenticated')
      }

      // Convert files
      const files = convertFilesToProjectFormat(get().files)

      if (files.length === 0) {
        throw new Error('No code to submit. Please write some code first.')
      }

      // Call API
      return await submitChallengeAPI({ ...params, files })
    },

    onError: (error: Error) => {
      console.error('Submission error:', error)

      // User-friendly messages
      if (error.message.includes('No challenge selected')) {
        toast.error('Please select a challenge first.')
      } else if (error.message.includes('Not authenticated')) {
        toast.error('Please log in to submit your code.')
      } else if (error.message.includes('No code to submit')) {
        toast.error('Please write some code before submitting.')
      } else if (error.message.includes('Network Error')) {
        toast.error('Connection error. Please check your internet and try again.')
      } else {
        toast.error(`Submission failed: ${error.message}`)
      }
    },
  })

  return {
    submitChallenge: (params) => {
      // Client-side validation before calling mutation
      if (!params.challengeId) {
        toast.error('No challenge selected')
        return
      }

      mutation.mutate(params)
    },
    isSubmitting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  }
}
```

#### Component Error Boundaries

**File:** `src/components/error-boundary.tsx`

```typescript
'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: React.ReactNode
  fallback?: React.Component<{ error: Error; resetErrorBoundary: () => void }>
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <this.props.fallback error={this.state.error!} resetErrorBoundary={() => this.setState({ hasError: false })} />
      }

      return (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{this.state.error?.message}</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </Button>
        </Card>
      )
    }

    return this.props.children
  }
}
```

**Usage:**

```tsx
<ErrorBoundary fallback={CustomErrorFallback}>
  <TestResultsViewer {...props} />
</ErrorBoundary>
```

### Server-Side Errors

#### API Error Handler

**File:** `src/api/courses/challenges.ts`

```typescript
export async function submitChallenge(
  params: SubmitChallengeParams
): Promise<SubmissionResult> {
  try {
    // Validate parameters
    if (!params.userId) {
      throw new Error('User ID is required')
    }

    if (!params.challengeId) {
      throw new Error('Challenge ID is required')
    }

    // Fetch challenge
    const challenge = await payload.find({
      collection: 'challenges-exercices',
      where: { id: { equals: params.challengeId } },
    })

    if (!challenge.docs[0]) {
      throw new Error('Challenge not found')
    }

    // Execute code
    let executionOutput = ''
    let executionError = ''

    try {
      const result = await compileProject(params.files, 'main.py', params.compiler)
      executionOutput = `${result.stdout}\n${result.stderr}`
      executionError = result.error || ''
    } catch (error) {
      executionError = error instanceof Error ? error.message : 'Unknown error'
      console.error('Code execution failed:', error)
    }

    // If execution failed, return early with error result
    if (executionError) {
      return {
        success: false,
        status: 'error',
        testResults: [
          {
            id: 'execution-error',
            name: 'Code Execution',
            status: 'error',
            error: executionError,
            duration: 0,
          },
        ],
        summary: {
          total: 1,
          passed: 0,
          failed: 1,
          score: 0,
        },
        executionOutput,
        executionTime: 0,
      }
    }

    // ... rest of implementation

  } catch (error) {
    // Log error for debugging
    console.error('submitChallenge error:', error)

    // Re-throw with context
    throw new Error(
      `Failed to submit challenge: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}
```

#### Validation Helper

**File:** `src/api/courses/challenges.ts`

```typescript
function validateSubmission(params: SubmitChallengeParams): void {
  const errors: string[] = []

  if (!params.userId) {
    errors.push('User ID is required')
  }

  if (!params.lessonId) {
    errors.push('Lesson ID is required')
  }

  if (!params.courseId) {
    errors.push('Course ID is required')
  }

  if (!params.challengeId) {
    errors.push('Challenge ID is required')
  }

  if (!params.files || params.files.length === 0) {
    errors.push('At least one file is required')
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`)
  }
}
```

### Test Result Errors

#### Format Error Messages

**File:** `src/core/testing/test-runner.ts`

```typescript
function parseTestResult(result: ExecutionResult): Pick<TestResult, 'status' | 'output' | 'error'> {
  const { stdout, stderr, error } = result

  if (error) {
    return {
      status: 'error',
      error: formatErrorMessage(error),
    }
  }

  if (stderr.includes('AssertionError')) {
    // Extract assertion message
    const match = stderr.match(/AssertionError: (.+)/)
    const errorMessage = match ? match[1] : 'Assertion failed'

    return {
      status: 'failed',
      error: errorMessage,
    }
  }

  // ... other cases
}

function formatErrorMessage(error: string): string {
  // Make error messages more user-friendly
  return error
    .replace('File "<string>", line ', '')
    .replace(/Traceback \(most recent call last\):[\s\S]*/, '') // Remove traceback
    .trim()
}
```

**Examples:**

| Raw Error | Formatted |
|-----------|-----------|
| `Traceback...\nFile "<string>", line 5, in <module>\nNameError: name 'x' is not defined` | `NameError: name 'x' is not defined` |
| `Traceback...\nZeroDivisionError: division by zero` | `ZeroDivisionError: division by zero` |

### User-Friendly Error Messages

#### Common Errors

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  'Challenge not found': 'This challenge does not exist or has been removed.',
  'Lesson not found': 'This lesson does not exist or has been removed.',
  'Not authenticated': 'Please log in to submit your code.',
  'No code to submit': 'Please write some code before submitting.',
  'Execution timeout': 'Your code took too long to run (>10s). Check for infinite loops.',
  'SyntaxError': 'There is a syntax error in your code. Check for typos, missing colons, etc.',
  'IndentationError': 'Python indentation must be consistent. Use 4 spaces for each indentation level.',
  'NameError': 'You are using a variable or function that does not exist.',
  'ZeroDivisionError': 'You are trying to divide by zero.',
  'TypeError': 'You are using a value with the wrong type (e.g., adding a string to a number).',
  'Network Error': 'Could not connect to the server. Please check your internet connection.',
}
```

#### Usage

```typescript
onError: (error: Error) => {
  const userMessage = ERROR_MESSAGES[error.message] || error.message
  toast.error(userMessage)
}
```

### Retry Logic

#### Exponential Backoff

**File:** `src/hooks/api/challenges/use-submit-challenge.ts`

```typescript
import { useMutation } from '@tanstack/react-query'

export function useSubmitChallenge() {
  const mutation = useMutation({
    mutationFn: submitChallengeAPI,

    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error.message.includes('validation')) {
        return false
      }

      // Retry up to 3 times on network errors
      if (failureCount < 3 && error.message.includes('Network')) {
        return true
      }

      return false
    },

    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * 2 ** attemptIndex, 10000)
    },
  })

  return { /* ... */ }
}
```

### Loading States

#### Optimistic UI

```tsx
function SubmitButton() {
  const { submitChallenge, isSubmitting } = useSubmitChallenge()

  return (
    <button
      onClick={() => submitChallenge(params)}
      disabled={isSubmitting}
      className={cn(
        "px-4 py-2 rounded",
        isSubmitting && "opacity-70 cursor-not-allowed"
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Running tests...
        </>
      ) : (
        'Submit Code'
      )}
    </button>
  )
}
```

#### Skeleton Loading

```tsx
function TestResultsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-muted rounded" />
      <div className="h-16 bg-muted rounded" />
      <div className="h-16 bg-muted rounded" />
    </div>
  )
}

// Usage
function TestsPanel() {
  const { data, isLoading } = useSubmissions({ userId, lessonId })

  if (isLoading) {
    return <TestResultsSkeleton />
  }

  return <TestResultsViewer {...data} />
}
```

## Error Logging

### Client-Side

```typescript
// Log to console in development
if (process.env.NODE_ENV === 'development') {
  console.error('Submission error:', error, {
    userId,
    lessonId,
    challengeId,
    fileCount: files.length,
  })
}

// Send to error tracking service in production
if (process.env.NODE_ENV === 'production') {
  // Sentry, LogRocket, etc.
  errorTrackingService.captureException(error, {
    tags: {
      component: 'useSubmitChallenge',
      action: 'submitChallenge',
    },
    extra: {
      userId,
      lessonId,
      challengeId,
    },
  })
}
```

### Server-Side

```typescript
// Log structured errors
console.error(JSON.stringify({
  error: error.message,
  stack: error.stack,
  userId,
  lessonId,
  challengeId,
  timestamp: new Date().toISOString(),
}))
```

## Testing Error Scenarios

```typescript
describe('Error Handling', () => {
  it('shows validation error when no files', async () => {
    const { submitChallenge } = useSubmitChallenge()

    submitChallenge({
      userId: 'test',
      lessonId: 1,
      courseId: 1,
      challengeId: 'test',
      files: [],
    })

    await waitFor(() => {
      expect(screen.findByText('Please write some code')).toBeInTheDocument()
    })
  })

  it('handles network errors gracefully', async () => {
    // Mock fetch to fail
    global.fetch = vi.fn(() => Promise.reject(new Error('Network Error')))

    const { submitChallenge } = useSubmitChallenge()

    submitChallenge({ /* params */ })

    await waitFor(() => {
      expect(screen.findByText('Connection error')).toBeInTheDocument()
    })
  })
})
```

## Best Practices

1. **Fail Fast**: Validate inputs before processing
2. **Be Specific**: Tell users exactly what went wrong
3. **Provide Solutions**: Suggest how to fix the error
4. **Don't Expose**: Hide internal implementation details
5. **Log Everything**: Log errors for debugging, show simple messages to users
6. **Offer Retry**: Allow users to retry after errors
7. **Stay Calm**: Use calm, professional language

## Next Steps

- → [Go to Notifications](./notifications.md) for toast implementation
- → [Go to Performance](./performance.md) for optimization
