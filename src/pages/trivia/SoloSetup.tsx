import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Shuffle } from 'lucide-react'
import { categories } from '@/data/mockData'
import { getCategoryIcon } from '@/lib/categoryIcons'

const ROUND_OPTIONS = [5, 10, 15] as const

export default function SoloSetup() {
  const navigate = useNavigate()
  const [count, setCount] = useState<number>(10)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleStart = () => {
    if (!selectedCategory) return
    navigate('/trivia/solo/game', { state: { categoryId: selectedCategory, count } })
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

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Solo Play</h1>
          <p className="text-sm text-warmGray dark:text-gray-400 mt-1">Test your knowledge</p>
        </motion.div>

        {/* Round count */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Number of questions
          </h2>
          <div className="flex gap-3">
            {ROUND_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  count === n
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface text-warmGray dark:text-gray-400 hover:border-amber/40'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Category picker */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
            Choose a topic
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {/* Mixed tile */}
            <button
              onClick={() => setSelectedCategory('mixed')}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-sm font-medium transition-all ${
                selectedCategory === 'mixed'
                  ? 'border-amber bg-amber/10 shadow-sm'
                  : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface hover:border-amber/40 hover:bg-amber/5'
              }`}
              style={selectedCategory === 'mixed' ? { borderColor: '#E8A838', backgroundColor: '#E8A83812' } : {}}
            >
              <Shuffle size={22} className="text-amber" />
              <span className="text-gray-800 dark:text-gray-200 font-medium leading-tight text-center text-sm">
                Mixed
              </span>
            </button>

            {/* Category tiles */}
            {categories.map((cat, i) => {
              const Icon = getCategoryIcon(cat.id)
              const isSelected = selectedCategory === cat.id
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-amber bg-amber/10 shadow-sm scale-[0.98]'
                      : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface hover:border-amber/40 hover:bg-amber/5'
                  }`}
                  style={isSelected ? { borderColor: '#E8A838', backgroundColor: '#E8A83812' } : {}}
                >
                  <Icon size={22} style={{ color: cat.color }} />
                  <span className="text-gray-800 dark:text-gray-200 font-medium leading-tight text-center text-sm">
                    {cat.name}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <button
            onClick={handleStart}
            disabled={!selectedCategory}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
              selectedCategory
                ? 'bg-amber text-white hover:bg-amber-dark shadow-md hover:shadow-lg active:scale-[0.98]'
                : 'bg-sand dark:bg-navy-surface text-warmGray dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Start Game →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
