import { AppHeader } from '@/components/headers/app-header'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Lightbulb,
  History,
  Code2,
  BookOpen,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ButtonGroup } from '@/components/ui/button-group'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { LessonExercisePanel } from '@/components/courses/lessons/lesson-exercise-panel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notFound } from 'next/navigation'
import { getLesson } from '@/api/courses'
import { LessonSidebarHeader } from '@/components/courses/lessons/nav/lesson-navigation'
import { LessonRatingButtons } from '@/components/courses/lessons/lesson-rating-buttons'
import { LessonStatusBadge } from '@/components/courses/lessons/lesson-status-badge'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ course_slug: string; chapter_slug: string; part_slug: string }>
}) {
  const { course_slug, chapter_slug, part_slug } = await params
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Récupération des données réelles
  const data = await getLesson({
    courseSlug: course_slug,
    chapterSlug: chapter_slug,
    lessonSlug: part_slug,
  })

  if (!data) return notFound()

  const { lesson, course, chapter, navigation } = data

  const difficulty = course.level || 'Beginner'

  const DescriptionPanel = (
    <div className="h-full border rounded-md flex flex-col overflow-hidden bg-background">
      <LessonSidebarHeader
        userId={session?.user.id}
        lessonId={lesson.id}
        courseId={course.id}
        courseSlug={course_slug}
        chapterSlug={chapter_slug}
        partSlug={part_slug}
        exercise={lesson.exercise}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col mb-4">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {chapter.title}
          </span>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold">{lesson.title}</h1>
            <div className="flex gap-2 shrink-0">
              <LessonStatusBadge
                userId={session?.user.id || ''}
                lessonId={lesson.id}
                courseId={course.id}
              />
              <Badge
                variant="outline"
                className={cn(
                  'border-amber-500/20',
                  difficulty === 'BEGINNER' ? 'text-green-500' : 'text-amber-500',
                )}
              >
                {difficulty}
              </Badge>
            </div>
          </div>
        </div>

        <article className="prose prose-sm dark:prose-invert max-w-none">{children}</article>
      </div>

      <footer className="shrink-0 border-t flex items-center justify-between p-2 bg-muted/5">
        <LessonRatingButtons userId={session?.user.id} lessonId={lesson.id} />
      </footer>
    </div>
  )

  const EditorPanel = (
    <div className="flex-1 border rounded-md overflow-hidden h-full">
      <LessonExercisePanel
        exercise={lesson.exercise}
        userId={session?.user.id}
        lessonId={lesson.id}
        courseId={course.id}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />

      <main className="flex-1 w-full overflow-hidden p-1 flex flex-col gap-1">
        {/* VUE DESKTOP */}
        <div className="hidden md:flex flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="w-full h-full gap-0.5">
            <ResizablePanel defaultSize={50} minSize={30}>
              {DescriptionPanel}
            </ResizablePanel>
            <ResizableHandle className="w-1 bg-transparent hover:bg-border rounded-md transition-all" />
            <ResizablePanel defaultSize={50} minSize={30} className="flex">
              {EditorPanel}
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* VUE MOBILE */}
        <Tabs defaultValue="content" className="flex md:hidden flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-hidden mb-1">
            <TabsContent value="content" className="h-full m-0">
              {DescriptionPanel}
            </TabsContent>
            <TabsContent value="ide" className="h-full m-0">
              {EditorPanel}
            </TabsContent>
          </div>

          <TabsList className="grid grid-cols-2 w-full h-12 bg-muted/50 border shrink-0">
            <TabsTrigger value="content" className="gap-2">
              <BookOpen className="h-4 w-4" /> Description
            </TabsTrigger>
            <TabsTrigger value="ide" className="gap-2">
              <Code2 className="h-4 w-4" /> Code
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* NAVIGATION GLOBALE */}
        <footer className="h-14 border rounded-md flex items-center justify-between px-4 bg-background shrink-0">
          <Button variant="outline" size="sm" asChild disabled={!navigation.prev}>
            <Link href={navigation.prev || '#'}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Link>
          </Button>

          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground mr-2 hidden sm:inline">
              Lesson {navigation.currentIndex + 1} of {navigation.totalLessons}
            </span>
            {/* On limite l'affichage des points si trop nombreux ou on les rend cliquables */}
            <div className="flex gap-1.5">
              {Array.from({ length: navigation.totalLessons }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === navigation.currentIndex ? 'bg-primary w-4' : 'bg-muted',
                  )}
                />
              ))}
            </div>
          </div>

          <Button size="sm" asChild disabled={!navigation.next}>
            <Link href={navigation.next || '#'}>
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </footer>
      </main>
    </div>
  )
}
