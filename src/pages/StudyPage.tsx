import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CardDeck } from '@/components/CardDeck'
import { RateLimitModal } from '@/components/RateLimitModal'
import { useStudyCards } from '@/hooks/useStudyCards'
import { Button } from '@/components/ui/button'

// StrictMode 중복 호출 방지
let lastLoadTime = 0

export function StudyPage() {
  const [searchParams] = useSearchParams()
  const category = searchParams.get('deck') || undefined

  const {
    currentCard,
    currentIndex,
    isLoading,
    error,
    isFlipped,
    isRateLimited,
    loadCards,
    flipCard,
    answerCard,
    clearRateLimitError,
    progress,
  } = useStudyCards()

  useEffect(() => {
    const now = Date.now()
    if (now - lastLoadTime < 100) return // 100ms 내 중복 호출 방지
    lastLoadTime = now
    loadCards(category)
  }, [loadCards, category])

  const handleRetry = () => {
    loadCards(category)
  }

  const handleNewSession = () => {
    loadCards(category)
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
            {category ? `${category} 학습` : '학습 세션'}
          </h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">카드를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={handleRetry}>다시 시도</Button>
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
                <h2 className="text-xl font-semibold mb-2">학습 완료!</h2>
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
