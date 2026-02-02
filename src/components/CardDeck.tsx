import { useState } from 'react'
import { Check, X, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CardResponse } from '@/types/card'

interface CardDeckProps {
  card: CardResponse | null
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
  const [isAnimating, setIsAnimating] = useState(false)

  if (!card) {
    return (
      <Card className="w-full max-w-md mx-auto">
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
    setTimeout(() => setIsAnimating(false), 300)
  }

  // 질문/답변 표시 (한글 우선, 없으면 영문)
  const question = card.questionKo || card.questionEn
  const answer = card.answerKo || card.answerEn

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          카드 {currentIndex + 1} / {totalCards}
        </span>
        <span className="px-2 py-1 rounded bg-secondary">{card.category}</span>
      </div>

      <div
        className={cn(
          'relative cursor-pointer perspective-1000',
          'transition-transform duration-300',
          isAnimating && 'pointer-events-none'
        )}
        onClick={handleFlip}
      >
        <Card
          className={cn(
            'min-h-64 transition-all duration-300',
            isFlipped && 'bg-primary/5'
          )}
        >
          <CardHeader />
          <CardContent className="flex items-center justify-center min-h-32">
            <p className="text-lg text-center">
              {isFlipped ? answer : question}
            </p>
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
            onClick={onIncorrect}
            className="flex-1 max-w-32"
          >
            <X className="mr-2 h-5 w-5" />
            오답
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleFlip}
          >
            <RotateCcw className="h-5 w-5 mr-1" />
            뒤집기
          </Button>
          <Button
            size="lg"
            onClick={onCorrect}
            className="flex-1 max-w-32 bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-5 w-5" />
            정답
          </Button>
        </div>
      )}
    </div>
  )
}
