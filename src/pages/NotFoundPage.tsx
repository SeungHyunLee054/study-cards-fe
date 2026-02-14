import { Link } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader variant="brand-only" />
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-gray-600 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Button asChild>
          <Link to="/">홈으로 돌아가기</Link>
        </Button>
      </main>
    </div>
  )
}
