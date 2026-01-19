'use client'

import { Eclipse } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AuthNav } from '@/components/nav/auth-nav'
import { cn } from '@/lib/utils'

export const navItems = [
  { label: 'Courses', href: '/courses' },
  // { label: 'Tutorials', href: '/tutorials' },
  { label: 'Articles', href: '/articles' },
  { label: 'Blog', href: '/blog' },
]

export const AppHeader = ({ className }: { className?: string }) => {
  const pathname = usePathname()

  return (
    <header
      className={cn(
        'flex sticky top-0 z-50 bg-background/80 backdrop-blur-md items-center justify-between border-b h-14 px-4',
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Eclipse className="w-6 h-6 text-primary" />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Côté droit : Auth (Avatar ou Login/Signup) */}
      <div className="flex items-center gap-4">
        <AuthNav />
      </div>
    </header>
  )
}
