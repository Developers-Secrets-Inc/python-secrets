# TypeScript Types

## What

Shared TypeScript type definitions used across the entire challenge submission system.

## Why

- **Type Safety**: Ensure consistency between client and server
- **Auto-completion**: Better IDE experience with IntelliSense
- **Documentation**: Types serve as inline documentation
- **Prevent Errors**: Catch type mismatches at compile time

## How

### Type Definitions File

**File:** `src/types/challenges.ts`

```typescript
// ============================================================================
// CHALLENGE SUBMISSION TYPES
// ============================================================================

/**
 * Result of a single test execution
 */
export interface TestResult {
  id: string
  name: string
  description?: string
  status: 'passed' | 'failed' | 'error'
  output?: string
  error?: string
  duration: number  // Execution time in milliseconds
}

/**
 * Summary of test execution results
 */
export interface TestSummary {
  total: number       // Total number of tests
  passed: number      // Number of passed tests
  failed: number      // Number of failed tests
  score: number       // Percentage (0-100)
}

/**
 * Complete submission result from the API
 */
export interface SubmissionResult {
  success: boolean
  status: 'completed' | 'in_progress' | 'error'
  testResults: TestResult[]
  summary: TestSummary
  executionOutput: string
  executionTime: number  // Total time in milliseconds
}

/**
 * Parameters for submitting a challenge
 */
export interface SubmitChallengeParams {
  userId: string
  lessonId: number
  courseId: number
  challengeId: string | number
  files: ProjectFile[]
  compiler?: 'server' | 'client'
}

/**
 * A single file in the project
 */
export interface ProjectFile {
  path: string       // Full file path (e.g., "/main.py")
  content: string    // File content
}

/**
 * Result from code execution
 */
export interface ExecutionResult {
  stdout: string
  stderr: string
  error?: string
}

/**
 * Compiler type for code execution
 */
export type Compiler = 'server' | 'client'

// ============================================================================
// SUBMISSION HISTORY TYPES
// ============================================================================

/**
 * A submission record from the database
 */
export interface SubmissionHistoryItem {
  id: string
  userId: string
  lessonId: number
  challengeId: string | number
  submittedAt: Date
  status: 'completed' | 'failed' | 'error'
  score: number
  totalTests: number
  executionTime: number
}

/**
 * Detailed submission with full data
 */
export interface SubmissionDetail extends SubmissionHistoryItem {
  submittedCode: ProjectFile[]
  testResults: TestResult[]
  executionOutput: string
}

/**
 * Parameters for fetching submission history
 */
export interface GetSubmissionsParams {
  userId: string
  lessonId: number
  limit?: number
  offset?: number
}

// ============================================================================
// CHALLENGE METADATA TYPES
// ============================================================================

/**
 * Structure of a challenge test
 */
export interface ChallengeTest {
  id: string
  name: string
  description?: string
  testCode: string      // Python test function
  expected: 'passed' | 'failed'
  timeout?: number      // Default 5000ms
  points?: number       // For scoring
  isHidden?: boolean    // Hide from user until submission
}

/**
 * Challenge metadata from ChallengesExercices collection
 */
export interface ChallengeMetadata {
  id: string | number
  title: string
  slug: string
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  fileStructure: Record<string, any>
  tests: ChallengeTest[]
  solution: string
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useSubmitChallenge hook
 */
export interface UseSubmitChallengeReturn {
  submitChallenge: (params: SubmitChallengeParams) => void
  isSubmitting: boolean
  error: Error | null
  data: SubmissionResult | null
  reset: () => void
}

/**
 * Return type for useChallengeSubmissions hook
 */
export interface UseChallengeSubmissionsReturn {
  submissions: SubmissionHistoryItem[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Return type for useRestoreSubmission hook
 */
export interface UseRestoreSubmissionReturn {
  restoreSubmission: (submissionId: string) => void
  isRestoring: boolean
  error: Error | null
}
```

### Barrel Export

**File:** `src/types/index.ts`

```typescript
export * from './challenges'
```

## Type Guards

**File:** `src/types/challenges.ts` (append to existing file)

```typescript
// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if a test result indicates success
 */
export function isTestPassed(result: TestResult): boolean {
  return result.status === 'passed'
}

/**
 * Check if submission was successful
 */
export function isSubmissionSuccessful(result: SubmissionResult): boolean {
  return result.success && result.summary.passed === result.summary.total
}

/**
 * Check if all tests in an array passed
 */
export function areAllTestsPassed(results: TestResult[]): boolean {
  return results.length > 0 && results.every(isTestPassed)
}

/**
 * Get failed tests from results
 */
export function getFailedTests(results: TestResult[]): TestResult[] {
  return results.filter(r => r.status === 'failed' || r.status === 'error')
}

/**
 * Format test duration for display
 */
export function formatTestDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
```

## Utility Types

**File:** `src/types/challenges.ts` (append to existing file)

```typescript
// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract file paths from ProjectFile array
 */
export type FilePath = ProjectFile['path']

/**
 * File extension from path
 */
export type FileExtension = '.py' | '.txt' | '.md' | '.json'

/**
 * Test status union type
 */
export type TestStatus = TestResult['status']

/**
 * Submission status union type
 */
export type SubmissionStatus = SubmissionHistoryItem['status']

/**
 * Compiler type union
 */
export type CompilerType = Compiler
```

## Usage Examples

### In API Functions

```typescript
import { SubmitChallengeParams, SubmissionResult } from '@/types/challenges'

export async function submitChallenge(
  params: SubmitChallengeParams
): Promise<SubmissionResult> {
  // Implementation
  // TypeScript will validate params structure
  // Return type is guaranteed
}
```

### In React Components

```typescript
import { TestResult, isTestPassed } from '@/types/challenges'

interface TestCardProps {
  result: TestResult
}

export function TestCard({ result }: TestCardProps) {
  const passed = isTestPassed(result)

  return (
    <div className={passed ? 'text-green-500' : 'text-red-500'}>
      {result.name}: {result.status}
    </div>
  )
}
```

### In Hooks

```typescript
import { UseSubmitChallengeReturn, SubmitChallengeParams } from '@/types/challenges'

export function useSubmitChallenge(): UseSubmitChallengeReturn {
  // Hook implementation
  // Return type is validated
}
```

## Integration with Payload Types

The Payload CMS generates types automatically. Extend them for use in the app:

**File:** `src/types/payload-extensions.ts` (optional, for convenience)

```typescript
import type { ChallengeSubmissions } from '@/payload-types'

/**
 * Enhanced submission type with computed properties
 */
export type EnhancedSubmission = ChallengeSubmissions & {
  passedTests: number
  failedTests: number
  passRate: number
}

/**
 * Convert Payload submission to our domain type
 */
export function toSubmissionDetail(
  payloadSubmission: ChallengeSubmissions
): SubmissionDetail {
  return {
    id: payloadSubmission.id,
    userId: payloadSubmission.userId,
    lessonId: typeof payloadSubmission.lesson === 'object'
      ? payloadSubmission.lesson.id
      : payloadSubmission.lesson,
    challengeId: typeof payloadSubmission.challenge === 'object'
      ? payloadSubmission.challenge.id
      : payloadSubmission.challenge,
    submittedAt: new Date(payloadSubmission.submittedAt),
    status: payloadSubmission.status as SubmissionHistoryItem['status'],
    score: payloadSubmission.score,
    totalTests: payloadSubmission.totalTests,
    executionTime: payloadSubmission.executionTime || 0,
    submittedCode: payloadSubmission.submittedCode as ProjectFile[],
    testResults: payloadSubmission.testResults as TestResult[],
    executionOutput: '',
  }
}
```

## Test

1. **Check imports work:**
   ```typescript
   import { TestResult, SubmissionResult } from '@/types/challenges'

   const result: TestResult = {
     id: '1',
     name: 'test',
     status: 'passed',
     duration: 100
   }
   // TypeScript should accept this
   ```

2. **Test type guards:**
   ```typescript
   import { isTestPassed, areAllTestsPassed } from '@/types/challenges'

   isTestPassed(result) // false
   areAllTestsPassed([result]) // true
   ```

3. **Verify exports:**
   ```bash
   # Check that types are exported
   grep -r "export.*from.*challenges" src/types/
   ```

## Next Steps

- → [Go to Setup](./setup.md) to configure the project
- → [Go to Submission API](../../02-backend/submission-api.md) to use these types
