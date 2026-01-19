# useRestoreSubmission Hook

## What

TanStack Query mutation hook that restores a previous submission's code into the IDE.

## Why

- **Easy Recovery**: Users can restore working solutions
- **Learning**: Review past attempts to understand mistakes
- **Backup**: Never lose code accidentally

## How

### Hook Implementation

**File:** `src/hooks/api/challenges/use-restore-submission.ts`

```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSubmissionDetail } from '@/api/courses/submissions'
import { useIDEStore } from '@/core/ide/stores/use-ide-store'
import { useRouter } from 'next/navigation'
import type { SubmissionDetail } from '@/types/challenges'
import { toast } from 'sonner'

/**
 * Restore a previous submission's code to the IDE
 *
 * @returns Object with mutation state and actions
 *
 * @example
 * ```tsx
 * const { restoreSubmission, isRestoring } = useRestoreSubmission()
 *
 * <button onClick={() => restoreSubmission('submission-id')}>
 *   Restore Code
 * </button>
 * ```
 */
export function useRestoreSubmission() {
  const queryClient = useQueryClient()
  const loadFiles = useIDEStore((state) => state.loadFiles)
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: async (submissionId: string): Promise<SubmissionDetail> => {
      return await getSubmissionDetail(submissionId)
    },

    onSuccess: (submission) => {
      // Convert submission code to IDE FileNode format
      const fileNodes = convertProjectFilesToFileNodes(submission.submittedCode)

      // Clear existing files and load restored files
      loadFiles(fileNodes)

      // Show success message
      toast.success('Code restored successfully!')

      // Optional: Switch to code tab if on submissions page
      if (typeof window !== 'undefined') {
        const path = window.location.pathname
        if (path.endsWith('/submissions')) {
          router.push(path.replace('/submissions', ''))
        }
      }

      // Invalidate submissions query to refresh cache
      queryClient.invalidateQueries({
        queryKey: ['challenge-submission', submission.id],
      })
    },

    onError: (error: Error) => {
      console.error('Failed to restore submission:', error)
      toast.error(`Failed to restore: ${error.message}`)
    },
  })

  return {
    /**
     * Restore submission code to IDE
     */
    restoreSubmission: mutation.mutate,

    /**
     * Restore submission (async version)
     */
    restoreSubmissionAsync: mutation.mutateAsync,

    /**
     * Is restoration in progress?
     */
    isRestoring: mutation.isPending,

    /**
     * Restored submission data
     */
    data: mutation.data,

    /**
     * Error object if restoration failed
     */
    error: mutation.error,
  }
}

/**
 * Convert ProjectFile[] to FileNode[] for IDE store
 */
function convertProjectFilesToFileNodes(projectFiles: SubmissionDetail['submittedCode']) {
  return projectFiles.map((file) => {
    // Extract filename from path
    const filename = file.path.split('/').pop() || 'untitled.py'
    const id = filename.replace('.py', '')

    return {
      id,
      name: filename,
      type: 'file' as const,
      parentId: null, // Simple structure, no nested folders
      content: file.content,
      isLocked: false,
    }
  })
}
```

### IDE Store Enhancement

**File:** `src/core/ide/stores/use-ide-store.ts` (add `loadFiles` action)

```typescript
// Add to IDEState interface
export interface IDEState {
  // ... existing state

  // NEW: Load files action
  loadFiles: (files: FileNode[]) => void
}

// Add to createFileSlice
export const createFileSlice: StateCreator<IDEState, [], [], FileSlice> = (set, get) => ({
  // ... existing actions

  // NEW: Load files from submission
  loadFiles: (files) => {
    set({
      files,
      activeFileId: files[0]?.id || null,
      openTabIds: files.map(f => f.id),
    })
  },
})
```

## Usage Examples

### Basic Usage

```tsx
'use client'

import { useRestoreSubmission } from '@/hooks/api/challenges/use-restore-submission'
import { Button } from '@/components/ui/button'

export function RestoreButton({ submissionId }: { submissionId: string }) {
  const { restoreSubmission, isRestoring } = useRestoreSubmission()

  return (
    <Button
      onClick={() => restoreSubmission(submissionId)}
      disabled={isRestoring}
      variant="outline"
      size="sm"
    >
      {isRestoring ? 'Restoring...' : 'Restore Code'}
    </Button>
  )
}
```

### With Confirmation Dialog

```tsx
'use client'

import { useRestoreSubmission } from '@/hooks/api/challenges/use-restore-submission'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function RestoreButtonWithConfirm({ submissionId }: { submissionId: string }) {
  const { restoreSubmission, isRestoring } = useRestoreSubmission()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          Restore Code
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore previous code?</AlertDialogTitle>
          <AlertDialogDescription>
            This will replace your current code in the IDE with the submission from{' '}
            {new Date().toLocaleDateString()}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => restoreSubmission(submissionId)}
            disabled={isRestoring}
          >
            {isRestoring ? 'Restoring...' : 'Restore'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### With Warning for Unsaved Changes

```tsx
'use client'

import { useRestoreSubmission } from '@/hooks/api/challenges/use-restore-submission'
import { useIDEStore } from '@/core/ide/stores/use-ide-store'
import { Button } from '@/components/ui/button'

export function RestoreButtonWithWarning({ submissionId }: { submissionId: string }) {
  const { restoreSubmission, isRestoring } = useRestoreSubmission()
  const files = useIDEStore((state) => state.files)

  const hasUnsavedChanges = files.some(f => f.content && f.content.trim() !== '')

  const handleRestore = () => {
    if (hasUnsavedChanges) {
      const confirmed = confirm(
        'You have unsaved changes in the IDE. Restoring will overwrite them. Continue?'
      )
      if (!confirmed) return
    }

    restoreSubmission(submissionId)
  }

  return (
    <div>
      {hasUnsavedChanges && (
        <p className="text-amber-600 text-sm mb-2">
          ⚠️ You have unsaved changes
        </p>
      )}
      <Button
        onClick={handleRestore}
        disabled={isRestoring}
        variant="outline"
        size="sm"
      >
        {isRestoring ? 'Restoring...' : 'Restore Code'}
      </Button>
    </div>
  )
}
```

### In Submissions List

```tsx
'use client'

import { useSubmissions } from '@/hooks/api/challenges/use-submissions'
import { useRestoreSubmission } from '@/hooks/api/challenges/use-restore-submission'
import { formatDistanceToNow } from 'date-fns'

export function SubmissionsList({ userId, lessonId }: { userId: string; lessonId: number }) {
  const { submissions, isLoading } = useSubmissions({ userId, lessonId })
  const { restoreSubmission, isRestoring } = useRestoreSubmission()

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-2">
      {submissions.map((submission) => (
        <div key={submission.id} className="flex justify-between items-center p-4 border rounded">
          <div>
            <p className="font-semibold">
              {submission.score}/{submission.totalTests} tests passed
            </p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
            </p>
          </div>
          <button
            onClick={() => restoreSubmission(submission.id)}
            disabled={isRestoring}
            className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
          >
            Restore
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Return Type

```typescript
interface UseRestoreSubmissionReturn {
  // Actions
  restoreSubmission: (submissionId: string) => void
  restoreSubmissionAsync: (submissionId: string) => Promise<SubmissionDetail>

  // State
  isRestoring: boolean
  data: SubmissionDetail | undefined
  error: Error | null
}
```

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Restore Code"                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ON MUTATE                                                   │
│  1. Call getSubmissionDetail(submissionId)                  │
│  2. Fetch submission with code from database                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  ON SUCCESS                                                  │
│  1. Convert ProjectFile[] to FileNode[]                     │
│  2. Call loadFiles() to update IDE store                    │
│  3. Switch active file to first file                        │
│  4. Open all files in tabs                                  │
│  5. Show success toast                                      │
│  6. Navigate to IDE (if on submissions page)               │
│  7. Invalidate cache                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
              Error?
               ↓      ↓
            YES      NO
              ↓        ↓
┌─────────────────────┐  ┌─────────────────────┐
│  ON ERROR           │  │  SUCCESS            │
│  1. Log error       │  │  IDE updated with   │
│  2. Show error      │  │  restored code      │
│     toast          │  │  User sees code     │
└─────────────────────┘  └─────────────────────┘
```

## File Structure Handling

For simple file structures (flat), the basic implementation works. For nested structures:

```typescript
function convertProjectFilesToFileNodes(projectFiles: SubmissionDetail['submittedCode']) {
  const fileNodes: FileNode[] = []
  const folderMap = new Map<string, string>()

  // First pass: create folders
  projectFiles.forEach((file) => {
    const pathParts = file.path.split('/').filter(Boolean)

    // Create nested folders
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderPath = pathParts.slice(0, i + 1).join('/')
      const folderName = pathParts[i]

      if (!folderMap.has(folderPath)) {
        const folderId = `folder-${Date.now()}-${Math.random()}`
        folderMap.set(folderPath, folderId)

        fileNodes.push({
          id: folderId,
          name: folderName,
          type: 'folder' as const,
          parentId: i > 0 ? folderMap.get(pathParts.slice(0, i).join('/')) : null,
          isOpen: true,
          isLocked: false,
        })
      }
    }
  })

  // Second pass: create files
  projectFiles.forEach((file) => {
    const pathParts = file.path.split('/').filter(Boolean)
    const filename = pathParts[pathParts.length - 1]
    const folderPath = pathParts.slice(0, -1).join('/')

    fileNodes.push({
      id: filename.replace('.py', ''),
      name: filename,
      type: 'file' as const,
      parentId: folderPath ? folderMap.get(folderPath) : null,
      content: file.content,
      isLocked: false,
    })
  })

  return fileNodes
}
```

## Navigation Behavior

After restoration:

- **If on submissions page**: Navigate back to IDE (removes `/submissions` from URL)
- **If already on IDE**: Just load files, no navigation

Customize navigation:

```typescript
onSuccess: (submission) => {
  // ... load files

  // Custom navigation logic
  if (shouldNavigate) {
    router.push('/custom-path')
  }
}
```

## Toast Notifications

- **Success**: "Code restored successfully!"
- **Error**: "Failed to restore: [error message]"

Customize messages:

```typescript
onSuccess: (submission) => {
  // ...
  toast.success(
    `Restored code from ${new Date(submission.submittedAt).toLocaleDateString()}`
  )
}
```

## Error Handling

The hook handles:

1. **Submission not found**
   - Error: "Submission with ID xxx not found"
   - Shown in error toast

2. **Permission denied**
   - Error: "You don't have access to this submission"
   - Shown in error toast

3. **Invalid data**
   - Error: "Invalid submission data"
   - Shown in error toast

## Best Practices

1. **Always warn user** before overwriting current code
2. **Show confirmation** dialog for better UX
3. **Check for unsaved changes** before restoring
4. **Provide undo** option (restore previous state)
5. **Show submission date** so user knows what they're restoring

## Dependencies

- `@tanstack/react-query` - Mutation management
- `@/api/courses/submissions` - Server-side API
- `@/core/ide/stores/use-ide-store` - IDE state
- `next/navigation` - Router
- `sonner` - Toast notifications

## Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRestoreSubmission } from '@/hooks/api/challenges/use-restore-submission'

describe('useRestoreSubmission', () => {
  it('restores submission code', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useRestoreSubmission(), { wrapper })

    await waitFor(() => {
      result.current.restoreSubmission('submission-id')
    })

    await waitFor(() => {
      expect(result.current.data).toBeDefined()
      expect(result.current.isRestoring).toBe(false)
    })
  })
})
```

## Next Steps

- → [Go to Submissions Page](../04-ui-components/submissions-page.md) to integrate with UI
- → [Go to Data Flow](../05-integration/data-flow.md) to understand complete flow
