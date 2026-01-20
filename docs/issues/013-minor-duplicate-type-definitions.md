# Minor: Duplicate Type Definitions Across Compiler Modules

## Priority
🟡 **Minor** - Code Maintainability & DRY

## Locations
- `src/core/compiler/index.ts:4-11`
- `src/core/compiler/client/index.ts:1-7`
- `src/core/compiler/server/index.ts:5-11`
- `src/core/compiler/client/worker.ts:1-7`

## Problem Description
The same types are defined in multiple files, violating DRY principle:

### `ProjectFile` - Defined 4 Times
```typescript
// src/core/compiler/index.ts
export type ProjectFile = { path: string; content: string }

// src/core/compiler/client/index.ts
export type ProjectFile = { path: string; content: string }

// src/core/compiler/server/index.ts
export type ProjectFile = { path: string; content: string }

// src/core/compiler/client/worker.ts
export type ProjectFile = { path: string; content: string }
```

### `ExecutionResult` - Defined 4 Times
```typescript
export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
}
```

## Impact
- **Maintenance burden**: Changes must be made in 4 places
- **Type inconsistency risk**: Definitions may drift apart
- **Code bloat**: Same types repeated
- **Import confusion**: Unclear which to import from

## Current Imports
```typescript
// Different files import from different places
import type { ProjectFile } from './server'
import type { ProjectFile } from './client'
import type { ProjectFile } from './index'
```

## Expected Behavior

### Single Source of Truth
Create `src/core/compiler/types.ts`:
```typescript
export type ProjectFile = {
  path: string
  content: string
}

export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
}

export type Compiler = 'server' | 'client'

export type WorkerMessage =
  | { id: number; type: 'code'; code: string }
  | { id: number; type: 'project'; files: ProjectFile[]; entryPoint: string }

export type WorkerResponse = { id: number; result: ExecutionResult }
```

### Update All Files
```typescript
// src/core/compiler/index.ts
export type { ProjectFile, ExecutionResult, Compiler } from './types'

// src/core/compiler/client/index.ts
import type { ProjectFile, ExecutionResult } from '../types'

// src/core/compiler/server/index.ts
import type { ProjectFile, ExecutionResult } from '../types'

// src/core/compiler/client/worker.ts
import type { ProjectFile, ExecutionResult, WorkerMessage } from '../types'
```

## Benefits
- **Single import**: `import type { ProjectFile } from '@/core/compiler/types'`
- **Type safety**: Consistent definitions everywhere
- **Easy updates**: Change once, applies everywhere
- **Better documentation**: Centralized type documentation

## Labels
`minor` `code-quality` `maintainability` `types` `refactor`

## Related Issues
- #034 - Imports not optimized

## Steps to Fix
1. Create `src/core/compiler/types.ts`
2. Move all shared types to new file
3. Update all imports across compiler modules
4. Remove duplicate type definitions
5. Run TypeScript compiler to verify
6. Update any barrel exports

## Verification
```bash
# Search for remaining duplicate definitions
grep -r "export type ProjectFile" src/
# Should only find one result
```

## Additional Context
This is a common issue that develops as code grows. The fix is straightforward and improves maintainability. This is a good "good first issue" for someone wanting to contribute.

## Enhanced Types
While fixing, could improve types:
```typescript
export type ProjectFile = {
  path: string       // e.g., '/utils.py' or 'utils.py'
  content: string
}

export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
  duration?: number  // Add execution time tracking
  exitCode?: number  // Add exit code
}

export type ExecutionOptions = {
  timeout?: number   // Execution timeout in ms
  compiler?: Compiler
}
```
