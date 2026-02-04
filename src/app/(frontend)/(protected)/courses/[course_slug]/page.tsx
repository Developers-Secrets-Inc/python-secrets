import { AppHeader } from '@/components/headers/app-header'
import { Play, ArrowLeft, Clock, Calendar, Code, Rocket, Award, Infinity, HelpCircle, Target, FileX } from 'lucide-react'
import Link from 'next/link'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

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

  // Description enrichie pour la formation
  const courseDescription = course.description
    ? `${course.description}\n\nThis comprehensive training program is designed to take you from beginner to advanced level. You'll learn through hands-on exercises, real-world projects, and expert-led instruction.\n\nWhat you'll learn:\n• Master core concepts and best practices\n• Build practical, production-ready applications\n• Understand advanced techniques and patterns\n• Develop problem-solving skills through challenging exercises\n\nPrerequisites: Basic familiarity with programming concepts. No prior experience with this specific technology required.\n\nUpon completion, you'll have the skills and confidence to tackle complex projects and contribute to professional development teams.`
    : "A comprehensive training program designed to take you from beginner to advanced level through hands-on exercises and real-world projects."

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

      <main className="flex-1 bg-white dark:bg-zinc-950 py-12">
        <div className="max-w-5xl mx-auto border-x border-y border-zinc-200 dark:border-zinc-800 min-h-screen flex flex-col">
          {/* Two Column Layout */}
          <div className="py-8 flex-1">

            {/* Header Section - Title, Code, Badges & Stats */}
            <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 pb-8 border-b border-zinc-200 dark:border-zinc-800">
              {/* Left Column - Title & CTA */}
              <div className="lg:col-span-2 space-y-4">
                {/* Course Code Badge */}
                <div className="flex items-start gap-3">
                  <span className="text-xs px-3 py-1 border border-zinc-900 dark:border-white font-bold bg-zinc-900 dark:bg-white text-white dark:text-black">
                    {course.code}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  {course.title}
                </h1>

                {/* Short Description */}
                <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                  {course.description}
                </p>

                {/* Duration & Date */}
                <div className="flex flex-wrap gap-8">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock size={16} className="text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">Duration</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{course.duration || '--H --M'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-zinc-400" />
                    <span className="text-zinc-600 dark:text-zinc-400">Last updated</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{lastRevision}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  href={continueUrl}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 text-sm font-semibold transition-colors"
                >
                  <Play size={16} fill="currentColor" />
                  Continue Training
                </Link>
              </div>

              {/* Right Column - Course Badges */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Course Info</h3>

                <div className="space-y-3">
                  {/* Level Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Level</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium rounded">
                      Intermediate
                    </span>
                  </div>

                  {/* Type Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Type</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium rounded">
                      Interactive
                    </span>
                  </div>

                  {/* Challenges Count */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Challenges</span>
                    <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium rounded">
                      {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                    </span>
                  </div>

                  {/* Students Count (dummy) */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">Students</span>
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-medium rounded">
                      2.4k enrolled
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content & Outline Grid */}
            <div className="px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
              {/* Left Column - Course Content/Description */}
              <div className="lg:col-span-3 space-y-6 border-r border-zinc-200 dark:border-zinc-800 pr-8 pt-8">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">About this course</h2>
                <div className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-4">
                  {courseDescription.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Right Column - Sticky CTA */}
              <div className="lg:col-span-2 pt-8">
                <div className="sticky top-8 space-y-6">
                  {/* Main CTA Button */}
                  <Link
                    href={continueUrl}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-3 rounded-lg shadow-lg shadow-emerald-600/20"
                  >
                    <Play size={18} fill="currentColor" />
                    Start Learning
                  </Link>

                  {/* Pricing Badge */}
                  <div className="text-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-full border border-emerald-200 dark:border-emerald-800">
                  Free
                    </span>
                  </div>

                  {/* What's Included Card */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">What's included</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                          </p>
                          <p className="text-xs text-zinc-500">Interactive exercises</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Hands-on projects</p>
                          <p className="text-xs text-zinc-500">Real-world applications</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Certificate</p>
                          <p className="text-xs text-zinc-500">Upon completion</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Lifetime access</p>
                          <p className="text-xs text-zinc-500">Learn at your own pace</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Info Badges */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Level</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium rounded text-xs">
                        Intermediate
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Duration</span>
                      <span className="text-zinc-900 dark:text-zinc-100 font-medium">
                        {course.duration || '--H --M'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Type</span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium rounded text-xs">
                        Interactive
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Learning Method Section - Full Width */}
            <div>
              {/* Stats Grid - Inspired by Vercel */}
              <div className="grid grid-cols-2 border-t border-zinc-200 dark:border-zinc-800">
                {/* 1. Challenges Card - Deployment Style */}
                <div className="p-6 md:p-8 border-r border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center relative">
                      <Code className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950"></div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Challenges</span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Master Python through hands-on coding challenges</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Practice with real exercises to solidify your understanding</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-zinc-700 dark:text-zinc-300">List Comprehensions</span>
                      </div>
                      <span className="text-xs text-zinc-500">Done</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-zinc-700 dark:text-zinc-300">Decorator Patterns</span>
                      </div>
                      <span className="text-xs text-zinc-500">In progress</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border-2 border-zinc-300 dark:border-zinc-600"></div>
                        <span className="text-zinc-700 dark:text-zinc-300">Async/Await Mastery</span>
                      </div>
                      <span className="text-xs text-zinc-500">Up next</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                      {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0}
                    </span>
                    <span className="text-xs text-zinc-500">exercises</span>
                  </div>
                </div>

                {/* 2. Projects Card - Analytics Style */}
                <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Projects</span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Build real-world projects for your portfolio</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Create production-ready applications</p>

                  <div className="space-y-3 mb-4">
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1.5">REST API Builder</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">FastAPI</span>
                        <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">PostgreSQL</span>
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">Docker</span>
                      </div>
                    </div>
                    <div className="p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1.5">Data Pipeline</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">Pandas</span>
                        <span className="text-xs px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">Airflow</span>
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">AWS</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">3</span>
                    <span className="text-xs text-zinc-500">portfolio projects</span>
                  </div>
                </div>

                {/* 3. Interactive Card - Feature Flags Style */}
                <div className="p-6 md:p-8 border-r border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Interactive</span>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Learn by doing with interactive exercises</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Get instant feedback and learn at your own pace</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 4.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM6.5 8a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5zm-5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Instant Feedback</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ON</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-500" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 4.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zM6.5 8a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5a.5.5 0 0 0-.5.5zm-5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
                        </svg>
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Code Editor</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">ON</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="8" cy="8" r="8" fill-opacity="0.2"/>
                        </svg>
                        <span className="text-xs font-medium text-zinc-500">AI Assistant</span>
                      </div>
                      <span className="text-xs font-semibold text-zinc-400">COMING SOON</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">100</span>
                    <span className="text-xs text-zinc-500">% interactive</span>
                  </div>
                </div>

                {/* 4. Certificate Card - PR Comment Style */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Certificate</span>
                      <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded font-medium">VERIFIED</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Earn a certificate upon completion</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">Validate your skills with a recognized certificate</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm py-1.5 px-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">Available</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 px-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Format</span>
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">PDF + Digital Badge</span>
                    </div>
                    <div className="flex items-center justify-between text-sm py-1.5 px-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200 dark:border-zinc-800">
                      <span className="text-zinc-600 dark:text-zinc-400">Share</span>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.01 0-.21 0-.41V10.1c-2.23.49-2.7-1.08-2.7-1.08-.37-.94-.91-1.19-.91-1.19-.74-.51.06-.5.51-.5.74.37 1.13 1.02 1.41 1.02 1.41 1.12 1.92 2.88 1.37 3.59-1.04.12-.26.25-.51.45-.75.09-.13.52-.64.83-1.05 1.47.15 2.92-.75 3.29-2.21.34-.64.55-1.37.55-2.15 0-2.22-1.79-4.02-4.02-4.02-.37 0-.72.05-1.06.14-.28-.09-.59-.14-.91-.14-2.24 0-4.05 1.81-4.05 4.05 0 1.59.91 2.97 2.24 3.68-.23.9-.53 2.33-.59 2.64 0 .05.01.11.03.16.09.26.76 1.13.76 2.19v4.24c0 .21.14.46.55.38C13.71 14.53 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        <svg className="w-4 h-4 text-sky-500" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M12.6.75h2.454c.143 0 .26.117.26.26v10.883c0 .143-.117.26-.26.26H12.6V.75zm1.374 10.253l-.85-4.874-.995 4.874h1.845zM8.35.75h2.454c.143 0 .26.117.26.26v10.883c0 .143-.117.26-.26.26H8.35V.75zm1.374 10.253l-.85-4.874-.995 4.874h1.845zM4.1.75h2.454c.143 0 .26.117.26.26v10.883c0 .143-.117.26-.26.26H4.1V.75zm1.374 10.253l-.85-4.874-.995 4.874h1.845zM.75.75h2.454c.143 0 .26.117.26.26v10.883c0 .143-.117.26-.26.26H.75V.75z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Free</span>
                    <span className="text-xs text-zinc-500">verified certificate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Challenges Section - 2 Columns */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Included Challenges</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">Practice your skills with these hands-on coding challenges</p>
                  <div className="space-y-4">
                    {[
                      { name: 'List Comprehension Mastery', difficulty: 'Beginner', duration: '30 min', color: 'emerald' },
                      { name: 'Advanced Dictionary Manipulation', difficulty: 'Intermediate', duration: '45 min', color: 'blue' },
                      { name: 'Decorator Patterns Deep Dive', difficulty: 'Advanced', duration: '60 min', color: 'purple' },
                      { name: 'Async/Await Real-World Scenarios', difficulty: 'Intermediate', duration: '50 min', color: 'blue' },
                    ].map((challenge, idx) => (
                      <Link
                        key={idx}
                        href={`/challenges`}
                        className="group block p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {challenge.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${challenge.color}-100 dark:bg-${challenge.color}-900/30 text-${challenge.color}-700 dark:text-${challenge.color}-300`}>
                                {challenge.difficulty}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {challenge.duration}
                              </span>
                            </div>
                          </div>
                          <Play size={16} className="text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-6 border border-zinc-200 dark:border-zinc-800 sticky top-8">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Why Challenges?</h3>
                    <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        Reinforce learning through practice
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        Build muscle memory for common patterns
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        Gain confidence in your coding skills
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        Prepare for real-world scenarios
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Projects Section - Full Width */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Real-World Projects</h2>
                  <p className="text-zinc-600 dark:text-zinc-400">Build portfolio-worthy projects while learning</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: 'REST API Builder', description: 'Build a complete REST API with authentication', tags: ['FastAPI', 'PostgreSQL', 'Docker'] },
                    { title: 'Data Pipeline', description: 'Create an ETL pipeline for data processing', tags: ['Pandas', 'Airflow', 'AWS'] },
                    { title: 'Web Scraper', description: 'Build a scalable web scraping system', tags: ['BeautifulSoup', 'Scrapy', 'Redis'] },
                  ].map((project, idx) => (
                    <div key={idx} className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden group hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                      <div className="aspect-video bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                        <Code className="w-12 h-12 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">{project.title}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="text-xs px-2 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Outline - Full Width */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Course Outline</h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {course.modules?.length || 0} modules • {course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0} lessons
                </p>
                {course.modules && course.modules.length > 0 ? (
                  <Accordion type="multiple" className="space-y-3">
                    {course.modules.map((module: any, mIdx: number) => (
                      <AccordionItem
                        key={mIdx}
                        value={`module-${mIdx}`}
                        className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline bg-zinc-50 dark:bg-zinc-900/50">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="text-base font-semibold text-left text-zinc-900 dark:text-zinc-100">{module.moduleTitle}</span>
                            <span className="text-sm text-zinc-500">{module.lessons?.length || 0} lessons</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="bg-white dark:bg-zinc-950">
                            <div className="space-y-1 p-4">
                              {module.lessons?.map((lesson: any, lIdx: number) => (
                                <Link
                                  key={lesson.id}
                                  href={`/courses/${course.slug}/${module.slug}/${lesson.slug}/description`}
                                  className="group flex items-center gap-4 px-4 py-3 rounded-md transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                                >
                                  <span className="text-sm text-zinc-400 w-6">
                                    {(lIdx + 1).toString().padStart(2, '0')}
                                  </span>
                                  <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                                    {lesson.title}
                                  </span>
                                  <Play size={14} className="text-zinc-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-zinc-400 space-y-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
                    <FileX size={32} className="opacity-20" />
                    <span className="text-sm font-medium">No modules available</span>
                  </div>
                )}
              </div>
            </div>

            {/* FAQ Section - Full Width */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Frequently Asked Questions</h2>
                  <p className="text-zinc-600 dark:text-zinc-400">Everything you need to know about this course</p>
                </div>
                <Accordion type="multiple" className="space-y-3">
                  {[
                    { q: 'What are the prerequisites for this course?', a: 'Basic familiarity with programming concepts is recommended. No prior experience with this specific technology is required.' },
                    { q: 'How long do I have access to the course?', a: 'You get lifetime access to all course materials. Learn at your own pace, forever.' },
                    { q: 'Will I receive a certificate?', a: 'Yes! Upon completing the course, you\'ll receive a certificate of completion that you can share on your LinkedIn profile.' },
                    { q: 'Can I use the projects in my portfolio?', a: 'Absolutely! All projects are designed to be portfolio-worthy. You can use them to showcase your skills to potential employers.' },
                    { q: 'What if I get stuck on a challenge?', a: 'We provide hints and solutions for each challenge. You can also join our community Discord to get help from other learners.' },
                  ].map((faq, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`faq-${idx}`}
                      className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex items-start gap-3 w-full pr-4">
                          <HelpCircle size={18} className="text-zinc-400 flex-shrink-0 mt-0.5" />
                          <span className="text-base font-medium text-left text-zinc-900 dark:text-zinc-100">{faq.q}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="bg-white dark:bg-zinc-950 px-6 pb-4 pl-11">
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Similar Courses - 2 Columns */}
            <div className="px-4 sm:px-6 lg:px-8 py-12 border-t border-zinc-200 dark:border-zinc-800">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">Continue Learning</h2>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">Explore more courses to expand your skills</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { title: 'Advanced Python Patterns', level: 'Advanced', duration: '8 hours', students: '1.8k' },
                      { title: 'Testing & Debugging Mastery', level: 'Intermediate', duration: '6 hours', students: '2.1k' },
                      { title: 'Python Performance Optimization', level: 'Advanced', duration: '7 hours', students: '1.5k' },
                      { title: 'API Development with FastAPI', level: 'Intermediate', duration: '10 hours', students: '3.2k' },
                    ].map((similarCourse, idx) => (
                      <Link key={idx} href="#" className="group block bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2">
                          {similarCourse.title}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800">
                            {similarCourse.level}
                          </span>
                          <span>{similarCourse.duration}</span>
                          <span>{similarCourse.students} students</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800 sticky top-8">
                    <Infinity className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-4" />
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Ready for more?</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                      Browse our complete catalog of courses and take your skills to the next level.
                    </p>
                    <Link
                      href="/courses"
                      className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
                    >
                      View all courses
                      <ArrowLeft size={14} className="rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function EmptyCourseState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
      <div className="p-10 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center space-y-6">
        <h2 className="text-xl font-bold">{message}</h2>
        <Link href="/courses" className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-semibold">
          <ArrowLeft size={14} /> Back to Courses
        </Link>
      </div>
    </div>
  )
}