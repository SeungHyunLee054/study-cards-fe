import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Clock,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  Loader2,
  Settings,
  LogOut,
  User,
  NotebookText,
  BarChart3,
  Shield,
  History,
  LayoutDashboard,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { fetchDashboard } from '@/api/dashboard'
import type {
  DashboardResponse,
  CategoryProgressItem,
  DashboardActivity,
  RecommendationType,
} from '@/types/dashboard'

const RECOMMENDATION_CONFIG: Record<
  RecommendationType,
  { buttonText: string; disabled: boolean; variant: 'default' | 'outline' }
> = {
  REVIEW: { buttonText: '복습 시작', disabled: false, variant: 'default' },
  STREAK_KEEP: { buttonText: '스트릭 유지하기', disabled: false, variant: 'default' },
  NEW: { buttonText: '새 카드 학습', disabled: false, variant: 'default' },
  COMPLETE: { buttonText: '오늘 학습 완료!', disabled: true, variant: 'outline' },
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function getWeekday(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { weekday: 'short' })
}

export function DashboardPage() {
  const { logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchDashboard()
        setDashboard(data)
      } catch {
        setError('대시보드를 불러오는데 실패했습니다')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  function handleRecommendationClick() {
    if (dashboard?.recommendation.type !== 'COMPLETE') {
      navigate('/study')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const { user, today, categoryProgress, recentActivity, recommendation } = dashboard ?? {
    user: null,
    today: { dueCards: 0, newCardsAvailable: 0, studiedToday: 0, todayAccuracy: 0 },
    categoryProgress: [],
    recentActivity: [],
    recommendation: { message: '', recommendedCategory: null, cardsToStudy: 0, type: 'NEW' as RecommendationType },
  }

  const recommendConfig = RECOMMENDATION_CONFIG[recommendation.type]
  const last7Days = recentActivity.slice(0, 7).reverse()
  const maxStudied = Math.max(...last7Days.map((d) => d.studied), 1)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Study Cards</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              {user?.nickname && <span>{user.nickname}</span>}
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/mypage">
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/sessions">
                <History className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-cards">
                <NotebookText className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/stats">
                <BarChart3 className="h-4 w-4" />
              </Link>
            </Button>
            {isAdmin && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/cards" className="text-purple-600">
                    <Shield className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/generation" className="text-purple-600">
                    <Sparkles className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/subscription">
                <CreditCard className="h-4 w-4" />
              </Link>
            </Button>
            <NotificationDropdown />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Recommendation Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{recommendation.message}</h1>
              {recommendation.cardsToStudy > 0 && (
                <p className="mt-1 text-gray-600">
                  {recommendation.recommendedCategory && `${recommendation.recommendedCategory} · `}
                  {recommendation.cardsToStudy}개 카드
                </p>
              )}
            </div>
          </div>
          <Button
            size="lg"
            variant={recommendConfig.variant}
            disabled={recommendConfig.disabled}
            onClick={handleRecommendationClick}
          >
            {recommendConfig.buttonText}
          </Button>
        </div>

        {/* Today's Stats Grid */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{today.dueCards}</div>
                <div className="text-sm text-gray-500">복습 예정</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{today.studiedToday}</div>
                <div className="text-sm text-gray-500">학습 완료</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{today.newCardsAvailable}</div>
                <div className="text-sm text-gray-500">새 카드</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatPercent(today.todayAccuracy)}
                </div>
                <div className="text-sm text-gray-500">오늘 정답률</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          {/* Category Progress */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                카테고리별 진행률
              </h2>
            </div>
            <div className="p-6">
              {categoryProgress.length === 0 ? (
                <p className="text-gray-500 text-center py-4">아직 학습 기록이 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {categoryProgress.map((cat: CategoryProgressItem) => (
                    <div key={cat.categoryCode}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{cat.categoryCode}</span>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-gray-500">
                            {cat.studiedCards}/{cat.totalCards} 학습
                          </span>
                          <span className="font-semibold text-primary">
                            {formatPercent(cat.progressRate)}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${cat.progressRate * 100}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        마스터리: {formatPercent(cat.masteryRate)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity Chart */}
          <div className="rounded-xl border border-gray-200 bg-white">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                최근 활동
              </h2>
            </div>
            <div className="p-6">
              {last7Days.length === 0 ? (
                <p className="text-gray-500 text-center py-4">아직 활동 기록이 없습니다</p>
              ) : (
                <div className="space-y-4">
                  {/* Bar Chart */}
                  <div className="flex items-end justify-between gap-2 h-32">
                    {last7Days.map((day: DashboardActivity) => {
                      const height = (day.studied / maxStudied) * 100
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <div className="text-xs text-gray-500">
                            {day.studied > 0 ? day.studied : '-'}
                          </div>
                          <div className="w-full h-full flex items-end">
                            <div
                              className={`w-full rounded-t-md transition-all ${
                                day.studied === 0
                                  ? 'bg-gray-100'
                                  : day.accuracy >= 0.8
                                    ? 'bg-green-500'
                                    : day.accuracy >= 0.5
                                      ? 'bg-yellow-500'
                                      : 'bg-red-400'
                              }`}
                              style={{
                                height: day.studied === 0 ? '4px' : `${height}%`,
                                minHeight: '4px',
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-600">{getWeekday(day.date)}</div>
                          <div className="text-xs text-gray-400">{formatDate(day.date)}</div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-4 pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-green-500" />
                      80%+
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-yellow-500" />
                      50-79%
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded bg-red-400" />
                      50% 미만
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Stats Summary */}
        {user && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{user.level}</div>
                  <div className="text-sm text-gray-500">레벨</div>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500">{user.streak}</div>
                  <div className="text-sm text-gray-500">연속 학습</div>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{user.totalStudied}</div>
                  <div className="text-sm text-gray-500">총 학습 카드</div>
                </div>
              </div>
              <Button variant="outline" asChild>
                <Link to="/stats">상세 통계 보기</Link>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>&copy; 2025 Study Cards. React + Vite로 제작되었습니다.</p>
        </div>
      </footer>
    </div>
  )
}
