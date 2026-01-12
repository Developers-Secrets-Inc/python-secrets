import { CollectionConfig } from 'payload'
import { difficultyField } from '@/fields/Difficulty'

export const ChallengesExercices: CollectionConfig = {
  slug: 'challenges-exercices',
  admin: { useAsTitle: 'title' },

  // Define default fields to populate when this collection is referenced
  defaultPopulate: {
    id: true,
    title: true,
    slug: true,
    difficulty: true,
    // Exclude: fileStructure (json - expensive)
    // Exclude: tests (json - expensive)
    // Exclude: solution (richText - expensive)
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
      name: 'fileStructure',
      type: 'json',
      required: true,
    },
    {
      name: 'tests',
      type: 'json',
      required: true,
    },
    {
      name: 'solution',
      type: 'richText',
      required: true,
    },
  ],
}
