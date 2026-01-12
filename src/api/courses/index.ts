'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

interface GetLessonParams {
  courseSlug: string
  chapterSlug: string
  lessonSlug: string
}

export async function getLesson({ courseSlug, chapterSlug, lessonSlug }: GetLessonParams) {
  const payload = await getPayload({ config })

  // === REQUÊTE 1: Récupérer la structure du cours avec métadonnées leçons uniquement ===
  // Grâce à defaultPopulate sur Lessons, les leçons ne contiennent que:
  // id, title, slug, difficulty (pas de description, solution, exercise)
  const courseQuery = await payload.find({
    collection: 'courses',
    where: {
      slug: { equals: courseSlug },
    },
    depth: 1, // Populate lessons via defaultPopulate
    // Note: Pas de select ici car les champs sont dans des tabs
  })

  const course = courseQuery.docs[0]
  if (!course) return null

  const modules = course.modules || []

  const chapter = modules.find((m) => m.slug === chapterSlug)
  if (!chapter) return null

  const lessonsInChapter = chapter.lessons || []
  const lessonMetadata = lessonsInChapter.find(
    (l: any) => typeof l === 'object' && l.slug === lessonSlug
  ) as any

  if (!lessonMetadata) return null

  // === REQUÊTE 2: Récupérer le contenu complet de SEULEMENT la leçon active ===
  const fullLesson = await payload.findByID({
    collection: 'lessons',
    id: lessonMetadata.id,
    depth: 0, // Pas de profondeur automatique
    select: {
      id: true,
      title: true,
      slug: true,
      difficulty: true,
      description: true, // Contenu complet
      exercise: true,    // Relation vers quiz/challenge
    },
  })

  // Navigation: utilise les métadonnées du cours (pas besoin de contenu complet)
  const allLessonsInCourse = modules.flatMap((m) =>
    (m.lessons || []).map((l: any) => ({
      ...l,
      moduleSlug: m.slug
    }))
  )

  const currentIndex = allLessonsInCourse.findIndex((l) => l.id === fullLesson.id)

  const prevLesson = currentIndex > 0 ? allLessonsInCourse[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessonsInCourse.length - 1
    ? allLessonsInCourse[currentIndex + 1]
    : null

  return {
    lesson: fullLesson, // Leçon complète avec description et exercise
    chapter: {
      title: chapter.moduleTitle,
      slug: chapter.slug
    },
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      level: course.level,
    },
    navigation: {
      prev: prevLesson ? `/courses/${courseSlug}/${prevLesson.moduleSlug}/${prevLesson.slug}` : null,
      next: nextLesson ? `/courses/${courseSlug}/${nextLesson.moduleSlug}/${nextLesson.slug}` : null,
      currentIndex: currentIndex,
      totalLessons: allLessonsInCourse.length
    }
  }
}



export async function getProgress(userId: string, lessonId: number) {
  const payload = await getPayload({ config })
  
  const result = await payload.find({
    collection: 'user-progress',
    where: {
      and: [
        { userId: { equals: userId } },
        { lesson: { equals: lessonId } }
      ]
    }
  })

  return result.docs[0] || { status: 'not_started', solutionUnlocked: false }
}

export async function updateProgress({
  userId,
  lessonId,
  courseId,
  updates
}: {
  userId: string
  lessonId: number
  courseId: number
  updates: { solutionUnlocked?: boolean; status?: 'completed' | 'in_progress' }
}) {
  const payload = await getPayload({ config })

    console.log(userId)
  
  const existing = await payload.find({
    collection: 'user-progress',
    where: {
      and: [{ userId: { equals: userId } }, { lesson: { equals: lessonId } }]
    }
  })

  if (existing.docs.length > 0) {
    return await payload.update({
      collection: 'user-progress',
      id: existing.docs[0].id,
      data: updates,
    })
  } else {
    return await payload.create({
      collection: 'user-progress',
      data: {
        userId,
        lesson: lessonId,
        course: courseId,
        ...updates
      }
    })
  }
}