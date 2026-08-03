import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Clipboard, Check, Share2, Crown, Users, Shuffle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as SupabaseClient<any>
import {
  fetchSession,
  fetchPlayers,
  updateSessionSettings,
  startGame,
  finishGame,
  leaveSession,
  subscribeToSession,
  subscribeToPlayers,
  type Session,
  type SessionPlayer,
} from '@/lib/sessionService'
import { fetchTriviaQuestions } from '@/lib/triviaService'
import { categories } from '@/data/mockData'
import { getCategoryIcon } from '@/lib/categoryIcons'

const ROUND_OPTIONS = [5, 10, 15] as const

export default function WaitingRoom() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { userId } = useAppStore()

  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<SessionPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [starting, setStarting] = useState(false)

  const isHost = session?.hostId === userId

  const loadSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const [s, p] = await Promise.all([fetchSession(sessionId), fetchPlayers(sessionId)])
      if (!s) {
        setError('Room not found.')
        setLoading(false)
        return
      }
      setSession(s)
      setPlayers(p)
      setLoading(false)
    } catch (err) {
      console.error('[WaitingRoom] loadSession error:', err)
      setError('Failed to load room.')
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  useEffect(() => {
    if (!sessionId) return

    const sessionChannel = subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession)
      if (updatedSession.status === 'active') {
        navigate(`/trivia/multi/game/${sessionId}`, { replace: true })
      }
      if (updatedSession.status === 'finished') {
        navigate('/trivia/multi', { replace: true })
      }
    })

    const playersChannel = subscribeToPlayers(sessionId, (updatedPlayers) => {
      setPlayers(updatedPlayers)
    })

    return () => {
      void sessionChannel.unsubscribe()
      void playersChannel.unsubscribe()
    }
  }, [sessionId, navigate])

  const handleCopyCode = () => {
    if (!session) return
    void navigator.clipboard.writeText(session.roomCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShare = () => {
    if (!session) return
    const url = `${window.location.origin}/join/${session.roomCode}`
    void navigator.clipboard.writeText(url)
  }

  const handleUpdateSettings = async (categoryId: string, roundCount: number) => {
    if (!sessionId) return
    try {
      await updateSessionSettings(sessionId, categoryId, roundCount)
      setSession((s) => s ? { ...s, categoryId, roundCount } : s)
    } catch (err) {
      console.error('[WaitingRoom] updateSessionSettings error:', err)
    }
  }

  const handleStartGame = async () => {
    if (!session || !sessionId || starting) return
    if (!session.categoryId) return
    setStarting(true)
    try {
      const questions = await fetchTriviaQuestions(session.categoryId, session.roundCount)
      const questionIds = questions.map((q) => q.id)
      await startGame(sessionId, questionIds)
      navigate(`/trivia/multi/game/${sessionId}`)
    } catch (err) {
      console.error('[WaitingRoom] startGame error:', err)
      setStarting(false)
    }
  }

  const handleCancelRoom = async () => {
    if (!sessionId) return
    try {
      await finishGame(sessionId)
      navigate('/trivia/multi')
    } catch (err) {
      console.error('[WaitingRoom] cancelRoom error:', err)
    }
  }

  const handleLeaveRoom = async () => {
    if (!sessionId || !userId) return
    try {
      await leaveSession(sessionId, userId)
      navigate('/trivia/multi')
    } catch (err) {
      console.error('[WaitingRoom] leaveRoom error:', err)
    }
  }

  const handleToggleReady = async () => {
    if (!sessionId || !userId) return
    const me = players.find((p) => p.userId === userId)
    if (!me) return
    try {
      await db
        .from('session_players')
        .update({ is_ready: !me.isReady })
        .eq('session_id', sessionId)
        .eq('user_id', userId)
    } catch (err) {
      console.error('[WaitingRoom] toggleReady error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-navy">
        <div className="w-12 h-12 rounded-xl bg-amber animate-pulse" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream dark:bg-navy text-center">
        <p className="text-warmGray dark:text-gray-400 mb-6">{error ?? 'Room not found.'}</p>
        <button
          onClick={() => navigate('/trivia/multi')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold"
        >
          Back
        </button>
      </div>
    )
  }

  const canStart = players.length >= 2 && !!session.categoryId && !starting

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-5 pb-28">
      <div className="max-w-md mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/trivia/multi')}
          className="flex items-center gap-2 text-warmGray hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Multiplayer</span>
        </button>

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {isHost ? 'Your Room' : 'Waiting Room'}
          </h1>
        </motion.div>

        {/* Room code */}
        <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-4 mb-4">
          <p className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider mb-2">
            Room Code
          </p>
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-bold text-gray-900 dark:text-gray-50 tracking-widest flex-1">
              {session.roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="p-2 rounded-lg hover:bg-amber/10 transition-colors"
              aria-label="Copy code"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                    <Check size={18} className="text-emerald-500" />
                  </motion.div>
                ) : (
                  <motion.div key="clip" initial={{ scale: 0.7 }} animate={{ scale: 1 }}>
                    <Clipboard size={18} className="text-warmGray" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg hover:bg-amber/10 transition-colors"
              aria-label="Share invite link"
            >
              <Share2 size={18} className="text-warmGray" />
            </button>
          </div>
        </div>

        {/* Settings (host editable) */}
        {isHost ? (
          <>
            {/* Round count */}
            <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-4 mb-4">
              <h2 className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider mb-3">
                Number of questions
              </h2>
              <div className="flex gap-3">
                {ROUND_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      if (session.categoryId) {
                        void handleUpdateSettings(session.categoryId, n)
                      } else {
                        setSession((s) => s ? { ...s, roundCount: n } : s)
                      }
                    }}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      session.roundCount === n
                        ? 'border-amber bg-amber/10 text-amber'
                        : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface text-warmGray dark:text-gray-400 hover:border-amber/40'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Category picker */}
            <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-4 mb-4">
              <h2 className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider mb-3">
                Choose a topic
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => void handleUpdateSettings('mixed', session.roundCount)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3 px-2 text-xs font-medium transition-all ${
                    session.categoryId === 'mixed'
                      ? 'border-amber bg-amber/10'
                      : 'border-sand dark:border-white/10 bg-cream dark:bg-navy hover:border-amber/40'
                  }`}
                >
                  <Shuffle size={16} className="text-amber" />
                  <span className="text-gray-800 dark:text-gray-200">Mixed</span>
                </button>
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.id)
                  const isSelected = session.categoryId === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => void handleUpdateSettings(cat.id, session.roundCount)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-3 px-2 text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-amber bg-amber/10'
                          : 'border-sand dark:border-white/10 bg-cream dark:bg-navy hover:border-amber/40'
                      }`}
                    >
                      <Icon size={16} style={{ color: cat.color }} />
                      <span className="text-gray-800 dark:text-gray-200 leading-tight text-center">
                        {cat.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        ) : (
          /* Guest: read-only settings display */
          <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-4 mb-4">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-warmGray dark:text-gray-400">Topic</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {session.categoryId
                  ? categories.find((c) => c.id === session.categoryId)?.name ?? session.categoryId
                  : 'Not set yet'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-warmGray dark:text-gray-400">Questions</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {session.roundCount}
              </span>
            </div>
          </div>
        )}

        {/* Players list */}
        <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-warmGray" />
            <h2 className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider">
              Players ({players.length})
            </h2>
          </div>
          <div className="space-y-2">
            {players.map((p) => (
              <div key={p.userId} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-amber">
                      {p.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {p.displayName}
                  </span>
                  {p.userId === session.hostId && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-amber">
                      <Crown size={11} />
                      HOST
                    </span>
                  )}
                </div>
                {p.isReady ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-sand dark:border-white/20" />
                )}
              </div>
            ))}
            {players.length === 0 && (
              <p className="text-sm text-warmGray dark:text-gray-400 text-center py-2">
                No players yet
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {isHost ? (
          <div className="space-y-3">
            <button
              onClick={() => void handleStartGame()}
              disabled={!canStart}
              className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
                canStart
                  ? 'bg-amber text-white hover:bg-amber-dark shadow-md'
                  : 'bg-sand dark:bg-navy-surface text-warmGray dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              {starting ? 'Starting…' : 'Start Game'}
            </button>
            {!session.categoryId && (
              <p className="text-xs text-center text-warmGray dark:text-gray-400">
                Select a topic to start
              </p>
            )}
            {players.length < 2 && session.categoryId && (
              <p className="text-xs text-center text-warmGray dark:text-gray-400">
                Waiting for at least 1 more player
              </p>
            )}
            <button
              onClick={() => void handleCancelRoom()}
              className="w-full py-3 rounded-2xl border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Cancel Room
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => void handleToggleReady()}
              className="w-full py-4 rounded-2xl font-bold text-base bg-amber text-white hover:bg-amber-dark shadow-md transition-colors"
            >
              {players.find((p) => p.userId === userId)?.isReady ? 'Ready!' : 'Mark as Ready'}
            </button>
            <button
              onClick={() => void handleLeaveRoom()}
              className="w-full py-3 rounded-2xl border-2 border-sand dark:border-white/10 text-warmGray dark:text-gray-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 transition-colors"
            >
              Leave Room
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
