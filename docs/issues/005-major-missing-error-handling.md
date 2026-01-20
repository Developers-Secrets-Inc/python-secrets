# Major: Missing Global Error Handling and Error Boundaries

## Priority
🟠 **Major** - Stability & User Experience

## Locations
- API routes: `src/app/`
- React components: No error boundary
- Worker: `src/core/compiler/client/index.ts`
- Client-side: No global error handler

## Problem Description
The application lacks comprehensive error handling at multiple levels:

### 1. API Routes - No Global Error Handler
```typescript
// Example from src/api/courses/index.ts
export async function getLesson(...) {
  const payload = await getPayload({ config })
  // No try/catch - if payload fails, request crashes
  const courseQuery = await payload.find({...})
}
```

### 2. Worker Timeout - No Cleanup
```typescript
// src/core/compiler/client/index.ts:57-62
setTimeout(() => {
  if (pendingMessages.has(id)) {
    pendingMessages.delete(id)
    reject(new Error('Execution timeout'))
    // Worker is not cleaned up, pending messages remain
  }
}, 30000)
```

### 3. No React Error Boundary
- If any component throws an error, entire app crashes
- No graceful degradation
- Poor user experience

### 4. No Global Error Logging
- Errors are only logged to console
- No error tracking (Sentry, etc.)
- Production errors are lost

## Impact
- **Users**: See raw error screens or blank pages
- **Developers**: Cannot debug production issues
- **Stability**: Single error can crash entire application
- **Support**: No visibility into user-facing errors

## Expected Behavior

### 1. API Middleware
Create `src/middleware/errorHandler.ts`:
```typescript
export function withApiErrorHandler(handler: Function) {
  return async (req: Request, res: Response) => {
    try {
      return await handler(req, res)
    } catch (error) {
      console.error('API Error:', error)
      return Response.json(
        { error: 'Internal server error', message: error.message },
        { status: 500 }
      )
    }
  }
}
```

### 2. React Error Boundary
Create `src/components/error-boundary.tsx`:
```typescript
export class ErrorBoundary extends React.Component {
  // Catch component errors, show fallback UI
  // Log errors to error tracking service
}
```

### 3. Worker Cleanup
```typescript
// Clear pending messages on timeout
// Optionally terminate and recreate worker
```

### 4. Error Tracking
- Integrate Sentry or similar
- Log all errors with context
- Track error rates and patterns

## Labels
`major` `stability` `error-handling` `user-experience` `technical-debt`

## Related Issues
- #021 - Add structured logging

## Steps to Fix
1. Add error boundary to `src/app/(frontend)/layout.tsx`
2. Create API error handler middleware
3. Wrap all API routes with error handler
4. Fix worker timeout cleanup
5. Integrate error tracking (Sentry)
6. Add error handling tests

## Additional Context
This is a foundational issue that affects production reliability. Should be addressed before public launch.

## References
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
