# Major: Development Playground Exposed to Authenticated Users

## Priority
🟠 **Major** - Security & Cost

## Location
`src/app/(frontend)/(protected)/playground/page.tsx`

## Problem Description
A development/testing playground page is accessible to all authenticated users at `/playground`. This page provides:
- Direct access to both Python compilers (E2B and Pyodide)
- No rate limiting
- No usage tracking
- No access control beyond authentication

## Security Risks

### 1. Cost Attack (E2B API)
Users can:
- Run unlimited code execution requests
- Spawn unlimited E2B sandboxes
- Each execution costs money via E2B API
- Could exhaust API quota or run up large bills

### 2. Resource Abuse
- Continuous code execution attempts
- Fork bombs or infinite loops
- Memory exhaustion attacks
- CPU resource consumption

### 3. Information Disclosure
- Test infrastructure exposed
- Error messages may leak system details
- E2B API key potentially accessible (if misconfigured)

## Current Access Control
```typescript
// Located in (protected) route group
// Requires authentication, but no further restrictions
```

## Impact Scenarios

### Scenario 1: Automated Abuse
Malicious user writes script to:
1. Authenticate once
2. Hit `/playground` endpoint continuously
3. Execute expensive code
4. Exhaust E2B quota in minutes

### Scenario 2: Curious Users
Well-meaning users testing the playground:
- Each execution costs money
- No indication of cost
- No usage limits shown

## Recommended Solutions

### Option 1: Remove in Production (Recommended)
```typescript
// next.config.mjs or via build flag
export default buildConfig({
  // ... other config
  experimental: {
    disablePlayground: process.env.NODE_ENV === 'production'
  }
})
```

### Option 2: Admin Only Access
```typescript
// Add admin check
export default function PlaygroundPage() {
  const { user } = useAuth()
  if (user?.role !== 'admin') {
    return <div>Not Found</div>
  }
  // ... rest of component
}
```

### Option 3: Rate Limiting + Quotas
If keeping playground:
- Add rate limiting (max 10 executions per hour)
- Track usage per user
- Show remaining quota
- Add explicit cost warning

### Option 4: Separate Development Environment
- Keep playground only in development
- Use environment variable to hide in production
- Document in README

## Labels
`major` `security` `cost` `access-control` `rate-limiting`

## Related Issues
- #010 - No rate limiting on API
- #011 - Missing security headers

## Steps to Fix
1. **Immediate**: Add environment check to hide in production
2. **Short term**: Add admin-only access restriction
3. **Long term**: If keeping, add rate limiting and usage tracking

## Code Solution
```typescript
// src/app/(frontend)/(protected)/playground/page.tsx
import { redirect } from 'next/navigation'

export default function PlaygroundPage() {
  // Hide in production
  if (process.env.NODE_ENV === 'production') {
    redirect('/courses')
  }

  // Or require admin role
  // const { user } = useAuth()
  // if (user?.role !== 'admin') {
  //   return <div>Not Found</div>
  // }

  // ... existing playground code
}
```

## Additional Context
This feature is marked as "development-only, to be removed in production" in README.md:90 but is still accessible. This suggests it was meant to be temporary but wasn't properly gated.

## Documentation Update
Update `README.md` to clarify playground access:
```markdown
- ✅ Playground (development only - not accessible in production)
```
