# Console with Tabs Component

## What

Extended Console component with two tabs: "Terminal" (existing) and "Tests" (new submission/results view).

## Why

- **Unified Interface**: Single panel for both terminal output and test results
- **Clean UX**: Users don't need to leave the IDE to see results
- **Space Efficient**: Reuses existing collapsible panel infrastructure

## How

### Component Implementation

**File:** `src/core/ide/components/console.tsx`

```typescript
"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp, Terminal as TerminalIcon, Beaker } from "lucide-react"
import { useIDEStore } from "@/core/ide/stores/use-ide-store"
import { cn } from "@/lib/utils"
import { TerminalContent } from "./terminal-content"
import { TestsContent } from "./tests-content"

interface ConsoleProps {
  isCollapsed: boolean
  onToggle: () => void
  challengeData?: any
}

type ConsoleTab = 'terminal' | 'tests'

export const Console = ({ isCollapsed, onToggle, challengeData }: ConsoleProps) => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('terminal')
  const activeConsoleTab = useIDEStore((state) => state.activeConsoleTab)
  const setConsoleTab = useIDEStore((state) => state.setConsoleTab)

  // Sync local state with store
  React.useEffect(() => {
    setActiveTab(activeConsoleTab)
  }, [activeConsoleTab])

  const handleTabChange = (tab: ConsoleTab) => {
    setActiveTab(tab)
    setConsoleTab(tab)
  }

  return (
    <div
      className="flex flex-col h-full bg-background overflow-hidden font-mono border-t"
    >
      {/* Header with tabs and toggle */}
      <div
        onDoubleClick={onToggle}
        className="h-10 border-b flex items-center justify-between px-4 shrink-0 cursor-pointer select-none hover:bg-muted/50 transition-colors"
      >
        {/* Tab Buttons */}
        <div className="flex items-center gap-4">
          {/* Terminal Tab */}
          <button
            onClick={() => handleTabChange('terminal')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors",
              activeTab === 'terminal'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TerminalIcon className="w-3 h-3" />
            <span>Terminal</span>
          </button>

          {/* Tests Tab */}
          <button
            onClick={() => handleTabChange('tests')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors",
              activeTab === 'tests'
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Beaker className="w-3 h-3" />
            <span>Tests</span>
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
        >
          {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {activeTab === 'terminal' && <TerminalContent />}
          {activeTab === 'tests' && <TestsContent challengeData={challengeData} />}
        </div>
      )}
    </div>
  )
}
```

### Terminal Content (Existing)

**File:** `src/core/ide/components/terminal-content.tsx` (extracted from console.tsx)

```typescript
"use client"

import React, { useState, useRef, useEffect } from "react"
import { useIDEStore } from "@/core/ide/stores/use-ide-store"
import { cn } from "@/lib/utils"

export const TerminalContent = () => {
  const { terminalLines, executeCommand, commandHistory, historyIndex, setHistoryIndex, files, currentFolderId } = useIDEStore()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [terminalLines])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
      setInput("")
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = historyIndex + 1
      if (nextIndex < commandHistory.length) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = historyIndex - 1
      if (nextIndex >= 0) {
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex])
      }
      else {
        setHistoryIndex(-1);
        setInput("")
      }
    }
  }

  return (
    <div className="flex flex-col h-full p-2 text-[12px] overflow-hidden">
      {/* Terminal Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 mb-2">
        {terminalLines.map((line, i) => (
          <div
            key={i}
            className={cn(
              "break-all",
              line.type === 'command' && "text-muted-foreground",
              line.type === 'output' && "text-emerald-500",
              line.type === 'error' && "text-destructive"
            )}
          >
            {line.text}
          </div>
        ))}
      </div>

      {/* Input Line */}
      <div className="flex items-center gap-2 shrink-0 pb-1">
        <span className="text-primary font-bold">
          {(!currentFolderId ? "~" : files.find(f => f.id === currentFolderId)?.name)}
        </span>
        <span className="text-muted-foreground">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-foreground"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
```

### Tests Content (New)

**File:** `src/core/ide/components/tests-content.tsx`

```typescript
"use client"

import { useSubmitChallenge } from "@/hooks/api/challenges/use-submit-challenge"
import { TestResultsViewer } from "./test-results-viewer"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"

interface TestsContentProps {
  challengeData?: any
}

export const TestsContent = ({ challengeData }: TestsContentProps) => {
  const { submitChallenge, isSubmitting, data: testResults } = useSubmitChallenge()

  const handleSubmit = () => {
    if (!challengeData) {
      return // Could show error toast here
    }

    submitChallenge({
      userId: 'current-user-id', // This should come from auth
      lessonId: challengeData.lessonId,
      courseId: challengeData.courseId,
      challengeId: challengeData.id,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Submit Button Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-semibold">Test Results</h3>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !challengeData}
          size="sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Submit Code
            </>
          )}
        </Button>
      </div>

      {/* Test Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {!testResults ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground text-sm">
              {challengeData
                ? "Click 'Submit Code' to run tests"
                : "No challenge loaded"}
            </p>
          </div>
        ) : (
          <TestResultsViewer
            summary={testResults.summary}
            testResults={testResults.testResults}
            executionOutput={testResults.executionOutput}
          />
        )}
      </div>
    </div>
  )
}
```

## Usage

### In IDE Component

**File:** `src/core/ide/components/index.tsx`

```typescript
import { Console } from './console'
// ... other imports

export const IDE = ({ challengeData }: { challengeData?: any }) => {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full">
        {/* FileSystem */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <FileSystem />
        </ResizablePanel>

        <ResizableHandle />

        {/* Editor + Console */}
        <ResizablePanel defaultSize={80}>
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel defaultSize={70} minSize={30}>
              <Editor />
            </ResizablePanel>

            <ResizableHandle />

            {/* Console with challengeData */}
            <ResizablePanel
              ref={consolePanelRef}
              defaultSize={30}
              minSize={10}
            >
              <Console
                isCollapsed={isConsoleCollapsed}
                onToggle={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                challengeData={challengeData}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
```

## Styling

The tabs use these styles:

```css
/* Tab button styles */
.tab-button {
  @apply flex items-center gap-2;
  @apply text-[10px] font-bold uppercase tracking-wider;
  @apply transition-colors;
}

.tab-button.active {
  @apply text-foreground;
}

.tab-button.inactive {
  @apply text-muted-foreground;
  @apply hover:text-foreground;
}

/* Tab content area */
.tab-content {
  @apply flex-1 overflow-hidden;
}
```

## State Management

Tab state is stored in Zustand:

```typescript
// In store
activeConsoleTab: 'terminal' | 'tests'
setConsoleTab: (tab: 'terminal' | 'tests') => void

// Usage
const activeTab = useIDEStore((state) => state.activeConsoleTab)
const setTab = useIDEStore((state) => state.setConsoleTab)
```

## Keyboard Shortcuts

Add keyboard shortcuts to switch tabs:

```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Ctrl/Cmd + 1: Terminal
    if ((e.ctrlKey || e.metaKey) && e.key === '1') {
      e.preventDefault()
      setConsoleTab('terminal')
    }
    // Ctrl/Cmd + 2: Tests
    if ((e.ctrlKey || e.metaKey) && e.key === '2') {
      e.preventDefault()
      setConsoleTab('tests')
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

## Accessibility

Add ARIA attributes:

```typescript
<div
  role="tablist"
  className="flex items-center gap-4"
>
  <button
    role="tab"
    aria-selected={activeTab === 'terminal'}
    aria-controls="terminal-panel"
    onClick={() => handleTabChange('terminal')}
  >
    Terminal
  </button>

  <button
    role="tab"
    aria-selected={activeTab === 'tests'}
    aria-controls="tests-panel"
    onClick={() => handleTabChange('tests')}
  >
    Tests
  </button>
</div>

<div
  role="tabpanel"
  id="terminal-panel"
  aria-labelledby="terminal-tab"
  hidden={activeTab !== 'terminal'}
>
  <TerminalContent />
</div>

<div
  role="tabpanel"
  id="tests-panel"
  aria-labelledby="tests-tab"
  hidden={activeTab !== 'tests'}
>
  <TestsContent />
</div>
```

## Dependencies

- `@/core/ide/stores/use-ide-store` - State management
- `@/hooks/api/challenges/use-submit-challenge` - Submission hook
- `@/components/ui/button` - Button component
- `lucide-react` - Icons
- `@/lib/utils` - Utility functions (cn)

## Next Steps

- → [Go to Test Results Viewer](./test-results.md) to implement results display
- → [Go to Challenge IDE](../05-integration/challenge-ide.md) to integrate with parent component
