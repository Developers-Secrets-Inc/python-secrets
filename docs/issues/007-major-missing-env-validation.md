# Major: Missing Environment Variable Validation

## Priority
🟠 **Major** - Configuration & Reliability

## Locations
- `src/payload.config.ts:82`
- `src/lib/auth.ts:6`
- All API routes using environment variables

## Problem Description
Environment variables are used directly without validation:

```typescript
// src/payload.config.ts:82
secret: process.env.PAYLOAD_SECRET || '',

// src/lib/auth.ts:6
database: new Pool({
  connectionString: process.env.DATABASE_URL,
}),
```

## Impact
- **Crash on startup**: Missing required variables cause cryptic errors
- **Silent failures**: Empty strings (`|| ''`) allow app to start but fail later
- **Poor DX**: Errors appear at runtime instead of startup
- **Production risk**: Deploying with missing config is possible

## Current Behavior
If `DATABASE_URL` is missing:
1. App starts successfully (because of `|| ''`)
2. First database query fails with cryptic error
3. Developer must debug to find root cause

## Expected Behavior

### 1. Create Environment Validation
`src/lib/env.ts`:
```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Required
  DATABASE_URL: z.string().url(),
  PAYLOAD_SECRET: z.string().min(32),
  E2B_API_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Optional
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

export const env = envSchema.parse(process.env)
```

### 2. Use Validated Config
```typescript
// src/payload.config.ts
import { env } from '@/lib/env'

export default buildConfig({
  secret: env.PAYLOAD_SECRET,  // Now guaranteed to exist
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
    },
  }),
})
```

### 3. Early Validation
Create `src/lib/env.ts` that validates on import:
- Fails fast at startup
- Clear error messages
- Type-safe access to all env vars

## Labels
`major` `configuration` `reliability` `developer-experience` `type-safety`

## Related Issues
- #003 - Inconsistent .env.example
- #021 - Add structured logging

## Steps to Fix
1. Install `zod` if not present (already in package.json)
2. Create `src/lib/env.ts` with validation schema
3. Update all files to use validated env vars
4. Add .env template with all variables
5. Document each variable in docs/SETUP.md

## Benefits
- **Fail fast**: App won't start without proper config
- **Type safety**: All env vars are typed
- **Documentation**: Schema serves as documentation
- **IntelliSense**: Autocomplete for all env vars
- **Validation**: Zod ensures format correctness (URLs, etc.)

## Additional Context
This is a best practice for Node.js applications and should be one of the first things done when setting up a new project.
