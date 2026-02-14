import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  BookOpen,
  Clock,
  CreditCard,
  Flame,
  Heart,
  History,
  Loader2,
  Play,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'
import { AppFooter } from '@/components/AppFooter'
import { AccountSettingsPanel } from '@/components/AccountSettingsPanel'
import { fetchStats } from '@/api/stats'
import { useAuth } from '@/contexts/useAuth'
import { DASHBOARD_PATH } from '@/constants/routes'
import type { StatsResponse } from '@/types/stats'

interface QuickAction {
  to: string
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
  adminOnly?: boolean
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function getProviderLabel(provider?: string): string {
  if (provider === 'LOCAL') return '이메일'
  if (provider === 'GOOGLE') return 'Google'
  if (provider === 'KAKAO') return 'Kakao'
  if (provider === 'NAVER') return 'Naver'
  return '알 수 없음'
}

export function MyPage() {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStats() {
      try {
        setIsStatsLoading(true)
        setStatsError(null)
        const data = await fetchStats()
        setStats(data)
      } catch {
        setStatsError('학습 요약 정보를 불러오지 못했습니다')
      } finally {
        setIsStatsLoading(false)
      }
    }

    void loadStats()
  }, [])

  const overview = stats?.overview
  const recentActivity = stats?.recentActivity ?? []

  const quickActions = useMemo<QuickAction[]>(() => [
    {
      to: '/subscription',
      title: '구독 관리',
      description: '플랜, 결제, 자동결제 관리',
      icon: CreditCard,
    },
    {
      to: '/my-cards',
      title: '내 카드',
      description: '직접 만든 카드 관리',
      icon: BookOpen,
    },
    {
      to: '/bookmarks',
      title: '북마크',
      description: '저장한 카드 모아보기',
      icon: Heart,
    },
    {
      to: '/sessions',
      title: '학습 기록',
      description: '세션별 학습 이력 확인',
      icon: History,
    },
    {
      to: '/stats',
      title: '상세 통계',
      description: '학습 추이 및 정답률',
      icon: BarChart3,
    },
    {
      to: '/ai-generate',
      title: 'AI 카드 생성',
      description: '텍스트로 카드 자동 생성',
      icon: Sparkles,
    },
    {
      to: '/admin/users',
      title: '관리자 센터',
      description: '사용자/카드/AI 관리',
      icon: Shield,
      adminOnly: true,
    },
  ], [])

  const visibleActions = quickActions.filter((action) => !action.adminOnly || isAdmin)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <AppHeader variant="app-nav" dashboardLink={DASHBOARD_PATH} dashboardLabel="대시보드" />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-primary">MY PAGE</p>
              <h1 className="mt-1 text-2xl md:text-3xl font-bold text-gray-900 truncate">
                {user?.nickname ?? '사용자'} 님
              </h1>
              <p className="mt-1 text-sm text-gray-600 break-all">{user?.email ?? ''}</p>
              <p className="mt-1 text-xs text-gray-500">
                로그인 제공자: {getProviderLabel(user?.provider)}
                {isAdmin ? ' · 관리자 계정' : ''}
              </p>
            </div>

            <div className="w-full md:w-auto">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/study">
                  <Play className="mr-2 h-4 w-4" />
                  학습 시작
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">바로가기</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {visibleActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
              >
                <action.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold text-gray-900">{action.title}</p>
                <p className="mt-1 text-sm text-gray-500">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">학습 요약</h2>
          {statsError && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {statsError}
            </div>
          )}
          {isStatsLoading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  오늘 복습
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{overview?.dueToday ?? 0}</p>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Flame className="h-4 w-4 text-orange-500" />
                  연속 학습
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{overview?.streak ?? 0}일</p>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Target className="h-4 w-4 text-green-600" />
                  정답률
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{Math.round(overview?.accuracyRate ?? 0)}%</p>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  누적 학습
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{overview?.totalStudied ?? 0}</p>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-gray-200 bg-white">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">최근 활동</h2>
          </div>
          <div className="p-6">
            {isStatsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">아직 활동 기록이 없습니다</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{formatDate(day.date)}</span>
                    <span className="text-gray-900">
                      {day.studied > 0 ? `${day.correct}/${day.studied} 정답` : '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="settings" className="mt-8 scroll-mt-24">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">설정</h2>
            <p className="mt-1 text-sm text-gray-600">프로필, 보안, 알림, 계정 탈퇴를 관리합니다.</p>
          </div>
          <AccountSettingsPanel />
        </section>
      </main>

      <AppFooter container="max-w-6xl" />
    </div>
  )
}
