import { Card, CardContent } from '@/components/ui/card'
import { Check, Circle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'

export function ChallengesCatalogCard() {
  return (
    <>
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search challenges..."
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="algorithms">Algorithms</SelectItem>
              <SelectItem value="data-structures">Data Structures</SelectItem>
              <SelectItem value="oop">OOP Patterns</SelectItem>
              <SelectItem value="async">Async Python</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-none bg-background gap-0 pb-0 pt-2">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900/30 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="w-10 px-4 py-3 text-left text-[10px] uppercase tracking-wider text-zinc-400 font-bold"></th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Challenge</th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Category</th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Difficulty</th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-wider text-zinc-400 font-bold">XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <Check className="w-4 h-4 text-emerald-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completed</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">
                  <Link href="/challenges/list-comprehension-mastery/description" className="block">
                    <div className="font-bold text-sm tracking-tight hover:text-primary transition-colors">List Comprehension Mastery</div>
                    <div className="text-xs text-zinc-500">Transform nested loops into elegant one-liners</div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-zinc-400 tracking-wider">ALG</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] border px-2 py-0.5 font-bold text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20 uppercase tracking-wider">
                    Intermediate
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold tabular-nums text-zinc-600 dark:text-zinc-400">+50</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <Loader2 className="w-4 h-4 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>In Progress</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">
                  <Link href="/challenges/binary-tree-traversal/description" className="block">
                    <div className="font-bold text-sm tracking-tight hover:text-primary transition-colors">Binary Tree Traversal</div>
                    <div className="text-xs text-zinc-500">Implement in-order, pre-order, and post-order</div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-zinc-400 tracking-wider">DS</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] border px-2 py-0.5 font-bold text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20 uppercase tracking-wider">
                    Intermediate
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold tabular-nums text-zinc-600 dark:text-zinc-400">+75</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <Circle className="w-4 h-4 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Not Started</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">
                  <Link href="/challenges/decorator-pattern/description" className="block">
                    <div className="font-bold text-sm tracking-tight hover:text-primary transition-colors">Decorator Pattern</div>
                    <div className="text-xs text-zinc-500">Implement Python decorators from scratch</div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-zinc-400 tracking-wider">OOP</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] border px-2 py-0.5 font-bold text-amber-600 border-amber-200 bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:bg-amber-950/20 uppercase tracking-wider">
                    Intermediate
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold tabular-nums text-zinc-600 dark:text-zinc-400">+60</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <Circle className="w-4 h-4 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Not Started</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">
                  <Link href="/challenges/async-http-server/description" className="block">
                    <div className="font-bold text-sm tracking-tight hover:text-primary transition-colors">Async HTTP Server</div>
                    <div className="text-xs text-zinc-500">Build async web server with aiohttp</div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-zinc-400 tracking-wider">ASYNC</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] border px-2 py-0.5 font-bold text-rose-600 border-rose-200 bg-rose-50 dark:text-rose-400 dark:border-rose-900/50 dark:bg-rose-950/20 uppercase tracking-wider">
                    Advanced
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold tabular-nums text-zinc-600 dark:text-zinc-400">+100</span>
                </td>
              </tr>
              <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <td className="px-4 py-4">
                  <Tooltip>
                    <TooltipTrigger>
                      <Check className="w-4 h-4 text-emerald-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Completed</p>
                    </TooltipContent>
                  </Tooltip>
                </td>
                <td className="px-6 py-4">
                  <Link href="/challenges/merge-sort-implementation/description" className="block">
                    <div className="font-bold text-sm tracking-tight hover:text-primary transition-colors">Merge Sort Implementation</div>
                    <div className="text-xs text-zinc-500">Classic divide and conquer algorithm</div>
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-zinc-400 tracking-wider">ALG</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[9px] border px-2 py-0.5 font-bold text-emerald-600 border-emerald-200 bg-emerald-50 dark:text-emerald-400 dark:border-emerald-900/50 dark:bg-emerald-950/20 uppercase tracking-wider">
                    Beginner
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold tabular-nums text-zinc-600 dark:text-zinc-400">+40</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
    </>
  )
}

