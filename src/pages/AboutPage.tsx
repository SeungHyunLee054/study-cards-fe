import { Github, BookOpen, Brain, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader variant="back-title" container="container" backTo="/" backLabel="뒤로가기" title="About" />

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Introduction */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Study Cards</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Study Cards는 AI가 학습 내용을 자동으로 정리하고 사용자 맞춤 복습을 설계해주는
            학습 SaaS 플랫폼입니다. 텍스트, 노트, 자료를 입력하면 핵심 개념을 추출해
            Q/A 형태의 학습 카드로 변환하고, 학습 기록을 분석해 오늘 복습할 카드와 취약 개념을 추천합니다.
          </p>
        </section>

        {/* Features */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">핵심 기능</h3>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>학습 자료 입력 시 AI 카드 자동 생성</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>학습 기록 기반 오늘의 복습 카드 추천</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>취약 개념 분석과 복습 전략 제안</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>개인 맞춤형 장기 학습 루틴 설계</span>
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
