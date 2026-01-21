# Search and Discovery

## Philosophy

**Start minimal, expand based on user behavior**

## MVP Features

### 1. Global Search Bar

#### Placement
```
Top of every page:

┌─────────────────────────────────────────────┐
│  Python Secrets        [🔍 Search...]       │
├─────────────────────────────────────────────┤
│  Courses  Challenges  Projects  Dashboard   │
└─────────────────────────────────────────────┘
```

#### What It Searches
- Course titles
- Lesson topics
- Challenge names
- Tags and concepts
- Project titles

#### Search Results Page

```
Search: "decorators"

5 results found

Courses (2)
┌─────────────────────────────────────────────┐
│ Python OOP                                  │
│ Decorators Lesson                           │
│ Free • Intermediate • 8 lessons             │
│ [Continue] [View Course]                    │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Advanced Python Patterns                    │
│ Decorators Deep Dive                        │
│ Paid • Advanced • 12 lessons                │
│ [$149] [View Course]                        │
└─────────────────────────────────────────────┘

Challenges (3)
┌─────────────────────────────────────────────┐
│ Implement Cache Decorator                   │
│ Medium • Hash Map • Design Pattern          │
│ [Solve Challenge]                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Retry Decorator                             │
│ Hard • Function Wrapping • Error Handling   │
│ [Solve Challenge]                           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Property Decorator                          │
│ Easy • OOP • Attributes                     │
│ [Solve Challenge]                           │
└─────────────────────────────────────────────┘
```

### 2. Browse Courses

#### Filter Options

```
Browse Courses (42 courses)

Filters:

Difficulty:
[All] [Beginner] [Intermediate] [Advanced]

Type:
[All] [Free] [Paid]

Status:
[All] [Not Started] [In Progress] [Completed]

Sort by:
• Recommended
• Newest
• Most Popular
```

#### Filtered Results Display

```
Showing: Beginner • Free Courses (12)

┌─────────────────────────────────────────────┐
│ Python Fundamentals                         │
│ Master Python basics from scratch           │
│ Free • Beginner • 15 lessons                │
│ [Start Course]                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Data Structures in Python                   │
│ Lists, dicts, sets, and more                │
│ Free • Beginner • 10 lessons                │
│ [Start Course]                              │
└─────────────────────────────────────────────┘
```

### 3. Tag-Based Discovery

#### Popular Topics

```
Browse by Topic:

🏷️  OOP              (12 courses)
🏷️  FastAPI          (8 courses)
🏷️  Testing          (6 courses)
🏷️  Async Python     (4 courses)
🏷️  Databases        (9 courses)
🏷️  REST APIs        (7 courses)
🏷️  Decorators       (5 courses)
🏷️  Data Structures  (8 courses)
```

#### Tag Page

```
Tag: OOP (12 courses)

Related tags: Classes, Inheritance, Design Patterns

Courses:
┌─────────────────────────────────────────────┐
│ Python OOP Fundamentals                     │
│ Free • Intermediate • 12 lessons            │
│ [View Course]                               │
└─────────────────────────────────────────────┘

Challenges:
┌─────────────────────────────────────────────┐
│ Design a Singleton                         │
│ Hard • Design Pattern                       │
│ [Solve Challenge]                           │
└─────────────────────────────────────────────┘
```

### 4. Challenge Browser

```
Challenges (150 total)

Filters:
Difficulty: [All] [Easy] [Medium] [Hard] [Expert]
Tag:        [All] [Arrays] [Strings] [DP]...
Status:     [All] [Solved] [Unsolved]

Sort by:
• Popular
• Success Rate
• Newest
```

### 5. Project Browser

```
Projects (25 total)

Filters:
Difficulty:  [All] [Beginner] [Intermediate] [Advanced] [Expert]
Type:        [All] [Backend] [CLI] [Web] [Data]
Status:      [All] [Not Started] [In Progress] [Completed]

Sort by:
• Popular
• Time Required
• Newest
```

## What We're Not Building (MVP)

### Skip Initially
- ❌ Advanced search operators (AND, OR, NOT)
- ❌ Search within lesson content (too expensive)
- ❌ Filter by duration/time
- ❌ Filter by instructor (no instructors)
- ❌ "Surprise me" / Random course button
- ❌ Learning path wizard
- ❌ Social proof overlays ("523 users taking this")
- ❌ Collections/playlists (user-created)

## Dashboard Recommendations (Primary Discovery)

### Better Than Search: Smart Recommendations

Most users don't search randomly - they follow paths:

```
Your Dashboard:

┌─────────────────────────────────────────────┐
│  Continue Learning                          │
│  [Python OOP - Lesson 8 →]                 │
└─────────────────────────────────────────────┘

Recommended for You:
┌─────────────────────────────────────────────┐
│  Since you completed Python Fundamentals:   │
│  → Python OOP (Free)                        │
│  → Data Structures (Free)                   │
│                                             │
│  Ready for the next level?                  │
│  → Backend Engineering (Paid)               │
└─────────────────────────────────────────────┘

Popular This Week:
┌─────────────────────────────────────────────┐
│  REST API Development (Paid)                │
│  1,234 learners started this week           │
│  [$149 - View Course]                       │
└─────────────────────────────────────────────┘
```

### Recommendation Logic

```python
# Simple rules for MVP
def recommend_next(user):
    completed = get_completed_courses(user)

    # Free content progression
    if "python-fundamentals" in completed:
        if "python-oop" not in completed:
            return "python-oop"

    # Upsell at natural transition points
    if all_free_complete(user):
        return "backend-engineering-mastery"

    # Popular content fallback
    return get_popular_course()
```

## Post-MVP Enhancements

### Phase 2: Advanced Features

**When users specifically ask for them:**

#### 1. Advanced Search
```
Search: "decorators AND hard" "arrays OR lists"
Filter by time: "Under 2 hours"
Filter by rating: "4+ stars"
```

#### 2. Smart Recommendations
```
"Because you liked Python OOP, you might like:
• Design Patterns (Paid)
• System Design with Python (Paid)"
```

#### 3. Collaborative Filtering
```
"Users like you also took:
• REST API Architecture
• Advanced Testing"
```

#### 4. Collections/Playlists
```
Users can create:
• "My Python Path" (custom learning list)
• "Interview Prep" (saved challenges)
• "Weekend Projects" (saved projects)
```

#### 5. "Continue Watching" Style
```
Auto-suggest from partially started:
"You started FastAPI Basics 2 days ago.
Pick up where you left off →"
```

## Search Analytics

### Track Internally
- Most searched terms
- Zero-result searches (content gaps?)
- Click-through rates
- Filter combinations
- Popular vs. niche content

### Use Data for Content Strategy
```
Insights:
"500 users searched for 'django' but we only have FastAPI.
Consider adding Django content."

"'async python' searches increased 300% this month.
Prioritize async content creation."
```

## URL Structure

### Searchable URLs
```
/courses                           # All courses
/courses?difficulty=beginner       # Filtered
/courses?tag=oop                   # By tag
/courses?type=free                 # Free only
/courses?q=decorators              # Search results

/challenges?difficulty=medium&tag=arrays
/projects?difficulty=advanced
```

### Shareable Links
- Users can bookmark filtered views
- Share specific search results
- Link to tag pages

## Mobile Experience

### Mobile Search
```
┌─────────────────────────┐
│  [🔍 Search courses...]│
│                         │
│ Filters ▼              │
│                         │
│ Course cards...         │
└─────────────────────────┘
```

### Filter Drawer
```
Tap "Filters" → Drawer slides up

Difficulty
○ All
● Beginner
○ Intermediate

Type
○ All
● Free

[Apply Filters]
```

## Empty States

### No Search Results
```
Search: "machine learning"

No results found for "machine learning"

💡 Tip:
Try searching for "python", "api", or "decorators"

Or browse our popular topics:
[OOP] [FastAPI] [Testing]
```

### No Filters Match
```
No expert-level free courses found.

Try:
• Removing some filters
• Changing difficulty level
• Browsing all courses
```

## Search Performance

### Optimization
- Debounce search input (300ms)
- Cache popular searches
- Index courses/challenges/projects
- Fuzzy search for typos

### Implementation
```javascript
// Client-side debouncing
const searchInput = debounce((query) => {
  if (query.length > 2) {
    fetch(`/api/search?q=${query}`)
  }
}, 300)
```

## Accessibility

### Keyboard Navigation
- `/` to focus search (like GitHub)
- ESC to close search
- Arrow keys in results
- Enter to open result

### Screen Readers
- "5 results found for 'decorators'"
- Announce filter changes
- Proper ARIA labels
