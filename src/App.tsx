import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/lib/useAuth'
import BottomNav from '@/components/BottomNav'
import Onboarding from '@/pages/Onboarding'
import Home from '@/pages/Home'
import Explore from '@/pages/Explore'
import Trivia from '@/pages/Trivia'
import Saved from '@/pages/Saved'
import Profile from '@/pages/Profile'
import Auth from '@/pages/Auth'
import SoloSetup from '@/pages/trivia/SoloSetup'
import SoloGame from '@/pages/trivia/SoloGame'
import SoloResults from '@/pages/trivia/SoloResults'
import MultiHub from '@/pages/trivia/MultiHub'
import WaitingRoom from '@/pages/trivia/WaitingRoom'
import MultiGame from '@/pages/trivia/MultiGame'
import MultiResults from '@/pages/trivia/MultiResults'
import Matchmaking from '@/pages/trivia/Matchmaking'
import JoinRoom from '@/pages/JoinRoom'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-cream dark:bg-navy flex items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-amber flex items-center justify-center shadow-lg animate-pulse">
        <span className="text-white font-bold text-3xl font-serif">Q</span>
      </div>
    </div>
  )
}

export default function App() {
  const { darkMode, hasCompletedOnboarding } = useAppStore()
  const { user, loading } = useAuth()
  const location = useLocation()
  const isOnboarding = location.pathname === '/onboarding'
  const isAuth = location.pathname === '/auth'

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="max-w-md mx-auto relative min-h-screen">
      <Routes>
        {/* Public auth route */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <Auth />}
        />

        {/* Onboarding — requires auth but not completed onboarding */}
        <Route
          path="/onboarding"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : hasCompletedOnboarding ? (
              <Navigate to="/" replace />
            ) : (
              <Onboarding />
            )
          }
        />

        {/* Protected app routes */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Home />
            )
          }
        />
        <Route
          path="/explore"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Explore />
            )
          }
        />
        <Route
          path="/explore/:categoryId"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Explore />
            )
          }
        />
        <Route
          path="/trivia"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Trivia />
            )
          }
        />
        <Route
          path="/trivia/solo"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <SoloSetup />
            )
          }
        />
        <Route
          path="/trivia/solo/game"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <SoloGame />
            )
          }
        />
        <Route
          path="/trivia/solo/results"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <SoloResults />
            )
          }
        />
        <Route
          path="/trivia/multi"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <MultiHub />
            )
          }
        />
        <Route
          path="/trivia/multi/room/:sessionId"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <WaitingRoom />
            )
          }
        />
        <Route
          path="/trivia/multi/game/:sessionId"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <MultiGame />
            )
          }
        />
        <Route
          path="/trivia/multi/results/:sessionId"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <MultiResults />
            )
          }
        />
        <Route
          path="/trivia/multi/matchmaking"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Matchmaking />
            )
          }
        />
        {/* Join room — requires auth but NOT hasCompletedOnboarding */}
        <Route
          path="/join/:roomCode"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : (
              <JoinRoom />
            )
          }
        />
        <Route
          path="/saved"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Saved />
            )
          }
        />
        <Route
          path="/profile"
          element={
            !user ? (
              <Navigate to="/auth" replace />
            ) : !hasCompletedOnboarding ? (
              <Navigate to="/onboarding" replace />
            ) : (
              <Profile />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isOnboarding && !isAuth && user && hasCompletedOnboarding && <BottomNav />}
    </div>
  )
}
