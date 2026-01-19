# Code Submission System for Challenges

## Overview

This feature allows users to submit their Python code solutions for coding challenges and get automated feedback through unit tests. The system executes user code in a secure sandbox, runs predefined tests, and provides detailed feedback on test results.

## Current Architecture

### Existing Components

- **ChallengesExercices Collection**: Stores challenge data including file structure, tests, and solutions
- **Compiler System**: Two execution engines (E2B server-side, Pyodide client-side)
- **IDE Component**: Full-featured code editor with file system and console
- **UserProgress Collection**: Tracks user progress and stores code snapshots
- **Quiz System**: Reference implementation for submission/grading workflows

### Key Files

- `src/collections/ChallengesExercices.ts` - Challenge data model
- `src/core/compiler/` - Code execution engines
- `src/core/ide/` - IDE components and state management
- `src/api/courses/quizzes.ts` - Reference submission pattern
- `src/api/courses/index.ts` - Progress tracking functions

---

## Detailed Workflow Implementation

### User Journey Overview

The submission flow follows this path:

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHALLENGE IDE COMPONENT                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     IDE MONACO                              │ │
│  │  (User edits code)                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CONSOLE WITH TABS                                         │ │
│  │  ┌──────────────┬──────────────┐                          │ │
│  │  │  TERMINAL    │   TESTS      │  ← Active tab switches   │ │
│  │  ├──────────────┼──────────────┤                          │ │
│  │  │ $ ls         │ [Submit]     │  ← Submit button         │ │
│  │  │ main.py      │              │                          │ │
│  │  │              │ Running...   │  ← Status indicator      │ │
│  │  └──────────────┴──────────────┘                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User clicks [Submit]
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE                                  │
│  1. Get files from IDE store                                    │
│  2. Call API: submitChallenge()                                 │
│  3. Set isSubmitting = true                                     │
│  4. Show "Running tests..." in Tests tab                       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ API Call
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER SIDE API                              │
│  submitChallenge()                                              │
│  1. Fetch challenge with tests                                  │
│  2. Execute user code via compileProject()                      │
│  3. Run test suite                                              │
│  4. Create ChallengeSubmission record                           │
│  5. Update UserProgress (if completed)                          │
│  6. Return results                                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ Return TestResult[]
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (update)                         │
│  1. Set isSubmitting = false                                    │
│  2. Set testResults = results                                   │
│  3. Show results in Tests tab:                                  │
│     ✓ ✓ ✗ ✓ (3/4 passed)                                       │
│     ┌────────────────────────────────┐                         │
│     │ ✓ test_addition              │                         │
│     │ ✗ test_subtraction           │                         │
│     │   Expected: 5, Got: 7         │                         │
│     └────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ User navigates to /submissions
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUBMISSIONS PAGE                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Submission History                                       │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ ✓ Today 14:32 - 3/4 tests passed        [View]     │ │  │
│  │  │ ✗ Today 14:28 - 1/4 tests passed        [View]     │ │  │
│  │  │ ✗ Today 14:15 - 0/4 tests passed        [View]     │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │  [Click View → Show details + restore code option]       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Step-by-Step Implementation

#### Step 1: Submit Button in IDE

**Location**: `src/core/ide/components/console.tsx` (extend existing Console component)

**Current state**: Console has terminal functionality with collapsible panel

**Proposed enhancement**: Add tab system to Console with:
- Tab 1: "Terminal" (existing functionality)
- Tab 2: "Tests" (new submission/results view)

**UI Changes**:
```tsx
<Console>
  <ConsoleHeader>
    <TabGroup>
      <Tab value="terminal">Terminal</Tab>
      <Tab value="tests">Tests</Tab>
    </TabGroup>
    <SubmitButton>Submit Code</SubmitButton>
  </ConsoleHeader>

  <TabContent value="terminal">
    {/* Existing terminal */}
  </TabContent>

  <TabContent value="tests">
    <TestsPanel />
  </TabContent>
</Console>
```

**When user clicks Submit**:
1. Switch to "Tests" tab if not already active
2. Show loading state: "Running tests..."
3. Get current files from IDE store
4. Call submission API
5. Display results when received

---

#### Step 2: Footer with Test Results Tab

**Architecture Decision**: Extend existing Console component (Option A)

**Rationale**:
- ✅ Reuses existing collapsible panel infrastructure
- ✅ Console and tests are both "output" views
- ✅ Consistent with current IDE layout
- ✅ Less disruptive to existing code
- ❌ Alternative (new separate panel) would reduce editor space

**Implementation**:

```typescript
// src/core/ide/components/console.tsx

interface ConsoleProps {
  isCollapsed: boolean
  onToggle: () => void
  challengeData?: any  // NEW: Receive challenge metadata
}

export const Console = ({ isCollapsed, onToggle, challengeData }: ConsoleProps) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'tests'>('terminal')
  const { testResults, isSubmitting } = useIDEStore()

  // Auto-switch to tests tab when submitting
  const handleSubmit = async () => {
    setActiveTab('tests')
    // Trigger submission...
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="h-10 border-b flex items-center justify-between px-4">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('terminal')}>Terminal</button>
          <button onClick={() => setActiveTab('tests')}>Tests</button>
        </div>
        {activeTab === 'tests' && (
          <SubmitButton onSubmit={handleSubmit} />
        )}
      </div>

      {/* Content */}
      {activeTab === 'terminal' && <TerminalContent />}
      {activeTab === 'tests' && <TestsContent challengeData={challengeData} />}
    </div>
  )
}
```

---

#### Step 3: Test Results Display

**New Component**: `src/core/ide/components/test-results.tsx`

**Features**:
1. **Loading State**: Spinner + "Running tests..." message
2. **Summary Card**: Large score display (e.g., "3/4 tests passed")
3. **Test List**: Individual test cards with expandable details
4. **Visual Indicators**:
   - ✓ Green for passed tests
   - ✗ Red for failed tests
   - ⚠ Amber for errors
5. **Error Details**: Show expected vs actual for failed tests
6. **Execution Time**: Display how long tests took

```tsx
<TestsPanel>
  {/* Summary */}
  <TestSummary score={3} total={4} status="partial" />

  {/* Individual tests */}
  <TestList>
    <TestCard status="passed" name="test_addition" duration={45ms} />
    <TestCard status="failed" name="test_subtraction" duration={12ms}>
      <ErrorDetails>
        <div>Expected: 5</div>
        <div>Got: 7</div>
      </ErrorDetails>
    </TestCard>
  </TestList>
</TestsPanel>
```

**Success State**:
- If all tests pass: Confetti animation! 🎉
- Show "Challenge Completed!" message
- Enable "Next Lesson" button

---

#### Step 4: Database Submission Record

**New Collection**: `src/collections/ChallengeSubmissions.ts`

```typescript
import { CollectionConfig } from 'payload'

export const ChallengeSubmissions: CollectionConfig = {
  slug: 'challenge-submissions',
  admin: {
    useAsTitle: 'submittedAt',
    group: 'Learning Data',
  },
  indexes: [
    {
      fields: ['userId', 'lesson'],
      unique: false,
    },
  ],
  fields: [
    {
      name: 'userId',
      type: 'text',
      required: true,
    },
    {
      name: 'lesson',
      type: 'relationship',
      relationTo: 'lessons',
      required: true,
    },
    {
      name: 'challenge',
      type: 'relationship',
      relationTo: 'challenges-exercices',
      required: true,
    },
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
        description: 'Detailed test results with pass/fail status',
      },
    },
    {
      name: 'passed',
      type: 'checkbox',
      defaultValue: false,
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
    },
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
      },
    },
  ],
}
```

**Integration with UserProgress**:
- `UserProgress.codeSnapshot` continues to store latest work (auto-save)
- `ChallengeSubmissions` stores complete submission history
- Allows users to review all attempts and restore old code

---

#### Step 5: Submissions History Page

**Route**: `src/app/(frontend)/(protected)/courses/[course_slug]/[chapter_slug]/[part_slug]/submissions/page.tsx`

**Current state**: Static page with placeholder data

**Required Changes**:

1. **API Endpoint** (`src/api/courses/submissions.ts`):
```typescript
interface GetSubmissionsParams {
  userId: string
  lessonId: number
}

interface SubmissionHistoryItem {
  id: string
  submittedAt: Date
  status: 'completed' | 'failed' | 'error'
  score: number
  totalTests: number
  executionTime: number
}

export async function getSubmissions({ userId, lessonId }: GetSubmissionsParams) {
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
    limit: 20,
  })

  return result.docs
}

export async function getSubmissionDetail(submissionId: string) {
  const payload = await getPayload({ config })

  return await payload.findByID({
    collection: 'challenge-submissions',
    id: submissionId,
  })
}
```

2. **Page Component**:
```tsx
// src/app/(frontend)/(protected)/courses/.../submissions/page.tsx

export default async function SubmissionsPage({ params }) {
  const session = await auth()
  const { lesson } = await getLesson(params)
  const submissions = await getSubmissions({
    userId: session.user.id,
    lessonId: lesson.id,
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header - already exists */}
      <header>
        {/* Tabs: Description, Solution, Submissions */}
      </header>

      {/* Submissions List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h2>Submission History</h2>

        {submissions.length === 0 ? (
          <p>No submissions yet. Try the challenge!</p>
        ) : (
          <SubmissionTimeline>
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id}>
                <SubmissionHeader>
                  <StatusBadge status={submission.status} />
                  <span>{formatDate(submission.submittedAt)}</span>
                  <span>{submission.score}/{submission.totalTests} tests</span>
                </SubmissionHeader>

                <SubmissionActions>
                  <Button onClick={() => viewDetails(submission.id)}>
                    View Details
                  </Button>
                  <Button onClick={() => restoreCode(submission.id)}>
                    Restore Code
                  </Button>
                </SubmissionActions>
              </SubmissionCard>
            ))}
          </SubmissionTimeline>
        )}
      </div>
    </div>
  )
}
```

3. **Restore Code Feature**:
```typescript
// When user clicks "Restore Code"
async function restoreCode(submissionId: string) {
  const submission = await getSubmissionDetail(submissionId)

  // Update IDE store with restored files
  useIDEStore.getState().loadFiles(submission.submittedCode)

  // Switch to code tab
  router.push('./ide')
}
```

**UI Layout**:
```
┌────────────────────────────────────────────────────────────┐
│  Submission History                                    [  ]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✓ Today 14:32                    3/4 tests passed     │ │
│  │    Completed in 1.2s                                │ │
│  │    [View Details] [Restore Code]                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✗ Today 14:28                    1/4 tests passed     │ │
│  │    Failed in 0.8s                                   │ │
│  │    [View Details] [Restore Code]                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ✗ Today 14:15                    0/4 tests passed     │ │
│  │    Error in 0.3s                                    │ │
│  │    [View Details] [Restore Code]                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### Client-Side Architecture with TanStack Query

#### Design Principle

**Two public entry points ONLY**:
1. `useSubmitChallenge` - Submit code for testing
2. `useChallengeSubmissions` - Fetch submission history

All internal logic (API calls, state management, error handling) is **encapsulated** in these hooks. Components only consume the hooks and don't access internal logic directly.

#### Hook 1: `useSubmitChallenge`

**File**: `src/hooks/api/challenges/use-submit-challenge.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { submitChallenge as submitChallengeAPI } from '@/api/courses/challenges'
import { useIDEStore } from '@/core/ide/stores/use-ide-store'
import { toast } from 'sonner' // or your toast library

interface SubmitChallengeParams {
  userId: string
  lessonId: number
  courseId: number
  challengeId: string
}

interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'error'
  output?: string
  error?: string
  duration: number
}

interface SubmissionResult {
  success: boolean
  testResults: TestResult[]
  summary: {
    total: number
    passed: number
    failed: number
    score: number
  }
  executionOutput: string
}

export function useSubmitChallenge() {
  const queryClient = useQueryClient()
  const files = useIDEStore((state) => state.files)
  const setConsoleTab = useIDEStore((state) => state.setConsoleTab)

  const mutation = useMutation({
    mutationFn: async (params: SubmitChallengeParams): Promise<SubmissionResult> => {
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
    onSuccess: (data) => {
      // Invalidate submissions query to refresh history
      queryClient.invalidateQueries({
        queryKey: ['challenge-submissions', data.lessonId],
      })

      // Show success notification
      if (data.summary.passed === data.summary.total) {
        toast.success(`🎉 Challenge completed! ${data.summary.passed}/${data.summary.total} tests passed`)
        triggerConfetti()
      } else {
        toast.info(`Tests: ${data.summary.passed}/${data.summary.total} passed`)
      }
    },
    onError: (error: Error) => {
      toast.error(`Submission failed: ${error.message}`)
    },
  })

  return {
    submitChallenge: mutation.mutate,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  }
}

// Helper function to convert IDE files to ProjectFile format
function convertFilesToProjectFormat(files: FileNode[]): ProjectFile[] {
  return files
    .filter(f => f.type === 'file')
    .map(f => ({
      path: f.id, // or build full path from parent hierarchy
      content: f.content || '',
    }))
}
```

**Usage in Console Component**:

```tsx
// src/core/ide/components/console.tsx
import { useSubmitChallenge } from '@/hooks/api/challenges/use-submit-challenge'

export const Console = ({ isCollapsed, onToggle, challengeData }: ConsoleProps) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'tests'>('terminal')
  const { submitChallenge, isSubmitting, data: testResults } = useSubmitChallenge()

  const handleSubmit = () => {
    if (!challengeData) {
      toast.error('No challenge loaded')
      return
    }

    submitChallenge({
      userId: 'current-user-id',
      lessonId: challengeData.lessonId,
      courseId: challengeData.courseId,
      challengeId: challengeData.id,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="h-10 border-b flex items-center justify-between px-4">
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('terminal')}>Terminal</button>
          <button onClick={() => setActiveTab('tests')}>Tests</button>
        </div>
        {activeTab === 'tests' && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-1.5 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
          >
            {isSubmitting ? 'Running...' : 'Submit Code'}
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'terminal' && <TerminalContent />}
      {activeTab === 'tests' && (
        <TestsContent
          isSubmitting={isSubmitting}
          testResults={testResults?.testResults}
          summary={testResults?.summary}
        />
      )}
    </div>
  )
}
```

---

#### Hook 2: `useChallengeSubmissions`

**File**: `src/hooks/api/challenges/use-challenge-submissions.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { getSubmissions, getSubmissionDetail } from '@/api/courses/submissions'

interface SubmissionHistoryItem {
  id: string
  submittedAt: Date
  status: 'completed' | 'failed' | 'error'
  score: number
  totalTests: number
  executionTime: number
  testResults: any[]
  submittedCode: any[]
}

interface UseChallengeSubmissionsParams {
  userId: string
  lessonId: number
  enabled?: boolean
}

export function useChallengeSubmissions({
  userId,
  lessonId,
  enabled = true,
}: UseChallengeSubmissionsParams) {
  const query = useQuery({
    queryKey: ['challenge-submissions', lessonId],
    queryFn: () => getSubmissions({ userId, lessonId }),
    enabled,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  })

  return {
    submissions: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}

// Hook for fetching a single submission detail
interface UseSubmissionDetailParams {
  submissionId: string
  enabled?: boolean
}

export function useSubmissionDetail({
  submissionId,
  enabled = true,
}: UseSubmissionDetailParams) {
  const query = useQuery({
    queryKey: ['challenge-submission', submissionId],
    queryFn: () => getSubmissionDetail(submissionId),
    enabled,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  })

  return {
    submission: query.data,
    isLoading: query.isLoading,
    error: query.error,
  }
}
```

**Usage in Submissions Page**:

```tsx
// src/app/(frontend)/(protected)/courses/.../submissions/page.tsx
import { useChallengeSubmissions } from '@/hooks/api/challenges/use-challenge-submissions'

export default function SubmissionsPage({ params }) {
  const session = await auth()
  const { lesson } = await getLesson(params)

  // Client component for data fetching
  return (
    <SubmissionsContent
      userId={session.user.id}
      lessonId={lesson.id}
    />
  )
}

function SubmissionsContent({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading, error } = useChallengeSubmissions({
    userId,
    lessonId,
  })

  if (isLoading) {
    return <div>Loading submissions...</div>
  }

  if (error) {
    return <div>Error loading submissions</div>
  }

  return (
    <div className="flex flex-col h-full">
      <header>
        {/* Tabs: Description, Solution, Submissions */}
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <h2>Submission History</h2>

        {submissions.length === 0 ? (
          <p className="text-muted-foreground">No submissions yet. Try the challenge!</p>
        ) : (
          <SubmissionTimeline>
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </SubmissionTimeline>
        )}
      </div>
    </div>
  )
}
```

---

#### Hook 3: `useRestoreSubmission` (Optional)

**File**: `src/hooks/api/challenges/use-restore-submission.ts`

```typescript
import { useMutation } from '@tanstack/react-query'
import { getSubmissionDetail } from '@/api/courses/submissions'
import { useIDEStore } from '@/core/ide/stores/use-ide-store'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function useRestoreSubmission() {
  const loadFiles = useIDEStore((state) => state.loadFiles)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: getSubmissionDetail,
    onSuccess: (submission) => {
      // Restore files to IDE
      loadFiles(submission.submittedCode)

      toast.success('Code restored successfully')

      // Switch back to IDE tab
      router.push('./')
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore: ${error.message}`)
    },
  })

  return {
    restoreSubmission: mutation.mutate,
    isRestoring: mutation.isPending,
  }
}
```

---

#### Updated IDE Store (Minimal Changes)

**File**: `src/core/ide/stores/use-ide-store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFileSlice, FileSlice } from './file-slice'
import { createTabSlice, TabSlice } from './tab-slice'
import { createTerminalSlice, TerminalSlice } from './terminal-slice'

// Add console tab state ONLY (no submission logic)
interface ConsoleSlice {
  activeConsoleTab: 'terminal' | 'tests'
  setConsoleTab: (tab: 'terminal' | 'tests') => void
}

const createConsoleSlice: StateCreator<IDEState, [], [], ConsoleSlice> = (set) => ({
  activeConsoleTab: 'terminal',
  setConsoleTab: (tab) => set({ activeConsoleTab: tab }),
})

export type IDEState = FileSlice & TabSlice & TerminalSlice & ConsoleSlice

export const useIDEStore = create<IDEState>()(
  persist(
    (...a) => ({
      ...createFileSlice(...a),
      ...createTabSlice(...a),
      ...createTerminalSlice(...a),
      ...createConsoleSlice(...a),
    }),
    {
      name: 'ide-storage',
      partialize: (state) => ({
        files: state.files,
        activeFileId: state.activeFileId,
        openTabIds: state.openTabIds,
        activeConsoleTab: state.activeConsoleTab,
      }),
    }
  )
)

// Helper to load files (for restore functionality)
export const loadFiles = (files: ProjectFile[]) => {
  // Implementation to load files into store
}
```

---

### Integration Points

#### 1. Challenge IDE Component

**File**: `src/components/courses/lessons/challenge-ide.tsx`

```tsx
import { IDE } from '@/core/ide/components'
import { useEffect } from 'react'

interface ChallengeIDEProps {
  data: any  // ChallengesExercice collection data
  userId: string
  lessonId: number
  courseId: number
}

export function ChallengeIDE({ data, userId, lessonId, courseId }: ChallengeIDEProps) {
  useEffect(() => {
    // Load initial file structure from challenge
    if (data?.fileStructure) {
      // Load files into IDE store
      loadChallengeStructure(data.fileStructure)
    }
  }, [data])

  return (
    <div className="h-full">
      <IDE challengeData={data} />
    </div>
  )
}
```

**Key Changes**:
- ❌ Removed `setChallengeMetadata` from store
- ✅ Pass challenge data directly to IDE component
- ✅ Hooks handle all submission logic

#### 2. IDE Component with Challenge Data

**File**: `src/core/ide/components/index.tsx`

```tsx
export const IDE = ({ challengeData }: { challengeData?: any }) => {
  // Pass challengeData to Console component
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        <ResizablePanel ref={fileSystemPanelRef} defaultSize={20} minSize={15}>
          <FileSystem />
        </ResizablePanel>

        {!isFsCollapsed && <ResizableHandle />}

        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} minSize={30}>
              <Editor />
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel ref={consolePanelRef} defaultSize={30} minSize={10}>
              <Console challengeData={challengeData} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
```

#### 3. No Changes Needed

These components already work correctly and don't need modifications:
- ✅ `src/components/courses/lessons/lesson-exercise-panel.tsx`
- ✅ `src/app/(frontend)/(protected)/courses/[course_slug]/[chapter_slug]/[part_slug]/layout.tsx`

---

## Implementation Plan

### Phase 1: Test System Infrastructure

#### 1.1 Define Test Structure Schema

Create a standardized JSON structure for challenge tests:

```typescript
interface ChallengeTest {
  id: string
  name: string
  description: string
  testCode: string        // Python test function
  expected: 'passed' | 'failed'
  timeout?: number        // Default 5000ms
  points?: number         // For scoring
  isHidden?: boolean      // Hide from user until submission
}
```

**File**: `src/core/testing/types.ts`

#### 1.2 Create Test Runner Service

Implement a service to execute tests against user code:

```typescript
interface TestRunnerResult {
  testName: string
  status: 'passed' | 'failed' | 'error'
  output: string
  error?: string
  duration: number
}

async function runTests(
  userFiles: ProjectFile[],
  tests: ChallengeTest[],
  entryPoint: string,
  compiler: Compiler
): Promise<TestRunnerResult[]>
```

**Key Features**:
- Inject test code into user project
- Execute using existing compiler system
- Capture test results with pytest/unittest
- Handle timeouts gracefully
- Return structured test results

**File**: `src/core/testing/test-runner.ts`

---

### Phase 2: API Layer

#### 2.1 Create Challenge Submission API

Implement the main submission endpoint:

```typescript
interface SubmitChallengeParams {
  userId: string
  lessonId: number
  courseId: number
  challengeId: number
  files: ProjectFile[]
  compiler?: 'server' | 'client'
}

interface ChallengeSubmissionResult {
  success: boolean
  status: 'completed' | 'in_progress'
  testResults: TestRunnerResult[]
  summary: {
    total: number
    passed: number
    failed: number
    score: number
  }
  executionOutput: string
}
```

**Workflow**:
1. Fetch challenge with tests by ID
2. Execute user code with test suite
3. Process and format test results
4. Update UserProgress (status + codeSnapshot)
5. Return formatted results

**File**: `src/api/courses/challenges.ts`

#### 2.2 Create Challenge History API (Optional)

For tracking submission attempts:

```typescript
// New collection: ChallengeSubmissions
interface ChallengeSubmission {
  userId: string
  lesson: relationship
  challenge: relationship
  submittedCode: json
  testResults: json
  passed: boolean
  score: number
  submittedAt: date
  attemptNumber: number
}
```

**Files**:
- `src/collections/ChallengeSubmissions.ts`
- `src/api/courses/submissions.ts`

#### 2.3 Save/Restore Code API

Add endpoints for auto-saving work:

```typescript
// Save current IDE state
interface SaveCodeParams {
  userId: string
  lessonId: number
  files: ProjectFile[]
}

// Restore previous work
interface LoadCodeParams {
  userId: string
  lessonId: number
}
```

**File**: `src/api/courses/code-state.ts`

---

### Phase 3: Frontend Components

#### 3.1 Challenge Submission UI

Create a submission panel component:

**Component**: `ChallengeSubmissionPanel`

**Features**:
- Submit button with loading state
- Real-time test results display
- Progress indicator (X/Y tests passed)
- Test output expansion
- Success/failure visual feedback
- "View Solution" button (when authorized)

**File**: `src/components/courses/lessons/challenge-submission-panel.tsx`

#### 3.2 Update Challenge IDE

Enhance existing IDE component:

**Enhancements to** `ChallengeIDE`:
- Load challenge file structure on mount
- Set up locked files (non-editable)
- Auto-save user code changes
- Display test requirements sidebar
- Show submission history
- Integration with submission panel

**File**: `src/components/courses/lessons/challenge-ide.tsx`

#### 3.3 Test Results Display

Create test results viewer:

**Component**: `TestResultsViewer`

**Features**:
- Summary card (passed/failed/score)
- Individual test cards with expandable details
- Syntax-highlighted test output
- Error messages with context
- Performance metrics (execution time)

**File**: `src/components/courses/lessons/test-results-viewer.tsx`

#### 3.4 Challenge Requirements Sidebar

Display challenge information:

**Component**: `ChallengeRequirementsSidebar`

**Content**:
- Challenge title and description
- Test requirements (public tests only)
- File structure overview
- Hints and constraints
- Difficulty badge
- Estimated completion time

**File**: `src/components/courses/lessons/challenge-requirements.tsx`

---

### Phase 4: State Management

#### 4.1 Extend IDE Store

Add challenge-specific state:

```typescript
interface ChallengeSlice {
  // Challenge metadata
  challengeId: string | null
  entryPoint: string
  lockedFiles: Set<string>

  // Test state
  testResults: TestRunnerResult[] | null
  isSubmitting: boolean
  lastSubmissionTime: number | null

  // Actions
  loadChallenge: (challenge: ChallengeExercice) => void
  setTestResults: (results: TestRunnerResult[]) => void
  clearChallenge: () => void
}
```

**File**: `src/core/ide/stores/challenge-slice.ts`

#### 4.2 Submission History Store

Track submission attempts:

```typescript
interface SubmissionHistoryState {
  submissions: SubmissionAttempt[]
  currentAttempt: number
  bestScore: number

  addSubmission: (attempt: SubmissionAttempt) => void
  getBestAttempt: () => SubmissionAttempt | null
  clearHistory: () => void
}
```

**File**: `src/core/ide/stores/submission-slice.ts`

---

### Phase 5: User Experience Enhancements

#### 5.1 Auto-Save System

Implement automatic code saving:

- Save to UserProgress.codeSnapshot on change
- Debounce saves (every 30 seconds)
- Show "Saving..." / "Saved" indicators
- Handle offline/online states

**File**: `src/core/ide/hooks/use-auto-save.ts`

#### 5.2 Achievement Notifications

Celebrate successful completions:

- Confetti animation on 100% pass
- Progress update notifications
- Unlock next lesson indicator
- Share success to social (optional)

**File**: `src/components/courses/lessons/achievement-notification.tsx`

#### 5.3 Help & Hints System

Provide progressive help:

- Show hints after failed attempts
- Reveal test cases incrementally
- "I'm stuck" button
- Solution unlock mechanism

**File**: `src/components/courses/lessons/hint-system.tsx`

---

## File Structure

```
src/
├── api/
│   └── courses/
│       ├── challenges.ts          # NEW - Main submission API
│       └── submissions.ts         # NEW - History & detail APIs
├── collections/
│   └── ChallengeSubmissions.ts    # NEW - Submission collection
├── core/
│   ├── testing/                   # NEW
│   │   ├── types.ts
│   │   └── test-runner.ts
│   └── ide/
│       ├── stores/
│       │   ├── console-slice.ts          # NEW - Console tab state only
│       │   └── use-ide-store.ts          # UPDATE - Add console slice
│       └── components/
│           ├── console.tsx               # UPDATE - Add tabs & submit button
│           └── test-results.tsx          # NEW - Display test results
├── hooks/
│   └── api/
│       └── challenges/
│           ├── use-submit-challenge.ts       # NEW - Main submission hook
│           ├── use-challenge-submissions.ts   # NEW - History hook
│           └── use-restore-submission.ts     # NEW - Restore code hook
└── components/
    └── courses/
        └── lessons/
            └── challenge-ide.tsx      # UPDATE - Pass challenge data
```

**Key Changes from Original Plan**:
- ✅ Removed `challenge-slice.ts` and `submission-slice.ts` from store (logic moved to hooks)
- ✅ Added TanStack Query hooks in `src/hooks/api/challenges/`
- ✅ Store only contains UI state (console tab), no business logic
- ✅ Components consume hooks, not internal logic


---

## Technical Considerations

### Security

1. **Sandbox Isolation**: Use E2B for server-side execution
2. **Timeout Limits**: Prevent infinite loops (default 5-10s)
3. **Resource Limits**: Memory and CPU restrictions
4. **Input Validation**: Sanitize all user inputs
5. **Rate Limiting**: Prevent abuse of submission API

### Performance

1. **Async Execution**: Non-blocking test execution
2. **Caching**: Cache challenge test definitions
3. **Optimistic UI**: Show immediate feedback, sync in background
4. **Lazy Loading**: Load test runner on-demand

### Error Handling

1. **Graceful Failures**: Handle compiler errors without crashing
2. **User-Friendly Messages**: Translate technical errors
3. **Retry Logic**: Allow resubmission after fixes
4. **Logging**: Track errors for debugging

---

## Testing Strategy

### Unit Tests

- Test runner with various code scenarios
- Test result parsing and formatting
- Error handling edge cases
- Timeout and cancellation

### Integration Tests

- Full submission flow end-to-end
- Progress tracking integration
- IDE state persistence
- Multi-file project execution

### Manual Testing

- Sample challenges with different difficulties
- Edge cases (syntax errors, infinite loops)
- Concurrent submissions
- Browser compatibility (Pyodide)

---

## Success Metrics

- **Accuracy**: Test results must be 100% reliable
- **Performance**: Submissions complete in < 10 seconds
- **Usability**: Users can submit code in 3 clicks or less
- **Engagement**: Increase challenge completion rate by 40%
- **Satisfaction**: User feedback rating > 4.5/5

---

## Future Enhancements

1. **AI-Powered Hints**: Use LLM to generate contextual hints
2. **Collaborative Debugging**: Share failed attempts for help
3. **Leaderboards**: Rank users by completion time/score
4. **Custom Test Cases**: Allow users to write their own tests
5. **Video Walkthroughs**: Show solution explanations on demand
6. **Challenge Templates**: Pre-built challenges for common patterns
7. **Peer Review**: Allow users to review each other's solutions

---

## Dependencies

### Required (Already Installed)
- `@e2b/code-interpreter` - Server-side execution
- `zustand` - State management
- `payload` - CMS and database

### May Need
- `pytest-runner` or similar - Test execution
- `confetti-react` - Celebration animations
- `react-syntax-highlighter` - Test output formatting
- Additional Pyodide packages for testing

---

## Timeline Estimate

- **Phase 1**: 2-3 days (Test system)
- **Phase 2**: 2-3 days (API layer)
- **Phase 3**: 4-5 days (Frontend components)
- **Phase 4**: 1-2 days (State management)
- **Phase 5**: 2-3 days (UX enhancements)
- **Testing**: 2-3 days

**Total**: ~13-19 days

---

## References

- Existing Quiz System: `src/api/courses/quizzes.ts`
- Compiler System: `src/core/compiler/`
- IDE Components: `src/core/ide/`
- UserProgress Collection: `src/collections/UserProgress.ts`
