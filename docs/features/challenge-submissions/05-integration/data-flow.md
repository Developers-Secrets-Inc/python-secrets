# Complete Data Flow

## What

End-to-end flow diagram showing how data moves through the entire system from button click to results display.

## Why

- **Understand System**: Visual representation of the complete flow
- **Debug**: Know where to look when something breaks
- **Integration**: See how all pieces connect

## How

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERACTION                             │
│                                                                         │
│  1. User edits code in IDE (Monaco)                                    │
│     └─> Updates useIDEStore().files                                   │
│                                                                         │
│  2. User clicks "Submit Code" button                                   │
│     └─> Triggers useSubmitChallenge().submitChallenge()              │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOOK: useSubmitChallenge                         │
│                                                                         │
│  onMutate:                                                             │
│    ├─> setConsoleTab('tests')  ──┐                                    │
│    │                             │                                    │
│    └─> Convert files to ProjectFile[]                                │
│         ┌────────────────────────────────────────────────┐             │
│         │ FileNode[] → ProjectFile[]                    │             │
│         │ [{id, name, content, ...}] → [{path, content}] │             │
│         └────────────────────────────────────────────────┘             │
│                                   │                                    │
│                                   ▼                                    │
│  mutationFn:                         │                                    │
│    └─> Call submitChallenge API (server)  ◄─────────────────────────────┘
│                                                                         │
│  onSuccess:                                                           │
│    ├─> Invalidate cache: queryClient.invalidateQueries()            │
│    ├─> Show toast notification                                       │
│    ├─> Trigger confetti (if 100% score)                               │
│    └─> Update state with results                                     │
│                                                                         │
│  onError:                                                             │
│    └─> Show error toast                                               │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      SERVER API: submitChallenge()                      │
│                                                                         │
│  1. Fetch Challenge                                                   │
│     └─> payload.find({ collection: 'challenges-exercices', ... })     │
│         └─> Get tests array from challenge                            │
│                                                                         │
│  2. Execute User Code                                                 │
│     └─> compileProject(files, 'main.py', compiler)                   │
│         ├─> E2B (server) OR Pyodide (client)                         │
│         ├─> Capture stdout, stderr, error                            │
│         └─> Measure execution time                                   │
│                                                                         │
│  3. Run Tests (if no execution error)                                │
│     └─> runTests({ userFiles, tests, compiler })                    │
│         ├─> For each test:                                           │
│         │   ├─> Build test script                                   │
│         │   ├─> Execute via compileCode()                           │
│         │   └─> Parse result (passed/failed/error)                   │
│         └─> Return TestResult[]                                     │
│                                                                         │
│  4. Calculate Summary                                                 │
│     ├─> total = testResults.length                                   │
│     ├─> passed = count of 'passed'                                   │
│     ├─> failed = count of 'failed' + 'error'                         │
│     └─> score = (passed / total) * 100                               │
│                                                                         │
│  5. Create Submission Record                                         │
│     └─> payload.create({                                             │
│           collection: 'challenge-submissions',                       │
│           data: {                                                    │
│             userId,                                                  │
│             lesson,                                                  │
│             challenge,                                               │
│             submittedCode: files,                                    │
│             testResults,                                             │
│             score,                                                   │
│             totalTests,                                              │
│             status,                                                  │
│             executionTime,                                           │
│             submittedAt,                                            │
│           }                                                         │
│         })                                                          │
│                                                                         │
│  6. Update UserProgress (if completed)                               │
│     └─> payload.update({ collection: 'user-progress', ... })          │
│         └─> Set status: 'completed'                                  │
│         └─> Save codeSnapshot: files                                 │
│                                                                         │
│  7. Return Results                                                   │
│     └─> Return {                                                     │
│           success,                                                  │
│           status,                                                   │
│           testResults,                                             │
│           summary,                                                 │
│           executionOutput,                                         │
│           executionTime                                            │
│         }                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         HOOK: useSubmitChallenge                         │
│                     (Response received from server)                    │
│                                                                         │
│  onSuccess() runs:                                                    │
│    ├─> queryClient.invalidateQueries({                              │
│          queryKey: ['challenge-submissions', lessonId]               │
│        })                                                           │
│    │                                                               │
│    ├─> toast.success('🎉 Challenge completed! X/X tests passed')   │
│    │                                                               │
│    ├─> triggerConfetti()  (if all passed)                          │
│    │                                                               │
│    └─> Update mutation.data with results                            │
│                                                                         │
│  Component receives:                                                 │
│    ├─> isSubmitting = false                                          │
│    └─> data = SubmissionResult                                       │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      COMPONENT: TestResultsViewer                       │
│                                                                         │
│  Receives via props:                                                  │
│    ├─> summary: { total, passed, failed, score }                     │
│    ├─> testResults: TestResult[]                                     │
│    └─> executionOutput: string                                       │
│                                                                         │
│  Renders:                                                              │
│    ├─> Summary card (color-coded by status)                          │
│    ├─> Test cards (expandable)                                       │
│    └─> Execution output (raw text)                                   │
│                                                                         │
│  User interactions:                                                   │
│    ├─> Click test card → Expand to see details                       │
│    └─> View output/error messages                                   │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      USER SEES RESULTS                                  │
│                                                                         │
│  Console panel shows "Tests" tab with:                                 │
│    ├─> "3/4 tests passed (75%)" summary card                         │
│    ├─> ✓ test_addition (45ms)                                        │
│    ├─> ✓ test_multiplication (32ms)                                  │
│    ├─> ✓ test_division (28ms)                                        │
│    └─> ✗ test_modulo (15ms)                                         │
│       └─> "AssertionError: Expected 0, got 2"                        │
│                                                                         │
│  User can:                                                            │
│    ├─> Fix code and resubmit                                         │
│    ├─> Click "Submissions" tab to see history                        │
│    └─> Restore previous attempts                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Parallel Flow: Cache Invalidation

```
┌─────────────────────────────────────────────────────────────────┐
│  useSubmitChallenge onSuccess()                                │
│    └─> queryClient.invalidateQueries({                          │
│          queryKey: ['challenge-submissions', lessonId]          │
│        })                                                       │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  TanStack Query detects invalidation                            │
│    └─> Flags 'challenge-submissions' query as stale            │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Background refetch triggered                                    │
│    └─> getSubmissions({ userId, lessonId }) called             │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  useSubmissions hook updates                                    │
│    └─> submissions array is refreshed with new submission      │
│    └─> Components using this hook re-render with new data     │
└─────────────────────────────────────────────────────────────────┘
```

### Restore Code Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User clicks "Restore Code" on submission                      │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  useRestoreSubmission().restoreSubmission(id)                  │
│    ├─> Call getSubmissionDetail(id)                           │
│    └─> Convert ProjectFile[] to FileNode[]                    │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  API: getSubmissionDetail()                                    │
│    └─> payload.findByID({                                     │
│          collection: 'challenge-submissions',                  │
│          id: submissionId                                     │
│        })                                                      │
│    └─> Return submission with submittedCode                   │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  Hook onSuccess()                                               │
│    ├─> loadFiles(fileNodes)  // Update IDE store               │
│    ├─> Show success toast                                      │
│    └─> Navigate to IDE (if on submissions page)               │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  IDE Store updated                                             │
│    ├─> files = restored files                                 │
│    ├─> activeFileId = first file                              │
│    └─> openTabIds = all file IDs                              │
└─────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  IDE re-renders with restored code                             │
└─────────────────────────────────────────────────────────────────┘
```

## Key Integration Points

### 1. Challenge Data Flow

```
Payload CMS → getLesson() → LessonExercisePanel → ChallengeIDE → IDE
                                                                         ↓
                                                                      Console
```

### 2. Submission Flow

```
useSubmitChallenge Hook
        ↓
submitChallenge API
        ↓
Test Runner Service
        ↓
Compiler (E2B/Pyodide)
        ↓
Database (ChallengeSubmissions)
        ↓
Return to Hook
        ↓
Update UI (TestResultsViewer)
```

### 3. History Flow

```
Submissions Page
        ↓
useSubmissions Hook
        ↓
getSubmissions API
        ↓
Database (ChallengeSubmissions)
        ↓
Return to Hook
        ↓
Map to UI (Timeline)
```

### 4. Restore Flow

```
Submissions Page (Restore Button)
        ↓
useRestoreSubmission Hook
        ↓
getSubmissionDetail API
        ↓
Database (ChallengeSubmissions)
        ↓
Return to Hook
        ↓
Convert to FileNode[]
        ↓
loadFiles() → IDE Store
        ↓
IDE re-renders
```

## State Transitions

### Console Tab State

```
Initial: 'terminal'
   ↓ (User clicks "Tests" tab OR submits code)
'tests'
   ↓ (User clicks "Terminal" tab)
'terminal'
```

### Submission State

```
Initial: { isSubmitting: false, data: null }
   ↓ (User submits)
{ isSubmitting: true, data: null }
   ↓ (API returns)
{ isSubmitting: false, data: SubmissionResult }
   ↓ (User submits again)
{ isSubmitting: true, data: previous data }
   ↓ (API returns)
{ isSubmitting: false, data: new SubmissionResult }
```

### Files State (Restore)

```
Initial: files = [current working files]
   ↓ (User clicks restore)
files = [restored files]
activeFileId = first restored file
openTabIds = all restored file IDs
```

## Error Flow

```
User submits code
   ↓
Compilation Error
   ↓
API returns { status: 'error', testResults: [error result] }
   ↓
Hook onError() NOT called (it's a success response with error data)
   ↓
Hook onSuccess() called
   ↓
toast.error('Code execution failed. Check for syntax errors.')
   ↓
UI shows error test result
```

## Data Transformations

### FileNode → ProjectFile

```typescript
// Client → Server
FileNode[] → ProjectFile[]
[
  { id: 'main', name: 'main.py', content: 'code', ... }
]
  ↓
[
  { path: '/main.py', content: 'code' }
]
```

### ProjectFile → FileNode

```typescript
// Server → Client
ProjectFile[] → FileNode[]
[
  { path: '/main.py', content: 'code' }
]
  ↓
[
  { id: 'main', name: 'main.py', content: 'code', type: 'file', parentId: null, ... }
]
```

## Cache Keys

| Key | Used By | Invalidation |
|-----|---------|--------------|
| `['challenge-submissions', lessonId]` | useSubmissions | After submission |
| `['challenge-submission', submissionId]` | useSubmissionDetail | Manual |
| `['challenge-best-submission', lessonId]` | useBestSubmission | After submission |

## Next Steps

- → [Back to README](../README.md) for overview
- → [Go to Notifications](../06-polish/notifications.md) for UX enhancements
