import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function CourseCatalogCard() {
  return (
    <Card className="rounded-none bg-background gap-0 pb-0 pt-2">
      <CardHeader className="border-b px-4 py-2 [.border-b]:pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
            <BookOpen className="w-4 h-4 text-zinc-500" />
            <span className="uppercase text-xs text-zinc-400 font-bold tracking-widest">Course Catalog</span>
          </CardTitle>
          <CardDescription className="text-xs">Browse all available courses</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x divide-zinc-200 dark:divide-zinc-800">
          <Link href="/courses" className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">[PY101]</span>
              <span className="text-[9px] border px-2 py-0.5 font-bold text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20 uppercase tracking-wider">
                BEGINNER
              </span>
            </div>
            <h3 className="font-bold text-sm mb-1 tracking-tight">Python Fundamentals</h3>
            <p className="text-xs text-zinc-500">12/24 lessons</p>
          </Link>
          <Link href="/courses" className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">[PY201]</span>
              <span className="text-[9px] border px-2 py-0.5 font-bold text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20 uppercase tracking-wider">
                INTERMEDIATE
              </span>
            </div>
            <h3 className="font-bold text-sm mb-1 tracking-tight">Advanced OOP</h3>
            <p className="text-xs text-zinc-500">8/18 lessons</p>
          </Link>
          <Link href="/courses" className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">[PY301]</span>
              <span className="text-[9px] border px-2 py-0.5 font-bold text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-900/50 dark:bg-rose-950/20 uppercase tracking-wider">
                ADVANCED
              </span>
            </div>
            <h3 className="font-bold text-sm mb-1 tracking-tight">Async Python</h3>
            <p className="text-xs text-zinc-500">3/12 lessons</p>
          </Link>
          <Link href="/courses" className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 tracking-wider">[PY401]</span>
              <span className="text-[9px] border px-2 py-0.5 font-bold text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-900/50 dark:bg-rose-950/20 uppercase tracking-wider">
                ADVANCED
              </span>
            </div>
            <h3 className="font-bold text-sm mb-1 tracking-tight">Distributed Systems</h3>
            <p className="text-xs text-zinc-500">0/20 lessons</p>
          </Link>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-50 dark:bg-zinc-900/30 border-t px-4 py-3 [.border-t]:pt-3">
        <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-[10px] uppercase tracking-wider">24 courses available</span>
          <span className="flex items-center gap-1">
            <span className="text-xs">See more</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
