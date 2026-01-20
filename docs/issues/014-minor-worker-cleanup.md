# Minor: Worker Connection Not Cleaned Up on Component Unmount

## Priority
🟡 **Minor** - Memory Leak & Resource Management

## Location
`src/core/compiler/client/index.ts:18-64`

## Problem Description
The Web Worker connection is not cleaned up when components unmount:

```typescript
let worker: Worker | null = null
let messageId = 0
const pendingMessages = new Map<number, (result: ExecutionResult) => void>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    })
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, result } = event.data
      const resolve = pendingMessages.get(id)
      if (resolve) {
        pendingMessages.delete(id)
        resolve(result)
      }
    }
  }
  return worker
}
```

## Issues

### 1. Worker Never Terminated
- Worker lives forever once created
- Continues consuming memory
- Pyodide stays loaded (~10MB+)

### 2. Pending Messages Never Cleared
- If component unmounts during execution
- Pending promises in Map never resolved
- Memory leak from accumulated callbacks

### 3. No Abort Mechanism
- Cannot cancel in-progress execution
- Must wait for timeout (30 seconds)

## Impact Scenarios

### Scenario 1: Navigation During Execution
```
1. User starts code execution
2. User navigates away before completion
3. Component unmounts
4. Worker continues running
5. Pyodide stays in memory
6. Pending message callback never cleaned
```

### Scenario 2: Multiple IDE Instances
```
1. User opens multiple lessons
2. Each creates/uses worker
3. Workers accumulate
4. Memory usage grows
5. No cleanup until page refresh
```

## Expected Behavior

### 1. Cleanup Function
```typescript
export function terminateWorker() {
  if (worker) {
    worker.terminate()
    worker = null
  }
  pendingMessages.clear()
  messageId = 0
}

export function useWorkerCleanup() {
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      terminateWorker()
    }
  }, [])
}
```

### 2. Abortable Execution
```typescript
const abortControllers = new Map<number, AbortController>()

function sendMessage(
  message: Omit<WorkerMessage, 'id'>,
  signal?: AbortSignal
): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const id = messageId++

    if (signal?.aborted) {
      reject(new Error('Execution aborted'))
      return
    }

    const controller = new AbortController()
    abortControllers.set(id, controller)

    signal?.addEventListener('abort', () => {
      pendingMessages.delete(id)
      abortControllers.delete(id)
      reject(new Error('Execution aborted'))
    })

    // ... rest of function
  })
}
```

### 3. React Hook Pattern
```typescript
export function useCompiler() {
  useEffect(() => {
    // Initialize worker on mount
    getWorker()

    return () => {
      // Cleanup on unmount
      terminateWorker()
    }
  }, [])

  const compile = useCallback(async (code: string) => {
    return sendMessage({ type: 'code', code })
  }, [])

  return { compile }
}
```

## Labels
`minor` `memory-leak` `resource-management` `worker` `web-apis`

## Related Issues
- #005 - Missing error handling
- #009 - No tests for worker communication

## Steps to Fix

### Phase 1: Basic Cleanup
1. Add `terminateWorker()` function
2. Clear pending messages on terminate
3. Export cleanup function

### Phase 2: React Integration
4. Create `useCompiler()` hook
5. Auto-cleanup on unmount
6. Update components to use hook

### Phase 3: Abort Support
7. Add abort signal support
8. Allow cancellation of in-flight requests
9. Update timeout handling to abort

## Memory Impact
Current (with leak):
- 10 lessons opened × 10MB Pyodide = 100MB
- Plus pending message callbacks

Fixed:
- Single worker instance
- Cleanup on unmount
- Max 10MB for Pyodide

## Testing
```typescript
// tests/unit/compiler/worker-cleanup.test.ts
describe('Worker Cleanup', () => {
  it('should terminate worker on cleanup')
  it('should clear pending messages on cleanup')
  it('should handle cleanup during execution')
  it('should reinitialize after cleanup')
})
```

## Verification
```typescript
// In browser console
// Before fix: Multiple workers in DevTools
// After fix: Single worker, cleaned up on navigation
```

## Additional Context
This is a subtle memory leak that accumulates over time. Users taking multiple lessons will see performance degradation. The fix is straightforward but important for production use.

## Best Practice Reference
- [MDN: Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [React: Cleaning Up Effects](https://react.dev/learn/synchronizing-with-effects#each-effect-represents-a-separate-synchronization-process)
