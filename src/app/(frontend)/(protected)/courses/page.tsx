import { AppHeader } from '@/components/headers/app-header'
import { CourseCard } from '@/components/courses/course-card'
import { TerminalDecoration } from '@/components/courses/terminal-decoration'
import { TrackFooter } from '@/components/courses/track-footer'

// Imports Payload
import { getPayload } from 'payload'
import config from '@payload-config'
import { Database, FolderX } from 'lucide-react'
import { TrackHeader } from '@/components/courses/track-header'

export default async function Page() {
  // 1. Initialisation de Payload
  const payload = await getPayload({ config })

  // 2. Récupération des formations (optimisé: depth: 0 évite de peupler les relations)
  // Note: On n'utilise pas select ici car les champs sont dans des tabs et Payload
  // ne supporte pas bien select sur les champs dans des tabs
  const { docs: courses } = await payload.find({
    collection: 'courses',
    sort: 'title', // Tri alphabétique par défaut
    depth: 0, // Pas de profondeur = pas de population des relations (modules.lessons reste des IDs)
  })

  // 3. Calculs des stats (Simulation du complété à 0 en attendant l'auth)
  const completedCount = 0 
  const progressPercent = courses.length > 0 ? Math.round((completedCount / courses.length) * 100) : 0

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="w-full max-w-5xl mx-auto border-zinc-200 dark:border-zinc-800 sm:border-x flex-1 flex flex-col uppercase tracking-tighter">
        <TrackHeader
          title="Mastery Curriculum"
          version="v2024.1"
          description="Comprehensive learning paths designed for professional engineers. From core language internals to distributed systems architecture."
          progressPercent={progressPercent}
          stats={{
            courses: courses.length,
            completed: completedCount,
            duration: 'EST_VARIES',
            difficulty: 'MLTI',
          }}
        />

        <TerminalDecoration path="./root/curriculum/active" />

        <div className="flex flex-col flex-1">
          {courses.length > 0 ? (
            courses.map((course) => (
              // On passe le document Payload à CourseCard
              // On s'assure que le composant CourseCard gère les propriétés de Payload (ex: slug au lieu de id)
              <CourseCard key={course.id} course={course as any} />
            ))
          ) : (
            <EmptyCoursesState />
          )}
        </div>

        <TrackFooter progress={progressPercent} />
      </main>
    </div>
  )
}

/**
 * Composant d'état vide pour les Formations
 */
function EmptyCoursesState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
      <div className="relative mb-6">
        <Database size={48} className="text-zinc-300 dark:text-zinc-700" />
        <FolderX size={20} className="absolute -bottom-1 -right-1 text-rose-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black italic">404_CURRICULUM_NOT_FOUND</h3>
        <p className="text-xs text-zinc-500 normal-case max-w-xs mx-auto leading-relaxed">
          The educational database is offline or empty. No active training modules were detected in the system registry.
        </p>
      </div>
      <div className="mt-8 px-4 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
        <span className="text-[10px] font-mono text-zinc-500 animate-pulse">
          SYSTEM_IDLE: AWAITING_CONTENT_SYNC
        </span>
      </div>
    </div>
  )
}