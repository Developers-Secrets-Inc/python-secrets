# Quiz System

## Philosophy

**Learning-focused, not gatekeeping**

## Quiz Format

### Question Display

```
┌─────────────────────────────────────────────────────────────┐
│ Quiz: Python Decorators                                      │
│ Question 3 of 5                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ What does @property do in Python?                           │
│                                                             │
│ ○  A) Creates a class property                              │
│ ○  B) Creates a private method                             │
│ ○  C) Decorates a function                                 │
│ ✓ B) Turns a method into an attribute                       │
│                                                             │
│ [Check Answer]                                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Immediate Feedback

#### Correct Answer
```
✓ Correct! Great job.

The @property decorator converts a method into an attribute,
allowing you to access it like obj.property instead of calling
obj.property().

[Next Question]
```

#### Incorrect Answer
```
✗ Not quite. The correct answer is B.

Explanation:
@property turns a method into an attribute so you can access
it without parentheses. It's useful for computed properties.

Example:
class Circle:
    @property
    def area(self):
        return 3.14 * self.radius ** 2

circle = Circle(radius=5)
print(circle.area)  # No parentheses needed!

[Next Question]
```

## Quiz Principles

### 1. Immediate Feedback
- Show answer after each question
- No waiting until quiz end
- Learn from mistakes immediately
- Reinforce correct understanding

### 2. No Passing Score Gate
- ❌ "Must get 80% to pass"
- ✅ Complete all questions to continue
- **Rationale**: Learning > testing, don't block progress

### 3. Unlimited Retakes
- Retake quiz anytime
- No penalties for retrying
- Questions shuffle on retry
- Encourages mastery

### 4. Progress, Not Score
- Show: "3 of 5 questions completed"
- Don't show: "You got 60%"
- **Focus**: Completion, not performance pressure

## Quiz Types

### 1. Multiple Choice (Primary)

Format:
- 4 options per question
- Only 1 correct answer
- Clear, unambiguous questions

Example:
```
What is the time complexity of list lookup by index?

○  A) O(1)
○  B) O(n)
○  C) O(log n)
○  D) O(n²)

Correct: A - Python lists are arrays, access by index is O(1)
```

### 2. Code Output Quiz

Test understanding of code execution:

```
What will this code print?

def outer():
    x = 10
    def inner():
        nonlocal x
        x = 20
    inner()
    return x

print(outer())

○  A) 10
✓  B) 20
○  C) Error
○  D) None

Correct: B - nonlocal allows inner function to modify x
```

### 3. Fill in the Blank (Optional)

Simple completion:

```
Complete the sentence:

Python _____ allow you to add functionality to functions
without modifying their code.

Answer: [decorators]
```

## Quiz Placement

### In Lessons

Quizzes appear after lesson content:

```
Lesson Structure:
1. Theory/Explanation
2. Code Examples
3. Interactive Practice
4. Quiz (3-5 questions)
5. Completion Mark
```

### Standalone Quizzes

Some lessons are quiz-only:

```
Quiz: Python Basics Review

15 questions covering:
• Variables and Types
• Control Flow
• Functions
• Basic Data Structures

[Start Quiz]
```

## Quiz Completion Flow

```
1. User finishes lesson content
2. "Take Quiz" button appears
3. User answers questions one by one
4. Immediate feedback after each answer
5. Complete all questions
6. Quiz complete badge shown
7. Next lesson unlocks automatically
8. "Mark Lesson Complete" enabled
```

## Quiz State Management

### Progress Tracking
```javascript
{
  lessonId: "decorators-101",
  userId: "user-123",
  quizStarted: true,
  currentQuestion: 3,
  totalQuestions: 5,
  answers: [1, 2, null, null, null],  // null = not answered
  completed: false,
  attempts: 1
}
```

### Retake Behavior
```javascript
// On retake
{
  lessonId: "decorators-101",
  userId: "user-123",
  quizStarted: true,
  currentQuestion: 1,  // Reset to start
  questionsShuffled: true,  // Different order
  completed: false,
  attempts: 2
}
```

## What We're Not Building

### Skip for MVP
- ❌ Timed quizzes (adds stress)
- ❌ Passing score requirements (gates progress)
- ❌ Limited attempts (prevents learning)
- ❌ Leaderboards (gamification deferred)
- ❌ Streaks for quiz completion (gamification deferred)
- ❌ Complex question types (drag-drop, matching, etc.)
- ❌ Partial credit (all or nothing for simplicity)

### Future Considerations
- 🔄 Difficulty-based question pools
- 🔄 Adaptive quizzes (harder if doing well)
- 🔄 Explanations from community (future social)
- 🔄 Quiz analytics for content improvement

## Quiz Analytics (Internal)

### Tracking for Improvement
Track these metrics internally:
- Which questions have low pass rates (confusing?)
- Which lessons have quiz drop-offs (too hard?)
- Common wrong answers (misconceptions?)
- Time spent per question (too long?)

### Use Data to Improve Content
```
Example insight:
"Only 40% of users get the 'nonlocal' question right.
The explanation might be unclear. Let's improve the lesson
content around this concept."
```

## Quiz Creation

### Question Quality Guidelines

#### Good Questions
✅ Clear, unambiguous
✅ Test understanding, not memorization
✅ Have one clearly correct answer
✅ Include distractors that represent common misconceptions
✅ Align with learning objectives

#### Bad Questions
❌ "All of the above" (gives it away)
❌ Trick questions
❌ Ambiguous wording
❌ Testing obscure details
❌ Multiple correct answers

### Example: Building a Good Quiz

**Bad Question:**
```
Which of the following is true about Python decorators?

A) They are functions
B) They take a function as input
C) All of the above  ← Gives away the answer
```

**Good Question:**
```
What must a decorator return?

A) The original function unchanged
B) A wrapper function that calls the original
C) None (decorators don't return anything)
D) A class definition

Correct: B
```

## Mobile Experience

### Responsive Quiz Interface
```
Mobile layout:

Question 3 of 5

What does @property do?

○ A) Creates property
○ B) Turns method into
  attribute
○ C) Decorates function
○ D) Creates method

[Check Answer]

(Options stacked for touch-friendly selection)
```

## Accessibility

### Keyboard Navigation
- Arrow keys to select options
- Enter to submit
- Number keys (1-4) for quick selection

### Screen Reader Support
- Proper ARIA labels
- Announce question number
- Announce selection state
- Announce correct/incorrect

## Quiz Completion Rewards

### Simple, Not Gamified
```
Quiz Complete! ✓

You've completed the Python Decorators quiz.

[Continue to Next Lesson]

[Retake Quiz] (for practice)
```

### No Complex Rewards (Deferred)
- ❌ Points system
- ❌ XP for quizzes
- ❌ Badges for quiz streaks
- ❌ Leaderboards

**Focus**: Learning and progress, not rewards
