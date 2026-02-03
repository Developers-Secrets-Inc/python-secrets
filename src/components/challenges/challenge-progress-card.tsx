import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function ChallengeProgressCard() {
  return (
    <Card className="rounded-none bg-background">
      <CardHeader>
        <CardTitle className="tracking-tight uppercase text-xs text-zinc-400 font-bold tracking-widest">
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50 rounded-none">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700 dark:text-amber-400 tracking-tight">15 Challenges Completed!</span>
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Keep solving to maintain your streak</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-200 dark:divide-zinc-800">
            <div className="px-2">
              <div className="text-lg font-bold tabular-nums">15</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Solved</div>
            </div>
            <div className="px-2">
              <div className="text-lg font-bold tabular-nums">750</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">XP Earned</div>
            </div>
            <div className="px-2">
              <div className="text-lg font-bold tabular-nums">5</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Day Streak</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
