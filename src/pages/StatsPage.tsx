import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Target,
  Flame,
  BookOpen,
  Calendar,
  BarChart3,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'
import { fetchStats } from '@/api/stats'
import { DASHBOARD_PATH } from '@/constants/routes'
import type { StatsResponse, DeckStats, RecentActivity } from '@/types/stats'

const CATEGORY_COLORS: Record<string, { bg: string; bar: string }> = {
  CS: { bg: 'bg-blue-100', bar: 'bg-blue-500' },
  ENGLISH: { bg: 'bg-green-100', bar: 'bg-green-500' },
  SQL: { bg: 'bg-purple-100', bar: 'bg-purple-500' },
  JAPANESE: { bg: 'bg-pink-100', bar: 'bg-pink-500' },
}

function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] || { bg: 'bg-gray-100', bar: 'bg-gray-500' }
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function getWeekday(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { weekday: 'short' })
}

export function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchStats()
        setStats(data)
      } catch {
        setError('통계를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const overview = stats?.overview
  const decks = stats?.deckStats ?? []
  const visibleDecks = decks.filter((deck) => (
    deck.newCount > 0
    || deck.learningCount > 0
    || deck.reviewCount > 0
    || (deck.masteryRate ?? 0) > 0
  ))
  const recentActivity = stats?.recentActivity ?? []

  // 최근 7일 활동 데이터 (없는 날은 0으로)
  const last7Days = recentActivity.slice(0, 7).reverse()
  const maxStudied = Math.max(...last7Days.map((d) => d.studied), 1)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader
        variant="back-title"
        container="max-w-4xl"
        backTo={DASHBOARD_PATH}
        backLabel="뒤로가기"
        title="학습 통계"
        titleClassName="text-xl font-semibold"
      />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Overview Stats */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            전체 현황
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 정답률 */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-700">
                    {formatPercent(overview?.accuracyRate ?? 0)}
                  </div>
                  <div className="text-sm text-green-600">정답률</div>
                </div>
              </div>
            </div>

            {/* 스트릭 */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">
                    {overview?.streak ?? 0}일
                  </div>
                  <div className="text-sm text-orange-600">연속 학습</div>
                </div>
              </div>
            </div>

            {/* 총 학습 */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">
                    {overview?.totalStudied ?? 0}
                  </div>
                  <div className="text-sm text-blue-600">총 학습 카드</div>
                </div>
              </div>
            </div>

            {/* 오늘 남은 */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700">
                    {overview?.dueToday ?? 0}
                  </div>
                  <div className="text-sm text-purple-600">오늘 복습 예정</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Activity */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            최근 7일 학습 현황
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            {last7Days.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 학습 기록이 없습니다
              </p>
            ) : (
              <div className="space-y-4">
                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-2 h-40">
                  {last7Days.map((day: RecentActivity) => {
                    const height = (day.studied / maxStudied) * 100
                    const accuracy =
                      day.studied > 0 ? day.correct / day.studied : 0
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-2"
                      >
                        <div className="text-xs text-gray-500">
                          {day.studied > 0
                            ? `${day.correct}/${day.studied}`
                            : '-'}
                        </div>
                        <div className="w-full h-full flex items-end">
                          <div
                            className={`w-full rounded-t-md transition-all ${
                              day.studied === 0
                                ? 'bg-gray-100'
                                : accuracy >= 0.8
                                  ? 'bg-green-500'
                                  : accuracy >= 0.5
                                    ? 'bg-yellow-500'
                                    : 'bg-red-400'
                            }`}
                            style={{
                              height: day.studied === 0 ? '8px' : `${height}%`,
                              minHeight: '8px',
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600">
                          {getWeekday(day.date)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(day.date)}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    80%+ 정답
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded bg-yellow-500" />
                    50-79% 정답
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded bg-red-400" />
                    50% 미만
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Category Mastery */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            카테고리별 마스터리
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white">
            {visibleDecks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                아직 학습한 카테고리가 없습니다
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {visibleDecks.map((deck: DeckStats) => {
                  const colors = getCategoryColor(deck.category)
                  const masteryPercent = deck.masteryRate ?? 0
                  return (
                    <div key={deck.category} className="p-5">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg}`}
                          >
                            {deck.category}
                          </div>
                          <span className="text-sm text-gray-500">
                            {deck.newCount + deck.learningCount + deck.reviewCount}개 카드
                          </span>
                        </div>
                        <span className="text-lg font-semibold">
                          {formatPercent(deck.masteryRate ?? 0)}
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${colors.bar}`}
                          style={{ width: `${masteryPercent}%` }}
                        />
                      </div>
                      {/* Card Status */}
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <span className="text-blue-600">
                          {deck.newCount} 신규
                        </span>
                        <span className="text-orange-600">
                          {deck.learningCount} 학습중
                        </span>
                        <span className="text-green-600">
                          {deck.reviewCount} 복습
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Study Button */}
        <div className="text-center">
          <Button size="lg" asChild>
            <Link to="/study">학습 시작하기</Link>
          </Button>
        </div>
      </main>

      <AppFooter container="max-w-4xl" />
    </div>
  )
}
