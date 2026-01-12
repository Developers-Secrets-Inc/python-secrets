import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group'
import {
  ThumbsUp,
  ThumbsDown,
  Star,
  FileText,
  Lightbulb,
  History,
  Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LessonDescriptionPage() {
  const lesson = {
    title: '1. Introduction aux Algorithmes de Tri',
    status: 'In Progress',
    difficulty: 'Medium',
  }

  return (
    // Le padding p-4 demandé sur le contexte (conteneur principal)
    <div className="flex flex-col h-full">
      {/* 1. HEADER - Navigation Button Group */}
      <header className='h-14'>
        <ButtonGroup className="w-full">
          <Button
            variant="outline"
            className={cn(
              'flex-1 gap-2 rounded-none border-0 border-b border-r rounded-tl-sm', // Pas de bordure haute, arrondi haut-gauche sm
            )}
            asChild
          >
            <Link href="description">
              <FileText className="h-4 w-4" />
              Description
            </Link>
          </Button>

          <Button
            variant="outline"
            className="flex-1 gap-2 border-0 border-x border-b rounded-none" // Pas de bordure haute, pas d'arrondi
            asChild
          >
            <Link href="solution">
              <Lightbulb className="h-4 w-4" />
              Solution
            </Link>
          </Button>

          <Button
            variant="outline"
            className={cn(
              'flex-1 gap-2 rounded-none border-0 border-b rounded-tr-sm', // Pas de bordure haute, arrondi haut-droite sm
            )}
            asChild
          >
            <Link href="submissions">
              <History className="h-4 w-4" />
              Submissions
            </Link>
          </Button>
        </ButtonGroup>
      </header>

      {/* 2. TITRE & METADATA */}
      <div className="space-y-4 flex-1 p-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{lesson.title}</h1>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-md">
              {lesson.status}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                'rounded-md',
                lesson.difficulty === 'Medium' &&
                  'text-amber-500 border-amber-500/20 bg-amber-500/5',
              )}
            >
              {lesson.difficulty}
            </Badge>
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed">
            Consigne de l'exercice : implémentez une fonction de tri qui minimise les échanges en
            mémoire...
          </p>
        </div>
      </div>

      {/* 3. FOOTER - Feedback & Rate (Centré en Y avec items-center) */}
      <footer className="mt-auto border-t flex items-center justify-between min-h-12 p-2">
        {/* Groupe Like/Dislike à gauche */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Like</span>
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <ThumbsDown className="h-4 w-4" />
            <span>Dislike</span>
          </Button>
        </div>

        {/* Bouton Rate à droite */}
        <Button variant="link" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
          Rate this lesson
        </Button>
      </footer>
    </div>
  )
}
