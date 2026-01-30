import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  'Anki 알고리즘 기반 간격 반복',
  '1,000+ CS 플래시카드',
  '하루 5개 무료 학습',
  '실시간 진행도 추적',
]

export function HomePage() {
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
              Log in
            </Link>
            <Button size="sm" asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-gray-600">Now with 1,000+ CS cards</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
            Master CS with
            <br />
            <span className="text-primary">
              Spaced Repetition
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            jwasham의 코딩 인터뷰 대학 플래시카드로 학습하세요.
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
              <Link to="/about">Learn More</Link>
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
          <div className="relative max-w-lg mx-auto">
            <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Data Structures
                </span>
                <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                  EF: 2.5
                </span>
              </div>

              <p className="text-xl font-medium text-gray-900">
                What is the time complexity of accessing an element in a hash table?
              </p>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  O(1) average case - constant time lookup using the hash function
                </p>
              </div>

              <div className="mt-8 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  Wrong
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-green-200 text-green-600 hover:bg-green-50"
                >
                  Correct
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="grid grid-cols-3 gap-8">
            {[
              { value: '1,000+', label: 'Flash Cards' },
              { value: '5/day', label: 'Free Tier' },
              { value: '∞', label: 'With Account' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-16">
          <div className="p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Ready to start learning?</h2>
            <p className="mt-2 text-gray-600">
              무료로 시작하세요. 가입하면 무제한 학습이 가능합니다.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/study">Start Free Trial</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2025 Study Cards. Built with React + Vite.</p>
        </div>
      </footer>
    </div>
  )
}
