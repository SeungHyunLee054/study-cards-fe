import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, CheckCircle, AlertCircle, BarChart3, Calendar, Settings, LogOut, User, BookOpen, Loader2, NotebookText, Shield, LayoutDashboard, History, Sparkles, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryTree } from '@/components/CategoryTree'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { useAuth } from '@/contexts/AuthContext'
import { fetchStats } from '@/api/stats'
import { fetchCategoryTree } from '@/api/categories'
import type { StatsResponse } from '@/types/stats'
import type { CategoryTreeResponse } from '@/types/category'

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '오늘'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return '어제'
  }

  const diffTime = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays}일 전`
}

export function MyPage() {
  const { logout, isAdmin, user } = useAuth()
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [categoryTree, setCategoryTree] = useState<CategoryTreeResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)
        const [statsData, treeData] = await Promise.all([
          fetchStats(),
          fetchCategoryTree(),
        ])
        setStats(statsData)
        setCategoryTree(treeData)
      } catch (err) {
        setError('데이터를 불러오는데 실패했습니다')
        console.error('Failed to fetch data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])
  const overview = stats?.overview
  const decks = stats?.deckStats ?? []
  const recentActivity = stats?.recentActivity ?? []

  const totalDue = overview?.dueToday ?? 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
              <Link to="/dashboard">
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

        {/* Welcome Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">다시 오셨군요!</h1>
            <p className="mt-1 text-gray-600">
              {totalDue > 0
                ? `오늘 복습할 카드가 ${totalDue}개 있습니다`
                : '새로운 카드로 학습을 시작하세요'}
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/study">
              <Play className="mr-2 h-5 w-5" />
              학습 시작
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.dueToday ?? 0}</div>
                <div className="text-sm text-gray-500">오늘 복습</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.totalStudied ?? 0}</div>
                <div className="text-sm text-gray-500">총 학습</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.newCards ?? 0}</div>
                <div className="text-sm text-gray-500">새 카드</div>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <BarChart3 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{overview?.streak ?? 0}일</div>
                <div className="text-sm text-gray-500">연속 학습</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          {/* Decks */}
          <div className="col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">내 덱</h2>
              </div>
              <div className="p-6">
                <CategoryTree tree={categoryTree} deckStats={decks} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="rounded-xl border border-gray-200 bg-white">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  최근 활동
                </h2>
              </div>
              <div className="p-6">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">아직 활동이 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((day) => (
                      <div key={day.date} className="flex justify-between text-sm">
                        <span className="text-gray-600">{formatDate(day.date)}</span>
                        <span className="text-gray-900">
                          {day.studied > 0
                            ? `${day.correct}/${day.studied} 정답`
                            : '-'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Study Cards. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
