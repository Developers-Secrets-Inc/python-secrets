# Major: No Rate Limiting on API Routes

## Priority
🟠 **Major** - Security & Cost

## Locations
- All API routes in `src/app/`
- Server actions in `src/api/`
- Code execution endpoints

## Problem Description
The application has **no rate limiting** on any API endpoints, including:

### Critical Endpoints Without Rate Limiting

1. **Code Execution** (Most Critical)
   - `POST /api/compile` (if exists)
   - Server actions using `compileCode()` and `compileProject()`
   - Each execution may spawn an E2B sandbox ($)
   - Can be called unlimited times

2. **Authentication**
   - `POST /api/auth/*` (Better Auth endpoints)
   - Brute force attacks possible
   - Password reset abuse

3. **Progress Updates**
   - `updateProgress()` in `src/api/courses/index.ts`
   - Can be spammed to update progress
   - Database write abuse

4. **Data Fetching**
   - All GET endpoints
   - Can be scraped
   - Database load abuse

## Attack Scenarios

### Scenario 1: E2B Cost Attack
```javascript
// Attacker script
while (true) {
  await fetch('/api/compile', {
    method: 'POST',
    body: JSON.stringify({ code: 'while True: pass' })
  })
}
```
**Impact**: Exhaust E2B quota in minutes, potentially thousands of dollars in costs.

### Scenario 2: Database Load
```javascript
// Spam progress updates
for (let i = 0; i < 10000; i++) {
  await fetch('/api/progress', {
    method: 'POST',
    body: JSON.stringify({ status: 'completed' })
  })
}
```
**Impact**: Database overload, slow queries, potential downtime.

### Scenario 3: Auth Brute Force
```javascript
// Try password combinations
const passwords = loadPasswordList()
for (const pwd of passwords) {
  await fetch('/api/auth/sign-in', {
    method: 'POST',
    body: JSON.stringify({ email: 'victim@example.com', password: pwd })
  })
}
```

## Expected Behavior

### 1. Code Execution - Strict Rate Limit
```typescript
// Max 10 executions per minute per user
// Max 50 executions per hour per user
// Max 1000 executions per day globally
```

### 2. Authentication - Tiered Rate Limit
```typescript
// Sign in: 5 attempts per 5 minutes per IP
// Sign up: 3 attempts per hour per IP
// Password reset: 3 attempts per day per email
```

### 3. General API - Standard Rate Limit
```typescript
// 100 requests per minute per user
// 1000 requests per minute per IP (for unauthenticated)
```

## Implementation Options

### Option 1: Next.js Middleware (Recommended)
```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return new Response('Too Many Requests', { status: 429 })
  }
}
```

### Option 2: Express/Route Handler
```typescript
// src/lib/rate-limit.ts
import rateLimit from 'express-rate-limit'

export const codeExecutionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: 'Too many code executions, please try again later',
})

// Apply to routes
router.post('/compile', codeExecutionLimiter, handler)
```

### Option 3: Database-backed (Payload)
```typescript
// Store rate limit data in Payload collection
// Works without external services
// Slower but self-contained
```

## Labels
`major` `security` `cost` `rate-limiting` `api`

## Related Issues
- #008 - Playground exposed (adds urgency)
- #011 - Missing security headers

## Steps to Fix

### Phase 1: Immediate (Critical)
1. Add rate limiting to code execution endpoints
2. Use Upstash Redis or similar (has free tier)
3. Set strict limits: 10/minute per user

### Phase 2: Authentication
4. Add rate limiting to auth endpoints
5. Implement progressive delays
6. Add IP-based blocking for repeated failures

### Phase 3: General API
7. Add general rate limiting middleware
8. Different limits for authenticated vs anonymous
9. Add rate limit headers to responses

### Phase 4: Monitoring
10. Log rate limit violations
11. Alert on suspicious patterns
12. Dashboard for rate limit metrics

## Rate Limit Response Headers
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1638360000
```

## Error Response
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45,
  "limit": 10,
  "window": "1m"
}
```

## Recommended Libraries
- `@upstash/ratelimit` - Redis-based, edge-ready
- `express-rate-limit` - Express middleware
- `rate-limiter-flexible` - Framework agnostic

## Additional Context
This is critical given the E2B integration. Each code execution has a direct cost. Without rate limiting, a single malicious user could cause significant financial damage.

## Cost Calculation
If E2B costs $0.01 per execution:
- Without rate limiting: 10,000 executions = $100
- With rate limiting (10/min): Max 14,400/day = $144/day worst case
- But per-user limits prevent this

## Testing
```typescript
// tests/int/rate-limit.int.spec.ts
describe('Rate Limiting', () => {
  it('should allow requests within limit')
  it('should block requests over limit')
  it('should reset after window expires')
  it('should have independent limits per user')
})
```
