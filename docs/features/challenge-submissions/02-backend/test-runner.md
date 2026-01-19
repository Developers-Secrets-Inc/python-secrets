# Test Runner Service

## What

A service that executes user code against predefined test cases and returns structured results.

## Why

- **Automated Testing**: Run multiple tests automatically
- **Isolation**: Each test runs independently
- **Structured Output**: Consistent result format for all tests
- **Error Capturing**: Catch and report test failures clearly

## How

### Test Runner Implementation

**File:** `src/core/testing/test-runner.ts`

```typescript
import { compileCode, compileProject, type Compiler, type ExecutionResult } from '@/core/compiler'
import type { ChallengeTest, ProjectFile, TestResult } from '@/types/challenges'

/**
 * Run tests against user code
 *
 * @param params - Test execution parameters
 * @returns Array of test results
 */
export async function runTests(params: {
  userFiles: ProjectFile[]
  tests: ChallengeTest[]
  entryPoint?: string
  compiler?: Compiler
}): Promise<TestResult[]> {
  const { userFiles, tests, entryPoint = 'main.py', compiler = 'client' } = params

  const results: TestResult[] = []

  for (const test of tests) {
    const startTime = Date.now()

    try {
      const result = await runSingleTest({
        userFiles,
        test,
        entryPoint,
        compiler,
      })

      results.push({
        id: test.id,
        name: test.name,
        description: test.description,
        ...result,
        duration: Date.now() - startTime,
      })
    } catch (error) {
      results.push({
        id: test.id,
        name: test.name,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown test error',
        duration: Date.now() - startTime,
      })
    }
  }

  return results
}

/**
 * Run a single test
 */
async function runSingleTest(params: {
  userFiles: ProjectFile[]
  test: ChallengeTest
  entryPoint: string
  compiler: Compiler
}): Promise<Pick<TestResult, 'status' | 'output' | 'error'>> {
  const { userFiles, test, entryPoint, compiler } = params

  // Build test script
  const testScript = buildTestScript({
    userFiles,
    testCode: test.testCode,
    entryPoint,
  })

  // Execute test
  const result = await compileCode(testScript, compiler)

  // Parse result
  return parseTestResult(result)
}

/**
 * Build test script that imports user code and runs tests
 */
function buildTestScript(params: {
  userFiles: ProjectFile[]
  testCode: string
  entryPoint: string
}): string {
  const { userFiles, testCode, entryPoint } = params

  // Build file imports
  const fileImports = userFiles
    .filter((f) => f.path !== `/${entryPoint}`)
    .map((file) => {
      const moduleName = file.path.replace('/', '').replace('.py', '')
      return `import imp
import sys
sys.path.insert(0, '/home/user')
${moduleName}_module = imp.load_source('${moduleName}', '${file.path}')
`
    })
    .join('\n')

  return `
import sys
import io
from contextlib import redirect_stdout, redirect_stderr

${fileImports}

# Capture output
stdout_capture = io.StringIO()
stderr_capture = io.StringIO()

try:
    with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
        # User code setup
        try:
            exec(open('${entryPoint}').read())
        except Exception as e:
            print(f"ERROR: Failed to execute user code: {e}", file=sys.stderr)
            sys.exit(1)

        # Test code
        ${testCode}

    # If we get here, test passed
    print("TEST_PASSED")

except AssertionError as e:
    print(f"TEST_FAILED: {e}", file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f"TEST_ERROR: {type(e).__name__}: {e}", file=sys.stderr)
    sys.exit(1)

# Get captured output
stdout_output = stdout_capture.getvalue()
stderr_output = stderr_capture.getvalue()

if stdout_output:
    print(f"OUTPUT: {stdout_output}")
if stderr_output and "TEST_" not in stderr_output:
    print(f"STDERR: {stderr_output}", file=sys.stderr)
  `
}

/**
 * Parse test execution result
 */
function parseTestResult(result: ExecutionResult): Pick<TestResult, 'status' | 'output' | 'error'> {
  const { stdout, stderr, error } = result

  // Check for execution error
  if (error) {
    return {
      status: 'error',
      error: error,
    }
  }

  // Check for test failure in stderr
  if (stderr.includes('TEST_FAILED')) {
    const errorMessage = stderr.replace('TEST_FAILED: ', '').trim()
    return {
      status: 'failed',
      error: errorMessage,
    }
  }

  // Check for test error
  if (stderr.includes('TEST_ERROR')) {
    const errorMessage = stderr.replace('TEST_ERROR: ', '').trim()
    return {
      status: 'error',
      error: errorMessage,
    }
  }

  // Check for pass
  if (stdout.includes('TEST_PASSED')) {
    const output = stdout
      .replace('TEST_PASSED', '')
      .replace('OUTPUT: ', '')
      .trim()
    return {
      status: 'passed',
      output: output || 'Test passed successfully',
    }
  }

  // Unknown result
  return {
    status: 'error',
    error: `Unexpected result: stdout=${stdout}, stderr=${stderr}`,
  }
}
```

### Alternative: pytest-based Runner

For more advanced testing, use pytest:

**File:** `src/core/testing/test-runner-pytest.ts` (optional)

```typescript
import { compileProject } from '@/core/compiler'
import type { ChallengeTest, ProjectFile, TestResult } from '@/types/challenges'

export async function runTestsWithPytest(params: {
  userFiles: ProjectFile[]
  tests: ChallengeTest[]
  compiler?: Compiler
}): Promise<TestResult[]> {
  const { userFiles, tests, compiler = 'server' } = params

  // Create test file
  const testFile: ProjectFile = {
    path: '/test_challenge.py',
    content: generatePytestFile(tests),
  }

  // Create pytest runner
  const runnerScript: ProjectFile = {
    path: '/run_tests.py',
    content: `
import pytest
import sys
import json

from test_challenge import *

# Run pytest programmatically
result = pytest.main(['-v', '--json-report', '--json-report-file=/tmp/test_results.json'])

sys.exit(result)
    `,
  }

  const allFiles = [...userFiles, testFile, runnerScript]

  // Execute
  const execResult = await compileProject(allFiles, 'run_tests.py', compiler)

  // Parse JSON output
  return parsePytestResults(execResult.stdout)
}

function generatePytestFile(tests: ChallengeTest[]): string {
  return tests.map((test) => test.testCode).join('\n\n')
}

function parsePytestResults(output: string): TestResult[] {
  try {
    const data = JSON.parse(output)
    return data.summary.map((test: any) => ({
      id: test.nodeid,
      name: test.nodeid,
      status: test.outcome,
      duration: test.duration * 1000,
      output: test.call?.longrepr || '',
    }))
  } catch {
    return []
  }
}
```

## Test Format

Tests should be Python code that uses assertions:

```python
# Example test from ChallengesExercices.tests
{
  "id": "test-1",
  "name": "test_addition",
  "description": "Test the add function",
  "testCode": """
def test_addition():
    result = add(2, 3)
    assert result == 5, f"Expected 5, got {result}"

def test_addition_negative():
    result = add(-2, -3)
    assert result == -5, f"Expected -5, got {result}"
  """,
  "timeout": 5000
}
```

### Best Practices for Test Code

1. **Use clear assertion messages**
   ```python
   assert result == 5, f"Expected 5, got {result}"
   ```

2. **Test edge cases**
   ```python
   def test_add_zero():
       assert add(5, 0) == 5

   def test_add_negative():
       assert add(-3, -4) == -7
   ```

3. **Test errors**
   ```python
   import pytest

   def test_division_by_zero():
       with pytest.raises(ZeroDivisionError):
           divide(10, 0)
   ```

4. **Use descriptive test names**
   ```python
   def test_addition_with_positive_numbers()  # Good
   def test_add()  # Less clear
   ```

## Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│  FOR EACH TEST in tests:                                     │
│                                                              │
│  1. BUILD TEST SCRIPT                                        │
│     - Import user code files                                │
│     - Wrap test execution with try/except                   │
│     - Capture stdout/stderr                                 │
│                                                              │
│  2. EXECUTE TEST                                             │
│     - Use compileCode() with test script                    │
│     - E2B or Pyodide                                        │
│     - Measure execution time                                │
│                                                              │
│  3. PARSE RESULT                                             │
│     - Check for TEST_PASSED in stdout                       │
│     - Check for TEST_FAILED in stderr                       │
│     - Check for TEST_ERROR in stderr                        │
│     - Extract output message                                │
│                                                              │
│  4. CREATE TEST RESULT                                       │
│     - id: test.id                                           │
│     - name: test.name                                       │
│     - status: 'passed' | 'failed' | 'error'                 │
│     - output/error: result message                          │
│     - duration: execution time in ms                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘

RETURN Array<TestResult>
```

## Timeout Handling

Each test should have a timeout to prevent infinite loops:

```typescript
export async function runTestsWithTimeout(params: {
  userFiles: ProjectFile[]
  tests: ChallengeTest[]
  compiler?: Compiler
}): Promise<TestResult[]> {
  const { tests, compiler = 'client' } = params

  const results = await Promise.all(
    tests.map((test) =>
      Promise.race([
        runSingleTest({ ...params, test }),
        timeoutAfter(test.timeout || 5000, test.id),
      ])
    )
  )

  return results
}

function timeoutAfter(ms: number, testId: string): Promise<TestResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: testId,
        name: 'Timeout',
        status: 'error',
        error: `Test exceeded ${ms}ms timeout`,
        duration: ms,
      })
    }, ms)
  })
}
```

## Error Handling

The test runner handles:

1. **Syntax Errors in User Code**
   - Caught during execution
   - Returned as error test result

2. **Runtime Errors in User Code**
   - Caught by try/except in test script
   - Returned as failed test result

3. **Test Runner Errors**
   - Caught and returned as error test result
   - Doesn't prevent other tests from running

4. **Timeout Errors**
   - Caught by timeout wrapper
   - Returned as error test result

## Performance

For large test suites (10+ tests):

- **Sequential**: Tests run one at a time (current implementation)
  - ✅ Simpler, more reliable
  - ✅ Clear error messages
  - ❌ Slower for many tests

- **Parallel**: Tests run concurrently (future enhancement)
  - ✅ Faster for many tests
  - ❌ More complex
  - ❌ Harder to debug

**Recommendation**: Start with sequential, optimize to parallel if needed.

## Test

### Unit Test

```typescript
import { describe, it, expect } from 'vitest'
import { runTests } from '@/core/testing/test-runner'

describe('runTests', () => {
  it('should run all tests and return results', async () => {
    const results = await runTests({
      userFiles: [
        {
          path: '/main.py',
          content: 'def add(a, b): return a + b',
        },
      ],
      tests: [
        {
          id: 'test-1',
          name: 'test_add',
          testCode: 'assert add(2, 3) == 5',
        },
      ],
    })

    expect(results).toHaveLength(1)
    expect(results[0].status).toBe('passed')
  })

  it('should handle test failures', async () => {
    const results = await runTests({
      userFiles: [
        {
          path: '/main.py',
          content: 'def add(a, b): return a - b',  // Bug!
        },
      ],
      tests: [
        {
          id: 'test-1',
          name: 'test_add',
          testCode: 'assert add(2, 3) == 5',
        },
      ],
    })

    expect(results[0].status).toBe('failed')
    expect(results[0].error).toContain('Expected')
  })
})
```

### Integration Test

Create a test challenge in Payload admin:
1. Create a challenge with simple tests
2. Run `submitChallenge` API
3. Verify test results match expected output

## Dependencies

- `@/core/compiler` - Code execution (`compileCode`, `compileProject`)
- `@/types/challenges` - Type definitions

## Next Steps

- → [Go to Submission API](./submission-api.md) to see how this is used
- → [Go to History API](./history-api.md) to implement submission retrieval
