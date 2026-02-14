import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const PAGE_WINDOW_SIZE = 2

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const startPage = Math.max(0, page - PAGE_WINDOW_SIZE)
  const endPage = Math.min(totalPages, page + PAGE_WINDOW_SIZE + 1)
  const pages = Array.from({ length: totalPages }, (_, i) => i).slice(startPage, endPage)

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="min-h-[44px]"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((value) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-3 py-2 rounded-lg text-sm min-h-[44px] min-w-[44px] transition-colors ${
            page === value
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {value + 1}
        </button>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="min-h-[44px]"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
