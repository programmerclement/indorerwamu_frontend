import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import PageLoader from '@/components/ui/PageLoader'

const LoginPage       = lazy(() => import('@/pages/LoginPage'))
const DashboardPage   = lazy(() => import('@/pages/DashboardPage'))
const UsersPage       = lazy(() => import('@/pages/UsersPage'))
const UserDetailPage  = lazy(() => import('@/pages/UserDetailPage'))
const ChallengesPage  = lazy(() => import('@/pages/ChallengesPage'))
const ArticlesPage    = lazy(() => import('@/pages/ArticlesPage'))
const TipsPage        = lazy(() => import('@/pages/TipsPage'))
const RewardsPage     = lazy(() => import('@/pages/RewardsPage'))
const AnalyticsPage   = lazy(() => import('@/pages/AnalyticsPage'))
const SettingsPage    = lazy(() => import('@/pages/SettingsPage'))
const ProfilePage     = lazy(() => import('@/pages/ProfilePage'))

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:id" element={<UserDetailPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/tips" element={<TipsPage />} />
              <Route path="/rewards" element={<RewardsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
