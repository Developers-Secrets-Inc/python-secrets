# Challenges System

## Overview

**LeetCode-style challenges, specifically for Python**

## Challenge Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Challenge: Two Sum                               │
│                    Difficulty: Medium 🔵                            │
├──────────────────────────────┬──────────────────────────────────────┤
│                              │                                      │
│  DESCRIPTION (Left)          │   CODE EDITOR (Right)                │
│                              │                                      │
│  ┌────────────────────┐     │   ┌────────────────────────────┐    │
│  │ Problem            │     │   │ def two_sum(nums, target):  │    │
│  │                    │     │   │     # Your code here        │    │
│  │ Given an array of  │     │   │     pass                   │    │
│  │ integers nums and  │     │   │                            │    │
│  │ an integer target, │     │   │                            │    │
│  │ return indices...  │     │   │                            │    │
│  │                    │     │   │                            │    │
│  │ Examples:          │     │   │                            │    │
│  │ Input: [2,7,11,15]│     │   │                            │    │
│  │ Target: 9         │     │   │                            │    │
│  │ Output: [0,1]     │     │   │                            │    │
│  │                    │     │   │                            │    │
│  │ Constraints:       │     │   │ [RUN]   [SUBMIT]           │    │
│  │ • 2 <= nums.length│     │   │                            │    │
│  │   <= 10^4         │     │   └────────────────────────────┘    │
│  │ • ...             │     │                                      │
│  └────────────────────┘     │   Test Cases:                       │
│                              │   ✓ Test Case 1 (0.02s)            │
│  ┌────────────────────┐     │   ✓ Test Case 2 (0.01s)            │
│  │ Hint 1             │     │   ✓ Test Case 3 (0.03s)            │
│  │ [Show Hint]        │     │   ✗ Test Case 4: Wrong Answer      │
│  └────────────────────┘     │   Expected: [0,1]                   │
│                              │   Got: [1,0]                        │
│  ┌────────────────────┐     │                                      │
│  │ Solution           │     │   Complexity:                       │
│  │ [View Solution]    │     │   Time: O(n)                        │
│  └────────────────────┘     │   Space: O(n)                       │
│                              │                                      │
└──────────────────────────────┴──────────────────────────────────────┘
```

## Challenge Components

### 1. Problem Description (Left Panel)

#### Problem Statement
- Clear description of what to solve
- Input/output format
- Edge cases explained

#### Examples
- Multiple input/output examples
- Walkthrough of one example
- Edge case examples

#### Constraints
- Input size constraints
- Time limit (e.g., "Must complete in < 1 second")
- Space complexity hints
- Python-specific constraints

#### Follow-up (for advanced challenges)
- "Can you do it in O(1) space?"
- "Can you solve it in one pass?"

### 2. Code Editor (Right Panel)

#### Starter Code
```python
def two_sum(nums, target):
    # Your code here
    pass

# Example usage:
# print(two_sum([2,7,11,15], 9))
```

#### Submission
- **RUN**: Test against visible test cases
- **SUBMIT**: Test against all test cases (hidden + visible)

#### Output Console
- Test case results
- Performance metrics
- Error messages

### 3. Hints System

#### Progressive Hints
- **Hint 1**: Gentle push in right direction
- **Hint 2**: More specific guidance
- **Hint 3**: Almost giving away the approach

#### Unlock Conditions
- Hint 1: Available after 2 failed attempts
- Hint 2: Available after 4 failed attempts OR 5 minutes
- Hint 3: Available after 6 failed attempts OR 10 minutes

### 4. Solution System

#### View Solution
- Available after completing OR multiple failed attempts
- Shows optimal Python solution
- Includes explanation
- Time/space complexity analysis

#### Multiple Solutions
- **Naive approach**: Brute force
- **Better approach**: Optimized
- **Best approach**: Most optimal

## Challenge Difficulty Levels

### Easy 🟢
- Single concept problems
- Straightforward solution
- Good for beginners
- Example: "Reverse a String"

### Medium 🔵
- Multiple concepts combined
- Require some optimization
- Common interview questions
- Example: "Two Sum", "Valid Parentheses"

### Hard 🔴
- Complex problems
- Require clever optimization
- Advanced data structures
- Example: "LRU Cache", "Merge Intervals"

### Expert ⚫ (Paid Content)
- System design problems
- Advanced patterns
- Production-grade challenges
- Example: "Design a Rate Limiter", "Implement Connection Pool"

## Test Cases

### Visible Test Cases
- Shown to user
- Examples from problem statement
- Basic edge cases
- Used for RUN button

### Hidden Test Cases
- Only shown after submission
- Comprehensive edge cases
- Performance stress tests
- Prevent hardcoding

### Test Case Structure
```python
def test_two_sum():
    assert two_sum([2,7,11,15], 9) == [0,1]  # Basic case
    assert two_sum([3,2,4], 6) == [1,2]       # Different order
    assert two_sum([3,3], 6) == [0,1]         # Same elements
    # ... more edge cases
```

## Submission & Evaluation

### Execution Process
1. User clicks SUBMIT
2. Code runs against ALL test cases
3. Each test case:
   - Time limit checked (default: 2 seconds)
   - Memory limit checked (default: 256MB)
   - Output compared to expected
4. Results displayed immediately

### Scoring
- **All tests pass**: ✅ Success
- **Some tests fail**: ❌ Failed (show which ones)
- **Time limit exceeded**: ⏱️ TLE
- **Memory limit exceeded**: 💾 MLE
- **Runtime error**: 🐛 Error shown

### Performance Metrics
- Execution time per test case
- Peak memory usage
- Comparison to optimal solution
- "Your solution: O(n²), Optimal: O(n)"

## Challenge Features

### 1. Challenge List View
```
Challenges (150)

Filters: [All] [Easy] [Medium] [Hard] [Expert]
Search: [search by name or tag...]

┌────────────────────────────────────────────┐
│ Two Sum                    Medium  ✓ Solved│
│ Tags: Array, Hash Map                       │
│ Success Rate: 78%                          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Valid Parentheses           Easy  ✓ Solved│
│ Tags: Stack, String                        │
│ Success Rate: 85%                          │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ LRU Cache                  Hard            │
│ Tags: Design, Hash Map, Linked List        │
│ Success Rate: 42%  [Premium]               │
└────────────────────────────────────────────┘
```

### 2. Tags & Categories
- **Data Structures**: Array, Linked List, Tree, Graph, Hash Map
- **Algorithms**: Sorting, Searching, DP, Greedy
- **Python-Specific**: Decorators, Generators, Context Managers
- **Domain**: Backend, System Design, APIs

### 3. Progress Tracking
- Solved/Total challenges
- Difficulty breakdown
- Streak tracking (deferred to gamification phase)
- Recent submissions

### 4. Discussions (Future)
- Community solutions
- Solution sharing
- Q&A per challenge

## Integration with Courses

### In-Course Challenges
- Part of lesson structure
- Must complete to progress
- Teach specific concept

### Standalone Practice
- Independent practice area
- Filter by difficulty/topic
- Random challenge button
- "Daily Challenge" (future)

## Editor Features

### Python-Specific Helpers
- Type hints auto-completion
- Common imports (`collections`, `itertools`, etc.)
- Snippets for common patterns
- PEP 8 style checking

### Debugging Tools
- Print statements
- Variable inspection
- Step-through execution (future)

## Mobile Experience

### Portrait Mode
- Problem description (full width)
- "Open Editor" button
- Editor opens in full-screen modal

### Landscape Mode
- Stacked layout (content top, editor bottom)
- Both visible simultaneously

## Anti-Cheat Measures

### Preventing Copy-Paste Solutions
- Rate limit submissions
- Detect identical submissions across users
- Flag suspicious patterns

### Encouraging Learning
- Solution explanations over just code
- "Try again" encouragement
- Learning-focused, not competition-focused
