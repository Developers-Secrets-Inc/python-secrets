# Challenge IDE Integration

## What

Update the ChallengeIDE component to pass challenge data to the IDE and load file structure.

## Why

- **Load Challenge Files**: Initialize IDE with challenge's file structure
- **Pass Metadata**: Provide challenge data to Console component
- **Auto-setup**: No manual file creation needed

## How

### Component Implementation

**File:** `src/components/courses/lessons/challenge-ide.tsx`

```typescript
'use client'

import { useEffect } from 'react'
import { IDE } from '@/core/ide/components'
import { useIDEStore } from '@/core/ide/stores/use-ide-store'

interface ChallengeIDEProps {
  data: any  // ChallengesExercice collection data
  userId: string
  lessonId: number
  courseId: number
}

export function ChallengeIDE({ data, userId, lessonId, courseId }: ChallengeIDEProps) {
  const { loadFiles, clearFiles } = useIDEStore()

  useEffect(() => {
    // Load challenge file structure into IDE
    if (data?.fileStructure) {
      const files = convertFileStructureToFileNodes(data.fileStructure)
      loadFiles(files)
    }

    // Cleanup: clear files when unmounting
    return () => {
      clearFiles()
    }
  }, [data, loadFiles, clearFiles])

  // Don't render if no challenge data
  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">No challenge data available</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <IDE
        challengeData={{
          ...data,
          lessonId,
          courseId,
        }}
      />
    </div>
  )
}

/**
 * Convert challenge fileStructure to FileNode[]
 */
function convertFileStructureToFileNodes(fileStructure: any[]): any[] {
  // fileStructure is an array of objects with path and content
  // We need to convert it to FileNode format for the IDE store

  const fileNodes: any[] = []
  const folderMap = new Map<string, string>()

  fileStructure.forEach((file: any, index: number) => {
    const pathParts = file.path.split('/').filter(Boolean)

    // Create folders
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderPath = pathParts.slice(0, i + 1).join('/')
      const folderName = pathParts[i]

      if (!folderMap.has(folderPath)) {
        const folderId = `folder-challenge-${Date.now()}-${i}`
        folderMap.set(folderPath, folderId)

        fileNodes.push({
          id: folderId,
          name: folderName,
          type: 'folder',
          parentId: i > 0 ? folderMap.get(pathParts.slice(0, i).join('/')) : null,
          isOpen: true,
          isLocked: false,
        })
      }
    }

    // Create file
    const filename = pathParts[pathParts.length - 1]
    const folderPath = pathParts.slice(0, -1).join('/')
    const fileId = `file-challenge-${index}`

    fileNodes.push({
      id: fileId,
      name: filename,
      type: 'file',
      content: file.content || '',
      parentId: folderPath ? folderMap.get(folderPath) : null,
      isLocked: false,
    })
  })

  return fileNodes
}
```

### IDE Store Enhancement

**File:** `src/core/ide/stores/use-ide-store.ts` (add to existing)

```typescript
// Add to FileSlice interface
export interface FileSlice {
  // ... existing properties

  // NEW: Clear all files
  clearFiles: () => void

  // NEW: Load files from array
  loadFiles: (files: FileNode[]) => void
}

// Add to createFileSlice implementation
export const createFileSlice: StateCreator<IDEState, [], [], FileSlice> = (set, get) => ({
  // ... existing actions

  clearFiles: () => {
    set({ files: [], activeFileId: null, openTabIds: [] })
  },

  loadFiles: (files) => {
    set({
      files,
      activeFileId: files.find(f => f.type === 'file')?.id || null,
      openTabIds: files.filter(f => f.type === 'file').map(f => f.id),
    })
  },
})
```

## Challenge Data Structure

The `data` prop from Payload looks like:

```typescript
{
  id: "12345"
  title: "Algorithm Challenge"
  slug: "algorithm-challenge"
  difficulty: "INTERMEDIATE"
  fileStructure: [
    {
      path: "/main.py",
      content: "# Write your solution here\n"
    },
    {
      path: "/utils.py",
      content: "# Utility functions\n"
    }
  ]
  tests: [...] // From ChallengesExercices collection
  solution: "..." // Rich text solution
}
```

## Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│  LESSON LAYOUT                                               │
│  - Fetch lesson data                                        │
│  - Pass exercise to LessonExercisePanel                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  LESSON EXERCISE PANEL                                      │
│  - Detect exercise type (quiz or challenge)                │
│  - Render ChallengeIDE for challenges                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  CHALLENGE IDE (this component)                             │
│  - Receive challenge data                                  │
│  - Convert fileStructure to FileNode[]                    │
│  - Load files into IDE store                              │
│  - Pass challenge data to IDE component                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  IDE COMPONENT                                               │
│  - Pass challengeData to Console                          │
│  - Display files in Editor                                │
└─────────────────────────────────────────────────────────────┘
```

## Props Flow

```tsx
// Layout
<LessonExercisePanel
  exercise={lesson.exercise}  // { relationTo: 'challenges-exercices', value: {...} }
  userId={session.user.id}
  lessonId={lesson.id}
  courseId={course.id}
/>

// LessonExercisePanel
{exercise?.relationTo === 'challenges-exercices' && (
  <ChallengeIDE
    data={exercise.value}  // Full challenge object with fileStructure
    userId={userId}
    lessonId={lessonId}
    courseId={courseId}
  />
)}

// ChallengeIDE
<IDE
  challengeData={{
    ...data,
    lessonId,
    courseId,
  }}
/>

// IDE
<Console challengeData={challengeData} />

// Console
<TestsContent challengeData={challengeData} />
```

## File Locking

Lock files that shouldn't be edited:

```typescript
function convertFileStructureToFileNodes(fileStructure: any[], lockedFiles: string[] = ['/utils.py']) {
  return fileStructure.map((file) => {
    const isLocked = lockedFiles.includes(file.path)

    return {
      // ... other properties
      isLocked, // Lock specific files
    }
  })
}
```

## Cleanup

Component cleans up on unmount:

```typescript
useEffect(() => {
  // Load files

  return () => {
    // Clear files when leaving challenge
    clearFiles()
  }
}, [data])
```

## Error Handling

```typescript
export function ChallengeIDE({ data, ...props }: ChallengeIDEProps) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (data?.fileStructure) {
        const files = convertFileStructureToFileNodes(data.fileStructure)
        loadFiles(files)
        setError(null)
      }
    } catch (err) {
      console.error('Failed to load challenge files:', err)
      setError('Failed to load challenge files')
    }
  }, [data])

  if (error) {
    return <div className="text-destructive">{error}</div>
  }

  // ... rest of component
}
```

## Testing

```tsx
import { render, waitFor } from '@testing-library/react'
import { ChallengeIDE } from '@/components/courses/lessons/challenge-ide'

describe('ChallengeIDE', () => {
  it('loads challenge files on mount', async () => {
    const mockData = {
      fileStructure: [
        { path: '/main.py', content: 'print("test")' }
      ]
    }

    render(<ChallengeIDE data={mockData} userId="test" lessonId={1} courseId={1} />)

    await waitFor(() => {
      // Verify files were loaded into store
      const files = useIDEStore.getState().files
      expect(files).toHaveLength(1)
      expect(files[0].name).toBe('main.py')
    })
  })
})
```

## Next Steps

- → [Go to State Management](./state-management.md) for store details
- → [Go to Data Flow](./data-flow.md) for complete flow diagram
