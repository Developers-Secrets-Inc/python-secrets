# Projects System

## Overview

**Multi-file, multi-step projects that span multiple lessons/pages**

Projects bridge the gap between:
- **Challenges**: Single-problem exercises
- **Courses**: Theory + practice
- **Projects**: Build complete, real-world applications

## Project Structure

### Multi-Page Format

```
Project: Build a REST API with FastAPI

┌─────────────────────────────────────────────────────────────────┐
│ Step 1 of 8: Project Setup                                       │
│ Progress: [██░░░░░░░] 12%                                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────┬──────────────────────────────────┐
│ CONTENT (Left)               │ CODE (Right)                     │
│                              │                                  │
│ Welcome to your first        │ 📁 project_files/                │
│ real-world project!          │   ├─ main.py                     │
│                              │   ├─ models.py                   │
│ In this project, you'll      │   ├─ database.py                 │
│ build a complete REST API    │   └─ requirements.txt            │
│ using FastAPI with:          │                                  │
│                              │ Currently editing: main.py       │
│ • CRUD operations            │                                  │
│ • Database with SQLAlchemy   │ [RUN] [SAVE] [NEXT STEP]         │
│ • Authentication             │                                  │
│ • Testing                    │ Your code is auto-saved ✓        │
│                              │                                  │
│ Let's start by setting       │                                  │
│ up the project structure     │                                  │
│ and installing FastAPI.      │                                  │
│                              │                                  │
│ Task:                        │                                  │
│ 1. Create main.py            │                                  │
│ 2. Set up basic FastAPI      │                                  │
│    app                       │                                  │
│ 3. Run the app               │                                  │
│                              │                                  │
└──────────────────────────────┴──────────────────────────────────┘
```

## Project Progression

### Step-by-Step Structure

```
Step 1: Project Setup
  ↓ (code saved)
Step 2: Database Models
  ↓ (code from Step 1 available)
Step 3: CRUD Endpoints
  ↓ (all previous code available)
Step 4: Authentication
  ↓ (build upon previous steps)
Step 5: Validation
  ↓
Step 6: Error Handling
  ↓
Step 7: Testing
  ↓
Step 8: Deployment Guide
  ↓
★ Complete!
```

## Key Features

### 1. Persistent Code Workspace

#### Multi-File System
```
project_name/
├── main.py              (Step 1)
├── models.py            (Step 2)
├── schemas.py           (Step 3)
├── database.py          (Step 4)
├── auth.py              (Step 5)
├── main_test.py         (Step 7)
└── requirements.txt     (Step 1)
```

#### Code Persistence
- Code saved between steps
- All files accessible in later steps
- Previous steps can be revisited
- Final result = complete working application

#### State Management
```python
# After Step 2, user sees:
# ✅ main.py (completed in Step 1)
# ✅ models.py (just completed in Step 2)

# Moving to Step 3, user sees:
# ✅ main.py (read-only reference)
# ✅ models.py (read-only reference)
# ⬜ schemas.py (current task)
```

### 2. Step Navigation

#### Forward Progress
- Complete current step to unlock next
- "Mark Complete" button
- Automatic progression option

#### Backward Navigation
- Revisit any completed step
- Review previous code
- Edit and improve (updates saved)
- Can't "break" future steps

#### Step Overview
```
[Project Progress]

Step 1: Setup ✅
Step 2: Models ✅
Step 3: Schemas 🔄 (current)
Step 4: Endpoints ⏳
Step 5: Auth ⏳
Step 6: Validation ⏳
Step 7: Testing ⏳
Step 8: Deployment ⏳
```

### 3. Project Types

#### Beginner Projects
- **Duration**: 5-10 steps
- **Time**: 1-2 hours total
- **Complexity**: Single concept focus
- **Example**: "Build a To-Do List CLI"

#### Intermediate Projects
- **Duration**: 10-15 steps
- **Time**: 3-5 hours total
- **Complexity**: Multiple integrated concepts
- **Example**: "REST API with Database"

#### Advanced Projects (Paid)
- **Duration**: 15-25 steps
- **Time**: 5-10 hours total
- **Complexity**: Production-grade applications
- **Example**: "Microservices Architecture with Docker"

#### Expert Projects (Paid)
- **Duration**: 25+ steps
- **Time**: 10+ hours total
- **Complexity**: Real-world system design
- **Example**: "Build a Scalable Chat Application"

## Project Workflow

### Starting a Project

```
1. User sees project card with details:
   - Name: "Build a REST API"
   - Difficulty: Intermediate
   - Estimated Time: 4 hours
   - Steps: 8
   - Technologies: FastAPI, SQLAlchemy, PostgreSQL

2. User clicks "Start Project"

3. Project workspace initializes:
   - Create file structure
   - Initialize git (optional)
   - Set up requirements.txt

4. Step 1 loads with:
   - Clear instructions
   - Starter code (if needed)
   - Empty workspace ready for code
```

### Working Through Steps

```
Step N:

1. Read instructions on left
2. Write code in editor on right
3. Run and test code
4. Click "Complete Step" when done
5. Code is saved and persisted
6. Step N+1 unlocks with all previous code available
```

### Completing a Project

```
Final Step:

1. User completes last step
2. All files are combined into complete project
3. "Download Project" button becomes available:
   - Full source code download
   - Requirements file
   - Setup instructions
   - Deployment guide

4. Portfolio Options:
   - "Add to Portfolio" button
   - Generate project showcase page
   - Deploy to preview (future)

5. Next Project Recommendations
   - "Since you built X, try building Y"
   - Skill progression path
```

## Project Features

### 1. Starter Templates

Each project starts with:
```python
# main.py
from fastapi import FastAPI

app = FastAPI()

# TODO: Initialize the app
```

Or blank slate for advanced projects.

### 2. Progressive Complexity

```
Step 1: Basic setup (scaffolding)
Step 2: Add one feature
Step 3: Add another feature
Step 4: Integrate features
Step 5: Add complexity
Step 6: Optimize and refine
Step 7: Test thoroughly
Step 8: Polish and deploy
```

### 3. Reference Solutions

#### Per-Step Hints
- "Stuck? View hint for this step"
- Shows approach, not full solution
- Available after 2 failed attempts

#### Full Solution
- "View Complete Solution"
- Shows final working code for entire project
- Available after completing OR giving up
- Includes explanations for key decisions

### 4. Testing & Validation

#### Automated Checks
Each step may include:
```python
# Automated validation
def check_step_3():
    # Checks if user implemented required function
    assert hasattr(app, 'get_user')
    assert callable(app.get_user)

    # Runs basic test
    result = app.get_user(1)
    assert result is not None
```

#### Manual Review
- Some steps are creative (no auto-check)
- User self-validates ("Does it work?")
- Peer review (future feature)

### 5. Project Showcase

#### Portfolio Integration
Completed projects can be:
- Added to user profile
- Featured on dashboard
- Shared via public link
- Downloaded for GitHub

#### Project Card
```
┌────────────────────────────────────┐
│ REST API with FastAPI     ✅ Done  │
│                                    │
│ Built: CRUD operations,            │
│        Authentication,             │
│        Database, Testing           │
│                                    │
│ [View Code] [Deploy] [Share]       │
└────────────────────────────────────┘
```

## Project Categories

### Backend Development (Paid Focus)
- REST APIs
- GraphQL APIs
- Websockets
- Authentication systems
- Database design

### DevOps & Deployment (Paid)
- Docker containers
- CI/CD pipelines
- Cloud deployment
- Monitoring setup

### Data Engineering (Paid)
- ETL pipelines
- Data processing
- API integrations
- Real-time systems

### Tools & Utilities (Free)
- CLI applications
- Automation scripts
- Web scrapers
- Data analysis tools

## Project Dashboard

### My Projects View
```
Projects (5 Completed, 2 In Progress)

In Progress:
┌──────────────────────────────────────┐
│ REST API with FastAPI    [██░░░░] 50%│
│ Step 4 of 8 - CRUD Endpoints   [→]   │
└──────────────────────────────────────┘

Completed:
┌──────────────────────────────────────┐
│ To-Do CLI               ✅ Completed  │
│ [View] [Download] [Portfolio]        │
└──────────────────────────────────────┘

Recommended:
┌──────────────────────────────────────┐
│ Build a WebSocket Chat    [Start →]  │
│ Difficulty: Advanced                 │
│ Prerequisite: REST API               │
└──────────────────────────────────────┘
```

## Different Projects vs. Challenges

| Aspect | Challenges | Projects |
|--------|-----------|----------|
| Duration | 5-30 minutes | 1-10 hours |
| Scope | Single problem | Complete application |
| Files | 1 file | Multiple files |
| Steps | Single submission | Multi-step progression |
| Persistence | Not saved | Saved between steps |
| Outcome | Skill practice | Portfolio piece |
| Focus | Algorithm/code skill | System building |

## Technical Implementation

### File System
- Virtual file system per project
- Files stored in database or object storage
- Retrieved on project load
- Version history (optional)

### Step Management
- Each step = separate lesson/page
- Steps linked in sequence
- Completion tracking per step
- Prerequisite: previous steps must complete

### State Persistence
```javascript
{
  projectId: "rest-api-fastapi",
  userId: "user-123",
  currentStep: 4,
  files: {
    "main.py": "import fastapi\n...",
    "models.py": "from sqlalchemy\n...",
    // ...
  },
  completedSteps: [1, 2, 3],
  startedAt: "2026-01-21",
  lastAccessed: "2026-01-21"
}
```

## Future Enhancements

### Collaboration
- Pair programming mode
- Shared projects
- Code review from mentors

### Deployment
- One-click deploy to Railway/Vercel
- Live project URLs
- Domain attachment

### Version Control
- Git integration
- Commit history
- Branch management

### AI Assistance
- Context-aware hints
- Code review suggestions
- Debugging help
