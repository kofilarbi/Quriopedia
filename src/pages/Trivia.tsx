import { motion } from 'framer-motion'
import { Trophy, Users, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Trivia() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pb-28 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-24 h-24 rounded-3xl bg-amber/10 border-2 border-amber/30 flex items-center justify-center mb-8"
      >
        <Trophy size={44} className="text-amber" />
      </motion.div>

      <motion.h1
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-3"
      >
        Trivia
      </motion.h1>

      <motion.p
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-warmGray dark:text-gray-400 max-w-xs leading-relaxed mb-10"
      >
        Challenge yourself and friends in daily knowledge battles.
      </motion.p>

      {/* Buttons */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3 w-full max-w-sm"
      >
        {/* Solo Play */}
        <div className="relative flex-1">
          <button
            onClick={() => navigate('/trivia/solo')}
            className="w-full flex flex-col items-center gap-2 bg-white dark:bg-navy-surface border-2 border-amber/40 rounded-2xl py-5 px-4 hover:border-amber hover:bg-amber/5 transition-all"
          >
            <User size={24} className="text-amber" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Solo Play</span>
          </button>
        </div>

        {/* Play with Friends */}
        <div className="relative flex-1">
          <button
            onClick={() => navigate('/trivia/multi')}
            className="w-full flex flex-col items-center gap-2 bg-amber/10 border-2 border-amber/30 rounded-2xl py-5 px-4 hover:border-amber hover:bg-amber/20 transition-all"
          >
            <Users size={24} className="text-amber" />
            <span className="font-semibold text-amber">Play with Friends</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
