# Setup Guide

## What

Initial configuration steps to set up the foundation for the challenge submission system.

## Why

- Ensure all dependencies are installed
- Configure Payload CMS with the new collection
- Set up TanStack Query provider
- Verify everything works before building features

## How

### Prerequisites

Verify these are already installed:

```json
// package.json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",          // Data fetching
    "payload": "^3.x",                        // CMS
    "zustand": "^4.x",                        // State management
    "@e2b/code-interpreter": "^0.x",          // Code execution (server)
    "sonner": "^1.x"                          // Toast notifications
  }
}
```

### Step 1: Add the Collection

Follow the [Database Schema guide](./database-schema.md) to:
- Create `src/collections/ChallengeSubmissions.ts`
- Register in `src/payload.config.ts`
- Export from `src/collections/index.ts`

### Step 2: Create Types File

Follow the [TypeScript Types guide](./types.md) to:
- Create `src/types/challenges.ts`
- Export from `src/types/index.ts`

### Step 3: Push Database Changes

After adding the collection, push the schema to your database:

```bash
# Using Payload's migration
pnpm payload generate:types

# Or if using Drizzle/Prisma directly
pnpm db:push
```

**Verify:**
- Check that the `challenge-submissions` table exists in PostgreSQL
- All columns are created with correct types
- Indexes are created

### Step 4: Configure TanStack Query

**File:** `src/app/providers.tsx` (or similar)

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

**If you already have a QueryClientProvider**, skip this step.

### Step 5: Update IDE Store (Minimal)

Add only the console tab state to the IDE store:

**File:** `src/core/ide/stores/console-slice.ts`

```typescript
import { StateCreator } from 'zustand'
import { IDEState } from './use-ide-store'

export interface ConsoleSlice {
  activeConsoleTab: 'terminal' | 'tests'
  setConsoleTab: (tab: 'terminal' | 'tests') => void
}

export const createConsoleSlice: StateCreator<IDEState, [], [], ConsoleSlice> = (set) => ({
  activeConsoleTab: 'terminal',
  setConsoleTab: (tab) => set({ activeConsoleTab: tab }),
})
```

**File:** `src/core/ide/stores/use-ide-store.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createFileSlice, FileSlice } from './file-slice'
import { createTabSlice, TabSlice } from './tab-slice'
import { createTerminalSlice, TerminalSlice } from './terminal-slice'
import { createConsoleSlice, ConsoleSlice } from './console-slice'

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

### Step 6: Verify Setup

Run these verification steps:

#### 6.1 Check Types

```typescript
// Test in any file
import type { TestResult, SubmissionResult } from '@/types/challenges'

const test: TestResult = {
  id: 'test-1',
  name: 'test_addition',
  status: 'passed',
  duration: 100
}
```

If TypeScript doesn't complain, types are working ✓

#### 6.2 Check Collection

```bash
# Start dev server
pnpm dev

# Go to http://localhost:3000/admin
# Login and check that "Challenge Submissions" appears in sidebar
# Click on it and verify you see the empty list
```

#### 6.3 Check Store

```typescript
// In any component
import { useIDEStore } from '@/core/ide/stores/use-ide-store'

export function TestComponent() {
  const activeTab = useIDEStore((state) => state.activeConsoleTab)
  const setTab = useIDEStore((state) => state.setConsoleTab)

  return (
    <div>
      <p>Active tab: {activeTab}</p>
      <button onClick={() => setTab('tests')}>Switch to Tests</button>
    </div>
  )
}
```

If the button works and switches the tab, store is working ✓

#### 6.4 Check Database

```sql
-- Connect to your PostgreSQL database
-- Run this query

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'payload'
  AND table_name = 'challenge-submissions';

-- Should return: challenge-submissions
```

Or use Payload's built-in admin:
- Go to Admin → API → Collections
- Find `challenge-submissions` in the list

### Step 7: Create Test Submission

Create a test submission via Payload admin to verify the collection works:

1. Go to `http://localhost:3000/admin/challenge-submissions`
2. Click "Create New"
3. Fill in:
   - **userId**: `test-user-123`
   - **lesson**: Select any lesson
   - **challenge**: Select any challenge
   - **submittedCode**:
     ```json
     [
       {
         "path": "/main.py",
         "content": "print('Hello, World!')"
       }
     ]
     ```
   - **testResults**:
     ```json
     [
       {
         "id": "test-1",
         "name": "test_hello",
         "status": "passed",
         "duration": 50
       }
     ]
     ```
   - **score**: `1`
   - **totalTests**: `1`
   - **status**: `completed`
4. Click "Save"
5. Verify it appears in the list

### Step 8: Clean Up

Delete the test submission:

1. Go to `http://localhost:3000/admin/challenge-submissions`
2. Click on the test submission
3. Click "Delete"
4. Confirm deletion

## Troubleshooting

### Collection doesn't appear in admin

**Problem:** "Challenge Submissions" is not visible in the sidebar

**Solution:**
1. Check that `ChallengeSubmissions` is imported in `payload.config.ts`
2. Check that it's exported from `collections/index.ts`
3. Restart the dev server
4. Clear browser cache and refresh

### TypeScript errors

**Problem:** Cannot find module '@/types/challenges'

**Solution:**
1. Check that `src/types/challenges.ts` exists
2. Check that it's exported from `src/types/index.ts`
3. Run `pnpm generate:types` to regenerate Payload types
4. Restart TypeScript server in VS Code (Cmd+Shift+P → "TypeScript: Restart TS Server")

### Store not working

**Problem:** `setConsoleTab` doesn't update the state

**Solution:**
1. Check that `createConsoleSlice` is imported in `use-ide-store.ts`
2. Check that it's included in the store composition
3. Check browser console for Zustand errors
4. Clear localStorage (where Zustand persists state)

### Database table not created

**Problem:** `challenge-submissions` table doesn't exist

**Solution:**
1. Run `pnpm db:push` or equivalent migration command
2. Check database connection string in `.env`
3. Verify Payload admin can access the database
4. Check database logs for errors

## Checklist

Before moving to Phase 2, verify:

- [ ] `ChallengeSubmissions` collection is created
- [ ] Collection is registered in `payload.config.ts`
- [ ] Collection appears in Payload admin
- [ ] Types file exists at `src/types/challenges.ts`
- [ ] Types are exported from `src/types/index.ts`
- [ ] TanStack Query provider is configured
- [ ] Console slice is added to IDE store
- [ ] Can create a test submission via admin
- [ ] Can query submissions via API
- [ ] No TypeScript errors in the project

## Next Steps

Once setup is complete:

- → [Go to Submission API](../02-backend/submission-api.md) to implement the main submission endpoint
- → [Go to Test Runner](../02-backend/test-runner.md) to implement test execution

## Quick Reference

Key files created/modified:

```
src/
├── collections/
│   ├── ChallengeSubmissions.ts       [NEW]
│   └── index.ts                       [MODIFIED]
├── types/
│   ├── challenges.ts                  [NEW]
│   └── index.ts                       [MODIFIED]
├── core/
│   └── ide/
│       └── stores/
│           ├── console-slice.ts       [NEW]
│           └── use-ide-store.ts       [MODIFIED]
└── payload.config.ts                  [MODIFIED]
```

Commands used:

```bash
# Generate types
pnpm payload generate:types

# Push database changes
pnpm db:push

# Start dev server
pnpm dev

# Run tests (when ready)
pnpm test
```
