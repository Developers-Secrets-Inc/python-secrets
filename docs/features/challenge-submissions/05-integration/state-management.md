# State Management

## What

Minimal Zustand store configuration for the challenge submission system.

## Why

- **UI State Only**: Store contains only UI state, no business logic
- **Simple**: Easy to understand and maintain
- **Separation**: Business logic is in TanStack Query hooks, not in store

## How

### Store Configuration

**File:** `src/core/ide/stores/use-ide-store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFileSlice, FileSlice } from './file-slice'
import { createTabSlice, TabSlice } from './tab-slice'
import { createTerminalSlice, TerminalSlice } from './terminal-slice'
import { createConsoleSlice, ConsoleSlice } from './console-slice'

/**
 * Combined IDE State
 * Only contains UI state - no business logic
 */
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
```

### Console Slice (New)

**File:** `src/core/ide/stores/console-slice.ts`

```typescript
import { StateCreator } from 'zustand'
import type { IDEState } from './use-ide-store'

export interface ConsoleSlice {
  /**
   * Currently active console tab
   * 'terminal' - Command terminal (existing)
   * 'tests' - Test results (new)
   */
  activeConsoleTab: 'terminal' | 'tests'

  /**
   * Set the active console tab
   */
  setConsoleTab: (tab: 'terminal' | 'tests') => void
}

export const createConsoleSlice: StateCreator<IDEState, [], [], ConsoleSlice> = (set) => ({
  activeConsoleTab: 'terminal',
  setConsoleTab: (tab) => set({ activeConsoleTab: tab }),
})
```

### File Slice (Enhanced)

**File:** `src/core/ide/stores/file-slice.ts` (additions)

```typescript
import { StateCreator } from 'zustand'
import type { FileNode, FileNodeType } from './types'
import type { IDEState } from './use-ide-store'

export interface FileSlice {
  // ... existing properties

  /**
   * Clear all files (used when switching challenges)
   */
  clearFiles: () => void

  /**
   * Load files from array (used when restoring submission)
   */
  loadFiles: (files: FileNode[]) => void
}

export const createFileSlice: StateCreator<IDEState, [], [], FileSlice> = (set, get) => ({
  // ... existing implementation

  clearFiles: () => {
    set({
      files: [],
      activeFileId: null,
      openTabIds: [],
    })
  },

  loadFiles: (files) => {
    set({
      files,
      activeFileId: files.find((f) => f.type === 'file')?.id || null,
      openTabIds: files.filter((f) => f.type === 'file').map((f) => f.id),
    })
  },
})
```

## Store Structure

```
IDEState
├── FileSlice
│   ├── files: FileNode[]
│   ├── activeFileId: string | null
│   ├── currentFolderId: string | null
│   ├── addNode()
│   ├── renameNode()
│   ├── deleteNode()
│   ├── updateFileContent()
│   ├── toggleFolder()
│   ├── toggleLock()
│   ├── clearFiles()      ← NEW
│   └── loadFiles()       ← NEW
│
├── TabSlice
│   ├── openTabIds: string[]
│   ├── addTab()
│   ├── closeTab()
│   └── setActiveTab()
│
├── TerminalSlice
│   ├── terminalLines: TerminalLine[]
│   ├── commandHistory: string[]
│   ├── historyIndex: number
│   ├── executeCommand()
│   ├── setHistoryIndex()
│   └── clearTerminal()
│
└── ConsoleSlice        ← NEW
    ├── activeConsoleTab: 'terminal' | 'tests'
    └── setConsoleTab()
```

## What's NOT in the Store

The store deliberately does NOT contain:

❌ `testResults: TestResult[]` - Stored in TanStack Query cache
❌ `isSubmitting: boolean` - Managed by useMutation
❌ `submissionError: string` - Managed by useMutation
❌ `challengeId: string` - Passed as prop to components
❌ `lessonId: number` - Passed as prop to components
❌ `submitChallenge()` - This is a hook, not a store action

## Usage Examples

### Get Active Tab

```typescript
import { useIDEStore } from '@/core/ide/stores/use-ide-store'

function Console() {
  const activeTab = useIDEStore((state) => state.activeConsoleTab)
  const setTab = useIDEStore((state) => state.setConsoleTab)

  return (
    <div>
      <button onClick={() => setTab('terminal')}>Terminal</button>
      <button onClick={() => setTab('tests')}>Tests</button>
      <p>Active: {activeTab}</p>
    </div>
  )
}
```

### Load Files from Submission

```typescript
import { useIDEStore } from '@/core/ide/stores/use-ide-store'

function RestoreButton({ submission }: { submission: SubmissionDetail }) {
  const loadFiles = useIDEStore((state) => state.loadFiles)

  const handleRestore = () => {
    const fileNodes = convertToNodes(submission.submittedCode)
    loadFiles(fileNodes)
  }

  return <button onClick={handleRestore}>Restore</button>
}
```

### Clear Files

```typescript
import { useIDEStore } from '@/core/ide/stores/use-ide-store'

function onUnmount() {
  const clearFiles = useIDEStore((state) => state.clearFiles)
  clearFiles()
}
```

## Persistence

The store is persisted to localStorage:

```typescript
partialize: (state) => ({
  files: state.files,
  activeFileId: state.activeFileId,
  openTabIds: state.openTabIds,
  activeConsoleTab: state.activeConsoleTab,
})
```

**What's persisted**:
- ✅ Files (user's code)
- ✅ Active file
- ✅ Open tabs
- ✅ Active console tab

**What's NOT persisted**:
- ❌ Terminal history (cleared on refresh)
- ❌ Test results (re-fetched from API)

## Access Patterns

### Direct Access

```typescript
const files = useIDEStore((state) => state.files)
```

### Actions

```typescript
const setTab = useIDEStore((state) => state.setConsoleTab)
setTab('tests')
```

### Multiple Values

```typescript
const { files, activeFileId, setConsoleTab } = useIDEStore()
```

## Why Minimal Store?

### Before (Anti-Pattern)

```typescript
// ❌ BAD: Business logic in store
const submitCode = async (userId: string) => {
  const { files, lessonId, challengeId } = get()

  // API call in store?
  const result = await fetch('/api/submit', { ... })

  // State mutation in store?
  set({ testResults: result.data, isSubmitting: false })
}
```

### After (Good Pattern)

```typescript
// ✅ GOOD: Store only has UI state
const setConsoleTab = (tab: 'terminal' | 'tests') => {
  set({ activeConsoleTab: tab })
}

// Business logic in hooks
const { submitChallenge, isSubmitting } = useSubmitChallenge()
```

## Benefits

1. **Separation of Concerns**
   - Store: UI state (tabs, files)
   - Hooks: Business logic (API calls, mutations)

2. **Testability**
   - Store: Simple state updates
   - Hooks: Complex async logic

3. **React Query Integration**
   - Automatic caching
   - Background refetch
   - Optimistic updates

4. **Type Safety**
   - All types are explicit
   - No implicit state transformations

## Next Steps

- → [Go to Data Flow](./data-flow.md) for complete system flow
- → [Go to Challenge IDE](./challenge-ide.md) for component integration
