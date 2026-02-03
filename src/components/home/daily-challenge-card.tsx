import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Zap } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface DailyChallengeCardProps {
  showViewAllLink?: boolean
  useLinks?: boolean
}

export function DailyChallengeCard({ showViewAllLink = false, useLinks = false }: DailyChallengeCardProps) {
  const challengeSlug = 'list-comprehension-mastery'

  return (
    <Card className="rounded-none bg-background gap-0 py-0 pt-2">
      <CardHeader className="border-b px-4 py-2 [.border-b]:pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base tracking-tight">
            <Target className="w-4 h-4 text-zinc-500" />
            <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Daily Challenge</span>
          </CardTitle>
          <CardDescription className="text-xs">Test your skills with today&apos;s challenge</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4 pb-4 bg-background">
        {useLinks ? (
          <Link href={`/challenges/${challengeSlug}/description`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold mb-1 tracking-tight hover:text-primary transition-colors">List Comprehension Mastery</h3>
                <p className="text-sm text-zinc-500">Transform nested loops into elegant one-liners</p>
              </div>
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
          </Link>
        ) : (
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold mb-1 tracking-tight">List Comprehension Mastery</h3>
              <p className="text-sm text-zinc-500">Transform nested loops into elegant one-liners</p>
            </div>
            <Zap className="w-5 h-5 text-amber-500" />
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[9px] border px-2 py-0.5 font-bold text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20 uppercase tracking-wider">
              +50 XP
            </span>
            <span className="text-[9px] border px-2 py-0.5 font-bold text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20 uppercase tracking-wider">
              Intermediate
            </span>
          </div>
          {useLinks ? (
            <Button size="sm" variant="outline" className="rounded-none border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-none" asChild>
              <Link href={`/challenges/${challengeSlug}/description`}>
                Start Challenge
              </Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="rounded-none border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-none">
              Start Challenge
            </Button>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/30 border-t px-4 py-3 [.border-t]:pt-3">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider">Resets in 8 hours</span>
          {showViewAllLink && (
            <Link href="/challenges" className="flex items-center gap-1">
              <span className="text-xs">View all challenges</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
