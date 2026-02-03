'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/user/user-avatar'
import { Menu, LayoutDashboard } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navItems } from '@/components/headers/app-header'
import { cn } from '@/lib/utils'

export const AuthNav = () => {
  const { data: session, isPending } = authClient.useSession()
  const pathname = usePathname()

  if (isPending) {
    return <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
  }

  return (
    <>
      {/* --- DESKTOP VERSION --- */}
      <div className="hidden md:flex items-center gap-3">
        {session ? (
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/home" className="flex items-center gap-2">
                Dashboard
              </Link>
            </Button>
            <UserAvatar className="h-9 w-9 border" />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>

      {/* --- MOBILE VERSION (Sheet) --- */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 border-2">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex flex-col w-full px-4">

            <div className="flex flex-col gap-6 py-6">
              
              {/* 1. Account / Auth Section (Now First) */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-2">Account</p>
                {session ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3 px-2 mb-2">
                      <UserAvatar className="h-10 w-10 border" />
                      <div className="flex flex-col text-left">
                        <span className="text-sm font-medium leading-none">{session.user.name}</span>
                        <span className="text-xs text-muted-foreground">{session.user.email}</span>
                      </div>
                    </div>
                    <Button asChild className="w-full justify-start" variant="secondary">
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link href="/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>

              {/* 2. Navigation Links Section (Now Second) */}
              <nav className="flex flex-col gap-3 border-t pt-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase px-2">Navigation</p>
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className={cn(
                      "justify-start w-full",
                      pathname === item.href && "bg-accent"
                    )}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </Button>
                ))}
              </nav>

            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}