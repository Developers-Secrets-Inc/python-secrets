# Test Results Viewer Component

## What

Component to display test execution results with summary, individual test cards, and detailed output.

## Why

- **Clear Feedback**: Users see exactly which tests passed/failed
- **Detailed Errors**: Show error messages for failed tests
- **Visual Progress**: Summary card with score
- **Execution Time**: Display how long tests took

## How

### Component Implementation

**File:** `src/core/ide/components/test-results-viewer.tsx`

```typescript
"use client"

import React, { useState } from "react"
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { cn, formatTestDuration } from "@/lib/utils"
import type { TestResult, TestSummary } from "@/types/challenges"

interface TestResultsViewerProps {
  summary: TestSummary
  testResults: TestResult[]
  executionOutput?: string
}

export function TestResultsViewer({ summary, testResults, executionOutput }: TestResultsViewerProps) {
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())

  const toggleExpanded = (testId: string) => {
    setExpandedTests((prev) => {
      const next = new Set(prev)
      if (next.has(testId)) {
        next.delete(testId)
      } else {
        next.add(testId)
      }
      return next
    })
  }

  const allPassed = summary.passed === summary.total && summary.total > 0

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className={cn(
        "rounded-lg border p-4",
        allPassed ? "bg-green-50 border-green-200" :
        summary.failed > 0 ? "bg-red-50 border-red-200" :
        "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            ) : summary.failed > 0 ? (
              <XCircle className="h-8 w-8 text-red-600" />
            ) : (
              <AlertCircle className="h-8 w-8 text-gray-600" />
            )}

            <div>
              <h3 className={cn(
                "text-lg font-semibold",
                allPassed ? "text-green-900" :
                summary.failed > 0 ? "text-red-900" :
                "text-gray-900"
              )}>
                {allPassed ? "All tests passed!" : "Some tests failed"}
              </h3>
              <p className={cn(
                "text-sm",
                allPassed ? "text-green-700" :
                summary.failed > 0 ? "text-red-700" :
                "text-gray-700"
              )}>
                {summary.passed} of {summary.total} tests passed
                {summary.score > 0 && ` (${summary.score}% score)`}
              </p>
            </div>
          </div>

          {summary.total > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {summary.score}%
              </div>
              <div className="text-xs text-gray-500">Success Rate</div>
            </div>
          )}
        </div>
      </div>

      {/* Test Results List */}
      <div className="space-y-2">
        {testResults.map((test, index) => (
          <TestCard
            key={test.id}
            test={test}
            index={index}
            isExpanded={expandedTests.has(test.id)}
            onToggle={() => toggleExpanded(test.id)}
          />
        ))}
      </div>

      {/* Execution Output (if available) */}
      {executionOutput && (
        <div className="mt-4">
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Raw Output
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
              {executionOutput}
            </pre>
          </details>
        </div>
      )}
    </div>
  )
}

interface TestCardProps {
  test: TestResult
  index: number
  isExpanded: boolean
  onToggle: () => void
}

function TestCard({ test, index, isExpanded, onToggle }: TestCardProps) {
  const isPassed = test.status === 'passed'
  const isFailed = test.status === 'failed'
  const isError = test.status === 'error'

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        isPassed ? "border-green-200" :
        isFailed ? "border-red-200" :
        "border-gray-200"
      )}
    >
      {/* Card Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Status Icon */}
          {isPassed ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          ) : isFailed ? (
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          )}

          {/* Test Name */}
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">{test.name}</p>
            {test.description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {test.description}
              </p>
            )}
          </div>

          {/* Duration Badge */}
          <div className="text-xs text-muted-foreground">
            {formatTestDuration(test.duration)}
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t bg-muted/30 p-4">
          {/* Output or Error */}
          {test.output && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground mb-1">Output:</p>
              <pre className="text-xs bg-background border rounded p-2 overflow-x-auto">
                {test.output}
              </pre>
            </div>
          )}

          {test.error && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Error:</p>
              <pre className={cn(
                "text-xs bg-background border rounded p-2 overflow-x-auto",
                isError ? "text-red-700" : "text-amber-700"
              )}>
                {test.error}
              </pre>
            </div>
          )}

          {/* Test ID */}
          <p className="text-[10px] text-muted-foreground mt-2">
            Test ID: {test.id}
          </p>
        </div>
      )}
    </div>
  )
}
```

### Utility Function

**File:** `src/lib/utils.ts` (add to existing)

```typescript
/**
 * Format test duration for display
 */
export function formatTestDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}
```

## Usage Examples

### Basic Usage

```tsx
import { TestResultsViewer } from '@/core/ide/components/test-results-viewer'

function MyComponent() {
  const summary = { total: 3, passed: 2, failed: 1, score: 67 }
  const testResults = [
    { id: '1', name: 'test_add', status: 'passed', duration: 45 },
    { id: '2', name: 'test_subtract', status: 'passed', duration: 32 },
    { id: '3', name: 'test_multiply', status: 'failed', error: 'Expected 6, got 7', duration: 28 },
  ]

  return <TestResultsViewer summary={summary} testResults={testResults} />
}
```

### With Hook Integration

```tsx
import { TestResultsViewer } from '@/core/ide/components/test-results-viewer'
import { useSubmitChallenge } from '@/hooks/api/challenges/use-submit-challenge'

function TestsPanel({ challengeData }: { challengeData: any }) {
  const { submitChallenge, isSubmitting, data } = useSubmitChallenge()

  return (
    <div>
      <button onClick={() => submitChallenge({...})} disabled={isSubmitting}>
        Submit
      </button>

      {data && (
        <TestResultsViewer
          summary={data.summary}
          testResults={data.testResults}
          executionOutput={data.executionOutput}
        />
      )}
    </div>
  )
}
```

## Component Structure

```
TestResultsViewer
├── Summary Card
│   ├── Status Icon (CheckCircle2 | XCircle | AlertCircle)
│   ├── Title ("All tests passed!" | "Some tests failed")
│   ├── Subtitle ("2 of 3 tests passed")
│   └── Score Badge ("67%")
│
└── Test Cards (one per test)
    ├── Header (always visible)
    │   ├── Status Icon
    │   ├── Test Name
    │   ├── Duration Badge
    │   └── Expand/Collapse Icon
    │
    └── Expanded Content (when clicked)
        ├── Output (if any)
        ├── Error (if any)
        └── Test ID
```

## Color Scheme

| Status | Background | Border | Icon |
|--------|-----------|--------|------|
| **Passed** | `bg-green-50` | `border-green-200` | `text-green-600` |
| **Failed** | `bg-red-50` | `border-red-200` | `text-red-600` |
| **Error** | `bg-amber-50` | `border-amber-200` | `text-amber-600` |

Customize colors by changing Tailwind classes.

## Accessibility

The component uses semantic HTML:

```typescript
<button
  aria-label={`Test ${test.name} - ${test.status}`}
  aria-expanded={isExpanded}
  onClick={onToggle}
>
  {/* Test card content */}
</button>
```

Add ARIA live regions for dynamic updates:

```typescript
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {summary.passed} of {summary.total} tests passed
</div>
```

## Animations

Add smooth expand/collapse animation:

```css
/* In globals.css or component module */
.test-card-content {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Responsive Design

On mobile, adjust spacing:

```typescript
<div className={cn(
  "px-2 py-2 sm:px-4 sm:py-3", // Smaller padding on mobile
  "flex items-center gap-2 sm:gap-3" // Smaller gaps on mobile
)}>
  {/* Test card content */}
</div>
```

## Performance

For large test suites (20+ tests):

1. **Virtual Scrolling**
   ```typescript
   import { useVirtualizer } from '@tanstack/react-virtual'

   const virtualizer = useVirtualizer({
     count: testResults.length,
     getScrollElement: () => parentRef.current,
     estimateSize: () => 80, // Approximate height per test
   })
   ```

2. **Lazy Expansion**
   ```typescript
   // Only render expanded content for visible tests
   const shouldRenderContent = isExpanded && virtualizer.isVisible(index)
   ```

## Dependencies

- `@/types/challenges` - Type definitions
- `@/lib/utils` - Utility functions (cn, formatTestDuration)
- `lucide-react` - Icons (CheckCircle2, XCircle, AlertCircle, etc.)

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TestResultsViewer } from '@/core/ide/components/test-results-viewer'

describe('TestResultsViewer', () => {
  it('displays summary correctly', () => {
    const summary = { total: 2, passed: 2, failed: 0, score: 100 }
    const testResults = [
      { id: '1', name: 'test1', status: 'passed', duration: 100 }
    ]

    render(<TestResultsViewer summary={summary} testResults={testResults} />)

    expect(screen.getByText('All tests passed!')).toBeInTheDocument()
    expect(screen.getByText('2 of 2 tests passed')).toBeInTheDocument()
  })

  it('expands test card on click', () => {
    const summary = { total: 1, passed: 0, failed: 1, score: 0 }
    const testResults = [
      { id: '1', name: 'test1', status: 'failed', error: 'Test failed', duration: 100 }
    ]

    render(<TestResultsViewer summary={summary} testResults={testResults} />)

    const button = screen.getByRole('button', { name: /test1/i })
    fireEvent.click(button)

    expect(screen.getByText('Test failed')).toBeInTheDocument()
  })
})
```

## Variations

### Compact Mode

For smaller spaces, use compact cards:

```typescript
<TestCard
  test={test}
  compact={true} // Remove descriptions, smaller padding
/>
```

### With Retry Button

Add retry button for failed tests:

```typescript
{test.status === 'failed' && (
  <button
    onClick={() => retryTest(test.id)}
    className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
  >
    Retry
  </button>
)}
```

### With History

Show previous attempts:

```typescript
<TestCard test={test}>
  {isExpanded && test.previousAttempts && (
    <div className="mt-2 p-2 bg-gray-50 rounded">
      <p className="text-xs font-semibold">Previous attempts:</p>
      {test.previousAttempts.map((attempt, i) => (
        <div key={i} className="text-xs">
          Attempt {i + 1}: {attempt.status}
        </div>
      ))}
    </div>
  )}
</TestCard>
```

## Next Steps

- → [Go to Console Tabs](./console-tabs.md) to integrate with tests panel
- → [Go to Submissions Page](./submissions-page.md) for history view
