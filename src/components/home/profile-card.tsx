import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Flame } from 'lucide-react'

export function ProfileCard() {
  return (
    <Card className="rounded-none bg-background">
      <CardHeader>
        <CardTitle className="tracking-tight uppercase text-xs text-zinc-400 font-bold tracking-widest">
          Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-none bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-100 dark:to-zinc-300 flex items-center justify-center text-white dark:text-black font-bold text-lg">
              JD
            </div>
            <div>
              <h3 className="font-bold tracking-tight">John Doe</h3>
              <p className="text-xs text-zinc-400 tracking-wider uppercase">Level 5 • 1,250 XP</p>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50 rounded-none">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="font-bold text-amber-700 dark:text-amber-400 tracking-tight">7 Day Streak!</span>
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Keep learning daily to maintain your streak</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-200 dark:divide-zinc-800">
            <div className="px-2">
              <div className="text-lg font-bold tabular-nums">12</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Completed</div>
            </div>
            <div className="px-2">
              <div className="text-lg font-bold tabular-nums">3</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">In Progress</div>
            </div>
            <div className="px-2">
              <div className="text-lg font-bold tabular-nums">45h</div>
              <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Time Learned</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
