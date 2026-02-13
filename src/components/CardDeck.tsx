import { useState, useRef, useEffect } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookmarkButton } from '@/components/BookmarkButton'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import type { StudyCard } from '@/types/card'

interface CardDeckProps {
  card: StudyCard | null
  isFlipped: boolean
  onFlip: () => void
  onCorrect: () => void
  onIncorrect: () => void
  currentIndex: number
  totalCards: number
}

export function CardDeck({
  card,
  isFlipped,
  onFlip,
  onCorrect,
  onIncorrect,
  currentIndex,
  totalCards,
}: CardDeckProps) {
  const { isLoggedIn } = useAuth()
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  if (!card) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">학습할 카드가 없습니다</p>
        </CardContent>
      </Card>
    )
  }

  const handleFlip = () => {
    if (isAnimating) return
    setIsAnimating(true)
    onFlip()
    timerRef.current = setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span className="font-medium">
          {currentIndex + 1} / {totalCards}
        </span>
        <span className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium">{card.category.name}</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? `정답: ${card.answer}` : `문제: ${card.question}. 클릭하여 정답 확인`}
        className={cn(
          'relative cursor-pointer perspective-1000',
          'transition-transform duration-300',
          isAnimating && 'pointer-events-none'
        )}
        onClick={handleFlip}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip() } }}
      >
        <Card
          className={cn(
            'min-h-[280px] md:min-h-[320px] transition-all duration-300',
            isFlipped && 'bg-primary/5'
          )}
        >
          <CardHeader className="pb-2 relative">
            <div className="text-center">
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                isFlipped ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
              )}>
                {isFlipped ? 'ANSWER' : 'QUESTION'}
              </span>
            </div>
            {isLoggedIn && 'cardType' in card && (
              <BookmarkButton
                key={card.id}
                cardId={card.id}
                cardType={card.cardType}
                size="sm"
                className="absolute top-2 right-2"
              />
            )}
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[160px] md:min-h-[200px] gap-3 px-6">
            <p className="text-lg md:text-xl text-center leading-relaxed">
              {isFlipped ? card.answer : card.question}
            </p>
            {isFlipped && card.answerSub && (
              <p className="text-sm text-muted-foreground text-center">{card.answerSub}</p>
            )}
            {!isFlipped && card.questionSub && (
              <p className="text-sm text-muted-foreground text-center">{card.questionSub}</p>
            )}
          </CardContent>
          <CardFooter className="justify-center pb-4">
            <p className="text-xs text-muted-foreground">
              {isFlipped ? '정답을 확인했습니다' : '탭하여 정답 확인'}
            </p>
          </CardFooter>
        </Card>
      </div>

      {isFlipped && (
        <div className="flex gap-3 justify-center">
          <Button
            variant="destructive"
            size="lg"
            onClick={onIncorrect}
            className="flex-1 max-w-36 min-h-[48px] text-base"
          >
            <X className="mr-1.5 h-5 w-5" />
            오답
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleFlip}
            className="min-h-[48px]"
          >
            <RotateCcw className="h-5 w-5 mr-1" />
            <span className="hidden sm:inline">뒤집기</span>
          </Button>
          <Button
            size="lg"
            onClick={onCorrect}
            className="flex-1 max-w-36 min-h-[48px] text-base bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-1.5 h-5 w-5" />
            정답
          </Button>
        </div>
      )}
    </div>
  )
}
