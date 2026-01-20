# Minor: No Structured Logging Framework

## Priority
🟡 **Minor** - Observability & Debugging

## Locations
Throughout codebase - any place using `console.log`

## Problem Description
The application uses `console.log` for logging instead of a proper structured logging framework:

### Current State
```typescript
// Debug logging (should be removed)
console.log(userId)  // src/api/courses/index.ts:124

// Error handling (should use logger)
catch (error) {
  console.error('Error:', error)
}

// No context, no structured data
console.log('Lesson fetched', lessonId)
```

## Issues with Console Logging

### 1. No Log Levels
```typescript
console.log()        // Info?
console.error()      // Error?
console.warn()       // Warning?
// No debug, trace, fatal levels
```

### 2. No Structured Data
```typescript
console.log('Lesson', lessonId, 'for user', userId)
// Hard to parse, search, or analyze
```

### 3. No Context/Metadata
```typescript
console.log(error)
// No request ID, no timestamp, no user context
```

### 4. Production Issues
- Logs lost in browser console
- No central log aggregation
- Can't filter/search logs
- No log rotation
- Performance impact

### 5. Development Issues
- Inconsistent format
- Hard to debug
- No stack traces in production

## Expected Behavior

### 1. Structured Logger
Create `src/lib/logger.ts`:
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  redact: ['userId', 'email', 'apiKey'], // Redact sensitive data
})
```

### 2. Usage Examples
```typescript
// Instead of console.log
logger.info({ lessonId, userId }, 'Lesson fetched')

// Instead of console.error
logger.error({ error, lessonId }, 'Failed to fetch lesson')

// Debug logging (removed in production)
logger.debug({ files, entryPoint }, 'Compiling project')

// Request context
logger.info({ requestId, userId, method, path }, 'Incoming request')
```

### 3. Request Context Middleware
```typescript
// middleware/logger.ts
import { v4 as uuidv4 } from 'uuid'

export function withLoggerContext(handler: Function) {
  return async (req: Request) => {
    const requestId = uuidv4()
    const logger = pino({ base: { requestId } })

    try {
      return await handler(req)
    } catch (error) {
      logger.error({ error, requestId }, 'Request failed')
      throw error
    }
  }
}
```

### 4. Log Output Examples
```json
// Development (pretty printed)
[10:30:45 Z] INFO (12345): Lesson fetched
    lessonId: 42
    userId: "user_abc"

// Production (JSON)
{"level":"info","time":1698767845123,"msg":"Lesson fetched","lessonId":42,"userId":"user_abc","requestId":"req-xyz"}
```

## Benefits

### Development
- Pretty-printed logs
- Color-coded by level
- Easy to read
- Stack traces on errors

### Production
- JSON structured logs
- Easy to parse and search
- Log aggregation ready
- Performance optimized

### Observability
- Request tracing
- Error tracking
- Performance monitoring
- User journey tracking

## Labels
`minor` `logging` `observability` `developer-experience` `monitoring`

## Related Issues
- #006 - Debug console.log in production
- #005 - Missing error handling
- #024 - No monitoring

## Steps to Fix

### Phase 1: Setup
1. Install `pino` and `pino-pretty`
2. Create `src/lib/logger.ts`
3. Set up log levels

### Phase 2: Integration
4. Add request context middleware
5. Update error handlers to use logger
6. Replace all console.log with logger

### Phase 3: Production
7. Configure log aggregation (optional)
8. Set up log rotation
9. Add sensitive data redaction

### Phase 4: Monitoring
10. Integrate with error tracking
11. Add performance metrics
12. Create log dashboards

## Recommended Libraries
- `pino` - Fast JSON logger (recommended)
- `winston` - Feature-rich transport-based logger
- `roarr` - Structured logging with context

## Configuration
```typescript
// Add to .env.example
LOG_LEVEL=debug  # debug | info | warn | error
LOG_PRETTY=true  # Pretty print in development
```

## ESLint Rule
```javascript
// eslint.config.mjs
{
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="console"][callee.property.name=/^(log|debug|info)$/]',
        message: 'Use logger instead of console.log'
      }
    ]
  }
}
```

## Log Levels Guide
```
trace: Very detailed logging (development only)
debug: Debugging information
info: General informational messages
warn: Warning messages
error: Error messages
fatal: Critical errors requiring immediate attention
```

## Additional Context
Structured logging is foundational for observability. Once implemented, it enables:
- Log aggregation (ELK, Loki, etc.)
- Error tracking (Sentry integration)
- Performance monitoring
- Compliance auditing

## Migration Path
1. Add logger alongside console.log (safe)
2. Gradually replace console.log
3. Add lint rule to prevent new console.log
4. Remove all console.log in final phase
