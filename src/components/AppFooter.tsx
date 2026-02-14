import { cn } from '@/lib/utils'

type FooterContainer = 'max-w-6xl' | 'max-w-4xl' | 'container'

interface AppFooterProps {
  container?: FooterContainer
  withTopMargin?: boolean
  className?: string
}

const CONTAINER_CLASS: Record<FooterContainer, string> = {
  'max-w-6xl': 'max-w-6xl mx-auto px-6',
  'max-w-4xl': 'max-w-4xl mx-auto px-4 md:px-6',
  container: 'container mx-auto px-4',
}

export function AppFooter({
  container = 'max-w-6xl',
  withTopMargin = true,
  className,
}: AppFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'border-t border-gray-200 py-8',
        withTopMargin && 'mt-16',
        className
      )}
    >
      <div className={cn(CONTAINER_CLASS[container], 'text-center text-sm text-gray-500')}>
        <p>&copy; {year} Study Cards. All rights reserved.</p>
      </div>
    </footer>
  )
}
