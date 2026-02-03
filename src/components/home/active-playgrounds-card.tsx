import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Code } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia, EmptyContent } from '@/components/ui/empty'
import { Code as CodeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ActivePlaygroundsCardProps {
  hasActivePlaygrounds?: boolean
}

export function ActivePlaygroundsCard({ hasActivePlaygrounds = false }: ActivePlaygroundsCardProps) {
  if (!hasActivePlaygrounds) {
    return (
      <Card className="rounded-none bg-background border-dashed py-2">
        <CardHeader className="border-b px-4 py-2 [.border-b]:pb-2 border-dashed">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
              <Code className="w-4 h-4 text-zinc-500" />
              <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Active Playgrounds</span>
            </CardTitle>
            <CardDescription className="text-xs">Recent coding environments</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CodeIcon />
              </EmptyMedia>
              <EmptyTitle>No active playgrounds</EmptyTitle>
              <EmptyDescription>
                Create a new playground to start coding and experimenting with Python code.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm" className="rounded-none border-2 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-none">
                <Link href="/playground">Create Playground</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-none bg-background gap-0 pb-0 pt-2">
      <CardHeader className="border-b px-4 py-2 [.border-b]:pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
            <Code className="w-4 h-4 text-zinc-500" />
            <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Active Playgrounds</span>
          </CardTitle>
          <CardDescription className="text-xs">Recent coding environments</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-800">
          <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <Code className="w-4 h-4 text-zinc-400" />
              <span className="text-[9px] text-zinc-400 tracking-wider">2h ago</span>
            </div>
            <h4 className="font-bold text-sm mb-1 tracking-tight">Data Structures</h4>
            <p className="text-xs text-zinc-500">Arrays, trees, graphs</p>
          </div>
          <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <Code className="w-4 h-4 text-zinc-400" />
              <span className="text-[9px] text-zinc-400 tracking-wider">1d ago</span>
            </div>
            <h4 className="font-bold text-sm mb-1 tracking-tight">API Integration</h4>
            <p className="text-xs text-zinc-500">REST endpoints</p>
          </div>
          <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group">
            <div className="flex items-start justify-between mb-2">
              <Code className="w-4 h-4 text-zinc-400" />
              <span className="text-[9px] text-zinc-400 tracking-wider">3d ago</span>
            </div>
            <h4 className="font-bold text-sm mb-1 tracking-tight">Async Demo</h4>
            <p className="text-xs text-zinc-500">Async/await patterns</p>
          </div>
          <div className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer flex items-center justify-center group">
            <div className="text-center">
              <div className="text-2xl mb-1">+</div>
              <p className="text-xs text-zinc-400 tracking-wider">New Playground</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/30 border-t px-4 py-3 [.border-t]:pt-3">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider">3 active playgrounds</span>
          <span className="flex items-center gap-1">
            <span className="text-xs">See more</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
