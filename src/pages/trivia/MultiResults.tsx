import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Medal, ArrowLeft } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  fetchSession,
  fetchPlayers,
  fetchAllAnswers,
  saveMatchResult,
  createSession,
  startGame,
  type Session,
  type SessionPlayer,
} from '@/lib/sessionService'
import { fetchTriviaQuestions } from '@/lib/triviaService'

interface PlayerResult {
  player: SessionPlayer
  totalScore: number
  questionsCorrect: number
  rank: number
}

export default function MultiResults() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { userId, name } = useAppStore()

  const [session, setSession] = useState<Session | null>(null)
  const [results, setResults] = useState<PlayerResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rematching, setRematching] = useState(false)
  const savedRef = useRef(false)

  useEffect(() => {
    if (!sessionId) return

    const load = async () => {
      try {
        const [s, players, answers] = await Promise.all([
          fetchSession(sessionId),
          fetchPlayers(sessionId),
          fetchAllAnswers(sessionId),
        ])

        if (!s) {
          setError('Session not found.')
          setLoading(false)
          return
        }

        setSession(s)

        // Compute per-player totals
        const playerResults: Omit<PlayerResult, 'rank'>[] = players.map((p) => {
          const playerAnswers = answers.filter((a) => a.userId === p.userId)
          const totalScore = playerAnswers.reduce((sum, a) => sum + a.scoreEarned, 0)
          const questionsCorrect = playerAnswers.filter((a) => a.isCorrect).length
          return { player: p, totalScore, questionsCorrect }
        })

        // Sort by score descending
        playerResults.sort((a, b) => b.totalScore - a.totalScore)

        const ranked: PlayerResult[] = playerResults.map((r, i) => ({ ...r, rank: i + 1 }))
        setResults(ranked)

        // Save match result for current user if not already saved
        if (userId && !savedRef.current) {
          savedRef.current = true
          const myResult = ranked.find((r) => r.player.userId === userId)
          if (myResult) {
            try {
              await saveMatchResult({
                sessionId,
                userId,
                finalRank: myResult.rank,
                finalScore: myResult.totalScore,
                questionsCorrect: myResult.questionsCorrect,
                questionsTotal: s.questionIds.length,
                categoryId: s.categoryId,
                opponentCount: players.length - 1,
              })
            } catch (err) {
              console.error('[MultiResults] saveMatchResult error:', err)
            }
          }
        }

        setLoading(false)
      } catch (err) {
        console.error('[MultiResults] load error:', err)
        setError('Failed to load results.')
        setLoading(false)
      }
    }

    void load()
  }, [sessionId, userId])

  const handleRematch = async () => {
    if (!session || !userId || !name || rematching) return
    setRematching(true)
    try {
      const questions = await fetchTriviaQuestions(
        session.categoryId ?? 'mixed',
        session.roundCount
      )
      const questionIds = questions.map((q) => q.id)
      const newSession = await createSession(userId, name)
      await startGame(newSession.id, questionIds)
      navigate(`/trivia/multi/room/${newSession.id}`)
    } catch (err) {
      console.error('[MultiResults] rematch error:', err)
      setRematching(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-navy">
        <div className="w-12 h-12 rounded-xl bg-amber animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream dark:bg-navy text-center">
        <p className="text-warmGray dark:text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => navigate('/trivia')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold"
        >
          Back to Trivia
        </button>
      </div>
    )
  }

  const isHost = session?.hostId === userId
  const top3 = results.slice(0, 3)
  const totalQuestions = session?.questionIds.length ?? 0

  // Podium order: 2nd left, 1st center, 3rd right
  const podiumOrder: Array<PlayerResult | undefined> = [top3[1], top3[0], top3[2]]

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-8 pb-28">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-amber/10 border-2 border-amber/30 flex items-center justify-center mb-4">
            <Trophy size={44} className="text-amber" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Game Over</h1>
        </motion.div>

        {/* Podium */}
        {top3.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-end justify-center gap-2 mb-8"
          >
            {podiumOrder.map((result, podiumPos) => {
              if (!result) return <div key={podiumPos} className="w-24" />
              const heights = ['h-20', 'h-28', 'h-16']
              const medalColors = ['text-gray-400', 'text-amber', 'text-orange-600']
              return (
                <div
                  key={result.player.userId}
                  className={`w-24 ${heights[podiumPos]} rounded-t-2xl bg-white dark:bg-navy-surface border border-sand dark:border-white/10 flex flex-col items-center justify-center pt-2 px-1`}
                >
                  <Medal size={20} className={medalColors[podiumPos]} />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-1 text-center leading-tight truncate w-full text-center px-1">
                    {result.player.displayName}
                  </span>
                  <span className="text-sm font-extrabold text-amber">{result.totalScore}</span>
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Full rankings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 overflow-hidden mb-6"
        >
          <div className="px-4 py-3 border-b border-sand dark:border-white/10">
            <h3 className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider">
              Final Rankings
            </h3>
          </div>
          <div className="divide-y divide-sand dark:divide-white/5">
            {results.map((result) => {
              const accuracy =
                totalQuestions > 0
                  ? Math.round((result.questionsCorrect / totalQuestions) * 100)
                  : 0
              const isMe = result.player.userId === userId
              return (
                <div
                  key={result.player.userId}
                  className={`flex items-center gap-3 px-4 py-3 ${isMe ? 'bg-amber/5' : ''}`}
                >
                  <span className="text-sm font-bold text-gray-500 dark:text-gray-400 w-5 text-center">
                    #{result.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber">
                      {result.player.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isMe ? 'text-amber' : 'text-gray-800 dark:text-gray-200'}`}>
                      {result.player.displayName}
                      {isMe && ' (you)'}
                    </p>
                    <p className="text-xs text-warmGray dark:text-gray-400">
                      {result.questionsCorrect}/{totalQuestions} correct · {accuracy}%
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {result.totalScore}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          {isHost && (
            <button
              onClick={() => void handleRematch()}
              disabled={rematching}
              className="flex-1 py-3.5 rounded-2xl border-2 border-amber text-amber font-bold text-sm hover:bg-amber/5 transition-colors disabled:opacity-60"
            >
              {rematching ? 'Setting up…' : 'Rematch'}
            </button>
          )}
          <button
            onClick={() => navigate('/trivia')}
            className="flex-1 py-3.5 rounded-2xl bg-amber text-white font-bold text-sm hover:bg-amber-dark transition-colors shadow-md"
          >
            <span className="flex items-center justify-center gap-1">
              <ArrowLeft size={14} />
              Back to Trivia
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}
