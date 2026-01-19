# History API

## What

API endpoints to retrieve submission history and individual submission details.

## Why

- **Show History**: Display all user's attempts for a lesson
- **Review Progress**: Allow users to see their improvement over time
- **Restore Code**: Enable users to restore previous code versions
- **Analytics**: Track success rates and common mistakes

## How

### Get Submission History

**File:** `src/api/courses/submissions.ts`

```typescript
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  GetSubmissionsParams,
  SubmissionHistoryItem,
  SubmissionDetail,
} from '@/types/challenges'

/**
 * Get all submissions for a user's lesson
 *
 * @param params - Query parameters
 * @returns Array of submission history items
 */
export async function getSubmissions(
  params: GetSubmissionsParams
): Promise<SubmissionHistoryItem[]> {
  const { userId, lessonId, limit = 20, offset = 0 } = params

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'challenge-submissions',
    where: {
      and: [
        { userId: { equals: userId } },
        { lesson: { equals: lessonId } },
      ],
    },
    sort: '-submittedAt',
    limit,
    offset,
    depth: 2, // Populate lesson and challenge
  })

  // Transform to our domain type
  return result.docs.map((doc) => ({
    id: doc.id,
    userId: doc.userId,
    lessonId: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
    challengeId:
      typeof doc.challenge === 'object' ? doc.challenge.id : (doc.challenge as string | number),
    submittedAt: new Date(doc.submittedAt),
    status: doc.status as SubmissionHistoryItem['status'],
    score: doc.score,
    totalTests: doc.totalTests,
    executionTime: doc.executionTime || 0,
  }))
}
```

### Get Submission Detail

**File:** `src/api/courses/submissions.ts` (append)

```typescript
/**
 * Get detailed information about a specific submission
 *
 * @param submissionId - The submission ID
 * @returns Complete submission details with code and test results
 */
export async function getSubmissionDetail(submissionId: string): Promise<SubmissionDetail> {
  const payload = await getPayload({ config })

  const doc = await payload.findByID({
    collection: 'challenge-submissions',
    id: submissionId,
    depth: 2,
  })

  if (!doc) {
    throw new Error('Submission not found')
  }

  // Transform to our domain type
  return {
    id: doc.id,
    userId: doc.userId,
    lessonId: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
    challengeId:
      typeof doc.challenge === 'object' ? doc.challenge.id : (doc.challenge as string | number),
    submittedAt: new Date(doc.submittedAt),
    status: doc.status as SubmissionDetail['status'],
    score: doc.score,
    totalTests: doc.totalTests,
    executionTime: doc.executionTime || 0,
    submittedCode: doc.submittedCode as SubmissionDetail['submittedCode'],
    testResults: doc.testResults as SubmissionDetail['testResults'],
    executionOutput: '', // Not stored in DB, would need to reconstruct if needed
  }
}
```

### Get Best Submission

**File:** `src/api/courses/submissions.ts` (append)

```typescript
/**
 * Get the best submission for a user's lesson
 * (highest score, earliest date if tie)
 *
 * @param params - Query parameters
 * @returns Best submission or null
 */
export async function getBestSubmission(
  params: GetSubmissionsParams
): Promise<SubmissionHistoryItem | null> {
  const { userId, lessonId } = params

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'challenge-submissions',
    where: {
      and: [
        { userId: { equals: userId } },
        { lesson: { equals: lessonId } },
        { status: { equals: 'completed' } }, // Only successful submissions
      ],
    },
    sort: 'score', // Higher score first (all completed have score 100%)
    limit: 1,
  })

  if (result.docs.length === 0) {
    return null
  }

  const doc = result.docs[0]

  return {
    id: doc.id,
    userId: doc.userId,
    lessonId: typeof doc.lesson === 'object' ? doc.lesson.id : doc.lesson,
    challengeId:
      typeof doc.challenge === 'object' ? doc.challenge.id : (doc.challenge as string | number),
    submittedAt: new Date(doc.submittedAt),
    status: doc.status as SubmissionHistoryItem['status'],
    score: doc.score,
    totalTests: doc.totalTests,
    executionTime: doc.executionTime || 0,
  }
}
```

### Get Submissions Statistics

**File:** `src/api/courses/submissions.ts` (append)

```typescript
/**
 * Get statistics about user's submissions
 *
 * @param params - Query parameters
 * @returns Statistics object
 */
export async function getSubmissionStats(params: {
  userId: string
  lessonId: number
}): Promise<{
  totalAttempts: number
  successfulAttempts: number
  bestScore: number
  averageExecutionTime: number
  firstAttempt: Date | null
  lastAttempt: Date | null
}> {
  const { userId, lessonId } = params

  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'challenge-submissions',
    where: {
      and: [
        { userId: { equals: userId } },
        { lesson: { equals: lessonId } },
      ],
    },
    sort: '-submittedAt',
    limit: 1000, // Get all for stats
  })

  const docs = result.docs

  if (docs.length === 0) {
    return {
      totalAttempts: 0,
      successfulAttempts: 0,
      bestScore: 0,
      averageExecutionTime: 0,
      firstAttempt: null,
      lastAttempt: null,
    }
  }

  const successful = docs.filter((d) => d.status === 'completed')
  const totalTime = docs.reduce((sum, d) => sum + (d.executionTime || 0), 0)

  return {
    totalAttempts: docs.length,
    successfulAttempts: successful.length,
    bestScore: Math.max(...docs.map((d) => d.score)),
    averageExecutionTime: Math.round(totalTime / docs.length),
    firstAttempt: new Date(docs[docs.length - 1].submittedAt),
    lastAttempt: new Date(docs[0].submittedAt),
  }
}
```

## Request/Response Examples

### Get All Submissions

```typescript
const submissions = await getSubmissions({
  userId: 'user-123',
  lessonId: 456,
  limit: 10
})

// Returns:
[
  {
    id: 'sub-1',
    userId: 'user-123',
    lessonId: 456,
    challengeId: 'challenge-abc',
    submittedAt: new Date('2025-01-19T14:32:00Z'),
    status: 'completed',
    score: 4,
    totalTests: 4,
    executionTime: 1450
  },
  {
    id: 'sub-2',
    userId: 'user-123',
    lessonId: 456,
    challengeId: 'challenge-abc',
    submittedAt: new Date('2025-01-19T14:28:00Z'),
    status: 'failed',
    score: 2,
    totalTests: 4,
    executionTime: 890
  }
]
```

### Get Submission Detail

```typescript
const detail = await getSubmissionDetail('sub-1')

// Returns:
{
  id: 'sub-1',
  userId: 'user-123',
  lessonId: 456,
  challengeId: 'challenge-abc',
  submittedAt: new Date('2025-01-19T14:32:00Z'),
  status: 'completed',
  score: 4,
  totalTests: 4,
  executionTime: 1450,
  submittedCode: [
    {
      path: '/main.py',
      content: 'def add(a, b): return a + b'
    }
  ],
  testResults: [
    {
      id: 'test-1',
      name: 'test_addition',
      status: 'passed',
      duration: 45
    }
  ],
  executionOutput: ''
}
```

### Get Best Submission

```typescript
const best = await getBestSubmission({
  userId: 'user-123',
  lessonId: 456
})

// Returns: First successful submission or null
{
  id: 'sub-1',
  userId: 'user-123',
  lessonId: 456,
  challengeId: 'challenge-abc',
  submittedAt: new Date('2025-01-19T14:32:00Z'),
  status: 'completed',
  score: 4,
  totalTests: 4,
  executionTime: 1450
}
```

### Get Statistics

```typescript
const stats = await getSubmissionStats({
  userId: 'user-123',
  lessonId: 456
})

// Returns:
{
  totalAttempts: 5,
  successfulAttempts: 2,
  bestScore: 100,
  averageExecutionTime: 1200,
  firstAttempt: new Date('2025-01-19T14:15:00Z'),
  lastAttempt: new Date('2025-01-19T14:32:00Z')
}
```

## Query Optimization

### Pagination

For large submission histories, use pagination:

```typescript
// Page 1
const page1 = await getSubmissions({
  userId,
  lessonId,
  limit: 20,
  offset: 0
})

// Page 2
const page2 = await getSubmissions({
  userId,
  lessonId,
  limit: 20,
  offset: 20
})
```

### Filtering

You can extend the API to support filtering:

```typescript
export async function getSubmissions(params: {
  userId: string
  lessonId: number
  status?: 'completed' | 'failed' | 'error'
  limit?: number
  offset?: number
}) {
  const where: any = {
    and: [
      { userId: { equals: params.userId } },
      { lesson: { equals: params.lessonId } },
    ],
  }

  // Optional status filter
  if (params.status) {
    where.and.push({ status: { equals: params.status } })
  }

  const result = await payload.find({
    collection: 'challenge-submissions',
    where,
    sort: '-submittedAt',
    limit: params.limit || 20,
    offset: params.offset || 0,
  })

  // ... rest of implementation
}
```

### Caching

Use TanStack Query's caching on the client side (see [useSubmissions hook](../03-frontend-hooks/use-submissions.md)).

For server-side caching, consider adding:

```typescript
import { unstable_cache } from 'next/cache'

export const getCachedSubmissions = unstable_cache(
  async (userId: string, lessonId: number) => {
    return await getSubmissions({ userId, lessonId })
  },
  ['challenge-submissions'],
  { revalidate: 60, tags: ['submissions'] }
)
```

## Security

### User Isolation

Always filter by `userId` to prevent cross-user data access:

```typescript
// ✅ GOOD - Filter by userId
where: {
  and: [
    { userId: { equals: userId } },
    { lesson: { equals: lessonId } }
  ]
}

// ❌ BAD - No user filter
where: {
  lesson: { equals: lessonId }
}
```

### Access Control

The API should check that the requesting user has access to the requested `userId`'s data. This is typically done at the route level:

```typescript
// In a Next.js route handler or server action
import { auth } from '@/lib/auth'

export async function GET_SUBMISSIONS(request: Request) {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  // Only allow users to get their own submissions
  const userId = session.user.id

  return await getSubmissions({ userId, lessonId })
}
```

## Error Handling

```typescript
export async function getSubmissionDetail(submissionId: string): Promise<SubmissionDetail> {
  const payload = await getPayload({ config })

  try {
    const doc = await payload.findByID({
      collection: 'challenge-submissions',
      id: submissionId,
      depth: 2,
    })

    if (!doc) {
      throw new Error('Submission not found')
    }

    // ... transform and return
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      throw new Error(`Submission with ID ${submissionId} not found`)
    }
    throw error
  }
}
```

## Test

### Unit Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { getSubmissions, getSubmissionDetail } from '../submissions'

describe('Submissions API', () => {
  beforeEach(async () => {
    // Setup test data
    const payload = await getPayload({ config })
    await payload.create({
      collection: 'challenge-submissions',
      data: {
        userId: 'test-user',
        lesson: 1,
        challenge: 1,
        submittedCode: [{ path: '/main.py', content: 'test' }],
        testResults: [],
        score: 1,
        totalTests: 1,
        status: 'completed',
      },
    })
  })

  it('should get submissions for user', async () => {
    const submissions = await getSubmissions({
      userId: 'test-user',
      lessonId: 1,
    })

    expect(submissions.length).toBeGreaterThan(0)
    expect(submissions[0].userId).toBe('test-user')
  })

  it('should get submission detail', async () => {
    const submissions = await getSubmissions({
      userId: 'test-user',
      lessonId: 1,
    })

    const detail = await getSubmissionDetail(submissions[0].id)

    expect(detail).toHaveProperty('submittedCode')
    expect(detail).toHaveProperty('testResults')
  })
})
```

### Manual Test

```typescript
// In a Route Handler or Server Action
import { getSubmissions } from '@/api/courses/submissions'
import { auth } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const submissions = await getSubmissions({
    userId,
    lessonId: 1,
  })

  return Response.json(submissions)
}
```

Test with curl:
```bash
curl http://localhost:3000/api/submissions?lessonId=1
```

## Next Steps

- → [Go to useSubmissions Hook](../03-frontend-hooks/use-submissions.md) to use this API from the frontend
- → [Go to Submissions Page](../04-ui-components/submissions-page.md) to implement the UI
- → [Go to useRestore Hook](../03-frontend-hooks/use-restore.md) to implement code restoration
