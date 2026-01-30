import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { CardDeck } from '@/components/CardDeck'
import { useStudyCards } from '@/hooks/useStudyCards'
import { Button } from '@/components/ui/button'

export function StudyPage() {
  const {
    currentCard,
    currentIndex,
    isLoading,
    error,
    isFlipped,
    loadCards,
    flipCard,
    answerCard,
    progress,
  } = useStudyCards()

  useEffect(() => {
    loadCards()
  }, [loadCards])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">Study Session</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading cards...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadCards}>Try again</Button>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>
                  {progress.correct} / {progress.completed} correct
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
                <h2 className="text-xl font-semibold mb-2">Session Complete!</h2>
                <p className="text-muted-foreground mb-4">
                  You got {progress.correct} out of {progress.total} correct (
                  {Math.round((progress.correct / progress.total) * 100)}%)
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={loadCards}>New Session</Button>
                  <Button variant="outline" asChild>
                    <Link to="/">Back to Home</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
