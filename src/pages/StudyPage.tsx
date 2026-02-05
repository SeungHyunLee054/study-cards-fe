import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Filter, Loader2, User, CalendarCheck, BookOpen } from 'lucide-react'
import { CardDeck } from '@/components/CardDeck'
import { RateLimitModal } from '@/components/RateLimitModal'
import { useStudyCards } from '@/hooks/useStudyCards'
import { Button } from '@/components/ui/button'
import { fetchCategories } from '@/api/categories'
import type { CategoryResponse } from '@/types/category'

type StudyMode = 'all' | 'review' | 'myCards' | 'session-review'

// StrictMode 중복 호출 방지
let lastLoadTime = 0

export function StudyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('deck') || undefined
  const modeParam = (searchParams.get('mode') as StudyMode) || 'all'

  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)
  const [selectedMode, setSelectedMode] = useState<StudyMode>(modeParam)
  const isLoggedIn = !!localStorage.getItem('accessToken')

  const {
    currentCard,
    currentIndex,
    isLoading,
    error,
    isFlipped,
    isRateLimited,
    studyMode,
    loadCards,
    flipCard,
    answerCard,
    clearRateLimitError,
    progress,
  } = useStudyCards()

  // 카테고리 목록 로드
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setIsCategoriesLoading(false))
  }, [])

  useEffect(() => {
    const now = Date.now()
    if (now - lastLoadTime < 100) return // 100ms 내 중복 호출 방지
    lastLoadTime = now

    if (selectedMode === 'session-review') {
      // sessionStorage에서 cardIds 가져오기
      const storedIds = sessionStorage.getItem('reviewCardIds')
      if (storedIds) {
        const cardIds = JSON.parse(storedIds) as number[]
        sessionStorage.removeItem('reviewCardIds') // 사용 후 삭제
        loadCards(undefined, 'session-review', cardIds)
      } else {
        // cardIds가 없으면 전체 학습으로 전환
        loadCards(category, 'all')
      }
    } else {
      loadCards(category, selectedMode)
    }
  }, [loadCards, category, selectedMode])

  const handleCategoryChange = (categoryCode: string | undefined) => {
    const params: Record<string, string> = {}
    if (categoryCode) params.deck = categoryCode
    if (selectedMode !== 'all') params.mode = selectedMode
    setSearchParams(params)
  }

  const handleModeChange = (mode: StudyMode) => {
    setSelectedMode(mode)
    const params: Record<string, string> = {}
    if (category) params.deck = category
    if (mode !== 'all') params.mode = mode
    setSearchParams(params)
  }

  const handleRetry = () => {
    loadCards(category, selectedMode)
  }

  const handleNewSession = () => {
    loadCards(category, selectedMode)
  }

  const getModeLabel = () => {
    switch (studyMode) {
      case 'review':
        return '오늘의 복습'
      case 'myCards':
        return '내 카드'
      case 'session-review':
        return '세션 복습'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">
            {getModeLabel()}{getModeLabel() && ' '}{category ? `${category} 학습` : '학습 세션'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Study Mode Selection */}
        {isLoggedIn && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">학습 모드</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleModeChange('all')}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedMode === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                전체 학습
              </button>
              <button
                onClick={() => handleModeChange('review')}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedMode === 'review'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <CalendarCheck className="h-4 w-4" />
                오늘의 복습
              </button>
              <button
                onClick={() => handleModeChange('myCards')}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  selectedMode === 'myCards'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <User className="h-4 w-4" />
                내 카드만
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">카테고리</span>
          </div>
          {isCategoriesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              카테고리 로딩 중...
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange(undefined)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  !category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                전체
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.code)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    category === cat.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">카드를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRetry}>다시 시도</Button>
          </div>
        ) : progress.total === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center p-8 rounded-lg bg-secondary/50">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {selectedMode === 'review' ? (
                <>
                  <h2 className="text-xl font-semibold mb-2">오늘 복습할 카드가 없습니다</h2>
                  <p className="text-muted-foreground mb-4">
                    모든 카드를 복습했거나, 아직 학습 기록이 없습니다.
                  </p>
                  <Button onClick={() => handleModeChange('all')}>
                    전체 학습하기
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-2">카드가 없습니다</h2>
                  <p className="text-muted-foreground">
                    {selectedMode === 'myCards'
                      ? '내 카드를 먼저 만들어보세요.'
                      : '해당 카테고리에 카드가 없습니다.'}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>진행률</span>
                <span>
                  {progress.correct} / {progress.completed} 정답
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${
                      progress.total > 0
                        ? (progress.completed / progress.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Card Deck */}
            <CardDeck
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={flipCard}
              onCorrect={() => answerCard(true)}
              onIncorrect={() => answerCard(false)}
              currentIndex={currentIndex}
              totalCards={progress.total}
            />

            {/* Session Complete */}
            {progress.completed === progress.total && progress.total > 0 && (
              <div className="mt-8 text-center p-6 rounded-lg bg-primary/10">
                <h2 className="text-xl font-semibold mb-2">
                  {selectedMode === 'review' ? '오늘의 복습 완료!' : '학습 완료!'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {progress.total}개 중 {progress.correct}개 정답 (
                  {Math.round((progress.correct / progress.total) * 100)}%)
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={handleNewSession}>새 세션</Button>
                  <Button variant="outline" asChild>
                    <Link to="/">홈으로</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Rate Limit Modal */}
      <RateLimitModal
        isOpen={isRateLimited}
        onClose={clearRateLimitError}
      />
    </div>
  )
}
