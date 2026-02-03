import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export function ChallengesLeaderboardCard() {
  return (
    <Card className="rounded-none bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
          <Trophy className="w-4 h-4 text-zinc-500" />
          <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="p-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-none bg-zinc-50 dark:bg-zinc-900/30">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
          <h3 className="font-bold mb-2 tracking-tight uppercase text-xs tracking-wider">Coming Soon</h3>
          <p className="text-sm text-zinc-500">Compete with other learners and climb the ranks</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-zinc-400 border border-zinc-300 dark:border-zinc-700 px-3 py-1 rounded-none">
            <span>🚀</span>
            <span className="uppercase tracking-wider">In Development</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
