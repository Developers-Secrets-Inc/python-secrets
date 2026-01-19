# Database Schema: ChallengeSubmissions

## What

A new Payload CMS collection to store all challenge submission attempts, enabling users to review their history and restore previous code.

## Why

- **Track Progress**: Keep a complete history of all submission attempts
- **Enable Restore**: Allow users to restore previous code versions
- **Analytics**: Analyze user learning patterns and success rates
- **Debugging**: Review failed attempts to understand mistakes

## How

### Collection Configuration

**File:** `src/collections/ChallengeSubmissions.ts`

```typescript
import { CollectionConfig } from 'payload'

export const ChallengeSubmissions: CollectionConfig = {
  slug: 'challenge-submissions',
  admin: {
    useAsTitle: 'submittedAt',
    group: 'Learning Data',
    defaultColumns: ['submittedAt', 'status', 'score', 'totalTests'],
  },
  indexes: [
    {
      fields: ['userId', 'lesson'],
      unique: false,
    },
    {
      fields: ['userId'],
      unique: false,
    },
    {
      fields: ['lesson'],
      unique: false,
    },
  ],
  fields: [
    // User identification
    {
      name: 'userId',
      type: 'text',
      required: true,
      admin: {
        description: 'External user identifier from the authentication provider',
      },
    },

    // Relationships
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
      admin: {
        description: 'The lesson this submission belongs to',
      },
    },
    {
      name: 'challenge',
      type: 'relationship',
      relationTo: 'challenges-exercices',
      required: true,
      admin: {
        description: 'The challenge being attempted',
      },
    },

    // Submission data
    {
      name: 'submittedCode',
      type: 'json',
      required: true,
      admin: {
        description: 'Snapshot of all files in the IDE at submission time',
      },
    },
    {
      name: 'testResults',
      type: 'json',
      required: true,
      admin: {
        description: 'Detailed test results with pass/fail status for each test',
      },
    },

    // Results
    {
      name: 'passed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether all tests passed',
      },
    },
    {
      name: 'score',
      type: 'number',
      required: true,
      admin: {
        description: 'Number of tests passed',
      },
    },
    {
      name: 'totalTests',
      type: 'number',
      required: true,
      admin: {
        description: 'Total number of tests',
      },
    },

    // Status & Metadata
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Error', value: 'error' },
      ],
      admin: {
        description: 'Overall submission status',
      },
    },
    {
      name: 'executionTime',
      type: 'number',
      admin: {
        description: 'Execution time in milliseconds',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          displayFormat: 'MMM d, yyyy HH:mm',
        },
      },
    },
  ],
}
```

### Register the Collection

**File:** `src/payload.config.ts`

```typescript
import { ChallengeSubmissions } from '@/collections/ChallengeSubmissions'

export default buildConfig({
  // ... existing config
  collections: [
    // ... existing collections
    ChallengeSubmissions,  // Add this line
  ],
})
```

**File:** `src/collections/index.ts`

```typescript
export * from './ChallengeSubmissions'  // Add this line
```

### Export from Collections Barrel

**File:** `src/collections/index.ts`

```typescript
export * from './Media'
export * from './Admins'
export * from './Courses'
export * from './Articles'
export * from './Blog'
export * from './TutorialArticle'
export * from './Tutorials'
export * from './Lessons'
export * from './UserProgress'
export * from './Quizzes'
export * from './ChallengesExercices'
export * from './LessonEngagement'
export * from './ChallengeSubmissions'  // Add this line
```

### Update Payload Types

After adding the collection, regenerate the TypeScript types:

```bash
npm run generate:types
# or if using Payload's default
pnpm payload generate:types
```

This will update `src/payload-types.ts` with the new `ChallengeSubmission` type.

## Data Structure Examples

### submittedCode (JSON)

```json
[
  {
    "path": "/main.py",
    "content": "def add(a, b):\n    return a + b\n\ndef multiply(a, b):\n    return a * b"
  },
  {
    "path": "/utils.py",
    "content": "# Utility functions\nimport math\n\ndef square(x):\n    return x ** 2"
  }
]
```

### testResults (JSON)

```json
[
  {
    "id": "test-1",
    "name": "test_addition",
    "status": "passed",
    "output": "Test passed: 2 + 3 = 5",
    "duration": 45
  },
  {
    "id": "test-2",
    "name": "test_subtraction",
    "status": "failed",
    "error": "AssertionError: Expected 5, got 7",
    "duration": 32
  }
]
```

## Database Relationships

```
ChallengeSubmissions
    ├─ userId → text (external auth)
    ├─ lesson → Lessons (many-to-one)
    │   └─ course → Courses (many-to-one)
    └─ challenge → ChallengesExercices (many-to-one)
        └─ tests (JSON)
        └─ fileStructure (JSON)
```

## Indexes

The collection has three indexes for performance:

1. **Composite Index**: `[userId, lesson]` - Fast lookup of user's submissions for a specific lesson
2. **Single Index**: `[userId]` - Get all submissions across all lessons
3. **Single Index**: `[lesson]` - Get all submissions for a lesson (analytics)

## Security Considerations

- **User Isolation**: All queries must filter by `userId` to prevent cross-user data access
- **No Direct Access**: Users interact through API endpoints, never directly with the collection
- **Read-Only for Users**: Users can only read their own submissions, not modify them

## Test

After implementing:

1. **Verify collection is registered:**
   ```bash
   # Start Payload admin
   npm run dev

   # Go to http://localhost:3000/admin
   # Check that "Challenge Submissions" appears in the sidebar
   ```

2. **Create a test submission via admin:**
   - Go to Admin → Challenge Submissions
   - Create new submission
   - Fill in required fields
   - Save and verify it persists

3. **Query via API:**
   ```typescript
   const payload = await getPayload({ config })

   const submissions = await payload.find({
     collection: 'challenge-submissions',
     where: {
       userId: { equals: 'test-user-123' }
     }
   })

   console.log(submissions.docs) // Should return array of submissions
   ```

4. **Check types:**
   ```typescript
   import type { ChallengeSubmission } from '@/payload-types'

   const submission: ChallengeSubmission = {
     // TypeScript should autocomplete all fields
   }
   ```

## Next Steps

Once the collection is set up:
- → [Go to Submission API](../../02-backend/submission-api.md) to implement the endpoint that creates submissions
- → [Go to History API](../../02-backend/history-api.md) to implement retrieval endpoints
