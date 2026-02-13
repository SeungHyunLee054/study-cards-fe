import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, ChevronRight, Check, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { fetchCardCount } from '@/api/cards'

export function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn, isLoading } = useAuth()
  const [isFlipped, setIsFlipped] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [cardCount, setCardCount] = useState<number | null>(null)
  const guideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (guideTimerRef.current) clearTimeout(guideTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate('/mypage', { replace: true })
    }
  }, [isLoggedIn, isLoading, navigate])

  useEffect(() => {
    fetchCardCount()
      .then(setCardCount)
      .catch(() => setCardCount(null))
  }, [])

  const handleAnswerClick = () => {
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current)
    setShowGuide(true)
    setIsFlipped(false)
    guideTimerRef.current = setTimeout(() => setShowGuide(false), 3000)
  }

  const features = [
    'Anki 알고리즘 기반 간격 반복',
    `${cardCount?.toLocaleString() ?? '...'} 플래시카드`,
    '하루 15개 무료 학습',
    '실시간 진행도 추적',
  ]

  // 로그인 상태면 리다이렉트 중이므로 아무것도 표시하지 않음
  if (isLoading || isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Study Cards</span>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              로그인
            </Link>
            <Button size="sm" asChild>
              <Link to="/signup">시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-6xl mx-auto px-6 py-12 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-gray-600">Now with {cardCount?.toLocaleString() ?? '...'} cards</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900" style={{ lineHeight: 1.4 }}>
            Master anything with
            <br />
            <span className="text-primary">
              Spaced Repetition
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            플래시카드로 효율적으로 학습하세요.
            과학적으로 검증된 기억법으로 영구 기억을 만듭니다.
          </p>

          <div className="mt-10 flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/study">
                Start Learning
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">About</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Card Preview */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-700">카드 예시</h3>
              <p className="text-sm text-gray-500 mt-1">클릭해서 카드를 뒤집어보세요</p>
            </div>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>카드 1 / 15</span>
              <span className="px-2 py-1 rounded bg-secondary">일반</span>
            </div>

            <div
              role="button"
              tabIndex={0}
              aria-label="카드 뒤집기"
              className={cn(
                'relative cursor-pointer perspective-1000',
                'transition-transform duration-300'
              )}
              onClick={() => setIsFlipped(!isFlipped)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFlipped(!isFlipped) } }}
            >
              <Card
                className={cn(
                  'min-h-64 transition-all duration-300',
                  isFlipped && 'bg-primary/5'
                )}
              >
                <CardHeader />
                <CardContent className="flex flex-col items-center justify-center min-h-32 gap-2">
                  <p className="text-lg text-center">
                    {isFlipped
                      ? '기억이 사라지기 직전에 복습하여 장기 기억으로 전환하는 학습 방법입니다.'
                      : '간격 반복(Spaced Repetition)이란 무엇인가요?'}
                  </p>
                  {isFlipped && (
                    <p className="text-sm text-muted-foreground text-center">
                      Spaced Repetition
                    </p>
                  )}
                </CardContent>
                <CardFooter className="justify-center">
                  <p className="text-xs text-muted-foreground">
                    {isFlipped ? '정답' : '클릭하여 정답 확인'}
                  </p>
                </CardFooter>
              </Card>
            </div>

            {isFlipped && (
              <div className="flex gap-4 justify-center">
                <Button
                  variant="destructive"
                  size="lg"
                  className="flex-1 max-w-32"
                  onClick={handleAnswerClick}
                >
                  <X className="mr-2 h-5 w-5" />
                  오답
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsFlipped(false)}
                >
                  <RotateCcw className="h-5 w-5 mr-1" />
                  뒤집기
                </Button>
                <Button
                  size="lg"
                  className="flex-1 max-w-32 bg-green-600 hover:bg-green-700"
                  onClick={handleAnswerClick}
                >
                  <Check className="mr-2 h-5 w-5" />
                  정답
                </Button>
              </div>
            )}

            {showGuide && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm text-primary font-medium">
                  지금 바로 학습을 시작해보세요!
                </p>
                <Button size="sm" className="mt-2" asChild>
                  <Link to="/study">학습 시작하기</Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">
                {cardCount?.toLocaleString() ?? '...'}
              </div>
              <div className="mt-2 text-sm text-gray-500">Flash Cards</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">15/day</div>
              <div className="mt-2 text-sm text-gray-500">Free Tier</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">∞</div>
              <div className="mt-2 text-sm text-gray-500">With Account</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="p-6 sm:p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Ready to start learning?</h2>
            <p className="mt-2 text-gray-600">
              무료로 시작하세요. 가입하면 무제한 학습이 가능합니다.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/signup">회원가입</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Study Cards. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
