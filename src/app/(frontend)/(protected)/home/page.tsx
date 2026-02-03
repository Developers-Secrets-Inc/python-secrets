import { AppHeader } from '@/components/headers/app-header'
import { ContinueLearningCard } from '@/components/home/continue-learning-card'
import { DailyChallengeCard } from '@/components/home/daily-challenge-card'
import { CourseCatalogCard } from '@/components/home/course-catalog-card'
import { ActivePlaygroundsCard } from '@/components/home/active-playgrounds-card'
import { ProfileCard } from '@/components/home/profile-card'
import { LeaderboardCard } from '@/components/home/leaderboard-card'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <ContinueLearningCard />
            <DailyChallengeCard />
            <CourseCatalogCard />
            <ActivePlaygroundsCard />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <ProfileCard />
            <LeaderboardCard />
          </div>
        </div>
      </main>
    </div>
  )
}
