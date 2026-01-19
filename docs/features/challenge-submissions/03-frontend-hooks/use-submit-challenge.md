# useSubmitChallenge Hook

## What

TanStack Query mutation hook that encapsulates the entire submission flow: code execution, testing, and result display.

## Why

- **Single Entry Point**: Components only call this hook, don't access internal logic
- **Automatic Refetching**: Invalidates submissions cache on success
- **Error Handling**: Built-in error handling with user-friendly messages
- **Loading States**: Easy to show loading/success/error states

## How

### Hook Implementation

**File:** `src/hooks/api/challenges/use-submit-challenge.ts`

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitChallenge as submitChallengeAPI } from '@/api/courses/challenges'
import { useIDEStore } from '@/core/ide/stores/use-ide-store'
import type { SubmitChallengeParams, SubmissionResult } from '@/types/challenges'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

/**
 * Submit challenge code for testing
 *
 * @returns Object with mutation state and actions
 *
 * @example
 * ```tsx
 * const { submitChallenge, isSubmitting, data } = useSubmitChallenge()
 *
 * <button onClick={() => submitChallenge({ userId, lessonId, courseId, challengeId })}>
 *   Submit
 * </button>
 * ```
 */
export function useSubmitChallenge() {
  const queryClient = useQueryClient()
  const files = useIDEStore((state) => state.files)
  const setConsoleTab = useIDEStore((state) => state.setConsoleTab)

  const mutation = useMutation({
    mutationFn: async (params: Omit<SubmitChallengeParams, 'files'>): Promise<SubmissionResult> => {
      // Convert IDE files to ProjectFile format
      const projectFiles = convertFilesToProjectFormat(files)

      return await submitChallengeAPI({
        ...params,
        files: projectFiles,
      })
    },

    onMutate: () => {
      // Switch to tests tab when submission starts
      setConsoleTab('tests')
    },

    onSuccess: (data, variables) => {
      // Invalidate submissions query to refresh history
      queryClient.invalidateQueries({
        queryKey: ['challenge-submissions', variables.lessonId],
      })

      // Show success notification
      if (data.summary.passed === data.summary.total && data.summary.total > 0) {
        toast.success(`🎉 Challenge completed! ${data.summary.passed}/${data.summary.total} tests passed`)

        // Trigger confetti celebration
        triggerConfetti()
      } else if (data.summary.failed > 0) {
        toast.info(`${data.summary.passed}/${data.summary.total} tests passed. Keep trying!`)
      } else if (data.status === 'error') {
        toast.error('Code execution failed. Check for syntax errors.')
      }
    },

    onError: (error: Error) => {
      console.error('Submission failed:', error)
      toast.error(`Submission failed: ${error.message}`)
    },
  })

  return {
    /**
     * Submit code for testing
     */
    submitChallenge: mutation.mutate,

    /**
     * Submit code (callback version)
     */
    submitChallengeAsync: mutation.mutateAsync,

    /**
     * Is submission in progress?
     */
    isSubmitting: mutation.isPending,

    /**
     * Latest submission data
     */
    data: mutation.data,

    /**
     * Error object if submission failed
     */
    error: mutation.error,

    /**
     * Reset mutation state
     */
    reset: mutation.reset,
  }
}

/**
 * Convert IDE FileNode[] to ProjectFile[]
 */
function convertFilesToProjectFormat(files: ReturnType<typeof useIDEStore.getState>['files']): SubmissionResult {
  return files
    .filter((f) => f.type === 'file')
    .map((f) => ({
      path: `/${f.id}`, // or build full path from parent hierarchy
      content: f.content || '',
    }))
}

/**
 * Trigger confetti celebration
 */
function triggerConfetti() {
  const duration = 3000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 50 * (timeLeft / duration)

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}
```

## Usage

### Basic Usage

```tsx
'use client'

import { useSubmitChallenge } from '@/hooks/api/challenges/use-submit-challenge'
import { Button } from '@/components/ui/button'

export function SubmitButton({ challengeData }: { challengeData: any }) {
  const { submitChallenge, isSubmitting } = useSubmitChallenge()

  const handleSubmit = () => {
    submitChallenge({
      userId: 'user-123',
      lessonId: challengeData.lessonId,
      courseId: challengeData.courseId,
      challengeId: challengeData.id,
    })
  }

  return (
    <Button onClick={handleSubmit} disabled={isSubmitting}>
      {isSubmitting ? 'Running...' : 'Submit Code'}
    </Button>
  )
}
```

### With Result Display

```tsx
'use client'

import { useSubmitChallenge } from '@/hooks/api/challenges/use-submit-challenge'
import { TestResultsViewer } from '@/components/test-results-viewer'

export function TestPanel({ challengeData }: { challengeData: any }) {
  const { submitChallenge, isSubmitting, data: results } = useSubmitChallenge()

  return (
    <div className="p-4">
      <button
        onClick={() => submitChallenge({
          userId: 'user-123',
          lessonId: challengeData.lessonId,
          courseId: challengeData.courseId,
          challengeId: challengeData.id,
        })}
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        {isSubmitting ? 'Running tests...' : 'Submit Code'}
      </button>

      {results && (
        <TestResultsViewer
          summary={results.summary}
          testResults={results.testResults}
        />
      )}
    </div>
  )
}
```

### With Retry Logic

```tsx
'use client'

import { useSubmitChallenge } from '@/hooks/api/challenges/use-submit-challenge'

export function SmartSubmitButton({ challengeData }: { challengeData: any }) {
  const { submitChallenge, isSubmitting, data, error } = useSubmitChallenge()

  const hasFailures = data?.summary.failed > 0
  const hasErrors = data?.status === 'error'

  return (
    <div className="space-y-4">
      <button
        onClick={() => submitChallenge({
          userId: 'user-123',
          lessonId: challengeData.lessonId,
          courseId: challengeData.courseId,
          challengeId: challengeData.id,
        })}
        disabled={isSubmitting}
        className="px-4 py-2 bg-primary text-white rounded"
      >
        {isSubmitting ? 'Running...' : 'Submit Code'}
      </button>

      {error && (
        <div className="text-red-500">
          {error.message}
        </div>
      )}

      {data && hasFailures && (
        <div className="text-amber-500">
          {data.summary.failed} tests failed. Try again!
        </div>
      )}

      {data && data.summary.passed === data.summary.total && (
        <div className="text-green-500">
          🎉 All tests passed!
        </div>
      )}
    </div>
  )
}
```

## Return Type

```typescript
interface UseSubmitChallengeReturn {
  // Actions
  submitChallenge: (params: Omit<SubmitChallengeParams, 'files'>) => void
  submitChallengeAsync: (params: Omit<SubmitChallengeParams, 'files'>) => Promise<SubmissionResult>
  reset: () => void

  // State
  isSubmitting: boolean
  data: SubmissionResult | undefined
  error: Error | null
}
```

## State Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Component calls submitChallenge(params)                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ON MUTATE                                                   │
│  1. setConsoleTab('tests') - Switch to Tests tab            │
│  2. Convert IDE files to ProjectFile[]                      │
│  3. Call submitChallenge API                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  API EXECUTES (server-side)                                  │
│  1. Execute user code                                        │
│  2. Run tests                                                │
│  3. Save submission to database                             │
│  4. Update UserProgress                                     │
└─────────────────────────────────────────────────────────────┘
                           ↓
              API Response (success or error)
                   ↓              ↓
                 SUCCESS        ERROR
                   ↓              ↓
┌────────────────────────┐  ┌────────────────────────┐
│  ON SUCCESS            │  │  ON ERROR               │
│  1. Invalidate cache   │  │  1. Log error           │
│  2. Show toast         │  │  2. Show error toast    │
│  3. Trigger confetti   │  │  3. Update error state  │
│     (if all pass)      │  │                         │
│  4. Update data state  │  │                         │
└────────────────────────┘  └────────────────────────┘
```

## Toast Notifications

The hook shows different toasts based on results:

| Result | Toast | Confetti? |
|--------|-------|-----------|
| All tests pass | 🎉 Challenge completed! X/X tests passed | ✅ Yes |
| Some tests pass | X/Y tests passed. Keep trying! | ❌ No |
| Execution error | Code execution failed. Check for syntax errors. | ❌ No |
| API error | Submission failed: [error message] | ❌ No |

You can customize the toast library (currently using `sonner`):

```typescript
import { toast } from 'sonner' // Current

// Or use your preferred library
import { toast } from 'react-hot-toast'
import { Toast } from '@/components/ui/toast'
```

## Confetti Configuration

The confetti animation uses `canvas-confetti`. Adjust the `triggerConfetti` function to customize:

```typescript
function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a'],
  })
}
```

Install dependency:
```bash
pnpm add canvas-confetti
```

## File Path Building

The `convertFilesToProjectFormat` function currently uses a simple path conversion. For more complex file hierarchies:

```typescript
function convertFilesToProjectFormat(files: FileNode[]): ProjectFile[] {
  const buildPath = (node: FileNode): string => {
    if (!node.parentId) return `/${node.name}`

    const parent = files.find(f => f.id === node.parentId)
    if (!parent) return `/${node.name}`

    return `${buildPath(parent)}/${node.name}`
  }

  return files
    .filter(f => f.type === 'file')
    .map(f => ({
      path: buildPath(f),
      content: f.content || '',
    }))
}
```

## Error Scenarios

The hook handles:

1. **Network Errors**
   - Caught by `onError`
   - Shows error toast
   - Error available in `error` state

2. **API Errors**
   - Returned from server
   - Shows error toast
   - Error details in toast message

3. **Execution Errors**
   - Returned in `data` with `status: 'error'`
   - Shows specific toast
   - Test results contain error details

4. **Validation Errors**
   - Should be caught before calling API
   - Example: Missing challengeId

```typescript
const handleSubmit = () => {
  if (!challengeData?.id) {
    toast.error('No challenge selected')
    return
  }

  submitChallenge({
    userId: 'user-123',
    lessonId: challengeData.lessonId,
    courseId: challengeData.courseId,
    challengeId: challengeData.id,
  })
}
```

## Dependencies

- `@tanstack/react-query` - Mutation and query management
- `@/api/courses/challenges` - Server-side submission API
- `@/core/ide/stores/use-ide-store` - IDE state (files, console tab)
- `@/types/challenges` - Type definitions
- `sonner` - Toast notifications
- `canvas-confetti` - Celebration animation

## Testing

### Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SubmitButton } from './submit-button'

// Mock the API
vi.mock('@/api/courses/challenges', () => ({
  submitChallenge: vi.fn(() => Promise.resolve({
    success: true,
    status: 'completed',
    testResults: [],
    summary: { total: 2, passed: 2, failed: 0, score: 100 },
    executionOutput: '',
    executionTime: 1000,
  })),
}))

describe('SubmitButton', () => {
  it('submits code on click', async () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SubmitButton challengeData={{ id: 1, lessonId: 1, courseId: 1 }} />
      </QueryClientProvider>
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    // Verify API was called
    expect(submitChallenge).toHaveBeenCalled()
  })
})
```

## Next Steps

- → [Go to useSubmissions](./use-submissions.md) to fetch submission history
- → [Go to Console Tabs](../04-ui-components/console-tabs.md) to integrate with UI
- → [Go to Test Results](../04-ui-components/test-results.md) to display results
