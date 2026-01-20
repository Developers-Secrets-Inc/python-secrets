# Major: Debug Console.log Left in Production Code

## Priority
🟠 **Major** - Code Quality & Security

## Location
`src/api/courses/index.ts:124`

## Problem Description
A debug `console.log()` statement was left in production code:

```typescript
export async function updateProgress({...}) {
  const payload = await getPayload({ config })

  console.log(userId)  // ← Debug statement in production

  const existing = await payload.find({...})
}
```

## Impact
- **Performance**: Unnecessary logging in production
- **Security**: Logs may contain sensitive user IDs
- **Noise**: Pollutes production logs
- **Memory**: Each log consumes memory
- **Anti-pattern**: Suggests poor code review process

## Why This Matters
In a production environment with thousands of users, this would log every progress update, which could:
1. Expose user activity patterns
2. Consume significant resources
3. Make legitimate debugging difficult
4. Potentially leak sensitive information

## Expected Behavior
1. Remove the debug statement:
```typescript
export async function updateProgress({...}) {
  const payload = await getPayload({ config })
  // console.log(userId)  // ← Remove this
  const existing = await payload.find({...})
}
```

2. Use a proper logger for production:
```typescript
import { logger } from '@/lib/logger'

export async function updateProgress({...}) {
  const payload = await getPayload({ config })
  logger.debug('Updating progress', { userId, lessonId, courseId })
  // ...
}
```

## Labels
`major` `code-quality` `security` `logging` `good-first-issue`

## Related Issues
- #021 - Add structured logging
- #007 - Add environment variable validation

## Prevention
To prevent this in the future:
1. Add ESLint rule: `no-console` in production
2. Set up pre-commit hooks to catch console statements
3. Use a proper logging library (pino, winston)
4. Code review checklist should include checking for debug statements

## ESLint Rule
Add to `eslint.config.mjs`:
```javascript
{
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn'
  }
}
```

## Steps to Fix
1. Remove the `console.log(userId)` statement
2. Search codebase for other `console.log` statements
3. Add ESLint no-console rule
4. Set up pre-commit hook
5. Consider adding structured logging

## Additional Context
While this seems minor, it's indicative of a larger issue: the codebase lacks proper logging infrastructure and code review processes.
