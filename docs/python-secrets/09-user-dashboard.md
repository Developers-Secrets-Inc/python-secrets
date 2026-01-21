# User Dashboard

## Design Philosophy

**Simple, focused on driving continued engagement and conversions**

## Core Elements (MVP)

### 1. Continue Learning Banner (Primary)
**Most important element - huge CTA**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  You're 30% through Python OOP Fundamentals    │
│                                                 │
│  [ RESUME LEARNING ]                            │
│                                                 │
└─────────────────────────────────────────────────┘
```

- One-click resume to where they left off
- Impossible to miss
- Primary action on dashboard

### 2. Course Progress Overview

```
Enrolled Courses:

┌─────────────────────────────────────┐
│ Python OOP Fundamentals   [████░░]  │
│ Next: Lesson 8 - Polymorphism    →  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ FastAPI Basics             [███░░░] │
│ Next: Lesson 4 - CRUD Operations →  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SQL with Python            [░░░░░░] │
│ Start Course                        │
└─────────────────────────────────────┘
```

- All enrolled courses with progress bars
- Clear visual completion status
- Quick access to next lesson

### 3. Recent Activity

```
Recent Activity:

• Completed Lesson 7 - Inheritance (2 hours ago)
• Solved "Binary Search" challenge (yesterday)
• Started FastAPI Basics course (2 days ago)
```

- Shows learning momentum
- Encourages consistency
- Social proof of progress

### 4. Recommended Next

```
Recommended for You:

Since you completed Python OOP, try:
→ Design Patterns in Python (Paid)
→ Advanced Decorators Masterclass (Free)

Ready for the next level?
→ Backend Engineering Mastery (Complete Package)
```

- Smart recommendations based on progress
- Upsell to paid content when appropriate
- Cross-link related content

## What We're Not Building (Deferred)

- ❌ Stats and charts (nice to have, not essential)
- ❌ Achievements/badges (gamification deferred)
- ❌ Leaderboards (social features deferred)
- ❌ Calendar/schedule (overkill for self-paced)
- ❌ Streak counters (gamification deferred)
- ❌ Community activity feed (social features deferred)

## User Journey

```
Dashboard → Resume Banner → Continue Learning → Complete Lesson
                                              ↓
                                        Back to Dashboard
                                              ↓
                                        See Progress Update
                                              ↓
                                        Feeling of Accomplishment
                                              ↓
                                        Recommended Next (Paid)
                                              ↓
                                        Consider Purchase
```

## Dashboard States

### New User (No Progress)
```
Welcome to Python Secrets!

[Start Your First Course] → Python Fundamentals

Browse All Courses →
```

### Active User (In Progress)
```
Continue Learning: [Current Course]
Your Progress
Recommended Next
```

### Completed Free User (Conversion Target)
```
🎉 You've completed all free courses!

Ready to become a backend engineer?
[Get the Complete Package]

Browse individual paid courses →
```

### Paid User
```
Continue Learning: [Current Paid Course]
Your Progress (Free + Paid)
Recommended Next
```

## Mobile Considerations

- Responsive design
- "Resume Learning" always above fold
- Simplified card layouts
- Touch-friendly CTAs

## Dashboard Goals

1. **Retention**: Easy to continue learning
2. **Engagement**: Show progress and momentum
3. **Conversion**: Upsell to paid at right moment
4. **Simplicity**: No distractions, clear next steps
