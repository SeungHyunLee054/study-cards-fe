import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LogIn, UserPlus, X } from 'lucide-react'

interface RateLimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RateLimitModal({ isOpen, onClose }: RateLimitModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-background rounded-lg shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
            <span className="text-2xl">⚠️</span>
          </div>

          <h2 className="text-xl font-semibold mb-2">
            일일 학습 한도 초과
          </h2>

          <p className="text-muted-foreground mb-6">
            오늘의 무료 학습 한도(15개)를 모두 사용했습니다.
            <br />
            로그인하면 무제한으로 학습할 수 있습니다.
          </p>

          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link to="/signup">
                <UserPlus className="mr-2 h-4 w-4" />
                회원가입
              </Link>
            </Button>

            <Button variant="ghost" onClick={onClose} className="w-full">
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
