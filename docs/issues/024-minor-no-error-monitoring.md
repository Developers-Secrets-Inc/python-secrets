# Minor: No Error Monitoring (Sentry or Similar)

## Priority
🟡 **Minor** - Production Reliability

## Location
Application-wide - missing error tracking integration

## Problem Description
No automated error monitoring in production. Errors are only visible in browser console or server logs.

## Current State

### Client-Side Errors
```typescript
// Component throws error
function Component() {
  throw new Error("Something broke")
  // → Error visible only in browser console
  // → No server notification
  // → No user tracking
}
```

### Server-Side Errors
```typescript
// API route fails
export async function GET() {
  throw new Error("Database query failed")
  // → Error in server logs only
  // → Lost if logs rotate
  // → No alerting
}
```

## Issues

### 1. Invisible Errors
- User reports "it's broken"
- Developer asks "what error?"
- User says "I didn't see one"
- Developer has no information

### 2. No Error Context
```typescript
// Error logged but no context
console.error(error)
// No user info
// No request info
// No environment info
```

### 3. No Grouping
```typescript
// Same error from 100 users
// Logged 100 times
// Should be grouped as 1 issue
```

### 4. No Alerting
- Production errors silent
- Users notice before developers
- No SLA monitoring

### 5. Lost Errors
```typescript
// Browser console cleared on refresh
// Server logs rotated after 7 days
// Historical errors lost
```

## Expected Behavior

### Sentry Integration

#### Installation
```bash
pnpm add @sentry/nextjs
```

#### Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.1,  // 10% of sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of error sessions

  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['cookie']
      delete event.request.headers['authorization']
    }
    return event
  },
})
```

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,

  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Postgres(),
  ],
})
```

```typescript
// sentry.edge.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

#### Error Boundary
```typescript
// src/components/error-boundary.tsx
'use client'

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

#### Custom Context
```typescript
// Add user context
Sentry.setUser({
  id: userId,
  email: userEmail,
})

// Add custom context
Sentry.setContext("code_execution", {
  compiler: "server",
  language: "python",
  codeLength: code.length,
})

// Capture with extra data
Sentry.captureException(error, {
  tags: {
    action: "compile_code",
    compiler: "e2b",
  },
  extra: {
    codeSnippet: code.substring(0, 100),
    userId: userId,
  },
})
```

## Benefits

### 1. Real-Time Alerts
```typescript
// Error in production
// → Slack notification immediately
// → Email to on-call engineer
// → Jira ticket created
```

### 2. Error Grouping
```
Error: "Cannot read property 'id' of undefined"
  - Users affected: 47
  - Occurrences: 234
  - First seen: 2 hours ago
  - Last seen: 5 minutes ago
  - URL: /courses/python-basics/variables
```

### 3. Full Context
```
Error: Database query failed
User: john@example.com (ID: user_abc123)
Request: GET /api/lessons/42
Browser: Chrome 120 / macOS
Device: Desktop
Memory: 45MB used
Release: python-secrets@0.1.0
```

### 4. Session Replay
```typescript
// Watch user's session leading to error
// See exactly what they clicked
// Reproduce the issue easily
```

### 5. Performance Monitoring
```
Transaction: GET /api/lessons
  Duration: 245ms (p95)
  Database: 180ms
  Error rate: 0.5%
```

## Labels
`minor` `monitoring` `production` `errors` `reliability`

## Related Issues
- #005 - Missing error handling (complementary)
- #016 - No structured logging
- #025 - No metrics/observability

## Steps to Fix

### Phase 1: Setup
1. Create Sentry account (free tier available)
2. Create project in Sentry dashboard
3. Get DSN (Data Source Name)
4. Add DSN to `.env`

### Phase 2: Integration
5. Install `@sentry/nextjs`
6. Configure client/server/edge
7. Add error boundary
8. Test with intentional error

### Phase 3: Context
9. Add user context
10. Add request context
11. Add custom tags
12. Set up filtering

### Phase 4: Alerts
13. Configure Slack notifications
14. Set up email alerts
15. Define alert thresholds
16. Create on-call schedule

## Alternatives to Sentry

### Free Options
- **Sentry** (Free: 5k errors/month)
- **LogRocket** (Free trial)
- **Rollbar** (Free tier limited)
- **Bugsnag** (Free trial)

### Self-Hosted
- **Sentry Self-Hosted** (Docker)
- **GlitchTip** (Open source Sentry alternative)

### Simple Options
- **Discord webhook** (Free)
- **Slack webhook** (Free)
- **Email** (Free but noisy)

## Environment Variables
```env
# .env
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=your-org
SENTRY_PROJECT=python-secrets
```

## Testing
```typescript
// Test error tracking
<button
  onClick={() => {
    throw new Error("Test error")
  }}
>
  Test Sentry
</button>
```

## Documentation
Add to `docs/MONITORING.md`:
```markdown
## Error Monitoring

### Viewing Errors
Errors are automatically sent to Sentry and visible at:
https://sentry.io/organizations/[org]/projects/[project]/

### Reporting Issues
When reporting an error from Sentry, include:
- Sentry issue URL
- User affected
- Steps to reproduce (if known)
```

## Additional Context
Error monitoring is essential for production reliability. Without it, you're flying blind - you only know about errors users choose to report (which is ~1% of actual errors).

## Cost Considerations
- Sentry Free: 5,000 errors/month
- Sentry Paid: $26/month for 100k errors
- For a learning platform, expect 10-100 errors/day per 1,000 users

## Privacy Considerations
```typescript
// Don't send sensitive data
beforeSend(event) {
  // Remove
  delete event.request.headers.cookie
  delete event.user.email
  delete event.contexts.code.codeSnippet

  return event
}
```

## Best Practices
1. **Filter noise**: Don't send 404s from bots
2. **Add context**: User, request, environment
3. **Set alerts**: Critical errors wake someone up
4. **Review regularly**: Weekly triage of new issues
5. **Close issues**: Mark resolved when deployed

## References
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Boundary Pattern](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
