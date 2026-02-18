import { BookOpen, Brain, ExternalLink } from 'lucide-react'
import { SiGithub } from 'react-icons/si'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/AppHeader'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader variant="back-title" container="container" backTo="/" backLabel="뒤로가기" title="서비스 소개" />

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Introduction */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold">Study Cards</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Study Cards는 학습 자료를 AI 카드로 정리하고, 학습 기록을 기반으로 오늘 복습 전략을
            추천해주는 개인 맞춤 학습 서비스입니다. 텍스트와 파일을 입력하면 핵심 개념을 Q/A 카드로
            자동 변환하고, 학습 흐름에 맞는 복습을 바로 시작할 수 있습니다.
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
              <span>텍스트/파일 기반 AI 카드 자동 생성</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>오늘의 복습에서 학습 기록 기반 카드 우선순위 제공</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>관리자/PRO 계정 대상 AI 취약 개념 분석 및 복습 전략 제안</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>카테고리/세션 기록 기반 학습 진행도 추적</span>
            </li>
          </ul>
        </section>

        {/* Credits */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold mb-4">데이터 및 참고</h3>
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground">
              일부 학습 카드 데이터는{' '}
              <a
                href="https://github.com/jwasham/coding-interview-university"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                jwasham/coding-interview-university
                <ExternalLink className="h-3 w-3" />
              </a>
              저장소를 참고해 구성했습니다.
            </p>
          </div>
        </section>

        {/* Links */}
        <section>
          <h3 className="text-xl font-semibold mb-4">프로젝트 링크</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SeungHyunLee054/study-cards-fe"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiGithub className="mr-2 h-4 w-4" />
                프론트엔드
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SeungHyunLee054/study-cards-be"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiGithub className="mr-2 h-4 w-4" />
                백엔드
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/SeungHyunLee054"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiGithub className="mr-2 h-4 w-4" />
                개발자
              </a>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
