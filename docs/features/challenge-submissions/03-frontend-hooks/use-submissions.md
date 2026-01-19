# useSubmissions Hook

## What

TanStack Query query hook that fetches submission history for a user's lesson.

## Why

- **Automatic Caching**: Results are cached for 5 minutes
- **Background Refetch**: Window focus doesn't trigger refetch (prevents unnecessary API calls)
- **Loading States**: Built-in `isLoading` and `error` states
- **Type Safe**: Fully typed with TypeScript

## How

### Hook Implementation

**File:** `src/hooks/api/challenges/use-submissions.ts`

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { getSubmissions, getSubmissionStats, getBestSubmission } from '@/api/courses/submissions'
import type {
  SubmissionHistoryItem,
  UseChallengeSubmissionsReturn,
  UseSubmissionStatsReturn,
  UseBestSubmissionReturn,
} from '@/types/challenges'

/**
 * Fetch submission history for a lesson
 *
 * @param params - Query parameters
 * @returns Query object with submissions data and state
 *
 * @example
 * ```tsx
 * const { submissions, isLoading, error } = useSubmissions({
 *   userId: 'user-123',
 *   lessonId: 456
 * })
 *
 * if (isLoading) return <div>Loading...</div>
 * if (error) return <div>Error: {error.message}</div>
 *
 * return (
 *   <ul>
 *     {submissions.map(sub => (
 *       <li key={sub.id}>{sub.status} - {sub.score}/{sub.totalTests}</li>
 *     ))}
 *   </ul>
 * )
 * ```
 */
export function useSubmissions(params: {
  userId: string | null
  lessonId: number | null
  enabled?: boolean
}): UseChallengeSubmissionsReturn {
  const { userId, lessonId, enabled = true } = params

  const query = useQuery({
    queryKey: ['challenge-submissions', lessonId],
    queryFn: () => {
      if (!userId || !lessonId) {
        throw new Error('userId and lessonId are required')
      }
      return getSubmissions({ userId, lessonId })
    },
    enabled: enabled && !!userId && !!lessonId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  })

  return {
    submissions: query.data || [],
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

/**
 * Fetch submission statistics for a lesson
 *
 * @param params - Query parameters
 * @returns Statistics object
 *
 * @example
 * ```tsx
 * const { stats, isLoading } = useSubmissionStats({
 *   userId: 'user-123',
 *   lessonId: 456
 * })
 *
 * return (
 *   <div>
 *     <p>Total attempts: {stats?.totalAttempts}</p>
 *     <p>Success rate: {stats?.successfulAttempts}</p>
 *   </div>
 * )
 * ```
 */
export function useSubmissionStats(params: {
  userId: string | null
  lessonId: number | null
  enabled?: boolean
}): UseSubmissionStatsReturn {
  const { userId, lessonId, enabled = true } = params

  const query = useQuery({
    queryKey: ['challenge-submission-stats', lessonId],
    queryFn: () => {
      if (!userId || !lessonId) {
        throw new Error('userId and lessonId are required')
      }
      return getSubmissionStats({ userId, lessonId })
    },
    enabled: enabled && !!userId && !!lessonId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  })

  return {
    stats: query.data || null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

/**
 * Fetch the best (most recent successful) submission
 *
 * @param params - Query parameters
 * @returns Best submission or null
 *
 * @example
 * ```tsx
 * const { bestSubmission, isLoading } = useBestSubmission({
 *   userId: 'user-123',
 *   lessonId: 456
 * })
 *
 * if (bestSubmission) {
 *   return <div>Best score: {bestSubmission.score}</div>
 * }
 * return <div>No successful submissions yet</div>
 * ```
 */
export function useBestSubmission(params: {
  userId: string | null
  lessonId: number | null
  enabled?: boolean
}): UseBestSubmissionReturn {
  const { userId, lessonId, enabled = true } = params

  const query = useQuery({
    queryKey: ['challenge-best-submission', lessonId],
    queryFn: () => {
      if (!userId || !lessonId) {
        return null
      }
      return getBestSubmission({ userId, lessonId })
    },
    enabled: enabled && !!userId && !!lessonId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  })

  return {
    bestSubmission: query.data || null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  }
}
```

### Type Definitions

**File:** `src/types/challenges.ts` (add to existing file)

```typescript
// Add to existing types file

/**
 * Return type for useSubmissions hook
 */
export interface UseChallengeSubmissionsReturn {
  submissions: SubmissionHistoryItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Return type for useSubmissionStats hook
 */
export interface UseSubmissionStatsReturn {
  stats: {
    totalAttempts: number
    successfulAttempts: number
    bestScore: number
    averageExecutionTime: number
    firstAttempt: Date | null
    lastAttempt: Date | null
  } | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Return type for useBestSubmission hook
 */
export interface UseBestSubmissionReturn {
  bestSubmission: SubmissionHistoryItem | null
  isLoading: boolean
  error: Error | null
}
```

## Usage Examples

### Display All Submissions

```tsx
'use client'

import { useSubmissions } from '@/hooks/api/challenges/use-submissions'
import { Card } from '@/components/ui/card'

export function SubmissionsList({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading, error } = useSubmissions({ userId, lessonId })

  if (isLoading) return <div>Loading submissions...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Submission History</h2>

      {submissions.length === 0 ? (
        <p className="text-muted-foreground">No submissions yet. Try the challenge!</p>
      ) : (
        <div className="space-y-2">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    {submission.score}/{submission.totalTests} tests passed
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded ${
                  submission.status === 'completed' ? 'bg-green-100 text-green-700' :
                  submission.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {submission.status}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
```

### With Statistics

```tsx
'use client'

import { useSubmissions, useSubmissionStats } from '@/hooks/api/challenges/use-submissions'

export function SubmissionsOverview({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading: loadingList } = useSubmissions({ userId, lessonId })
  const { stats, isLoading: loadingStats } = useSubmissionStats({ userId, lessonId })

  if (loadingList || loadingStats) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Attempts" value={stats?.totalAttempts || 0} />
        <StatCard label="Successful" value={stats?.successfulAttempts || 0} />
        <StatCard label="Best Score" value={`${stats?.bestScore || 0}%`} />
        <StatCard label="Avg Time" value={`${stats?.averageExecutionTime || 0}ms`} />
      </div>

      {/* Submissions List */}
      <div className="space-y-2">
        {submissions.map((sub) => (
          <SubmissionCard key={sub.id} submission={sub} />
        ))}
      </div>
    </div>
  )
}
```

### Conditional Rendering

```tsx
'use client'

import { useSubmissions } from '@/hooks/api/challenges/use-submissions'

export function SubmissionsSection({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading } = useSubmissions({
    userId,
    lessonId,
    enabled: false // Disabled by default
  })

  const [showSubmissions, setShowSubmissions] = useState(false)

  return (
    <div>
      <button onClick={() => setShowSubmissions(!showSubmissions)}>
        {showSubmissions ? 'Hide' : 'Show'} History
      </button>

      {showSubmissions && (
        <div>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <ul>
              {submissions.map((sub) => (
                <li key={sub.id}>{sub.status}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
```

### With Refetch

```tsx
'use client'

import { useSubmissions } from '@/hooks/api/challenges/use-submissions'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export function SubmissionsWithRefresh({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading, refetch } = useSubmissions({ userId, lessonId })

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Submissions</h2>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* ... display submissions */}
    </div>
  )
}
```

## Query Keys

The hooks use these query keys:

| Hook | Query Key | Invalidation |
|------|-----------|--------------|
| `useSubmissions` | `['challenge-submissions', lessonId]` | Auto-invalidated after submission |
| `useSubmissionStats` | `['challenge-submission-stats', lessonId]` | Manual or after submission |
| `useBestSubmission` | `['challenge-best-submission', lessonId]` | Manual or after submission |

Invalidate from anywhere:

```typescript
import { useQueryClient } from '@tanstack/react-query'

function MyComponent() {
  const queryClient = useQueryClient()

  const handleManualRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['challenge-submissions', lessonId]
    })
  }
}
```

## Caching Strategy

| Cache Duration | Hook |
|----------------|------|
| 5 minutes | `useSubmissions`, `useBestSubmission` |
| 10 minutes | `useSubmissionStats` |

Adjust `staleTime` if needed:

```typescript
export function useSubmissions(params: Params) {
  return useQuery({
    // ...
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes instead
  })
}
```

## Enabled Conditional

Disable query until conditions are met:

```typescript
// Don't fetch until user clicks "Show History"
const { submissions } = useSubmissions({
  userId,
  lessonId,
  enabled: showHistory
})

// Don't fetch if userId is null
const { submissions } = useSubmissions({
  userId: session?.user.id || null,
  lessonId,
  enabled: !!session?.user.id // Only fetch if authenticated
})
```

## Error Handling

```tsx
'use client'

import { useSubmissions } from '@/hooks/api/challenges/use-submissions'

export function SubmissionsWithError({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading, error } = useSubmissions({ userId, lessonId })

  if (isLoading) return <div>Loading...</div>

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-semibold text-red-800">Failed to load submissions</h3>
        <p className="text-sm text-red-600">{error.message}</p>
        <button onClick={() => window.location.reload()} className="text-red-700 underline">
          Retry
        </button>
      </div>
    )
  }

  return <div>{/* ... */}</div>
}
```

## Performance Tips

1. **Use Selectors** for large datasets
   ```typescript
   const submissionIds = useSubmissions({
     userId,
     lessonId,
     select: (data) => data.map(s => s.id)
   })
   ```

2. **Paginate** for many submissions
   ```typescript
   const { submissions } = useSubmissions({
     userId,
     lessonId,
     limit: 20,
     offset: page * 20
   })
   ```

3. **Deduplicate** similar queries
   ```typescript
   // Multiple components with same lessonId share cache
   const list1 = useSubmissions({ userId, lessonId: 123 })
   const list2 = useSubmissions({ userId, lessonId: 123 })
   // Only one API call!
   ```

## Dependencies

- `@tanstack/react-query` - Query management
- `@/api/courses/submissions` - Server-side API
- `@/types/challenges` - Type definitions

## Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSubmissions } from '@/hooks/api/challenges/use-submissions'

describe('useSubmissions', () => {
  it('fetches submissions', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() =>
      useSubmissions({ userId: 'test', lessonId: 1 }),
      { wrapper }
    )

    await waitFor(() => {
      expect(result.current.submissions).toBeDefined()
      expect(result.current.isLoading).toBe(false)
    })
  })
})
```

## Next Steps

- → [Go to Submissions Page](../04-ui-components/submissions-page.md) to build the UI
- → [Go to useRestore](./use-restore.md) to implement code restoration
