# Minor: No API Documentation (OpenAPI/Swagger)

## Priority
🟡 **Minor** - Developer Experience & Integration

## Locations
- All API routes
- Server actions in `src/api/`

## Problem Description
The API lacks comprehensive documentation for external or internal consumers:

### Current State
- `docs/API.md` exists but likely incomplete
- No OpenAPI/Swagger spec
- No interactive API explorer
- No request/response examples
- No authentication documentation

### What's Missing

#### 1. Endpoint Documentation
```typescript
// src/api/courses/index.ts - No JSDoc
export async function getLesson({ courseSlug, chapterSlug, lessonSlug }) {
  // What does this return?
  // What errors can it throw?
  // What authentication is required?
}
```

#### 2. Type Documentation
```typescript
// Types exist but aren't documented
export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
  // What does empty stdout mean?
  // When is error present vs stderr?
}
```

#### 3. Authentication Documentation
- How to authenticate requests?
- What are the auth headers?
- How to refresh tokens?

#### 4. Rate Limiting
- What are the limits?
- What headers indicate limits?
- How to handle 429 responses?

## Expected Behavior

### 1. OpenAPI/Swagger Specification
Create `openapi.yaml`:
```yaml
openapi: 3.0.0
info:
  title: Python Secrets API
  version: 1.0.0
  description: Interactive Python learning platform API

servers:
  - url: http://localhost:3000/api/v1
    description: Development
  - url: https://python-secrets.com/api/v1
    description: Production

paths:
  /lessons/{id}:
    get:
      summary: Get lesson by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Lesson retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Lesson'
        '404':
          description: Lesson not found

components:
  schemas:
    Lesson:
      type: object
      properties:
        id:
          type: integer
        title:
          type: string
        slug:
          type: string
        description:
          type: string
        difficulty:
          type: string
          enum: [BEGINNER, INTERMEDIATE, ADVANCED]

  securitySchemes:
    cookieAuth:
      type: apiKey
      in: cookie
      name: session_token
```

### 2. JSDoc Comments
```typescript
/**
 * Get a lesson by its course, chapter, and lesson slugs
 *
 * @param params.lessonSlug - The URL-friendly identifier of the lesson
 * @param params.chapterSlug - The chapter containing the lesson
 * @param params.courseSlug - The course containing the chapter
 *
 * @returns The lesson with navigation info, or null if not found
 *
 * @throws {Error} When database connection fails
 *
 * @example
 * ```typescript
 * const lesson = await getLesson({
 *   courseSlug: 'python-basics',
 *   chapterSlug: 'variables',
 *   lessonSlug: 'intro-to-strings'
 * })
 * ```
 *
 * @authentication Requires user session
 * @rate-limit 100 requests per minute per user
 */
export async function getLesson(params: GetLessonParams) {
  // ...
}
```

### 3. Interactive API Explorer
Integrate Swagger UI or Scalar:
```typescript
// src/app/api/docs/route.tsx
import SwaggerUI from 'swagger-ui-react'
import spec from './openapi.yaml'

export default function APIDocs() {
  return <SwaggerUI spec={spec} />
}
```

Access at: `http://localhost:3000/api/docs`

### 4. Request/Response Examples
```typescript
/**
 * @example Request
 * GET /api/v1/lessons/intro-to-python
 * Cookie: session_token=abc123
 *
 * @example Response 200
 * {
 *   "lesson": {
 *     "id": 1,
 *     "title": "Introduction to Python",
 *     "slug": "intro-to-python",
 *     "difficulty": "BEGINNER",
 *     "description": "<p>Learn the basics...</p>"
 *   },
 *   "navigation": {
 *     "prev": null,
 *     "next": "/courses/python-basics/variables/data-types",
 *     "currentIndex": 0,
 *     "totalLessons": 42
 *   }
 * }
 *
 * @example Response 404
 * {
 *   "error": "Lesson not found",
 *   "code": "LESSON_NOT_FOUND"
 * }
 */
```

## Labels
`minor` `documentation` `api` `developer-experience` `openapi`

## Related Issues
- #018 - No API versioning
- #034 - Imports not optimized

## Steps to Fix

### Phase 1: Foundation
1. Install Swagger/OpenAPI tools
2. Create initial `openapi.yaml`
3. Document core endpoints (lessons, progress)

### Phase 2: Expansion
4. Add JSDoc to all API functions
5. Add authentication documentation
6. Add error response documentation

### Phase 3: Interactive Docs
7. Set up Swagger UI or Scalar
8. Add request/response examples
9. Add authentication examples

### Phase 4: Automation
10. Auto-generate OpenAPI from TypeScript types
11. Keep docs in sync with code
12. CI/CD validation of OpenAPI spec

## Recommended Tools
- `scalar` - Modern API documentation (recommended)
- `swagger-ui-react` - Classic Swagger UI
- `zod-to-openapi` - Generate OpenAPI from Zod schemas
- `openapi-typescript` - Generate TypeScript from OpenAPI

## Documentation Structure
```
docs/
├── API.md                 (Overview)
├── API_AUTHENTICATION.md  (Auth guide)
├── API_MIGRATION.md       (Version migration)
└── api/
    ├── openapi.yaml       (OpenAPI spec)
    └── examples/          (Request/response examples)
```

## API Documentation Template
```markdown
# API Reference

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Most endpoints require authentication. Include session cookie:
\`\`\`http
Cookie: session_token=your_token_here
\`\`\`

## Rate Limiting
- 100 requests per minute per user
- See headers for limit info:
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 95
  - `X-RateLimit-Reset`: 1638360000

## Errors
All errors return JSON:
\`\`\`json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
\`\`\`

### Common Error Codes
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error
```

## Additional Context
API documentation is critical for:
- Team onboarding
- External integrations
- Testing (reference for expected responses)
- Client SDK generation
- API stability

## Benefits
- **Self-service**: Developers can explore API themselves
- **Accurate**: Generated from code, stays in sync
- **Interactive**: Test endpoints directly from docs
- **Standard**: OpenAPI is industry standard
- **Tooling**: Can generate client SDKs

## References
- [OpenAPI Specification](https://swagger.io/specification/)
- [Scalar Docs](https://scalar.com/)
- [Zod to OpenAPI](https://github.com/AstroxNetwork/openapi-typescript)
