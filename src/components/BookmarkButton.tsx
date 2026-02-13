import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBookmark } from '@/hooks/useBookmark'
import { useAuth } from '@/contexts/AuthContext'
import type { CardType } from '@/types/card'

interface BookmarkButtonProps {
  cardId: number
  cardType: CardType
  initialBookmarked?: boolean
  className?: string
  size?: 'sm' | 'md'
  onToggled?: () => void
}

export function BookmarkButton({
  cardId,
  cardType,
  initialBookmarked,
  className,
  size = 'md',
  onToggled,
}: BookmarkButtonProps) {
  const { isLoggedIn } = useAuth()
  const { isBookmarked, isLoading, toggle } = useBookmark({
    cardId,
    cardType,
    initialBookmarked,
  })

  if (!isLoggedIn) return null

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation()
        e.preventDefault()
        await toggle()
        onToggled?.()
      }}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        'min-h-[44px] min-w-[44px]',
        'hover:bg-gray-100 active:bg-gray-200',
        isLoading && 'opacity-50 cursor-not-allowed',
        className,
      )}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <Heart
        className={cn(
          iconSize,
          'transition-colors',
          isBookmarked
            ? 'fill-red-500 text-red-500'
            : 'fill-none text-gray-400',
        )}
      />
    </button>
  )
}
