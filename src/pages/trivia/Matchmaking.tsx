import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shuffle, X } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  joinQueue,
  leaveQueue,
  findQueuedPlayers,
  subscribeToQueue,
} from '@/lib/matchmakingService'
import {
  createSession,
  startGame,
  joinSession,
} from '@/lib/sessionService'
import { fetchTriviaQuestions } from '@/lib/triviaService'
import { categories } from '@/data/mockData'
import { getCategoryIcon } from '@/lib/categoryIcons'
import type { RealtimeChannel } from '@supabase/supabase-js'

const FIRST_PROMPT_MS = 25000
const AUTO_REDIRECT_MS = 50000
const POLL_INTERVAL_MS = 3000

type MatchmakingPhase = 'select' | 'searching'

export default function Matchmaking() {
  const navigate = useNavigate()
  const { userId, name } = useAppStore()

  const [phase, setPhase] = useState<MatchmakingPhase>('select')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [showDialog, setShowDialog] = useState(false)
  const [matchFound, setMatchFound] = useState(false)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dialogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoRedirectRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const matchFoundRef = useRef(false)

  const stopSearching = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe()
      channelRef.current = null
    }
    if (pollRef.current) clearInterval(pollRef.current)
    if (elapsedRef.current) clearInterval(elapsedRef.current)
    if (dialogTimerRef.current) clearTimeout(dialogTimerRef.current)
    if (autoRedirectRef.current) clearTimeout(autoRedirectRef.current)
    if (userId) {
      try { await leaveQueue(userId) } catch { /* ignore */ }
    }
  }, [userId])

  useEffect(() => {
    return () => {
      void stopSearching()
    }
  }, [stopSearching])

  const handleMatchFound = useCallback(
    async (otherPlayers: Array<{ userId: string; displayName: string }>) => {
      if (matchFoundRef.current) return
      matchFoundRef.current = true
      setMatchFound(true)
      await stopSearching()

      if (!userId || !name || !selectedCategory) return

      // Lexicographically first userId creates the session
      const allIds = [userId, ...otherPlayers.map((p) => p.userId)].sort()
      const isCreator = allIds[0] === userId

      try {
        if (isCreator) {
          const questions = await fetchTriviaQuestions(selectedCategory, 10)
          const questionIds = questions.map((q) => q.id)
          const session = await createSession(userId, name)
          // Join other players
          for (const op of otherPlayers) {
            try {
              await joinSession(session.id, op.userId, op.displayName)
            } catch { /* may fail if they joined themselves */ }
          }
          await startGame(session.id, questionIds)
          navigate(`/trivia/multi/room/${session.id}`)
        } else {
          // Non-creator: poll until session becomes active
          // For simplicity, navigate to matchmaking hub — the session subscription will pick it up
          // In practice the host creates session and calls startGame. Since we can't know the session ID
          // from this side without a coordination mechanism, redirect to multi hub.
          navigate('/trivia/multi')
        }
      } catch (err) {
        console.error('[Matchmaking] handleMatchFound error:', err)
        navigate('/trivia/solo')
      }
    },
    [userId, name, selectedCategory, stopSearching, navigate]
  )

  const startSearching = useCallback(async () => {
    if (!userId || !name || !selectedCategory) return
    matchFoundRef.current = false

    await joinQueue(userId, selectedCategory, name)

    // Subscribe to queue changes
    channelRef.current = subscribeToQueue(selectedCategory, () => {
      // Trigger an immediate poll when queue changes
      if (!matchFoundRef.current) {
        findQueuedPlayers(selectedCategory, userId)
          .then((others) => {
            if (others.length >= 1 && !matchFoundRef.current) {
              void handleMatchFound(others)
            }
          })
          .catch(console.error)
      }
    })

    // Polling
    pollRef.current = setInterval(() => {
      if (matchFoundRef.current) return
      findQueuedPlayers(selectedCategory, userId)
        .then((others) => {
          if (others.length >= 1 && !matchFoundRef.current) {
            void handleMatchFound(others)
          }
        })
        .catch(console.error)
    }, POLL_INTERVAL_MS)

    // Elapsed timer
    const startTime = Date.now()
    elapsedRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime)
    }, 500)

    // 25s: show dialog
    dialogTimerRef.current = setTimeout(() => {
      if (!matchFoundRef.current) setShowDialog(true)
    }, FIRST_PROMPT_MS)

    // 50s: auto-redirect
    autoRedirectRef.current = setTimeout(() => {
      if (!matchFoundRef.current) {
        void stopSearching().then(() => navigate('/trivia/solo'))
      }
    }, AUTO_REDIRECT_MS)
  }, [userId, name, selectedCategory, handleMatchFound, stopSearching, navigate])

  const handleStartSearching = () => {
    if (!selectedCategory) return
    setPhase('searching')
    void startSearching()
  }

  const handleStartSolo = async () => {
    await stopSearching()
    navigate('/trivia/solo')
  }

  const handleKeepWaiting = () => {
    setShowDialog(false)
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000)

  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-5 pb-28">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate('/trivia/multi')}
            className="flex items-center gap-2 text-warmGray hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Multiplayer</span>
          </button>

          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Matchmaking</h1>
            <p className="text-sm text-warmGray dark:text-gray-400 mt-1">
              Choose a topic to match with other players
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('mixed')}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-sm font-medium transition-all ${
                selectedCategory === 'mixed'
                  ? 'border-amber bg-amber/10'
                  : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface hover:border-amber/40 hover:bg-amber/5'
              }`}
            >
              <Shuffle size={22} className="text-amber" />
              <span className="text-gray-800 dark:text-gray-200">Mixed</span>
            </button>
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.id)
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-amber bg-amber/10'
                      : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface hover:border-amber/40 hover:bg-amber/5'
                  }`}
                >
                  <Icon size={22} style={{ color: cat.color }} />
                  <span className="text-gray-800 dark:text-gray-200 text-center leading-tight">
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleStartSearching}
            disabled={!selectedCategory}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              selectedCategory
                ? 'bg-amber text-white hover:bg-amber-dark shadow-md'
                : 'bg-sand dark:bg-navy-surface text-warmGray cursor-not-allowed'
            }`}
          >
            Find Match
          </button>
        </div>
      </div>
    )
  }

  // Searching phase
  const categoryName = selectedCategory
    ? selectedCategory === 'mixed'
      ? 'Mixed'
      : categories.find((c) => c.id === selectedCategory)?.name ?? selectedCategory
    : ''

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-5 pb-28 flex flex-col">
      <div className="max-w-md mx-auto w-full">
        <button
          onClick={() => {
            void stopSearching().then(() => navigate('/trivia/multi'))
          }}
          className="flex items-center gap-2 text-warmGray hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Cancel</span>
        </button>

        <div className="flex flex-col items-center justify-center flex-1 py-12">
          {/* Pulsing avatar circles */}
          <div className="flex items-center gap-4 mb-8">
            {/* User avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber flex items-center justify-center z-10 relative">
                <span className="text-white font-bold text-xl">
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            </div>
            {/* Waiting slots */}
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                className="w-16 h-16 rounded-full border-2 border-dashed border-amber/40 bg-amber/5 flex items-center justify-center"
              >
                <div className="w-6 h-6 rounded-full bg-amber/20" />
              </motion.div>
            ))}
          </div>

          {/* Category badge */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-navy-surface border border-sand dark:border-white/10 rounded-full px-4 py-2 mb-4">
            {selectedCategory && selectedCategory !== 'mixed' ? (
              (() => {
                const Icon = getCategoryIcon(selectedCategory)
                const cat = categories.find((c) => c.id === selectedCategory)
                return <Icon size={14} style={{ color: cat?.color }} />
              })()
            ) : (
              <Shuffle size={14} className="text-amber" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {categoryName}
            </span>
          </div>

          {/* Elapsed timer */}
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-warmGray dark:text-gray-400"
          >
            Searching for {elapsedSeconds}s…
          </motion.p>

          {matchFound && (
            <p className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Match found! Setting up game…
            </p>
          )}
        </div>
      </div>

      {/* No-match dialog */}
      <AnimatePresence>
        {showDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 px-4 pb-8"
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="bg-white dark:bg-navy-surface rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">
                  No one found yet
                </h2>
                <button onClick={handleKeepWaiting} className="text-warmGray hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-warmGray dark:text-gray-400 mb-6">
                We haven't found anyone for <strong>{categoryName}</strong> yet. You can start a solo
                game instead or keep waiting (auto-redirects in {Math.max(0, 50 - elapsedSeconds)}s).
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => void handleStartSolo()}
                  className="flex-1 py-3 rounded-xl border-2 border-sand dark:border-white/10 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:border-amber/40 transition-colors"
                >
                  Start Solo
                </button>
                <button
                  onClick={handleKeepWaiting}
                  className="flex-1 py-3 rounded-xl bg-amber text-white font-semibold text-sm hover:bg-amber-dark transition-colors"
                >
                  Keep Waiting
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
