# Minor: No API Versioning Strategy

## Priority
🟡 **Minor** - API Design & Maintainability

## Locations
- `src/app/(payload)/api/[...slug]/route.ts`
- `src/app/(frontend)/api/auth/[...all]/route.ts`
- All custom API routes

## Problem Description
API routes lack versioning, making future breaking changes difficult:

### Current API Structure
```
/api/compile           ← No version
/api/auth/*            ← Better Auth (no version)
/api/graphql           ← No version
/api/[*slug]           ← Payload API (no version)
```

## Issues

### 1. Breaking Changes Break Clients
```typescript
// Current
GET /api/lessons/:id
// Response: { id, title, slug, description }

// Future change - add difficulty
GET /api/lessons/:id
// Response: { id, title, slug, description, difficulty }

// Breaking change - remove description
GET /api/lessons/:id
// Response: { id, title, slug, difficulty }
// ↑ Existing clients expecting 'description' break
```

### 2. No Backward Compatibility
- Cannot maintain multiple API versions
- Forced to support old responses forever
- Or break existing clients

### 3. No Migration Path
- Clients don't know when API changes
- No deprecation warnings
- No grace period for migration

### 4. Testing Challenges
- Cannot test old vs new API versions
- Cannot run multiple versions in parallel

## Expected Behavior

### Option 1: URL Path Versioning (Recommended)
```
/api/v1/lessons/:id
/api/v2/lessons/:id
```

**Implementation:**
```typescript
// src/app/api/v1/lessons/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // v1 implementation
  return Response.json({ id, title, slug, description })
}

// src/app/api/v2/lessons/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // v2 implementation (breaking change)
  return Response.json({ id, title, slug, difficulty })
}
```

### Option 2: Header Versioning
```
GET /api/lessons/:id
Accept: application/vnd.python-secrets.v1+json
```

**Implementation:**
```typescript
export async function GET(request: Request) {
  const accept = request.headers.get('Accept')
  const version = accept?.match(/v(\d+)/)?.[1] || '1'

  if (version === '2') {
    return Response.json({ id, title, slug, difficulty })
  }
  return Response.json({ id, title, slug, description })
}
```

### Option 3: Query Parameter Versioning
```
/api/lessons/:id?v=2
```

## Recommendation: URL Path Versioning

### Directory Structure
```
src/app/api/
├── v1/
│   ├── compile/
│   │   └── route.ts
│   ├── lessons/
│   │   └── [id]/
│   │       └── route.ts
│   └── progress/
│       └── route.ts
├── v2/
│   ├── compile/
│   │   └── route.ts
│   └── lessons/
│       └── [id]/
│           └── route.ts
└── route.ts  ← Redirect /api to /api/v1
```

### Version Redirect
```typescript
// src/app/api/route.ts
export async function GET(request: Request) {
  return Response.redirect(new URL('/api/v1', request.url), 307)
}
```

### API Version Header
```typescript
// Add to all responses
headers.set('X-API-Version', 'v1')
headers.set('X-API-Latest', 'v2')
```

## Migration Strategy

### Phase 1: Add v1 Structure (Non-breaking)
```
Move existing routes to /api/v1/
Add redirect from /api to /api/v1
Keep old routes working for now
```

### Phase 2: Add v2 (Non-breaking)
```
Create /api/v2/ with new implementation
Both v1 and v2 work
```

### Phase 3: Deprecation Warning
```
Add deprecation header to v1:
X-API-Deprecated: true
X-API-Sunset: 2025-06-01
X-API-Alternative: /api/v2
```

### Phase 4: Remove v1
```
After sunset date, remove v1
Document breaking changes in changelog
```

## Labels
`minor` `api-design` `versioning` `backward-compatibility` `architecture`

## Related Issues
- #019 - No API documentation
- #033 - TypeScript not strict enough

## Steps to Fix
1. Create `/api/v1/` directory structure
2. Move existing routes to v1
3. Add redirect from `/api` to `/api/v1`
4. Document API versioning in API.md
5. Add version header to all responses
6. Plan for v2 when breaking changes needed

## API Documentation Update
Add to `docs/API.md`:
```markdown
## API Versioning

### Current Version: v1
Base URL: `/api/v1`

### Versioning Strategy
- URL path versioning: `/api/v1/`, `/api/v2/`, etc.
- Latest version: `/api` redirects to current stable
- Deprecated versions return warning headers
- See [API Migration Guide](./API_MIGRATION.md)
```

## Additional Context
This may seem premature for a new project, but establishing versioning early prevents pain later. The project already has multiple API consumers (web app, potentially mobile apps, etc.) and breaking changes will be needed.

## Version Compatibility
```typescript
// Semantic versioning for API
// MAJOR version = breaking changes
// MINOR version = additions, backward compatible
// PATCH version = bug fixes

v1.0.0 → v1.1.0  (add new field)  ✓ Backward compatible
v1.1.0 → v2.0.0  (remove field)   ✗ Breaking change
```

## Examples from Other Projects
- GitHub API: `https://api.github.com` (v3 is default)
- Stripe API: `https://api.stripe.com/v1`
- Slack API: `https://slack.com/api/v1`
