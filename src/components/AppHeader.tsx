import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Settings,
  LogOut,
  User,
  NotebookText,
  BarChart3,
  Shield,
  History,
  LayoutDashboard,
  CreditCard,
  Search,
  Heart,
  Menu,
  X,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { useAuth } from '@/contexts/AuthContext'

type HeaderContainer = 'max-w-6xl' | 'max-w-4xl' | 'max-w-3xl' | 'container'
type StickyTone = 'white' | 'background'

type BaseHeaderProps = {
  container?: HeaderContainer
  brandTo?: string
  brandLabel?: string
  sticky?: boolean
  stickyTone?: StickyTone
  className?: string
}

type AppNavHeaderProps = BaseHeaderProps & {
  variant: 'app-nav'
  dashboardLink: '/mypage' | '/dashboard'
  dashboardLabel: string
  includeAiGenerate?: boolean
}

type BrandOnlyHeaderProps = BaseHeaderProps & {
  variant: 'brand-only'
}

type BrandActionsHeaderProps = BaseHeaderProps & {
  variant: 'brand-actions'
  rightSlot: ReactNode
}

type BrandBackHeaderProps = BaseHeaderProps & {
  variant: 'brand-back'
  backTo: string
  backLabel?: string
  hideBackLabelOnMobile?: boolean
  backAriaLabel?: string
}

type BackTitleHeaderProps = BaseHeaderProps & {
  variant: 'back-title'
  backTo: string
  title: ReactNode
  backLabel?: string
  hideBackLabelOnMobile?: boolean
  rightSlot?: ReactNode
  titleClassName?: string
  backAriaLabel?: string
}

type AppHeaderProps =
  | AppNavHeaderProps
  | BrandOnlyHeaderProps
  | BrandActionsHeaderProps
  | BrandBackHeaderProps
  | BackTitleHeaderProps

type NavItem = {
  to: string
  label: string
  icon: ComponentType<{ className?: string }>
  adminOnly?: boolean
  accent?: 'primary' | 'purple'
}

const CONTAINER_CLASS: Record<HeaderContainer, string> = {
  'max-w-6xl': 'max-w-6xl mx-auto px-4 md:px-6',
  'max-w-4xl': 'max-w-4xl mx-auto px-4 md:px-6',
  'max-w-3xl': 'max-w-3xl mx-auto px-4',
  container: 'container mx-auto px-4',
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function AppHeader(props: AppHeaderProps) {
  const { logout, isAdmin, user } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  function getLinkClassName(item: NavItem): string {
    if (item.accent === 'purple') return 'text-purple-600'
    if (item.accent === 'primary') return 'text-primary'
    if (location.pathname === item.to) return 'text-primary'
    return ''
  }

  function renderBrand(hideTextOnMobile = false) {
    return (
      <Link to={props.brandTo ?? '/'} className="flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className={cx('text-xl font-semibold', hideTextOnMobile && 'hidden sm:inline')}>
          {props.brandLabel ?? 'Study Cards'}
        </span>
      </Link>
    )
  }

  function renderAppNavHeader({
    dashboardLink,
    dashboardLabel,
    includeAiGenerate = false,
  }: AppNavHeaderProps) {
    const navItems: NavItem[] = [
      { to: dashboardLink, label: dashboardLabel, icon: LayoutDashboard },
      { to: '/search', label: '검색', icon: Search },
      { to: '/bookmarks', label: '북마크', icon: Heart },
      ...(includeAiGenerate
        ? [{ to: '/ai-generate', label: 'AI 생성', icon: Wand2, accent: 'primary' as const }]
        : []),
      { to: '/sessions', label: '세션', icon: History },
      { to: '/my-cards', label: '내 카드', icon: NotebookText },
      { to: '/stats', label: '통계', icon: BarChart3 },
      { to: '/subscription', label: '구독', icon: CreditCard },
      { to: '/settings', label: '설정', icon: Settings },
      { to: '/admin/cards', label: '관리 카드', icon: Shield, adminOnly: true, accent: 'purple' },
      { to: '/admin/generation', label: '관리 생성', icon: Sparkles, adminOnly: true, accent: 'purple' },
    ]

    const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin)
    const desktopItems = visibleItems.filter(item => item.to !== '/settings')

    return (
      <div className={cx(CONTAINER_CLASS[props.container ?? 'max-w-6xl'], 'py-4 flex items-center justify-between gap-2')}>
        {renderBrand(true)}

        <div className="hidden md:flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-2 text-sm text-gray-600 shrink-0">
              <User className="h-4 w-4" />
              {user?.nickname && <span>{user.nickname}</span>}
            </div>
            {desktopItems.map((item) => (
              <Button key={item.to} variant="ghost" size="sm" asChild className="min-h-[44px] shrink-0">
                <Link to={item.to} className={getLinkClassName(item)}>
                  <item.icon className="h-4 w-4" />
                </Link>
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <NotificationDropdown />
            <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
              <Link to="/settings" className={location.pathname === '/settings' ? 'text-primary' : ''}>
                <Settings className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="min-h-[44px]">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex md:hidden items-center gap-1">
          <NotificationDropdown />
          <Button variant="ghost" size="sm" onClick={logout} className="min-h-[44px] min-w-[44px]">
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label="모바일 메뉴 열기"
            className="min-h-[44px] min-w-[44px]"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-200">
            <div className={cx(CONTAINER_CLASS[props.container ?? 'max-w-6xl'], 'py-3 grid grid-cols-2 gap-2')}>
              {visibleItems.map((item) => (
                <Button key={item.to} variant="ghost" size="sm" asChild className="min-h-[44px] justify-start">
                  <Link to={item.to} className={getLinkClassName(item)}>
                    <item.icon className="h-4 w-4" />
                    <span className="ml-2">{item.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    )
  }

  function renderBrandActionsHeader({ rightSlot }: BrandActionsHeaderProps) {
    return (
      <div className={cx(CONTAINER_CLASS[props.container ?? 'max-w-6xl'], 'py-4 flex items-center justify-between gap-3')}>
        {renderBrand()}
        <div className="flex items-center gap-2 md:gap-3">
          {rightSlot}
        </div>
      </div>
    )
  }

  function renderBrandBackHeader({
    backTo,
    backLabel = '돌아가기',
    hideBackLabelOnMobile = false,
    backAriaLabel,
  }: BrandBackHeaderProps) {
    return (
      <div className={cx(CONTAINER_CLASS[props.container ?? 'max-w-6xl'], 'py-4 flex items-center justify-between gap-3')}>
        {renderBrand()}
        <Button variant="ghost" size="sm" asChild className="min-h-[44px]">
          <Link to={backTo} aria-label={backAriaLabel}>
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            {hideBackLabelOnMobile ? (
              <span className="hidden sm:inline">{backLabel}</span>
            ) : (
              <span>{backLabel}</span>
            )}
          </Link>
        </Button>
      </div>
    )
  }

  function renderBackTitleHeader({
    backTo,
    title,
    backLabel = '뒤로',
    hideBackLabelOnMobile = false,
    rightSlot,
    titleClassName,
    backAriaLabel,
  }: BackTitleHeaderProps) {
    return (
      <div className={cx(CONTAINER_CLASS[props.container ?? 'max-w-4xl'], 'py-3 md:py-4 flex items-center gap-3')}>
        <Button variant="ghost" size="sm" asChild className="min-h-[44px] shrink-0">
          <Link to={backTo} aria-label={backAriaLabel}>
            <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
            {hideBackLabelOnMobile ? (
              <span className="hidden sm:inline">{backLabel}</span>
            ) : (
              <span>{backLabel}</span>
            )}
          </Link>
        </Button>
        <h1 className={titleClassName ?? 'text-base md:text-lg font-semibold truncate'}>
          {title}
        </h1>
        <div className="ml-auto shrink-0">
          {rightSlot ?? <div className="w-16" />}
        </div>
      </div>
    )
  }

  const stickyClass = props.sticky
    ? props.stickyTone === 'background'
      ? 'sticky top-0 bg-background/95 backdrop-blur z-10'
      : 'sticky top-0 bg-white/95 backdrop-blur z-10'
    : 'bg-white'

  return (
    <header className={cx('border-b border-gray-200', stickyClass, props.className)}>
      {props.variant === 'app-nav' && renderAppNavHeader(props)}
      {props.variant === 'brand-only' && (
        <div className={cx(CONTAINER_CLASS[props.container ?? 'max-w-6xl'], 'py-4')}>
          {renderBrand()}
        </div>
      )}
      {props.variant === 'brand-actions' && renderBrandActionsHeader(props)}
      {props.variant === 'brand-back' && renderBrandBackHeader(props)}
      {props.variant === 'back-title' && renderBackTitleHeader(props)}
    </header>
  )
}
