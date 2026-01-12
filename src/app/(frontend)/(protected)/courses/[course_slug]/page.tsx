import { AppHeader } from '@/components/headers/app-header'
import { TerminalDecoration } from '@/components/courses/terminal-decoration'
import { TrackFooter } from '@/components/courses/track-footer'
import { Play, Lock, CheckCircle2, Layers, FileX, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

// Imports Payload
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function CourseDetailPage({ params }: { params: Promise<{ course_slug: string }> }) {
  const { course_slug: courseId } = await params
  
  // 1. Initialisation Payload
  const payload = await getPayload({ config })

  // 2. Récupération du cours par slug avec profondeur pour les leçons
  const course = await payload.findByID({
    id: courseId,
    collection: 'courses',
    depth: 1, // Optimisé: defaultPopulate sur Lessons réduit la taille des leçons
  })

  // 3. Gestion de l'état "Cours non trouvé"
  if (!course) {
    return <EmptyCourseState message="404_COURSE_NOT_FOUND" />
  }

  // Formatage de la date de révision
  const lastRevision = new Date(course.updatedAt).toLocaleDateString('en-CA')

  // URL vers la première leçon (pour le bouton "Continuer")
  const firstModule = course.modules?.[0]
  const firstLesson = firstModule?.lessons?.[0]
  const continueUrl = firstModule && firstLesson
    ? `/courses/${course.slug}/${firstModule.slug}/${firstLesson.slug}/description`
    : '#'

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="w-full max-w-5xl mx-auto border-zinc-200 dark:border-zinc-800 sm:border-x flex-1 flex flex-col uppercase tracking-tighter">
        
        {/* Breadcrumbs */}
        <div className="px-4 sm:px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 flex items-center gap-2">
          <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white transition-colors">ROOT</Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-zinc-900 dark:hover:text-white transition-colors">COURSES</Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-bold underline decoration-1 underline-offset-2">
            {course.slug.replace(/-/g, '_').toUpperCase()}
          </span>
        </div>

        {/* Course Hero Section */}
        <div className="p-4 sm:p-10 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] px-2 py-0.5 border border-zinc-900 dark:border-white font-bold bg-zinc-900 dark:bg-white text-white dark:text-black">
                    {course.code}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black italic leading-none tracking-[-0.02em]">
                  {course.title}
                </h1>
                <p className="text-sm text-zinc-500 normal-case leading-relaxed font-medium max-w-2xl pt-2">
                  {course.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-8 pt-4">
                <StatItem label="TOTAL_RUNTIME" value={course.duration || '--H --M'} />
                <StatItem label="LAST_REVISION" value={lastRevision} />
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="w-full lg:w-64 space-y-6 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 pt-6 lg:pt-0 lg:pl-10">
              <Link
                href={continueUrl}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 text-xs font-black tracking-[0.2em] transition-colors flex items-center justify-center gap-3"
              >
                <Play size={14} fill="currentColor" /> CONTINUE_TRAINING
              </Link>
            </div>
          </div>
        </div>

        <TerminalDecoration path={`./courses/${course.slug}/modules`} />

        {/* Content Modules */}
        <div className="flex-1 bg-white dark:bg-zinc-950">
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module: any, mIdx: number) => (
              <div key={mIdx} className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 sm:px-8 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
                  <h3 className="text-xs font-black flex items-center gap-3">
                    <Layers size={14} className="text-zinc-400" />
                    {module.moduleTitle}
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">Files: {module.lessons?.length || 0}</span>
                </div>
                
                <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
                  {module.lessons?.map((lesson: any, lIdx: number) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/${module.slug}/${lesson.slug}/description`}
                      className="group flex items-center gap-6 px-4 sm:px-8 py-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                    >
                      <span className="text-[10px] font-mono text-zinc-400 w-6">
                        {(lIdx + 1).toString().padStart(2, '0')}
                      </span>

                      <div className="flex-1">
                        <h4 className="text-sm font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {lesson.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="w-10 flex justify-center">
                          {/* Logique de status à lier plus tard à l'user progress */}
                          <Play size={16} className="text-zinc-900 dark:text-white group-hover:scale-125 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-zinc-400 space-y-4">
              <FileX size={40} className="opacity-20" />
              <span className="text-xs font-bold tracking-widest uppercase">No_modules_indexed_for_this_node</span>
            </div>
          )}
        </div>

        <TrackFooter progress={0} />
      </main>
    </div>
  )
}

function StatItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-zinc-400 font-bold">{label}</span>
      <span className="text-sm font-bold tracking-normal">{value}</span>
    </div>
  )
}

function EmptyCourseState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 uppercase tracking-tighter">
      <div className="p-10 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center space-y-6">
        <h2 className="text-2xl font-black italic">{message}</h2>
        <Link href="/courses" className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-[10px] font-bold">
          <ArrowLeft size={12} /> Return_to_Registry
        </Link>
      </div>
    </div>
  )
}