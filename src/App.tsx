import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import type { AppState } from '@/store/useAppStore'
import BottomNav from '@/components/BottomNav'
import Onboarding from '@/pages/Onboarding'
import Home from '@/pages/Home'
import Explore from '@/pages/Explore'
import Trivia from '@/pages/Trivia'
import Saved from '@/pages/Saved'
import Profile from '@/pages/Profile'

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const hasCompletedOnboarding = useAppStore((s: AppState) => s.hasCompletedOnboarding)
  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export default function App() {
  const { darkMode } = useAppStore()
  const location = useLocation()
  const isOnboarding = location.pathname === '/onboarding'

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route
          path="/"
          element={
            <RequireOnboarding>
              <Home />
            </RequireOnboarding>
          }
        />
        <Route
          path="/explore"
          element={
            <RequireOnboarding>
              <Explore />
            </RequireOnboarding>
          }
        />
        <Route
          path="/explore/:categoryId"
          element={
            <RequireOnboarding>
              <Explore />
            </RequireOnboarding>
          }
        />
        <Route
          path="/trivia"
          element={
            <RequireOnboarding>
              <Trivia />
            </RequireOnboarding>
          }
        />
        <Route
          path="/saved"
          element={
            <RequireOnboarding>
              <Saved />
            </RequireOnboarding>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireOnboarding>
              <Profile />
            </RequireOnboarding>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isOnboarding && <BottomNav />}
    </div>
  )
}
