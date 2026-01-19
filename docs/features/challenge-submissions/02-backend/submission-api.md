# Submission API

## What

Server-side API endpoint that accepts user code, executes it in a sandbox, runs tests, and returns results.

## Why

- **Execute Code**: Run user-submitted Python code safely
- **Run Tests**: Validate code against predefined test cases
- **Store Results**: Save submission attempt for history
- **Provide Feedback**: Give users immediate, detailed feedback

## How

### API Signature

**File:** `src/api/courses/challenges.ts`

```typescript
'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { compileProject } from '@/core/compiler'
import { runTests } from '@/core/testing/test-runner'
import type {
  SubmitChallengeParams,
  SubmissionResult,
  TestResult,
  TestSummary,
} from '@/types/challenges'

/**
 * Submit challenge code for testing
 *
 * @param params - Submission parameters
 * @returns Test results and summary
 */
export async function submitChallenge(
  params: SubmitChallengeParams
): Promise<SubmissionResult> {
  const { userId, lessonId, courseId, challengeId, files, compiler = 'client' } = params

  const payload = await getPayload({ config })

  // Step 1: Fetch challenge with tests
  const challengeQuery = await payload.find({
    collection: 'challenges-exercices',
    where: { id: { equals: challengeId } },
    depth: 0,
  })

  const challenge = challengeQuery.docs[0]
  if (!challenge) {
    throw new Error('Challenge not found')
  }

  // Step 2: Execute user code
  const startTime = Date.now()
  let executionOutput = ''
  let executionError = ''

  try {
    const result = await compileProject(files, 'main.py', compiler)
    executionOutput = `${result.stdout}\n${result.stderr}`
    executionError = result.error || ''
  } catch (error) {
    executionError = error instanceof Error ? error.message : 'Unknown error'
  }

  const executionTime = Date.now() - startTime

  // Step 3: Run tests (only if code executed successfully)
  let testResults: TestResult[] = []

  if (!executionError) {
    try {
      testResults = await runTests({
        userFiles: files,
        tests: challenge.tests,
        compiler,
      })
    } catch (error) {
      // If tests fail to run, mark as error
      testResults = [
        {
          id: 'test-error',
          name: 'Test Execution Error',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown test error',
          duration: 0,
        },
      ]
    }
  } else {
    // Code execution failed, create a single error test result
    testResults = [
      {
        id: 'execution-error',
        name: 'Code Execution',
        status: 'error',
        error: executionError,
        duration: executionTime,
      },
    ]
  }

  // Step 4: Calculate summary
  const summary: TestSummary = {
    total: testResults.length,
    passed: testResults.filter((t) => t.status === 'passed').length,
    failed: testResults.filter((t) => t.status === 'failed' || t.status === 'error').length,
    score: 0,
  }

  summary.score = Math.round((summary.passed / summary.total) * 100)

  // Step 5: Determine overall status
  const allPassed = summary.passed === summary.total && summary.total > 0
  const submissionStatus: 'completed' | 'in_progress' | 'error' = allPassed
    ? 'completed'
    : executionError
    ? 'error'
    : 'in_progress'

  // Step 6: Create submission record
  try {
    await payload.create({
      collection: 'challenge-submissions',
      data: {
        userId,
        lesson: lessonId,
        challenge: challengeId,
        submittedCode: files,
        testResults,
        passed: allPassed,
        score: summary.passed,
        totalTests: summary.total,
        status: submissionStatus,
        executionTime,
        submittedAt: new Date(),
      },
    })

    // Step 7: Update UserProgress if completed
    if (allPassed) {
      const existingProgress = await payload.find({
        collection: 'user-progress',
        where: {
          and: [
            { userId: { equals: userId } },
            { lesson: { equals: lessonId } },
          ],
        },
      })

      if (existingProgress.docs.length > 0) {
        await payload.update({
          collection: 'user-progress',
          id: existingProgress.docs[0].id,
          data: {
            status: 'completed',
            codeSnapshot: files,
          },
        })
      } else {
        await payload.create({
          collection: 'user-progress',
          data: {
            userId,
            lesson: lessonId,
            course: courseId,
            status: 'completed',
            codeSnapshot: files,
          },
        })
      }
    }
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to create submission record:', error)
  }

  // Step 8: Return results
  return {
    success: !executionError && summary.failed === 0,
    status: submissionStatus,
    testResults,
    summary,
    executionOutput,
    executionTime,
  }
}
```

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  1. RECEIVE REQUEST                                          │
│     - userId, lessonId, challengeId                          │
│     - files: ProjectFile[]                                  │
│     - compiler: 'server' | 'client'                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. FETCH CHALLENGE                                          │
│     - Get challenge from Payload                            │
│     - Extract tests array                                   │
│     - Validate challenge exists                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. EXECUTE USER CODE                                        │
│     - Use compileProject()                                  │
│     - E2B (server) or Pyodide (client)                      │
│     - Capture stdout, stderr, error                         │
│     - Measure execution time                                │
└─────────────────────────────────────────────────────────────┘
                           ↓
              Execution Error?
                   ↓         ↓
                 YES         NO
                   ↓         ↓
┌────────────────────┐  ┌────────────────────┐
│  CREATE ERROR      │  │  4. RUN TESTS      │
│  TEST RESULT      │  │  - runTests()      │
│  - status: error  │  │  - Execute each    │
│  - error message  │  │    test            │
└────────────────────┘  │  - Collect results│
                         └────────────────────┘
                                 ↓
┌─────────────────────────────────────────────────────────────┐
│  5. CALCULATE SUMMARY                                         │
│     - total: testResults.length                             │
│     - passed: count of 'passed'                             │
│     - failed: count of 'failed' + 'error'                   │
│     - score: (passed / total) * 100                         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  6. DETERMINE STATUS                                          │
│     - allPassed? → 'completed'                              │
│     - executionError? → 'error'                             │
│     - otherwise → 'in_progress'                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  7. SAVE SUBMISSION                                           │
│     - Create ChallengeSubmissions record                    │
│     - Update UserProgress if completed                      │
│     - Handle errors gracefully                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  8. RETURN RESULTS                                            │
│     - success: boolean                                      │
│     - status: 'completed' | 'in_progress' | 'error'         │
│     - testResults: TestResult[]                             │
│     - summary: TestSummary                                  │
│     - executionOutput: string                               │
│     - executionTime: number                                 │
└─────────────────────────────────────────────────────────────┘
```

## Request/Response Examples

### Request

```typescript
const params: SubmitChallengeParams = {
  userId: 'user-123',
  lessonId: 456,
  courseId: 78,
  challengeId: 'challenge-abc',
  files: [
    {
      path: '/main.py',
      content: `
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
      `
    }
  ],
  compiler: 'server'
}

const result = await submitChallenge(params)
```

### Response (Success)

```json
{
  "success": true,
  "status": "completed",
  "testResults": [
    {
      "id": "test-1",
      "name": "test_addition",
      "status": "passed",
      "output": "2 + 3 = 5",
      "duration": 45
    },
    {
      "id": "test-2",
      "name": "test_multiplication",
      "status": "passed",
      "output": "4 * 5 = 20",
      "duration": 38
    }
  ],
  "summary": {
    "total": 2,
    "passed": 2,
    "failed": 0,
    "score": 100
  },
  "executionOutput": "Test passed: 2 + 3 = 5\nTest passed: 4 * 5 = 20",
  "executionTime": 1450
}
```

### Response (Partial Success)

```json
{
  "success": false,
  "status": "in_progress",
  "testResults": [
    {
      "id": "test-1",
      "name": "test_addition",
      "status": "passed",
      "duration": 45
    },
    {
      "id": "test-2",
      "name": "test_subtraction",
      "status": "failed",
      "error": "AssertionError: Expected 5, got 7",
      "duration": 32
    }
  ],
  "summary": {
    "total": 2,
    "passed": 1,
    "failed": 1,
    "score": 50
  },
  "executionOutput": "Test passed: 2 + 3 = 5\nAssertionError: Expected 5, got 7",
  "executionTime": 890
}
```

### Response (Execution Error)

```json
{
  "success": false,
  "status": "error",
  "testResults": [
    {
      "id": "execution-error",
      "name": "Code Execution",
      "status": "error",
      "error": "SyntaxError: invalid syntax (main.py, line 3)",
      "duration": 125
    }
  ],
  "summary": {
    "total": 1,
    "passed": 0,
    "failed": 1,
    "score": 0
  },
  "executionOutput": "",
  "executionTime": 125
}
```

## Error Handling

The API handles these error scenarios:

1. **Challenge not found**
   ```typescript
   throw new Error('Challenge not found')
   ```

2. **Code execution error**
   - Captured in `executionError`
   - Returned as error test result
   - Doesn't throw, allows user to see the error

3. **Test execution error**
   - Caught and returned as error test result
   - Doesn't prevent saving submission

4. **Database save error**
   - Logged but doesn't fail the request
   - User still gets results

5. **UserProgress update error**
   - Logged but doesn't fail the request
   - Submission is still saved

## Security Considerations

1. **User Isolation**: Always filter by `userId` in database queries
2. **Sandbox**: All code runs in E2B or Pyodide (isolated environment)
3. **Timeout**: Compiler should enforce time limits (configurable)
4. **Resource Limits**: E2B enforces memory/CPU limits
5. **Input Validation**: Validate all parameters before processing

## Dependencies

This API depends on:

- `@/core/compiler` - Code execution (`compileProject`)
- `@/core/testing/test-runner` - Test execution (`runTests`)
- `@/types/challenges` - Type definitions
- `payload` - Database operations

Make sure these are implemented before using this API.

## Test

### Manual Test (with curl)

```bash
curl -X POST http://localhost:3000/api/challenges/submit \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "lessonId": 1,
    "courseId": 1,
    "challengeId": 1,
    "files": [
      {
        "path": "/main.py",
        "content": "print(\"Hello, World!\")"
      }
    ],
    "compiler": "client"
  }'
```

### Test from Code

Create a test file `src/api/courses/__tests__/challenges.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { submitChallenge } from '../challenges'

describe('submitChallenge', () => {
  it('should submit code and return results', async () => {
    const result = await submitChallenge({
      userId: 'test-user',
      lessonId: 1,
      courseId: 1,
      challengeId: 1,
      files: [
        {
          path: '/main.py',
          content: 'print("test")',
        },
      ],
    })

    expect(result).toHaveProperty('testResults')
    expect(result).toHaveProperty('summary')
    expect(result.summary.total).toBeGreaterThan(0)
  })

  it('should handle execution errors gracefully', async () => {
    const result = await submitChallenge({
      userId: 'test-user',
      lessonId: 1,
      courseId: 1,
      challengeId: 1,
      files: [
        {
          path: '/main.py',
          content: 'invalid python syntax!!!',
        },
      ],
    })

    expect(result.status).toBe('error')
    expect(result.testResults[0].status).toBe('error')
  })
})
```

## Next Steps

- → [Go to Test Runner](./test-runner.md) to implement the `runTests` function
- → [Go to History API](./history-api.md) to implement submission retrieval
- → [Go to useSubmitChallenge Hook](../03-frontend-hooks/use-submit-challenge.md) to use this API from the frontend
