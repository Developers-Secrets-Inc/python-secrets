import { TrackHeader } from '@/components/courses/track-header'
import { TerminalDecoration } from '@/components/courses/terminal-decoration'
import { TrackFooter } from '@/components/courses/track-footer'
import Link from 'next/link'

// Imports Payload
import { getPayload } from 'payload'
import config from '@payload-config'
import { FileSearch, Terminal as TerminalIcon } from 'lucide-react'

export default async function ArticlesPage() {
  // 1. Initialisation de Payload
  const payload = await getPayload({ config })

  // 2. Récupération des articles
  const { docs: articles } = await payload.find({
    collection: 'articles',
    sort: '-publishedDate', // Tri du plus récent au plus ancien
  })

  return (
      <main className="w-full max-w-5xl mx-auto border-zinc-200 dark:border-zinc-800 sm:border-x flex-1 flex flex-col uppercase tracking-tighter">
        <TrackHeader
          title="Technical Archive"
          version="v1.0.4"
          description="Internal documentation and technical deep-dives on system architecture and modern engineering."
          progressPercent={100}
          stats={{
            courses: articles.length,
            completed: articles.length, 
            duration: 'INDEXED',
            difficulty: 'STABLE',
          }}
        />

        <TerminalDecoration path="./root/docs/articles" />

        {/* 3. Condition d'affichage : Grille ou État Vide */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full flex-1">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <EmptyArticlesState />
        )}

        <TrackFooter progress={100} />
      </main>
  )
}

/**
 * Composant d'état vide stylisé "Système"
 */
function EmptyArticlesState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
      <div className="relative mb-6">
        <FileSearch size={48} className="text-zinc-300 dark:text-zinc-700" />
        <TerminalIcon size={20} className="absolute -bottom-2 -right-2 text-emerald-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black italic">404_DOCUMENTS_NOT_FOUND</h3>
        <p className="text-sm text-zinc-500 normal-case max-w-xs mx-auto leading-relaxed">
          The directory <code className="bg-zinc-100 dark:bg-zinc-800 px-1">/root/docs/articles</code> is currently empty or the index is being rebuilt.
        </p>
      </div>
      <div className="mt-8 flex gap-4">
        <div className="h-px w-12 bg-zinc-200 dark:border-zinc-800 self-center"></div>
        <span className="text-[10px] font-mono text-zinc-400">WAITING_FOR_INPUT</span>
        <div className="h-px w-12 bg-zinc-200 dark:border-zinc-800 self-center"></div>
      </div>
    </div>
  )
}

/**
 * Carte Article adaptée aux données de Payload
 */
function ArticleCard({ article }: { article: any }) {
  // Adaptation des dates (Payload stocke en ISO string)
  const formattedDate = new Date(article.publishedDate).toLocaleDateString('en-CA') // YYYY-MM-DD

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="relative flex flex-col p-6 min-h-[280px] border-b border-zinc-200 dark:border-zinc-800 md:border-r md:[&:nth-child(2n)]:border-r-0 lg:border-r lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(3n)]:border-r-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <span className="text-[10px] font-bold text-zinc-400">
          [{article.code || 'UNTITLED'}]
        </span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 bg-zinc-100 dark:bg-zinc-800 uppercase font-mono">
          {article.category}
        </span>
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold leading-[1.1] mb-3 group-hover:underline decoration-1 underline-offset-4">
          {article.title}
        </h2>
        <p className="text-[11px] text-zinc-500 normal-case leading-relaxed line-clamp-3 font-medium">
          {article.subtitle}
        </p>
      </div>

      <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-900/50 flex justify-between items-end">
        <div className="space-y-1">
          <span className="block text-[8px] text-zinc-400 font-bold uppercase">Published_Revision</span>
          <span className="text-[10px] font-bold tabular-nums">{article.revision || formattedDate}</span>
        </div>
        <div className="text-right space-y-1">
          <span className="block text-[8px] text-zinc-400 font-bold uppercase">Checksum</span>
          <span className="text-[10px] font-bold tabular-nums text-emerald-600 dark:text-emerald-500 uppercase">
            {article.hash || 'Verified'}
          </span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-zinc-900 dark:group-hover:border-white pointer-events-none m-[-1px] z-10" />
    </Link>
  )
}