import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from '@/components/ui/empty'
import { BookOpen as BookOpenIcon } from 'lucide-react'
import Link from 'next/link'

interface ContinueLearningCardProps {
  hasActiveCourse?: boolean
}

export function ContinueLearningCard({ hasActiveCourse = false }: ContinueLearningCardProps) {
  if (!hasActiveCourse) {
    return (
      <Card className="rounded-none bg-background border-dashed py-2">
        <CardHeader className="border-b px-4 py-2 [.border-b]:pb-2 border-dashed">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base tracking-tight">
              <BookOpen className="w-4 h-4 text-zinc-500" />
              <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Continue Learning</span>
            </CardTitle>
            <CardDescription className="text-xs">Pick up where you left off</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpenIcon />
              </EmptyMedia>
              <EmptyTitle>No courses in progress</EmptyTitle>
              <EmptyDescription>
                Start learning by browsing our course catalog and find the perfect course for you.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm" className="rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-none">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-none gap-0 py-0 pt-2 bg-background">
      <CardHeader className=" border-b px-4 py-2 [.border-b]:pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base tracking-tight">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Continue Learning</span>
          </CardTitle>
          <CardDescription className="text-xs">Pick up where you left off</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-zinc-400 tracking-wider">[PY101]</span>
          <span className="text-[9px] border px-2 py-0.5 font-bold text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20 uppercase tracking-wider">
            BEGINNER
          </span>
        </div>
        <h3 className="text-lg font-bold mb-2 tracking-tight">Python Fundamentals</h3>
        <p className="text-sm text-zinc-500 mb-4">Master the basics of Python programming, from variables to functions.</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="block text-[10px] text-zinc-400 font-bold tracking-wider uppercase">Progress</span>
            <span className="text-sm font-bold tabular-nums">12 / 24 lessons</span>
          </div>
          <Button size="sm" className="rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-none">
            Continue
          </Button>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/30 border-t px-4 py-3 [.border-t]:pt-3">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider">Last accessed 2 hours ago</span>
          <span className="flex items-center gap-1">
            <span className="text-xs">Resume</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
