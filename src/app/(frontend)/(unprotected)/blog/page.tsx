import { TrackHeader } from '@/components/courses/track-header'
import { TerminalDecoration } from '@/components/courses/terminal-decoration'
import { TrackFooter } from '@/components/courses/track-footer'
import Link from 'next/link'

// Imports Payload
import { getPayload } from 'payload'
import config from '@payload-config'
import { Radio,WifiOff } from 'lucide-react'

export default async function BlogPage() {
  // 1. Initialisation de Payload
  const payload = await getPayload({ config })

  // 2. Récupération de tous les posts triés par date
  const { docs: allPosts } = await payload.find({
    collection: 'blog',
    sort: '-publishedDate',
  })

  // 3. Logique de tri Featured / Regular
  const featuredPost = allPosts.find(p => p.isFeatured)
  const regularPosts = featuredPost 
    ? allPosts.filter(p => p.id !== featuredPost.id) 
    : allPosts

  return (
      <main className="w-full max-w-5xl mx-auto border-zinc-200 dark:border-zinc-800 sm:border-x flex-1 flex flex-col uppercase tracking-tighter">
        <TrackHeader
          title="Communications Log"
          version="v3.0_STABLE"
          description="Internal dispatches, editorial thoughts, and system updates from the engineering core."
          progressPercent={100}
          stats={{
            courses: allPosts.length,
            completed: 256, // Valeur statique ou provenant d'analytics
            duration: 'WEEKLY',
            difficulty: 'PUBLIC',
          }}
        />

        <TerminalDecoration path="./root/logs/comms" />

        {allPosts.length > 0 ? (
          <>
            {/* FEATURED POST */}
            {featuredPost && (
              <Link 
                href={`/blog/${featuredPost.slug}`}
                className="group relative border-b border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-2">
                    <Radio size={12} className="animate-pulse" /> FEATURED_DISPATCH
                  </span>
                  <span className="text-zinc-400 text-xs font-mono">ID: {featuredPost.code}</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black italic leading-none mb-6 group-hover:underline underline-offset-8">
                  {featuredPost.title}
                </h2>
                <p className="max-w-2xl text-sm sm:text-base text-zinc-500 normal-case mb-8 leading-relaxed font-medium">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-6 text-[10px] font-bold">
                  <div><span className="text-zinc-400">AUTH:</span> ADMIN_CORE</div>
                  <div>
                    <span className="text-zinc-400">STAMP:</span> {new Date(featuredPost.publishedDate).toLocaleDateString('en-CA').replace(/-/g, '.')}
                  </div>
                </div>
              </Link>
            )}

            {/* FEED GRID (2 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 flex-1">
              {regularPosts.map((post, idx) => (
                <BlogPostCard key={post.id} post={post} idx={idx} />
              ))}
            </div>
          </>
        ) : (
          <EmptyBlogState />
        )}

        <TrackFooter progress={100} />
      </main>
  )
}

/**
 * Composant Carte pour le flux régulier
 */
function BlogPostCard({ post, idx }: { post: any, idx: number }) {
  const dateObj = new Date(post.publishedDate)
  const formattedDate = dateObj.toLocaleDateString('en-CA').replace(/-/g, '.')
  const formattedTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`
        p-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col
        ${idx % 2 === 0 ? 'md:border-r' : ''}
        hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors group
      `}
    >
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-zinc-400">REF_{post.code}</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase">{post.category}</span>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-bold text-zinc-900 dark:text-zinc-100">{formattedDate}</span>
          <span className="block text-[10px] text-zinc-400 font-mono">{formattedTime}</span>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-xs text-zinc-500 normal-case leading-relaxed line-clamp-2 font-medium">
          {post.excerpt}
        </p>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-[10px] font-bold">BY_SYSTEM_ARCH</span>
        <span className="text-[10px] font-bold tracking-[0.2em] group-hover:translate-x-2 transition-transform">
          READ_LOG —&gt;
        </span>
      </div>
    </Link>
  )
}

/**
 * État vide stylisé pour le Blog
 */
function EmptyBlogState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
      <WifiOff size={40} className="text-zinc-300 dark:text-zinc-700 mb-4" />
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black italic">NO_LOGS_DETECTED</h3>
        <p className="text-sm text-zinc-500 normal-case max-w-xs mx-auto leading-relaxed">
          The communications frequency is silent. No transmissions have been recorded in the current epoch.
        </p>
      </div>
      <div className="mt-8 px-4 py-1 border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 animate-pulse font-mono">
        SCANNING_FOR_SIGNALS...
      </div>
    </div>
  )
}