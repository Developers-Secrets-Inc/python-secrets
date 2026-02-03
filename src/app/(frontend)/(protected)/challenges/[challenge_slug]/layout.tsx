import { AppHeader } from '@/components/headers/app-header'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Code2 } from 'lucide-react'
import { ChallengeNavigation } from '@/components/challenges/challenge-navigation'

export default async function ChallengeLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ challenge_slug: string }>
}) {
  const { challenge_slug } = await params

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <AppHeader />

      <main className="flex-1 w-full overflow-hidden p-1.5 flex flex-col gap-1">
        {/* VUE DESKTOP */}
        <div className="hidden md:flex flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="w-full h-full gap-0.5">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full border rounded-md flex flex-col overflow-hidden bg-background">
                <ChallengeNavigation challengeSlug={challenge_slug} />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {children}
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle className="w-1 bg-transparent hover:bg-border rounded-md transition-all" />
            <ResizablePanel defaultSize={50} minSize={30} className="flex">
              <div className="flex-1 border rounded-md overflow-hidden h-full bg-muted/50 flex items-center justify-center">
                <div className="text-center p-6">
                  <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-semibold mb-2">Code Editor</h3>
                  <p className="text-sm text-muted-foreground">Write your solution here</p>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* VUE MOBILE */}
        <div className="flex md:hidden flex-1 min-h-0 flex-col gap-1">
          <div className="border rounded-md overflow-hidden bg-background">
            <ChallengeNavigation challengeSlug={challenge_slug} />
            <div className="p-4">
              {children}
            </div>
          </div>
          <div className="flex-1 border rounded-md overflow-hidden bg-muted/50 flex items-center justify-center">
            <div className="text-center p-6">
              <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Code Editor</h3>
              <p className="text-sm text-muted-foreground">Write your solution here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
