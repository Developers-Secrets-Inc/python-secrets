// components/courses/lessons/nav/lesson-sidebar-header.tsx
'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FileText, Lightbulb, History, Lock, Unlock, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { useLessonProgress } from '@/hooks/courses/lessons/use-lesson-progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Exercise {
  relationTo: string
  value: string | number
}

interface LessonSidebarHeaderProps {
  userId: string
  lessonId: number
  courseId: number
  courseSlug: string
  chapterSlug: string
  partSlug: string
  exercise: Exercise | null
}

export function LessonSidebarHeader({
  userId,
  lessonId,
  courseId,
  courseSlug,
  chapterSlug,
  partSlug,
  exercise,
}: LessonSidebarHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)

  const { isUnlocked, isLoading, unlockSolution, isUpdating } = useLessonProgress(userId, lessonId, courseId)

  const showSolutionTab = useMemo(() => {
    return exercise?.relationTo === 'challenges-exercices'
  }, [exercise])

  const activeTab = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    if (['description', 'solution', 'submissions'].includes(lastSegment)) {
      return lastSegment
    }
    return 'description'
  }, [pathname])

  const basePath = `/courses/${courseSlug}/${chapterSlug}/${partSlug}`

  useEffect(() => {
    if (!showSolutionTab && activeTab === 'solution') {
      router.push(`${basePath}/description`)
    }
  }, [showSolutionTab, activeTab, basePath, router])

  const getTabClass = (tabName: string) => cn(
    "flex-1 gap-2 rounded-none border-0 border-b h-12 transition-all",
    activeTab === tabName
      ? "bg-background border-b-2 border-primary font-bold text-foreground"
      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
  )

  const handleSolutionClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Si déjà débloqué ou en chargement, on laisse le lien fonctionner normalement
    if (!isUnlocked && !isLoading) {
      e.preventDefault()
      setShowUnlockDialog(true)
    }
  }

  const handleConfirmUnlock = async () => {
    try {
      await unlockSolution() // Attend la fin de la requête serveur
      setShowUnlockDialog(false) // Ferme le dialogue
      router.push(`${basePath}/solution`) // Change d'onglet
    } catch (error) {
      console.error("Failed to unlock:", error)
    }
  }

  return (
    <>
      <header className="shrink-0 border-b">
        <ButtonGroup className="w-full">
          <Button variant="ghost" className={cn(getTabClass('description'))} asChild>
            <Link href={`${basePath}/description`}>
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Description</span>
            </Link>
          </Button>

          {showSolutionTab && (
            <Button
              variant="ghost"
              className={cn(getTabClass('solution'))}
              asChild
              disabled={isLoading}
            >
              <Link href={`${basePath}/solution`} onClick={handleSolutionClick}>
                {isLoading ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : isUnlocked ? (
                  <Lightbulb className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="hidden sm:inline">Solution</span>
              </Link>
            </Button>
          )}

          <Button variant="ghost" className={cn(getTabClass('submissions'))} asChild>
            <Link href={`${basePath}/submissions`}>
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Submissions</span>
            </Link>
          </Button>
        </ButtonGroup>
      </header>

      <Dialog open={showUnlockDialog} onOpenChange={isUpdating ? undefined : setShowUnlockDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-center text-xl">Unlock Solution?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Trying to solve it yourself is the best way to learn!
              Unlocking will reveal the full code.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex sm:justify-center gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowUnlockDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmUnlock}
              disabled={isUpdating}
              className="gap-2 min-w-[140px]"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Unlocking...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Yes, reveal
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}