// collections/Lessons.ts
import { difficultyField } from '@/fields/Difficulty'

export const Lessons = {
  slug: 'lessons',
  admin: { useAsTitle: 'title' },

  // Define default fields to populate when this collection is referenced
  // This drastically reduces response size when loaded from Courses or other relations
  defaultPopulate: {
    id: true,
    title: true,
    slug: true,
    difficulty: true,
    // Exclude: description (richText - expensive)
    // Exclude: exercise (relation to quizzes/challenges-exercices - expensive)
  },

  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    difficultyField,
    {
      name: 'description',
      type: 'richText',
      required: true
    },
    {
      name: 'exercise',
      type: 'relationship',
      relationTo: ['quizzes', 'challenges-exercices'],
    },
  ],
}
