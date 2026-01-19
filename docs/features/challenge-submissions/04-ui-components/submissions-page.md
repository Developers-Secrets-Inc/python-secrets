# Submissions History Page

## What

Page component that displays all submission attempts for a lesson with restore functionality.

## Why

- **Review History**: Users can see all their attempts
- **Restore Code**: Easy restoration of previous solutions
- **Track Progress**: Visual improvement over time
- **Debug**: Learn from mistakes

## How

### Page Component

**File:** `src/app/(frontend)/(protected)/courses/[course_slug]/[chapter_slug]/[part_slug]/submissions/page.tsx`

```typescript
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getLesson } from '@/api/courses'
import { SubmissionsContent } from './submissions-content'

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{
    course_slug: string
    chapter_slug: string
    part_slug: string
  }>
}) {
  const { course_slug, chapter_slug, part_slug } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  // Get lesson data
  const data = await getLesson({
    courseSlug: course_slug,
    chapterSlug: chapter_slug,
    lessonSlug: part_slug,
  })

  if (!data) {
    return <div>Lesson not found</div>
  }

  const { lesson, course, chapter } = data

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs - already exists in layout */}
      <header className="h-14">
        <ButtonGroup className="w-full">
          <Button variant="outline" className="flex-1 gap-2 rounded-none border-0 border-b rounded-tl-sm" asChild>
            <Link href="description">
              <FileText className="h-4 w-4" />
              Description
            </Link>
          </Button>

          <Button variant="outline" className="flex-1 gap-2 border-0 border-x border-b rounded-none" asChild>
            <Link href="solution">
              <Lightbulb className="h-4 w-4" />
              Solution
            </Link>
          </Button>

          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-none border-0 border-b rounded-tr-sm bg-primary/10"
            asChild
          >
            <Link href="submissions">
              <History className="h-4 w-4" />
              Submissions
            </Link>
          </Button>
        </ButtonGroup>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <SubmissionsContent
          userId={session.user.id}
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          chapterSlug={chapter_slug}
          partSlug={part_slug}
        />
      </div>
    </div>
  )
}
```

### Client Component

**File:** `src/app/(frontend)/(protected)/courses/[course_slug]/[chapter_slug]/[part_slug]/submissions/submissions-content.tsx`

```typescript
'use client'

import { useSubmissions, useSubmissionStats } from '@/hooks/api/challenges/use-submissions'
import { useRestoreSubmission } from '@/hooks/api/challenges/use-restore-submission'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  History,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface SubmissionsContentProps {
  userId: string
  lessonId: number
  lessonTitle: string
  chapterSlug: string
  partSlug: string
}

export function SubmissionsContent({
  userId,
  lessonId,
  lessonTitle,
  chapterSlug,
  partSlug,
}: SubmissionsContentProps) {
  const { submissions, isLoading, error } = useSubmissions({ userId, lessonId })
  const { stats } = useSubmissionStats({ userId, lessonId })
  const { restoreSubmission, isRestoring } = useRestoreSubmission()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading submissions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load submissions</h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{lessonTitle}</h1>
          <p className="text-muted-foreground">Submission History</p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`../${partSlug}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenge
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && stats.totalAttempts > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Attempts"
            value={stats.totalAttempts}
            icon={<History className="h-4 w-4" />}
          />
          <StatCard
            label="Successful"
            value={stats.successfulAttempts}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatCard
            label="Best Score"
            value={`${stats.bestScore}%`}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <StatCard
            label="Avg Time"
            value={`${stats.averageExecutionTime}ms`}
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
      )}

      {/* No Submissions State */}
      {submissions.length === 0 && (
        <Card className="p-12 text-center">
          <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No submissions yet</h3>
          <p className="text-muted-foreground mb-6">
            Try the challenge to see your submission history here.
          </p>
          <Button asChild>
            <Link href={`../${partSlug}`}>
              Start Challenge
            </Link>
          </Button>
        </Card>
      )}

      {/* Submissions Timeline */}
      {submissions.length > 0 && (
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              index={index}
              onRestore={() => restoreSubmission(submission.id)}
              isRestoring={isRestoring}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Stat Card Component
function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  )
}

// Submission Card Component
function SubmissionCard({
  submission,
  index,
  onRestore,
  isRestoring,
}: {
  submission: any
  index: number
  onRestore: () => void
  isRestoring: boolean
}) {
  const isCompleted = submission.status === 'completed'
  const isFailed = submission.status === 'failed'
  const isError = submission.status === 'error'

  return (
    <Card
      className={cn(
        "p-4 transition-colors hover:bg-muted/50",
        index === 0 && "border-primary border-2" // Highlight most recent
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Status + Info */}
        <div className="flex items-start gap-3 flex-1">
          {/* Status Icon */}
          {isCompleted ? (
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-1" />
          ) : isFailed ? (
            <XCircle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
          ) : (
            <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-1" />
          )}

          {/* Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">
                {submission.score} / {submission.totalTests} tests passed
              </p>
              <Badge
                variant={isCompleted ? "default" : "destructive"}
                className={cn(
                  "ml-2",
                  isCompleted && "bg-green-600 hover:bg-green-700"
                )}
              >
                {submission.status}
              </Badge>
              {index === 0 && (
                <Badge variant="outline" className="ml-2">
                  Latest
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(submission.submittedAt), {
                  addSuffix: true,
                })}
              </span>
              <span>•</span>
              <span>{submission.executionTime}ms execution time</span>
            </div>

            {isCompleted && (
              <p className="text-sm text-green-700 mt-2">
                🎉 Great job! All tests passed.
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <Button
          onClick={onRestore}
          disabled={isRestoring}
          variant="outline"
          size="sm"
        >
          {isRestoring ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Restoring...
            </>
          ) : (
            'Restore Code'
          )}
        </Button>
      </div>
    </Card>
  )
}
```

## Features

### Statistics Overview

Shows key metrics at a glance:
- Total attempts
- Successful submissions
- Best score achieved
- Average execution time

### Timeline View

Submissions displayed in reverse chronological order (newest first).

### Visual Indicators

- **Latest submission**: Highlighted with primary border
- **Status icons**: Green check / Red X / Amber warning
- **Badges**: Status label + "Latest" badge

### Restore Button

One-click restore for any submission:
- Shows loading state during restoration
- Automatically navigates back to challenge
- Restores code to IDE

### Back Link

Quick navigation back to the challenge.

## Responsive Design

```tsx
{/* Mobile: 2 columns, Desktop: 4 columns */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {/* Stats cards */}
</div>
```

## Empty States

Two empty states:

1. **No submissions ever**
   - Show icon + message + "Start Challenge" button

2. **Loading state**
   - Show spinner + "Loading submissions..."

## Error Handling

Shows user-friendly error message with retry button.

## Dependencies

- `@/hooks/api/challenges/use-submissions` - Fetch submissions
- `@/hooks/api/challenges/use-submission-stats` - Fetch stats
- `@/hooks/api/challenges/use-restore-submission` - Restore functionality
- `@/components/ui/*` - UI components (Button, Card, Badge)
- `date-fns` - Date formatting
- `lucide-react` - Icons

## Next Steps

- → [Go to Challenge IDE](../05-integration/challenge-ide.md) to integrate with IDE
- → [Go to Data Flow](../05-integration/data-flow.md) for complete flow diagram
