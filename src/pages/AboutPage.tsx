import { Github, BookOpen, Brain, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader variant="back-title" container="container" backTo="/" backLabel="홈으로" title="About" />

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Introduction */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Study Cards</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Study Cards는 플래시카드 기반 학습 앱입니다.
            과학적으로 검증된 간격 반복(Spaced Repetition) 알고리즘을 사용하여
            효율적인 장기 기억을 돕습니다.
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">학습 방법</h3>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Anki 알고리즘 기반의 간격 반복 학습</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>정답/오답에 따른 복습 주기 자동 조절</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>비로그인 시 하루 15개 무료 학습</span>
            </li>
          </ul>
        </section>

        {/* Credits */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Credits</h3>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground">
              플래시카드 데이터는{' '}
              <a
                href="https://github.com/jwasham/coding-interview-university"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                jwasham/coding-interview-university
                <ExternalLink className="h-3 w-3" />
              </a>
              를 참고하여 제작되었습니다.
            </p>
          </div>
        </section>

        {/* Links */}
        <section>
          <h3 className="text-xl font-semibold mb-4">Links</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SeungHyunLee054/study-cards-fe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                Frontend
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SeungHyunLee054/study-cards-be"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                Backend
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SeungHyunLee054"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                Developer
              </a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
