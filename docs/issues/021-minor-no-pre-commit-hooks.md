# Minor: No Pre-commit Hooks or Code Quality Automation

## Priority
🟡 **Minor** - Code Quality & Team Workflow

## Location
Repository root - missing `.husky` directory and related config

## Problem Description
The project has no automated code quality checks before commits:

### Missing Automations

#### 1. Pre-commit Hooks
```bash
# No automated checks before commit
git commit -m "feat: add feature"
# Code with errors gets committed
```

#### 2. Linting on Commit
- TypeScript errors committed
- ESLint warnings committed
- Prettier formatting not applied

#### 3. Test Verification
- No tests run before commit
- Broken tests can be committed

#### 4. Commit Message Linting
- No enforced commit message format
- Inconsistent commit styles

## Issues

### 1. Broken Code in Repository
```typescript
// Can commit this
export function broken() {
  const x = und efined  // Syntax error
}
```

### 2. Inconsistent Formatting
```typescript
// Developer 1
const x = {a:1}

// Developer 2
const x = { a: 1 }
```

### 3. TypeScript Errors in Git History
- `git log` shows type errors
- Bisecting becomes difficult
- CI/CD fails after merge

### 4. Manual Review Required
- Must manually check code quality
- Wastes reviewer time
- Slow feedback loop

## Expected Behavior

### Pre-commit Setup
```bash
# Install husky
pnpm add -D husky lint-staged

# Initialize
pnpm husky init
```

### `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
```

### `package.json` Configuration
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Commit Message Linting
`.husky/commit-msg`:
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm commitlint --edit $1
```

`commitlint.config.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'test', 'chore', 'perf', 'ci', 'build'
    ]],
    'subject-case': [0]
  }
}
```

## Benefits

### For Developers
- Immediate feedback on code quality
- Automatic formatting
- Prevents bad commits
- Faster development

### For Reviewers
- Consistent code style
- Fewer nitpicks
- Focus on logic, not formatting
- Faster reviews

### For Project
- Clean git history
- Fewer CI failures
- Better code quality
- Professional workflow

## Labels
`minor` `tooling` `code-quality` `workflow` `automation`

## Related Issues
- #002 - Build errors ignored (pre-commit would catch)
- #006 - Debug console.log (pre-commit would catch)
- #012 - French comments (could warn)

## Steps to Fix

### Phase 1: Basic Hooks
1. Install husky and lint-staged
2. Set up pre-commit hook
3. Configure lint-staged
4. Test with intentional bad code

### Phase 2: Commit Messages
5. Install commitlint
6. Configure commit message rules
7. Add commit-msg hook

### Phase 3: Additional Checks
8. Run affected tests on commit
9. Check for console.log/debugger
10. Validate file sizes

### Phase 4: Team Onboarding
11. Document in contributing guide
12. Ensure hooks work for all platforms
13. Add to setup documentation

## Recommended Tools
```json
{
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "@commitlint/cli": "^19.0.0",
    "@commitlint/config-conventional": "^19.0.0"
  }
}
```

## Pre-commit Checklist
```typescript
// .husky/pre-commit
pnpm lint-staged

# What runs:
✓ ESLint with auto-fix
✓ Prettier formatting
✓ TypeScript check (optional, can be slow)
✓ No console.log or debugger
✓ File size limits
```

## Commit Message Format
```
feat: add user authentication
fix: resolve database connection error
docs: update API documentation
refactor: simplify compiler logic
test: add integration tests for lessons
chore: upgrade dependencies
```

## Verification
```bash
# Test hooks
echo "const x = und efined" > test.ts
git add test.ts
git commit -m "test: bad code"
# Should be rejected!

# Test commitlint
git commit -m "bad commit message"
# Should be rejected!
```

## Additional Context
Pre-commit hooks are a best practice for professional projects. They catch issues at the commit stage, preventing bad code from ever entering the repository. This is especially important for teams.

## Git Hooks vs CI/CD
```
Pre-commit hooks: Catch issues immediately (fast)
CI/CD: Catch issues after push (slow, but comprehensive)

Both needed for optimal workflow
```

## Documentation
Add to `CONTRIBUTING.md`:
```markdown
## Setting Up Pre-commit Hooks

After cloning:

\`\`\`bash
pnpm install
pnpm husky install
\`\`\`

Hooks will now run automatically on commit.
```

## Platform Considerations
Husky works on:
- ✅ Linux
- ✅ macOS
- ✅ Windows (Git Bash, WSL)
- ✅ CI/CD (automatically disabled)

## References
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
