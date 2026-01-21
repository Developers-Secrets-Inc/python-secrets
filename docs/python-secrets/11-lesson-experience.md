# Lesson Experience

## Layout Design

### LeetCode-Style Split Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Python: Decorators Deep Dive                   │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │                                      │
│  CONTENT (Left Panel)        │   CODE EDITOR (Right Panel)          │
│                              │                                      │
│  ┌────────────────────┐     │   ┌────────────────────────────┐    │
│  │ Theory &           │     │   │ def solve():               │    │
│  │ Explanations       │     │   │     # Your code here        │    │
│  │                    │     │   │     pass                   │    │
│  │ Decorators are...  │     │   │                            │    │
│  │                    │     │   │                            │    │
│  │ Example:           │     │   │                            │    │
│  │ @decorator         │     │   │                            │    │
│  │ def func():        │     │   │                            │    │
│  │     pass           │     │   │                            │    │
│  │                    │     │   │                            │    │
│  │ Task: Implement    │     │   │ [RUN]   [SUBMIT]           │    │
│  │ a caching decorator│     │   │                            │    │
│  └────────────────────┘     │   └────────────────────────────┘    │
│                              │                                      │
│  ✓ Mark Complete             │   Output:                           │
│                              │   [Execution results appear here]   │
│                              │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

## Left Panel: Content

### Components

1. **Title & Navigation**
   - Lesson title
   - Progress indicator (Lesson 3 of 10)
   - Previous/Next buttons

2. **Theory & Explanations**
   - Concept explanations
   - Code examples with syntax highlighting
   - Diagrams where helpful
   - Best practices

3. **Task Instructions**
   - Clear problem statement
   - Input/output specifications
   - Constraints
   - Examples

4. **Progress Actions**
   - "Mark Complete" button
   - "Next Lesson" button (unlocks after completion)

## Right Panel: Code Editor

### Components

1. **Monaco Editor**
   - Full-featured code editor
   - Python syntax highlighting
   - Auto-completion
   - Line numbers
   - Error highlighting

2. **File Tabs** (for multi-file projects)
   - `main.py` (default)
   - `solution.py`
   - `test_cases.py`

3. **Action Buttons**
   - **RUN**: Execute code and see output
   - **SUBMIT**: Submit solution for validation
   - **RESET**: Reset to starter code

4. **Output Console**
   - stdout display
   - stderr for errors
   - Execution time
   - Memory usage (for optimization lessons)

## Lesson Types

### 1. Theory Lessons
```
Left: Explanations + Examples
Right: Interactive code playground
Goal: Understanding concepts
```

### 2. Practice Lessons
```
Left: Task description + examples
Right: Code editor with starter code
Goal: Apply concepts learned
```

### 3. Challenge Lessons
```
Left: Problem statement (LeetCode style)
Right: Code editor + test cases
Goal: Problem-solving skills
```

## Responsive Behavior

### Desktop (> 1024px)
- Full side-by-side split
- Optimal reading + coding experience

### Tablet (768px - 1024px)
- Resizable panels
- Stacked option available

### Mobile (< 768px)
- Tabbed interface:
  - [Content] | [Code]
- User switches between reading and coding
- Sticky button to "Open Editor"

## Persistence & State

### Auto-Save
- Code saved automatically every 30 seconds
- On every successful run
- Restored when returning to lesson

### Progress Tracking
- Lesson marked complete when:
  - All tasks submitted successfully
  - User clicks "Mark Complete"
- Progress synced immediately

### Solution Access
- "View Solution" button (after attempting)
- Solutions unlock after:
  - 3 failed attempts, OR
  - 10 minutes spent on lesson, OR
  - Completing the lesson (for review)

## Accessibility

### Keyboard Navigation
- `Ctrl+Enter`: Run code
- `Ctrl+Submit`: Submit solution
- `Ctrl+1` / `Ctrl+2`: Switch between panels
- `Ctrl+/`: Toggle comments

### Font Sizing
- Adjustable font size in editor
- High contrast mode option
- Dyslexia-friendly font option

### Screen Reader Support
- Proper ARIA labels
- Semantic HTML structure
- Code announcements

## Lesson Metadata

### Display to User
- Estimated time: "15 minutes"
- Difficulty: "Intermediate"
- Prerequisites: "Functions, Closures"
- Progress: "3 of 10 completed"

### Internal Tracking
- Time spent per lesson
- Attempt count
- Common mistakes
- Completion rate
