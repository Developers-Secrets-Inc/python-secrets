import { CollectionConfig } from 'payload'
import { difficultyField } from '@/fields/Difficulty'

export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: { useAsTitle: 'title' },

  // Define default fields to populate when this collection is referenced
  defaultPopulate: {
    id: true,
    title: true,
    slug: true,
    difficulty: true,
    // Exclude: questions (richText array - expensive)
    // Exclude: answers (array with richText questions - expensive)
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    difficultyField,
    {
      name: 'questions',
      type: 'array',
      fields: [
        {
          name: 'question',
          type: 'richText',
          required: true,
        },
        {
          name: 'answers',
          type: 'array',
          fields: [
            {
              name: 'text',
              type: 'text',
              required: true,
            },
            {
              name: 'isCorrect',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
      ],
    },
  ],
}
