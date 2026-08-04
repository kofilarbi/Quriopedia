import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAppStore } from '@/store/useAppStore'
import { useAuth } from '@/lib/useAuth'
import BottomNav from '@/components/BottomNav'
import Auth from '@/pages/Auth'
import OfflineBanner from '@/components/OfflineBanner'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const Trivia = lazy(() => import('./pages/Trivia'))
const Saved = lazy(() => import('./pages/Saved'))
const Profile = lazy(() => import('./pages/Profile'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const SoloSetup = lazy(() => import('./pages/trivia/SoloSetup'))
const SoloGame = lazy(() => import('./pages/trivia/SoloGame'))
const SoloResults = lazy(() => import('./pages/trivia/SoloResults'))
const MultiHub = lazy(() => import('./pages/trivia/MultiHub'))
const WaitingRoom = lazy(() => import('./pages/trivia/WaitingRoom'))
const MultiGame = lazy(() => import('./pages/trivia/MultiGame'))
const MultiResults = lazy(() => import('./pages/trivia/MultiResults'))
const Matchmaking = lazy(() => import('./pages/trivia/Matchmaking'))
const JoinRoom = lazy(() => import('./pages/JoinRoom'))

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
      <OfflineBanner />
      <main role="main">
        <Suspense fallback={<LoadingScreen />}>
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
              element={!user ? <Navigate to="/auth" replace /> : <WaitingRoom />}
            />
            <Route
              path="/trivia/multi/game/:sessionId"
              element={!user ? <Navigate to="/auth" replace /> : <MultiGame />}
            />
            <Route
              path="/trivia/multi/results/:sessionId"
              element={!user ? <Navigate to="/auth" replace /> : <MultiResults />}
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
            {/* Join room — public entry point; JoinRoom handles auth inline */}
            <Route path="/join/:roomCode" element={<JoinRoom />} />
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
        </Suspense>
      </main>

      {!isOnboarding && !isAuth && user && hasCompletedOnboarding && <BottomNav />}
    </div>
  )
}
