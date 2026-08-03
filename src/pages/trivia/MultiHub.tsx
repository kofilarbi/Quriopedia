import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Zap, Trophy, Medal, WifiOff } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { fetchMatchHistory } from '@/lib/sessionService'
import { createSession } from '@/lib/sessionService'
import { getCategoryIcon } from '@/lib/categoryIcons'
import { useState } from 'react'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function MultiHub() {
  const navigate = useNavigate()
  const { userId, name } = useAppStore()
  const [creating, setCreating] = useState(false)

  if (!navigator.onLine) {
    return (
      <div className="min-h-screen bg-cream dark:bg-navy flex flex-col items-center justify-center px-6 text-center">
        <WifiOff size={48} className="text-warmGray dark:text-gray-400 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
          Multiplayer requires an internet connection.
        </h1>
        <p className="text-sm text-warmGray dark:text-gray-400 mb-6">
          You're currently offline. Connect to the internet to play with others.
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

  const { data: matchHistory, isLoading: historyLoading, error: historyError } = useQuery({
    queryKey: ['matchHistory', userId],
    queryFn: () => fetchMatchHistory(userId!),
    enabled: !!userId,
  })

  const handleCreateRoom = async () => {
    if (!userId || !name || creating) return
    setCreating(true)
    try {
      const session = await createSession(userId, name)
      navigate(`/trivia/multi/room/${session.id}`)
    } catch (err) {
      console.error('[MultiHub] createSession error:', err)
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-5 pb-28">
      <div className="max-w-md mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/trivia')}
          className="flex items-center gap-2 text-warmGray hover:text-gray-700 dark:hover:text-gray-300 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Trivia</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Multiplayer</h1>
          <p className="text-sm text-warmGray dark:text-gray-400 mt-1">
            Challenge friends or match with players worldwide
          </p>
        </motion.div>

        {/* Action cards */}
        <div className="space-y-3 mb-8">
          {/* Create Private Room */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <button
              onClick={() => void handleCreateRoom()}
              disabled={creating}
              className="w-full bg-white dark:bg-navy-surface border-2 border-sand dark:border-white/10 rounded-2xl p-5 text-left hover:border-amber/40 hover:bg-amber/5 transition-all disabled:opacity-60"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <Users size={24} className="text-amber" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-1">
                    {creating ? 'Creating room…' : 'Create Private Room'}
                  </h3>
                  <p className="text-sm text-warmGray dark:text-gray-400">
                    Invite friends with a link or code
                  </p>
                </div>
              </div>
            </button>
          </motion.div>

          {/* Online Matchmaking */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <button
              onClick={() => navigate('/trivia/multi/matchmaking')}
              className="w-full bg-white dark:bg-navy-surface border-2 border-sand dark:border-white/10 rounded-2xl p-5 text-left hover:border-amber/40 hover:bg-amber/5 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber/10 flex items-center justify-center flex-shrink-0">
                  <Zap size={24} className="text-amber" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-50 mb-1">
                    Online Matchmaking
                  </h3>
                  <p className="text-sm text-warmGray dark:text-gray-400">
                    Match with players worldwide
                  </p>
                </div>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Recent Matches */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Recent Matches
          </h2>

          {historyLoading && (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-sand dark:bg-white/10 animate-pulse"
                />
              ))}
            </div>
          )}

          {historyError && (
            <p className="text-sm text-red-500 dark:text-red-400">Failed to load match history.</p>
          )}

          {!historyLoading && !historyError && (!matchHistory || matchHistory.length === 0) && (
            <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-6 text-center">
              <Trophy size={32} className="text-amber/40 mx-auto mb-2" />
              <p className="text-sm text-warmGray dark:text-gray-400">
                No matches yet — play with friends to see results here.
              </p>
            </div>
          )}

          {!historyLoading && matchHistory && matchHistory.length > 0 && (
            <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 overflow-hidden">
              <div className="divide-y divide-sand dark:divide-white/5">
                {matchHistory.slice(0, 3).map((match) => {
                  const CatIcon = match.categoryId
                    ? getCategoryIcon(match.categoryId)
                    : Trophy
                  return (
                    <div
                      key={match.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <CatIcon size={18} className="text-amber flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          #{match.finalRank} of {match.opponentCount + 1}
                        </p>
                        <p className="text-xs text-warmGray dark:text-gray-400">
                          {match.questionsCorrect}/{match.questionsTotal} correct
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <Medal size={12} className="text-amber" />
                          <span className="text-sm font-bold text-amber">{match.finalScore}</span>
                        </div>
                        <p className="text-xs text-warmGray dark:text-gray-400">
                          {formatDate(match.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
