import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shuffle, X, WifiOff } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  joinQueue,
  leaveQueue,
  findQueuedPlayers,
  subscribeToQueue,
  writeSessionIdToQueue,
  fetchQueueSessionId,
} from '@/lib/matchmakingService'
import {
  createSession,
  joinSession,
} from '@/lib/sessionService'
import { categories } from '@/data/mockData'
import { getCategoryIcon } from '@/lib/categoryIcons'
import type { RealtimeChannel } from '@supabase/supabase-js'

const FIRST_PROMPT_MS = 25000
const AUTO_REDIRECT_MS = 50000
const POLL_INTERVAL_MS = 3000
const SESSION_WAIT_INTERVAL_MS = 500
const SESSION_WAIT_MAX_ATTEMPTS = 30

type MatchmakingPhase = 'select' | 'searching'

export default function Matchmaking() {
  const navigate = useNavigate()
  const { userId, name } = useAppStore()

  if (!navigator.onLine) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy flex flex-col items-center justify-center px-6 text-center">
        <WifiOff size={48} className="text-warmGray dark:text-gray-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          Multiplayer requires an internet connection.
        </h1>
        <p className="text-sm text-warmGray dark:text-gray-400 mb-6">
          You're currently offline. Connect to the internet to find a match.
        </p>
        <button
          onClick={() => navigate('/trivia/solo')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold hover:bg-amber-dark transition-colors"
        >
          Go Solo
        </button>
      </div>
    )
  }

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
  const sessionWaitRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const matchFoundRef = useRef(false)

  // Stops all timers and subscriptions without touching the DB queue row.
  const stopTimers = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe()
      channelRef.current = null
    }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (elapsedRef.current) { clearInterval(elapsedRef.current); elapsedRef.current = null }
    if (dialogTimerRef.current) { clearTimeout(dialogTimerRef.current); dialogTimerRef.current = null }
    if (autoRedirectRef.current) { clearTimeout(autoRedirectRef.current); autoRedirectRef.current = null }
    if (sessionWaitRef.current) { clearInterval(sessionWaitRef.current); sessionWaitRef.current = null }
  }, [])

  // Full cleanup: stop timers AND remove own queue row.
  const stopSearching = useCallback(async () => {
    await stopTimers()
    if (userId) {
      try { await leaveQueue(userId) } catch { /* ignore */ }
    }
  }, [stopTimers, userId])

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

      // Stop timers but do NOT leave queue yet — the non-creator's row needs to
      // stay alive so the creator can write the session_id into it.
      await stopTimers()

      if (!userId || !selectedCategory) return

      const displayName = name || 'Player'
      const allIds = [userId, ...otherPlayers.map((p) => p.userId)].sort()
      const isCreator = allIds[0] === userId

      try {
        if (isCreator) {
          const session = await createSession(userId, displayName)

          // Relay session ID to every other matched player's queue row before
          // starting the game, so they can discover and join the waiting room.
          await Promise.all(
            otherPlayers.map((op) =>
              writeSessionIdToQueue(op.userId, session.id).catch(() => {})
            )
          )

          // Start game questions but keep status 'waiting' so all players can
          // land in WaitingRoom together before the host starts the game.
          // (The host is already in the session as it was created with their row.)
          await leaveQueue(userId)
          navigate(`/trivia/multi/room/${session.id}`)
        } else {
          // Non-creator: poll own queue row until creator writes session_id.
          let attempts = 0
          sessionWaitRef.current = setInterval(async () => {
            attempts++
            if (attempts > SESSION_WAIT_MAX_ATTEMPTS) {
              clearInterval(sessionWaitRef.current!)
              sessionWaitRef.current = null
              await leaveQueue(userId).catch(() => {})
              navigate('/trivia/solo')
              return
            }
            try {
              const sessionId = await fetchQueueSessionId(userId)
              if (sessionId) {
                clearInterval(sessionWaitRef.current!)
                sessionWaitRef.current = null
                await joinSession(sessionId, userId, displayName)
                await leaveQueue(userId)
                navigate(`/trivia/multi/room/${sessionId}`)
              }
            } catch (err) {
              console.error('[Matchmaking] session wait poll error:', err)
            }
          }, SESSION_WAIT_INTERVAL_MS)
        }
      } catch (err) {
        console.error('[Matchmaking] handleMatchFound error:', err)
        await leaveQueue(userId).catch(() => {})
        navigate('/trivia/solo')
      }
    },
    [userId, name, selectedCategory, stopTimers, navigate]
  )

  const startSearching = useCallback(async () => {
    if (!userId || !selectedCategory) return
    matchFoundRef.current = false

    await joinQueue(userId, selectedCategory, name || 'Player')

    channelRef.current = subscribeToQueue(selectedCategory, () => {
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

    const startTime = Date.now()
    elapsedRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTime)
    }, 500)

    dialogTimerRef.current = setTimeout(() => {
      if (!matchFoundRef.current) setShowDialog(true)
    }, FIRST_PROMPT_MS)

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
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-amber flex items-center justify-center z-10 relative">
                <span className="text-white font-bold text-xl">
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            </div>
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

          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-warmGray dark:text-gray-400"
          >
            {matchFound ? '' : `Searching for ${elapsedSeconds}s…`}
          </motion.p>

          {matchFound && (
            <p className="mt-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Match found! Joining room…
            </p>
          )}
        </div>
      </div>

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
