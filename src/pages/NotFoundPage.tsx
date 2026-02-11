import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-gray-600 mb-6">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Button asChild>
        <Link to="/">홈으로 돌아가기</Link>
      </Button>
    </div>
  )
}
