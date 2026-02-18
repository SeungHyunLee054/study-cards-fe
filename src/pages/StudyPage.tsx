import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, User, CalendarCheck, BookOpen, Sparkles } from 'lucide-react'
import { CardDeck } from '@/components/CardDeck'
import { RateLimitModal } from '@/components/RateLimitModal'
import { RecommendedCardList } from '@/components/RecommendedCardList'
import { CategoryAccuracyChart } from '@/components/CategoryAccuracyChart'
import { CategoryFilterSection } from '@/components/CategoryFilterSection'
import { useStudyCards } from '@/hooks/useStudyCards'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'
import { useAuth } from '@/contexts/useAuth'
import { useCategories } from '@/hooks/useCategories'
import { fetchRecommendations, fetchCategoryAccuracy } from '@/api/recommendations'
import { fetchMySubscription } from '@/api/subscriptions'
import { DASHBOARD_PATH } from '@/constants/routes'
import type { RecommendationResponse, CategoryAccuracyResponse } from '@/types/recommendation'
import { STUDY_LOAD_DEBOUNCE_MS } from '@/lib/constants'

type StudyMode = 'all' | 'review' | 'myCards' | 'session-review' | 'recommended'

interface StudyPageProps {
  forcedMode?: StudyMode
  hideModeSelector?: boolean
}

export function StudyPage({ forcedMode, hideModeSelector = false }: StudyPageProps = {}) {
  const navigate = useNavigate()
  const lastLoadTimeRef = useRef(0)
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('deck') || undefined
  const modeParam = forcedMode ?? ((searchParams.get('mode') as StudyMode) || 'all')

  const { categories, isLoading: isCategoriesLoading } = useCategories()
  const [selectedMode, setSelectedMode] = useState<StudyMode>(modeParam)
  const { isLoggedIn, isLoading: authLoading } = useAuth()

  useEffect(() => {
    setSelectedMode(modeParam)
  }, [modeParam])

  // 추천 관련 상태
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [categoryAccuracy, setCategoryAccuracy] = useState<CategoryAccuracyResponse[]>([])
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null)
  const [canSeeAiExplanation, setCanSeeAiExplanation] = useState(false)

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

  // 추천 데이터 로드 함수 (useEffect + retry 버튼에서 공유)
  const loadRecommendations = useCallback(async () => {
    try {
      setIsRecommendationsLoading(true)
      setRecommendationsError(null)
      const [recData, accData] = await Promise.all([
        fetchRecommendations(20),
        fetchCategoryAccuracy(),
      ])
      setRecommendations(recData)
      setCategoryAccuracy(accData)

      try {
        const sub = await fetchMySubscription()
        setCanSeeAiExplanation(sub?.plan === 'PRO')
      } catch {
        setCanSeeAiExplanation(false)
      }
    } catch {
      setRecommendationsError('추천 카드를 불러오는데 실패했습니다.')
    } finally {
      setIsRecommendationsLoading(false)
    }
  }, [])

  // 추천 모드 진입 시 데이터 로드
  useEffect(() => {
    if (selectedMode !== 'recommended' || !isLoggedIn || authLoading) return
    loadRecommendations()
  }, [selectedMode, isLoggedIn, authLoading, loadRecommendations])

  useEffect(() => {
    if (authLoading) return
    if (selectedMode === 'recommended') return // 추천 모드는 별도 로드
    const now = Date.now()
    if (now - lastLoadTimeRef.current < STUDY_LOAD_DEBOUNCE_MS) return
    lastLoadTimeRef.current = now

    if (selectedMode === 'session-review') {
      // sessionStorage에서 cardIds 가져오기
      const storedIds = sessionStorage.getItem('reviewCardIds')
      if (storedIds) {
        try {
          const cardIds = JSON.parse(storedIds) as number[]
          if (Array.isArray(cardIds) && cardIds.length > 0) {
            sessionStorage.removeItem('reviewCardIds')
            loadCards(undefined, 'session-review', cardIds, isLoggedIn)
          } else {
            sessionStorage.removeItem('reviewCardIds')
            loadCards(category, 'all', undefined, isLoggedIn)
          }
        } catch {
          sessionStorage.removeItem('reviewCardIds')
          loadCards(category, 'all', undefined, isLoggedIn)
        }
      } else {
        // cardIds가 없으면 전체 학습으로 전환
        loadCards(category, 'all', undefined, isLoggedIn)
      }
    } else {
      loadCards(category, selectedMode, undefined, isLoggedIn)
    }
  }, [loadCards, category, selectedMode, isLoggedIn, authLoading])

  const handleCategoryChange = (categoryCode: string | undefined) => {
    const nextCategory = categoryCode ?? 'ALL'
    const currentCategory = category ?? 'ALL'
    if (nextCategory === currentCategory) return

    const params: Record<string, string> = {}
    if (categoryCode) params.deck = categoryCode
    if (!forcedMode && selectedMode !== 'all') params.mode = selectedMode
    setSearchParams(params, { replace: true })
  }

  const handleModeChange = (mode: StudyMode) => {
    if (forcedMode) return
    if (mode === selectedMode) return

    setSelectedMode(mode)
    const params: Record<string, string> = {}
    if (category) params.deck = category
    if (mode !== 'all') params.mode = mode
    setSearchParams(params, { replace: true })
  }

  const handleRetry = () => {
    loadCards(category, selectedMode, undefined, isLoggedIn)
  }

  const handleNewSession = () => {
    loadCards(category, selectedMode, undefined, isLoggedIn)
  }

  const getModeLabel = () => {
    switch (studyMode) {
      case 'review':
        return '오늘의 복습'
      case 'myCards':
        return '내 카드'
      case 'session-review':
        return '세션 복습'
      case 'recommended':
        return 'AI 추천'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        variant="back-title"
        container="container"
        backTo={isLoggedIn ? DASHBOARD_PATH : '/'}
        backLabel="뒤로가기"
        hideBackLabelOnMobile
        title={`${getModeLabel()}${getModeLabel() && ' '}${category ? `${category} 학습` : '학습 세션'}`}
        sticky
        stickyTone="background"
        rightSlot={progress.total > 0 ? (
          <div className="text-sm font-medium text-primary">
            {progress.completed}/{progress.total}
          </div>
        ) : undefined}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Study Mode Selection */}
        {isLoggedIn && !hideModeSelector && (
          <div className="max-w-2xl mx-auto mb-4 md:mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">학습 모드</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleModeChange('all')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
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
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
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
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
                  selectedMode === 'myCards'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <User className="h-4 w-4" />
                내 카드만
              </button>
              <button
                onClick={() => handleModeChange('recommended')}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm rounded-lg transition-colors min-h-[44px] ${
                  selectedMode === 'recommended'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                AI 추천
              </button>
            </div>
          </div>
        )}

        {/* Category Filter (추천 모드에서는 숨김) */}
        {selectedMode !== 'recommended' && (
          <CategoryFilterSection
            className="max-w-2xl mx-auto mb-4 md:mb-6"
            categories={categories}
            isLoading={isCategoriesLoading}
            selectedCategory={category ?? 'ALL'}
            onChange={(code) => handleCategoryChange(code === 'ALL' ? undefined : code)}
            collapsible
            autoCloseOnSelect
            title="카테고리"
            loadingText="카테고리 로딩 중..."
            buttonBaseClassName="px-3 py-2 text-sm rounded-md transition-colors min-h-[38px]"
          />
        )}

        {/* AI 추천 모드 뷰 */}
        {selectedMode === 'recommended' ? (
          <div className="max-w-2xl mx-auto">
            {isRecommendationsLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">추천 카드를 분석하는 중...</p>
              </div>
            ) : recommendationsError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-destructive mb-4">{recommendationsError}</p>
                <Button onClick={loadRecommendations} className="min-h-[44px]">
                  다시 시도
                </Button>
              </div>
            ) : recommendations && recommendations.recommendations.length === 0 ? (
              <div className="text-center p-6 md:p-8 rounded-lg bg-secondary/50">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-lg md:text-xl font-semibold mb-2">추천 카드가 없습니다</h2>
                <p className="text-muted-foreground text-sm md:text-base">
                  학습 데이터가 더 쌓이면 AI가 맞춤 카드를 추천해 드립니다.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <RecommendedCardList
                  recommendations={recommendations?.recommendations ?? []}
                  aiExplanation={recommendations?.aiExplanation ?? null}
                  canSeeAiExplanation={canSeeAiExplanation}
                />
                {categoryAccuracy.length > 0 && (
                  <CategoryAccuracyChart data={categoryAccuracy} />
                )}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">카드를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRetry} className="min-h-[44px]">다시 시도</Button>
          </div>
        ) : progress.total === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center p-6 md:p-8 rounded-lg bg-secondary/50">
              <CalendarCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {selectedMode === 'review' ? (
                <>
                  <h2 className="text-lg md:text-xl font-semibold mb-2">오늘 복습할 카드가 없습니다</h2>
                  <p className="text-muted-foreground mb-4 text-sm md:text-base">
                    모든 카드를 복습했거나, 아직 학습 기록이 없습니다.
                  </p>
                  <Button
                    onClick={() => {
                      if (forcedMode === 'review') {
                        navigate('/study')
                        return
                      }
                      handleModeChange('all')
                    }}
                    className="min-h-[44px]"
                  >
                    전체 학습하기
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="text-lg md:text-xl font-semibold mb-2">카드가 없습니다</h2>
                  <p className="text-muted-foreground text-sm md:text-base">
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
            <div className="mb-4 md:mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>{progress.completed}/{progress.total} 완료</span>
                <span>
                  {progress.correct}/{progress.completed} 정답
                  {progress.completed > 0 && (
                    <span className="ml-1 text-primary font-medium">
                      ({Math.round((progress.correct / progress.completed) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary">
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
              <div className="mt-6 md:mt-8 text-center p-5 md:p-6 rounded-xl bg-primary/10">
                <h2 className="text-lg md:text-xl font-semibold mb-2">
                  {selectedMode === 'review' ? '오늘의 복습 완료!' : '학습 완료!'}
                </h2>
                <p className="text-muted-foreground mb-4 text-sm md:text-base">
                  {progress.total}개 중 {progress.correct}개 정답 (
                  {Math.round((progress.correct / progress.total) * 100)}%)
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={handleNewSession} className="min-h-[44px]">새 세션</Button>
                  <Button variant="outline" asChild className="min-h-[44px]">
                    <Link to={isLoggedIn ? DASHBOARD_PATH : '/'}>홈으로</Link>
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
