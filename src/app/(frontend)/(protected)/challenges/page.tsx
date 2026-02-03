import { AppHeader } from '@/components/headers/app-header'
import { DailyChallengeCard } from '@/components/home/daily-challenge-card'
import { ChallengeCategoriesCard } from '@/components/challenges/challenge-categories-card'
import { ChallengesCatalogCard } from '@/components/challenges/challenges-catalog-card'
import { ChallengeProgressCard } from '@/components/challenges/challenge-progress-card'
import { ChallengesLeaderboardCard } from '@/components/challenges/challenges-leaderboard-card'

export default function ChallengesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <DailyChallengeCard useLinks={true} />
            <ChallengeCategoriesCard />
            <ChallengesCatalogCard />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            <ChallengeProgressCard />
            <ChallengesLeaderboardCard />
          </div>
        </div>
      </main>
    </div>
  )
}
