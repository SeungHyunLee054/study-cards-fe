import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { DASHBOARD_PATH, MYPAGE_PATH, REVIEW_PATH } from '@/constants/routes'
import { recordPageVisit } from '@/lib/pageHistory'

// Lazy-loaded pages
const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then(m => ({ default: m.AboutPage }))
)
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage }))
)
const EmailVerificationPage = lazy(() =>
  import('@/pages/EmailVerificationPage').then(m => ({ default: m.EmailVerificationPage }))
)
const StudyPage = lazy(() =>
  import('@/pages/StudyPage').then(m => ({ default: m.StudyPage }))
)
const TodayReviewPage = lazy(() =>
  import('@/pages/TodayReviewPage').then(m => ({ default: m.TodayReviewPage }))
)
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage }))
)
const TermsPage = lazy(() =>
  import('@/pages/TermsPage').then(m => ({ default: m.TermsPage }))
)
const SubscriptionPage = lazy(() =>
  import('@/pages/SubscriptionPage').then(m => ({ default: m.SubscriptionPage }))
)
const SubscriptionSuccessPage = lazy(() =>
  import('@/pages/SubscriptionSuccessPage').then(m => ({ default: m.SubscriptionSuccessPage }))
)
const SubscriptionFailPage = lazy(() =>
  import('@/pages/SubscriptionFailPage').then(m => ({ default: m.SubscriptionFailPage }))
)
const MyPage = lazy(() =>
  import('@/pages/MyPage').then(m => ({ default: m.MyPage }))
)
const MyCardsPage = lazy(() =>
  import('@/pages/MyCardsPage').then(m => ({ default: m.MyCardsPage }))
)
const StatsPage = lazy(() =>
  import('@/pages/StatsPage').then(m => ({ default: m.StatsPage }))
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage }))
)
const SessionHistoryPage = lazy(() =>
  import('@/pages/SessionHistoryPage').then(m => ({ default: m.SessionHistoryPage }))
)
const AiGeneratePage = lazy(() =>
  import('@/pages/AiGeneratePage').then(m => ({ default: m.AiGeneratePage }))
)
const BookmarksPage = lazy(() =>
  import('@/pages/BookmarksPage').then(m => ({ default: m.BookmarksPage }))
)
const SearchPage = lazy(() =>
  import('@/pages/SearchPage').then(m => ({ default: m.SearchPage }))
)
const AdminCardsPage = lazy(() =>
  import('@/pages/AdminCardsPage').then(m => ({ default: m.AdminCardsPage }))
)
const AdminUsersPage = lazy(() =>
  import('@/pages/AdminUsersPage').then(m => ({ default: m.AdminUsersPage }))
)
const AdminGenerationPage = lazy(() =>
  import('@/pages/AdminGenerationPage').then(m => ({ default: m.AdminGenerationPage }))
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
)

function PageLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

function PageHistoryTracker() {
  const location = useLocation()

  useEffect(() => {
    recordPageVisit(location.pathname)
  }, [location.pathname])

  return null
}

function AppRoutes() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/subscription" element={<SubscriptionPage />} />
          <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
          <Route path="/subscription/fail" element={<SubscriptionFailPage />} />
          <Route path="/search" element={<SearchPage />} />
          {/* Protected routes */}
          <Route path={MYPAGE_PATH} element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
          <Route path="/my-cards" element={<ProtectedRoute><MyCardsPage /></ProtectedRoute>} />
          <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
          <Route path={DASHBOARD_PATH} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path={REVIEW_PATH} element={<ProtectedRoute><TodayReviewPage /></ProtectedRoute>} />
          <Route path="/sessions" element={<ProtectedRoute><SessionHistoryPage /></ProtectedRoute>} />
          <Route path="/ai-generate" element={<ProtectedRoute><AiGeneratePage /></ProtectedRoute>} />
          <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />
          {/* Admin routes */}
          <Route
            path="/admin/cards"
            element={
              <AdminRoute>
                <AdminCardsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/generation"
            element={
              <AdminRoute>
                <AdminGenerationPage />
              </AdminRoute>
            }
          />
          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <BrowserRouter>
            <PageHistoryTracker />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App
