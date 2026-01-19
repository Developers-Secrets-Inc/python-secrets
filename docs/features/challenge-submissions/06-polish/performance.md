# Performance

## What

Optimization strategies and caching patterns for the challenge submission system.

## Why

- **Fast User Experience**: Submissions complete in < 10 seconds
- **Reduced Server Load**: Fewer unnecessary API calls
- **Better UX**: Optimistic updates and instant feedback

## How

### Caching Strategy

#### TanStack Query Cache

```typescript
// Submissions list - 5 minute cache
const { submissions } = useQuery({
  queryKey: ['challenge-submissions', lessonId],
  queryFn: () => getSubmissions({ userId, lessonId }),
  staleTime: 1000 * 60 * 5, // 5 minutes
  gcTime: 1000 * 60 * 10, // Keep in memory for 10 minutes
})
```

**Cache Duration Guidelines:**

| Data | staleTime | gcTime | Reason |
|------|-----------|--------|--------|
| Submissions list | 5 min | 10 min | Changes infrequently |
| Submission detail | 10 min | 15 min | Historical data |
| Best submission | 5 min | 10 min | Changes with new attempts |
| Challenge data | 15 min | 30 min | Rarely changes |

#### Cache Invalidation

```typescript
// Automatic invalidation after submission
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['challenge-submissions', lessonId],
  })
}
```

**Selective Invalidation:**

```typescript
// Invalidate specific query
queryClient.invalidateQueries({
  queryKey: ['challenge-submissions', lessonId],
})

// Invalidate all submissions for user
queryClient.invalidateQueries({
  queryKey: ['challenge-submissions'],
})

// Invalidate matching predicate
queryClient.invalidateQueries({
  predicate: (query) => {
    return query.queryKey[0] === 'challenge-submissions'
  }
})
```

### Optimistic Updates

#### Instant UI Feedback

```typescript
export function useSubmitChallenge() {
  const mutation = useMutation({
    mutationFn: submitChallengeAPI,

    onMutate: async (variables) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['challenge-submissions', variables.lessonId] })

      // Snapshot previous value
      const previousSubmissions = queryClient.getQueryData(['challenge-submissions', variables.lessonId])

      // Optimistically add submission to list
      queryClient.setQueryData(
        ['challenge-submissions', variables.lessonId],
        (old: any[]) => [
          {
            id: 'temp-id',
            status: 'pending',
            score: 0,
            totalTests: 0,
            submittedAt: new Date(),
          },
          ...(old || []),
        ]
      )

      return { previousSubmissions }
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousSubmissions) {
        queryClient.setQueryData(
          ['challenge-submissions', variables.lessonId],
          context.previousSubmissions
        )
      }
    },

    onSuccess: (data, variables) => {
      // Replace optimistic update with real data
      queryClient.invalidateQueries({
        queryKey: ['challenge-submissions', variables.lessonId],
      })
    },
  })
}
```

### Request Debouncing

#### Auto-Save Debounce

```typescript
import { useDebouncedCallback } from 'use-debounce'

function IDEComponent() {
  const { updateFileContent } = useIDEStore()

  // Debounce file saves (every 2 seconds)
  const debouncedSave = useDebouncedCallback((fileId, content) => {
    saveToDatabase({ fileId, content })
  }, 2000)

  const handleChange = (content: string) => {
    updateFileContent(fileId, content)
    debouncedSave(fileId, content)
  }
}
```

**Installation:**

```bash
pnpm add use-debounce
```

### Code Splitting

#### Lazy Load Test Runner

```typescript
import { lazy, Suspense } from 'react'

// Lazy load test runner (only needed when submitting)
const TestRunner = lazy(() => import('@/core/testing/test-runner'))

function TestsPanel() {
  const [shouldRunTests, setShouldRunTests] = useState(false)

  return (
    <div>
      <button onClick={() => setShouldRunTests(true)}>
        Run Tests
      </button>

      {shouldRunTests && (
        <Suspense fallback={<div>Loading test runner...</div>}>
          <TestRunner />
        </Suspense>
      )}
    </div>
  )
}
```

### Pagination

#### Paginate Submissions

```typescript
export function useSubmissions(params: {
  userId: string
  lessonId: number
  page: number
  limit: number
}) {
  return useQuery({
    queryKey: ['challenge-submissions', params.lessonId, params.page],
    queryFn: () => getSubmissions({
      userId: params.userId,
      lessonId: params.lessonId,
      offset: params.page * params.limit,
      limit: params.limit,
    }),
  })
}
```

**Usage:**

```typescript
function SubmissionsPage() {
  const [page, setPage] = useState(0)
  const limit = 20

  const { submissions, isLoading } = useSubmissions({ userId, lessonId, page, limit })

  return (
    <div>
      <div>
        {submissions.map(sub => <SubmissionCard key={sub.id} {...sub} />)}
      </div>

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### Code Execution Optimization

#### Timeout Management

```typescript
// Set reasonable timeouts
const TEST_TIMEOUT = 5000 // 5 seconds per test
const TOTAL_TIMEOUT = 30000 // 30 seconds total

async function runTests(tests: ChallengeTest[]) {
  const results = await Promise.allSettled(
    tests.map(test =>
      Promise.race([
        runTest(test),
        timeout(TEST_TIMEOUT, test.name)
      ])
    )
  )
}
```

#### Parallel vs Sequential

```typescript
// Sequential (safer, simpler)
async function runSequential(tests: ChallengeTest[]) {
  const results = []
  for (const test of tests) {
    const result = await runTest(test)
    results.push(result)
  }
  return results
}

// Parallel (faster, riskier)
async function runParallel(tests: ChallengeTest[]) {
  return Promise.all(tests.map(test => runTest(test)))
}

// Hybrid (best of both)
async function runHybrid(tests: ChallengeTest[], parallel = 3) {
  const chunks = chunk(tests, parallel)
  const results = []

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(runTest))
    results.push(...chunkResults)
  }

  return results
}

function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
```

### Data Compression

#### Compress Large Output

```typescript
import { compressToUTF16, decompressFromUTF16 } from 'lz-string'

// Store compressed output
const compressed = compressToUTF16(largeOutput)

// Decompress when needed
const decompressed = decompressFromUTF16(compressed)
```

**Installation:**

```bash
pnpm add lz-string
```

### Prefetching

#### Prefetch Challenge Data

```typescript
// Prefetch when user hovers over challenge link
function ChallengeLink({ challengeId }: { challengeId: string }) {
  const queryClient = useQueryClient()

  return (
    <Link
      href={`/challenges/${challengeId}`}
      onMouseEnter={() => {
        queryClient.prefetchQuery({
          queryKey: ['challenge', challengeId],
          queryFn: () => getChallenge(challengeId),
        })
      }}
    >
      {children}
    </Link>
  )
}
```

#### Prefetch Submissions

```typescript
// In lesson layout
useEffect(() => {
  // Prefetch submissions in background
  queryClient.prefetchQuery({
    queryKey: ['challenge-submissions', lessonId],
    queryFn: () => getSubmissions({ userId, lessonId }),
  })
}, [lessonId, userId])
```

### Performance Monitoring

#### Measure Execution Time

```typescript
export async function submitChallenge(params: SubmitChallengeParams) {
  const startTime = performance.now()

  try {
    const result = await submitChallengeAPI(params)

    const duration = performance.now() - startTime

    // Log slow submissions
    if (duration > 5000) {
      console.warn(`Slow submission: ${duration}ms`)
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      ;(window as any).gtag('event', 'submission_time', {
        event_category: 'performance',
        value: Math.round(duration),
      })
    }

    return result
  } catch (error) {
    // Still measure failed submissions
    const duration = performance.now() - startTime
    console.error(`Submission failed after ${duration}ms`, error)
    throw error
  }
}
```

#### React Query DevTools

```typescript
// In development only
if (process.env.NODE_ENV === 'development') {
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

  function App() {
    return (
      <>
        <QueryClientProvider client={queryClient}>
          {/* ... */}
        </QueryClientProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </>
    )
  }
}
```

**Installation:**

```bash
pnpm add @tanstack/react-query-devtools
```

### Memory Management

#### Cleanup Unused Data

```typescript
// Configure garbage collection
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 10, // Keep unused data for 10 minutes
      staleTime: 1000 * 60 * 5,
    },
  },
})
```

#### Clear Cache on Logout

```typescript
function onLogout() {
  queryClient.clear()
  // Or selective clear
  queryClient.removeQueries({ queryKey: ['challenge-submissions'] })
}
```

## Performance Targets

| Metric | Target | Acceptable |
|--------|--------|------------|
| Submission time | < 5s | < 10s |
| Time to first test result | < 2s | < 5s |
| Page load (submissions) | < 1s | < 3s |
| Cache hit rate | > 80% | > 50% |
| Memory usage | < 50MB | < 100MB |

## Monitoring

### Key Metrics to Track

1. **Submission Duration**
   - P50, P95, P99 latency
   - Track by test count

2. **Error Rate**
   - Percentage of failed submissions
   - Error types distribution

3. **Cache Performance**
   - Hit rate
   - Miss rate
   - Invalidations per minute

4. **User Behavior**
   - Submissions per session
   - Average attempts before success
   - Time between submissions

### Analytics Integration

```typescript
// Track submission events
function trackSubmission(result: SubmissionResult) {
  ;(window as any).gtag('event', 'challenge_submission', {
    event_category: 'engagement',
    event_label: result.status,
    value: result.summary.score,
  })
}
```

## Next Steps

- → [Back to README](../README.md) for overview
- → [Go to Error Handling](./error-handling.md) for error patterns
