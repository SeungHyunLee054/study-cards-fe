import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { HomePage } from '@/pages/HomePage'
import { AboutPage } from '@/pages/AboutPage'
import { MyPage } from '@/pages/MyPage'
import { StudyPage } from '@/pages/StudyPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { EmailVerificationPage } from '@/pages/EmailVerificationPage'
import { StatsPage } from '@/pages/StatsPage'
import { OAuthCallbackPage } from '@/pages/OAuthCallbackPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { MyCardsPage } from '@/pages/MyCardsPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { AdminCardsPage } from '@/pages/AdminCardsPage'
import { AdminGenerationPage } from '@/pages/AdminGenerationPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SessionHistoryPage } from '@/pages/SessionHistoryPage'
import { SubscriptionPage } from '@/pages/SubscriptionPage'
import { SubscriptionSuccessPage } from '@/pages/SubscriptionSuccessPage'
import { SubscriptionFailPage } from '@/pages/SubscriptionFailPage'
import { AdminRoute } from '@/components/AdminRoute'

function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<EmailVerificationPage />} />
        <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/my-cards" element={<MyCardsPage />} />
        <Route path="/study" element={<StudyPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sessions" element={<SessionHistoryPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
        <Route path="/subscription/fail" element={<SubscriptionFailPage />} />
        <Route
          path="/admin/cards"
          element={
            <AdminRoute>
              <AdminCardsPage />
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
      </Routes>
    </AuthProvider>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
