'use client'

import { FileText, Code2, History } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface ChallengeNavigationProps {
  challengeSlug: string
}

export function ChallengeNavigation({ challengeSlug }: ChallengeNavigationProps) {
  const pathname = usePathname()

  const activeTab = (() => {
    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    if (['description', 'solution', 'submissions'].includes(lastSegment)) {
      return lastSegment
    }
    return 'description'
  })()

  const basePath = `/challenges/${challengeSlug}`

  const getTabClass = (tabName: string) => cn(
    "flex-1 gap-2 rounded-none border-0 border-b h-12 transition-all",
    activeTab === tabName
      ? "bg-background border-b-2 border-primary font-bold text-foreground"
      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
  )

  return (
    <header className="shrink-0 border-b">
      <ButtonGroup className="w-full">
        <Button variant="ghost" className={getTabClass('description')} asChild>
          <Link href={`${basePath}/description`}>
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Description</span>
          </Link>
        </Button>

        <Button variant="ghost" className={getTabClass('solution')} asChild>
          <Link href={`${basePath}/solution`}>
            <Code2 className="h-4 w-4" />
            <span className="hidden sm:inline">Solution</span>
          </Link>
        </Button>

        <Button variant="ghost" className={getTabClass('submissions')} asChild>
          <Link href={`${basePath}/submissions`}>
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Submissions</span>
          </Link>
        </Button>
      </ButtonGroup>
    </header>
  )
}
