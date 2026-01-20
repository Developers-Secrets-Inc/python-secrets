# Major: No Tests for Critical Compiler Functions

## Priority
🟠 **Major** - Quality & Reliability

## Locations
- `src/core/compiler/server/index.ts` - E2B compiler
- `src/core/compiler/client/index.ts` - Pyodide compiler
- `src/core/compiler/client/worker.ts` - Web worker
- `src/api/courses/index.ts` - Course API

## Problem Description
The most critical and complex functions in the application have **zero test coverage**:

### Untested Critical Functions

1. **`compileCode()`** - Executes arbitrary Python code
   - Two implementations (server/client)
   - No tests for success cases
   - No tests for error handling
   - No tests for timeout scenarios
   - No tests for security edge cases

2. **`compileProject()`** - Multi-file Python projects
   - Complex file handling
   - No tests for file structure validation
   - No tests for entry point resolution
   - No tests for import path handling

3. **Worker Communication** - Message passing
   - No tests for pending messages
   - No tests for timeout handling
   - No tests for worker initialization

4. **API Functions**
   - `getLesson()` - Complex nested data fetching
   - `updateProgress()` - User progress mutations
   - `getCourseProgress()` - Progress calculation

### Current Test Coverage
```
tests/
├── int/api.int.spec.ts     (1 integration test file)
└── e2e/frontend.e2e.spec.ts (1 e2e test file)
```

## Impact

### 1. Code Quality Risks
- Refactoring is unsafe (no safety net)
- Bugs may be introduced unnoticed
- regressions occur frequently

### 2. Security Risks
- Compiler functions execute user code
- No tests for malicious input handling
- No tests for resource exhaustion

### 3. Development Velocity
- Manual testing required for every change
- Fear of touching complex code
- Slow development cycle

### 4. Edge Cases Untested
- What happens if Pyodide fails to load?
- What happens if E2B API times out?
- What happens with circular file imports?
- What happens with very large code snippets?

## Expected Test Coverage

### Unit Tests (New)
`tests/unit/compiler/server.test.ts`:
```typescript
describe('Server Compiler', () => {
  it('should execute simple code')
  it('should handle syntax errors')
  it('should handle runtime errors')
  it('should timeout after configured duration')
  it('should clean up sandbox after execution')
  it('should handle E2B API failures')
})
```

`tests/unit/compiler/client.test.ts`:
```typescript
describe('Client Compiler', () => {
  it('should initialize worker')
  it('should execute code in browser')
  it('should handle worker timeout')
  it('should cleanup pending messages')
  it('should handle multiple concurrent executions')
})
```

### Integration Tests (Expand)
`tests/int/compiler.int.spec.ts`:
```typescript
describe('Compiler Integration', () => {
  it('should execute same code on both compilers')
  it('should handle multi-file projects')
  it('should handle missing entry point')
  it('should handle file read/write operations')
})
```

### API Tests (Expand)
`tests/int/api.test.ts`:
```typescript
describe('Course API', () => {
  it('should get lesson with navigation')
  it('should update progress')
  it('should calculate course progress correctly')
  it('should handle missing lessons')
  it('should handle invalid user IDs')
})
```

## Labels
`major` `testing` `quality` `technical-debt` `compiler`

## Related Issues
- #005 - Missing error handling
- #010 - No rate limiting (tests needed)

## Steps to Fix

### Phase 1: Foundation
1. Set up test utilities (mock E2B, mock Pyodide)
2. Add test coverage reporting
3. Configure CI to run tests

### Phase 2: Critical Paths
4. Add tests for `compileCode()` (both implementations)
5. Add tests for `compileProject()` (both implementations)
6. Add tests for worker communication

### Phase 3: API Tests
7. Add tests for all API functions in `src/api/courses/`
8. Add tests for progress tracking
9. Add tests for engagement functions

### Phase 4: Edge Cases
10. Add security-focused tests (malicious code)
11. Add performance tests (large inputs)
12. Add failure scenario tests (network failures)

## Test Metrics Goals
- **Current**: ~5% (only 2 test files)
- **Target**: 80%+ coverage on critical paths
- **Minimum**: All compiler functions fully tested

## Additional Context
This is the most dangerous technical debt in the project. The compiler functions are the core value proposition and are completely untested. A single bug here affects all users.

## References
- [Vitest Testing Library](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/react)
- [Playwright E2E](https://playwright.dev/)
