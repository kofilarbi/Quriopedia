import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, CheckCircle2, XCircle } from 'lucide-react'
import type { TriviaQuestion } from '@/lib/triviaService'

interface LocationState {
  questions: TriviaQuestion[]
  scores: number[]
  categoryId: string
}

export default function SoloResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState | null

  if (!state?.questions) {
    navigate('/trivia/solo', { replace: true })
    return null
  }

  const { questions, scores, categoryId } = state
  const totalScore = scores.reduce((a, b) => a + b, 0)
  const correctCount = scores.filter((s) => s > 0).length
  const total = questions.length
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const isGreat = accuracy >= 80

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-8 pb-28">
      <div className="max-w-md mx-auto">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-3xl bg-amber/10 border-2 border-amber/30 flex items-center justify-center">
            <Trophy size={44} className="text-amber" />
          </div>
        </motion.div>

        {/* Great job badge */}
        {isGreat && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-4"
          >
            <span className="inline-block bg-amber/10 border border-amber/30 text-amber font-bold text-sm px-4 py-1.5 rounded-full">
              Great job! Outstanding performance
            </span>
          </motion.div>
        )}

        {/* Score */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-8"
        >
          <div className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-1">
            {totalScore}
          </div>
          <div className="text-2xl font-bold text-amber mb-1">{accuracy}%</div>
          <div className="text-sm text-warmGray dark:text-gray-400">
            {correctCount} of {total} correct
          </div>
        </motion.div>

        {/* Question breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 overflow-hidden mb-8"
        >
          <div className="px-4 py-3 border-b border-sand dark:border-white/10">
            <h3 className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider">
              Score breakdown
            </h3>
          </div>
          <div className="divide-y divide-sand dark:divide-white/5">
            {questions.map((q, i) => {
              const earned = scores[i] ?? 0
              const correct = earned > 0
              return (
                <div key={q.id} className="flex items-center gap-3 px-4 py-3">
                  {correct ? (
                    <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-red-400 flex-shrink-0" />
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300 flex-1 line-clamp-1">
                    {q.question}
                  </p>
                  {correct && (
                    <span className="text-xs font-bold text-amber flex-shrink-0">+{earned}</span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex gap-3"
        >
          <button
            onClick={() =>
              navigate('/trivia/solo', { state: { preSelectedCategory: categoryId } })
            }
            className="flex-1 py-3.5 rounded-2xl border-2 border-amber text-amber font-bold text-sm hover:bg-amber/5 transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => navigate('/trivia/solo')}
            className="flex-1 py-3.5 rounded-2xl bg-amber text-white font-bold text-sm hover:bg-amber-dark transition-colors shadow-md"
          >
            New Topic
          </button>
        </motion.div>
      </div>
    </div>
  )
}
