import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, LogIn } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { fetchSessionByCode, joinSession, fetchPlayers, type Session } from '@/lib/sessionService'
import { categories } from '@/data/mockData'
import Auth from '@/pages/Auth'

export default function JoinRoom() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { userId, name } = useAppStore()

  const [session, setSession] = useState<Session | null>(null)
  const [playerCount, setPlayerCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    if (!roomCode) {
      setError('Invalid room code.')
      setLoading(false)
      return
    }
    fetchSessionByCode(roomCode)
      .then(async (s) => {
        if (!s) {
          setError('Room not found.')
          setLoading(false)
          return
        }
        setSession(s)
        const players = await fetchPlayers(s.id)
        setPlayerCount(players.length)

        // If already in this session, go straight to waiting room
        if (userId && players.some((p) => p.userId === userId)) {
          navigate(`/trivia/multi/room/${s.id}`, { replace: true })
          return
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to find room.')
        setLoading(false)
      })
  }, [roomCode, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // If not authenticated, show Auth inline so they can sign in then return
  if (!userId) {
    return <Auth />
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
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold"
        >
          Go Home
        </button>
      </div>
    )
  }

  if (session.status !== 'waiting') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream dark:bg-navy text-center">
        <p className="text-warmGray dark:text-gray-400 mb-2 text-lg font-semibold">
          {session.status === 'active' ? 'This game has already started.' : 'This game has ended.'}
        </p>
        <p className="text-sm text-warmGray dark:text-gray-400 mb-6">
          Ask your friend to create a new room.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold"
        >
          Go Home
        </button>
      </div>
    )
  }

  const categoryName = session.categoryId
    ? categories.find((c) => c.id === session.categoryId)?.name ?? session.categoryId
    : 'Not set yet'

  const handleJoin = async () => {
    if (!userId || joining) return
    setJoining(true)
    try {
      await joinSession(session.id, userId, name || 'Player')
      navigate(`/trivia/multi/room/${session.id}`)
    } catch (err) {
      console.error('[JoinRoom] joinSession error:', err)
      setJoining(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 flex items-center justify-center pb-10">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center">
              <Users size={24} className="text-amber" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50">Join Game</h1>
              <p className="text-sm text-warmGray dark:text-gray-400">Room {session.roomCode}</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-warmGray dark:text-gray-400">Topic</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {categoryName}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-warmGray dark:text-gray-400">Questions</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {session.roundCount}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-sm text-warmGray dark:text-gray-400">Players</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {playerCount} waiting
              </span>
            </div>
          </div>

          <button
            onClick={() => void handleJoin()}
            disabled={joining}
            className="w-full py-4 rounded-2xl bg-amber text-white font-bold text-base hover:bg-amber-dark shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {joining ? 'Joining…' : 'Join Game'}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
