# Engineering Documentation

This directory contains engineering and architectural documentation for the Python Secrets platform.

## Documents

### [ARCHITECTURE.md](./ARCHITECTURE.md)
**Core Architecture Guide** - The comprehensive guide to the target architecture.

Covers:
- Directory structure and organization
- tRPC-like API design pattern
- Data layer separation (Queries & Mutations)
- Component organization patterns
- Type system centralization
- Migration guide from current to target structure
- Best practices and conventions

### [FUNCTIONAL_PROGRAMMING.md](./FUNCTIONAL_PROGRAMMING.md)
**Functional Programming Guidelines** - Complete guide to functional programming approach.

Covers:
- Core functional programming principles (pure functions, immutability, composability)
- Algebraic Data Types (Maybe, Result, Try, Unit)
- Type definitions and utilities
- Common patterns and combinators
- Error handling without exceptions
- Real-world implementation examples
- Testing functional code
- Migration guide from imperative to functional

### [ERROR_HANDLING.md](./ERROR_HANDLING.md)
**Error Handling Strategy** - Comprehensive error handling and recovery strategy.

Covers:
- Current state analysis and problems identified
- Structured error taxonomy (Domain, Infrastructure, User errors)
- Functional error handling with Result types
- Recovery patterns (retry, circuit breaker, fallback)
- User communication with toast notifications
- React Error Boundaries implementation
- Logging, monitoring, and error tracking (Sentry)
- Testing strategy for error scenarios
- Complete migration guide from exceptions to functional errors

### [WHY_FUNCTIONAL_ERRORS.md](./WHY_FUNCTIONAL_ERRORS.md)
**Why Functional Error Handling is Superior** - In-depth analysis of functional vs native error handling.

Covers:
- Why native TypeScript/JavaScript Error handling is fundamentally flawed
- Problems with try/catch (no types, no composition, no pattern matching)
- How functional approach with algebraic data types solves these problems
- Comparative examples (native vs functional for 5+ real scenarios)
- Advanced patterns (error transformation, aggregation, context)
- Performance comparison (3.75x faster, less memory)
- Real-world benefits (compiler safety, refactoring, testing)
- The fundamental difference: exceptions vs error handling

### [TESTING.md](./TESTING.md)
**Testing Strategy with Functional Programming** - Comprehensive testing guide for functional code.

Covers:
- Testing philosophy: test outcomes not implementation
- Testing functional types (Maybe, Result, Try) with examples
- Testing server actions that return Result
- Testing TanStack Query hooks and mutations
- Testing React components with Maybe/Result
- Testing error scenarios and recovery patterns
- Property-based testing with fast-check
- Mocking strategy for functional code
- Anti-patterns to avoid
- Test coverage targets by feature

### [SECURITY.md](./SECURITY.md)
**Security Strategy** - Comprehensive security documentation for code execution and platform protection.

Covers:
- Current state analysis and identified vulnerabilities
- Rate limiting strategy (P0 critical for cost protection)
- Module blacklisting for dangerous Python modules
- Resource limits (timeout, memory, CPU)
- Code validation with Zod schemas
- Static analysis for dangerous patterns
- E2B sandbox security configuration
- Pyodide restrictions for client-side execution
- Abuse prevention (session tracking, cost tracking, anomaly detection)
- Monitoring and alerting (Sentry, cost alerts, health monitoring)
- Implementation roadmap (P0/P1/P2/P3 priorities)
- Security testing strategy
- Migration guide for existing code

## Purpose

The engineering documentation serves as:

1. **Architecture Blueprint**: Defines the target structure for the codebase
2. **Migration Guide**: Step-by-step instructions to refactor from current to target architecture
3. **Style Guide**: Enforces consistent patterns across the codebase
4. **Reference**: Quick lookup for established patterns and conventions

## Key Principles

### 1. Separation of Concerns
- **API** (`src/api/`): Server actions only
- **Queries** (`src/queries/`): Read operations with TanStack Query
- **Mutations** (`src/mutations/`): Write operations with TanStack Query
- **Hooks** (`src/hooks/`): UI-only logic
- **Components** (`src/components/`): Presentation and feature logic

### 2. tRPC-like API Structure
```typescript
api.courses.lessons.get({ courseSlug, chapterSlug, lessonSlug })
api.courses.progress.unlock({ userId, lessonId, courseId })
api.articles.getBySlug('my-article')
```

### 3. Feature-based Organization
Components are organized by feature, not by type:
```
features/
├── courses/     # All course-related components
├── articles/    # All article-related components
├── auth/        # All auth-related components
└── layout/      # Layout components
```

## Migration Status

- [ ] API layer reorganization
- [ ] Query hooks extraction
- [ ] Mutation hooks extraction
- [ ] Component reorganization by feature
- [ ] Type system centralization
- [ ] Removal of old structure

## Quick Start

Read [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Complete directory structure
- API design patterns with examples
- Query and mutation hook patterns
- Component organization templates
- Step-by-step migration guide

## Contributing

When making architectural changes:

1. Update this documentation first
2. Propose changes in a PR
3. Include examples of new patterns
4. Update the migration status checklist

---

**Last Updated:** 2026-01-24
**Maintainer:** Development Team
